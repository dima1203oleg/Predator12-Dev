#!/usr/bin/env python3
"""
Enhanced Error Response System for Predator Analytics
Implements standardized error handling with trace_id correlation.
Part of Delta Revision 1.1 - Block B2
"""

import logging
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from functools import wraps
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class ErrorCode(Enum):
    """Standardized error codes"""

    # Authentication & Authorization
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    FORBIDDEN_PII = "FORBIDDEN_PII"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"

    # Validation & Input
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    INVALID_FORMAT = "INVALID_FORMAT"

    # Business Logic
    PLAN_LIMIT_EXCEEDED = "PLAN_LIMIT_EXCEEDED"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE"
    OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED"

    # System & Infrastructure
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
    CACHE_ERROR = "CACHE_ERROR"
    STORAGE_ERROR = "STORAGE_ERROR"
    ML_MODEL_ERROR = "ML_MODEL_ERROR"

    # External Services
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    UPSTREAM_TIMEOUT = "UPSTREAM_TIMEOUT"

    # Data Processing
    ETL_PROCESSING_ERROR = "ETL_PROCESSING_ERROR"
    DATA_QUALITY_ERROR = "DATA_QUALITY_ERROR"
    PII_DETECTION_ERROR = "PII_DETECTION_ERROR"
    PARSING_ERROR = "PARSING_ERROR"


class ErrorSeverity(Enum):
    """Error severity levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ErrorDetails:
    """Detailed error information"""

    code: ErrorCode
    message: str
    trace_id: str
    timestamp: str
    severity: ErrorSeverity
    component: str
    user_message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    documentation_url: Optional[str] = None
    retry_after: Optional[int] = None


@dataclass
class ErrorContext:
    """Error context for debugging"""

    request_id: str
    user_id: Optional[str]
    session_id: Optional[str]
    endpoint: str
    method: str
    user_agent: Optional[str]
    ip_address: Optional[str]
    additional_context: Optional[Dict[str, Any]]


class PredatorException(Exception):
    """Base exception for Predator Analytics"""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        component: str = "unknown",
        user_message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        suggestions: Optional[List[str]] = None,
        status_code: int = 500,
    ):
        self.code = code
        self.message = message
        self.severity = severity
        self.component = component
        self.user_message = user_message or self._generate_user_message(code)
        self.details = details or {}
        self.suggestions = suggestions or self._generate_suggestions(code)
        self.status_code = status_code
        self.trace_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat()

        super().__init__(message)

    def _generate_user_message(self, code: ErrorCode) -> str:
        """Generate user-friendly message based on error code"""
        user_messages = {
            ErrorCode.UNAUTHORIZED: "Please log in to access this resource",
            ErrorCode.FORBIDDEN: "You don't have permission to perform this action",
            ErrorCode.FORBIDDEN_PII: "Viewing sensitive data requires additional permissions",
            ErrorCode.PLAN_LIMIT_EXCEEDED: "Your current plan limit has been reached",
            ErrorCode.QUOTA_EXCEEDED: "You've exceeded your usage quota for this period",
            ErrorCode.RESOURCE_NOT_FOUND: "The requested resource was not found",
            ErrorCode.VALIDATION_ERROR: "Please check your input and try again",
            ErrorCode.SERVICE_UNAVAILABLE: "Service is temporarily unavailable. Please try again later",
            ErrorCode.RATE_LIMIT_EXCEEDED: "Too many requests. Please wait before trying again",
            ErrorCode.INTERNAL_ERROR: "An internal error occurred. Our team has been notified",
        }
        return user_messages.get(code, "An error occurred while processing your request")

    def _generate_suggestions(self, code: ErrorCode) -> List[str]:
        """Generate helpful suggestions based on error code"""
        suggestions_map = {
            ErrorCode.UNAUTHORIZED: [
                "Check if you're logged in",
                "Verify your session hasn't expired",
                "Try refreshing the page",
            ],
            ErrorCode.FORBIDDEN_PII: [
                "Contact your administrator for PII access",
                "Upgrade to a plan with PII viewing permissions",
                "Use the masked data view instead",
            ],
            ErrorCode.PLAN_LIMIT_EXCEEDED: [
                "Upgrade your plan for higher limits",
                "Wait for your quota to reset",
                "Contact support for assistance",
            ],
            ErrorCode.VALIDATION_ERROR: [
                "Check required fields are filled",
                "Verify data formats match requirements",
                "Review the API documentation",
            ],
            ErrorCode.RATE_LIMIT_EXCEEDED: [
                "Wait before making more requests",
                "Reduce request frequency",
                "Consider upgrading for higher limits",
            ],
        }
        return suggestions_map.get(code, ["Contact support if the problem persists"])

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for JSON response"""
        return {
            "error": {
                "code": self.code.value,
                "message": self.message,
                "user_message": self.user_message,
                "trace_id": self.trace_id,
                "timestamp": self.timestamp,
                "severity": self.severity.value,
                "component": self.component,
                "details": self.details,
                "suggestions": self.suggestions,
                "documentation_url": f"https://docs.predator-analytics.com/errors/{self.code.value.lower()}",
                "retry_after": getattr(self, "retry_after", None),
            }
        }


class AuthenticationError(PredatorException):
    """Authentication-related errors"""

    def __init__(self, message: str = "Authentication failed", **kwargs):
        super().__init__(
            code=ErrorCode.UNAUTHORIZED,
            message=message,
            status_code=401,
            severity=ErrorSeverity.MEDIUM,
            component="auth",
            **kwargs,
        )


class AuthorizationError(PredatorException):
    """Authorization-related errors"""

    def __init__(self, message: str = "Access forbidden", **kwargs):
        super().__init__(
            code=ErrorCode.FORBIDDEN,
            message=message,
            status_code=403,
            severity=ErrorSeverity.MEDIUM,
            component="auth",
            **kwargs,
        )


class PIIAccessError(PredatorException):
    """PII access authorization errors"""

    def __init__(self, message: str = "PII access requires elevated permissions", **kwargs):
        super().__init__(
            code=ErrorCode.FORBIDDEN_PII,
            message=message,
            status_code=403,
            severity=ErrorSeverity.HIGH,
            component="pii",
            **kwargs,
        )


class PlanLimitError(PredatorException):
    """Plan limit exceeded errors"""

    def __init__(self, message: str = "Plan limit exceeded", retry_after: int = 3600, **kwargs):
        super().__init__(
            code=ErrorCode.PLAN_LIMIT_EXCEEDED,
            message=message,
            status_code=402,
            severity=ErrorSeverity.MEDIUM,
            component="billing",
            **kwargs,
        )
        self.retry_after = retry_after


class ValidationError(PredatorException):
    """Input validation errors"""

    def __init__(
        self, message: str = "Validation failed", field_errors: Dict[str, str] = None, **kwargs
    ):
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            status_code=400,
            severity=ErrorSeverity.LOW,
            component="validation",
            details={"field_errors": field_errors or {}},
            **kwargs,
        )


class DataQualityError(PredatorException):
    """Data quality validation errors"""

    def __init__(
        self, message: str = "Data quality check failed", quality_issues: List[str] = None, **kwargs
    ):
        super().__init__(
            code=ErrorCode.DATA_QUALITY_ERROR,
            message=message,
            status_code=422,
            severity=ErrorSeverity.MEDIUM,
            component="etl",
            details={"quality_issues": quality_issues or []},
            **kwargs,
        )


class RateLimitError(PredatorException):
    """Rate limiting errors"""

    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 60, **kwargs):
        super().__init__(
            code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            status_code=429,
            severity=ErrorSeverity.LOW,
            component="rate_limiter",
            **kwargs,
        )
        self.retry_after = retry_after


class ServiceUnavailableError(PredatorException):
    """Service unavailable errors"""

    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        service_name: str = "unknown",
        **kwargs,
    ):
        super().__init__(
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message=message,
            status_code=503,
            severity=ErrorSeverity.HIGH,
            component=f"service_{service_name}",
            **kwargs,
        )


class ErrorTracker:
    """Track and analyze error patterns"""

    def __init__(self):
        self.error_history: List[Dict[str, Any]] = []
        self.error_counts: Dict[str, int] = {}
        self.component_errors: Dict[str, List[str]] = {}

    def record_error(self, error: PredatorException, context: Optional[ErrorContext] = None):
        """Record error occurrence for analysis"""
        error_record = {
            "trace_id": error.trace_id,
            "code": error.code.value,
            "component": error.component,
            "severity": error.severity.value,
            "timestamp": error.timestamp,
            "status_code": error.status_code,
            "message": error.message,
        }

        if context:
            error_record["context"] = asdict(context)

        self.error_history.append(error_record)

        # Update counters
        error_key = f"{error.component}:{error.code.value}"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1

        if error.component not in self.component_errors:
            self.component_errors[error.component] = []
        self.component_errors[error.component].append(error.code.value)

        # Keep only last 1000 errors
        if len(self.error_history) > 1000:
            self.error_history = self.error_history[-1000:]

        logger.error(
            f"Error recorded [{error.trace_id}]: {error.component}:{error.code.value} - {error.message}"
        )

    def get_error_stats(self) -> Dict[str, Any]:
        """Get error statistics"""
        return {
            "total_errors": len(self.error_history),
            "error_counts": self.error_counts,
            "component_errors": self.component_errors,
            "recent_errors": self.error_history[-10:] if self.error_history else [],
        }


# Global error tracker
error_tracker = ErrorTracker()


def handle_exceptions(component: str = "unknown"):
    """Decorator for consistent exception handling"""

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except PredatorException:
                raise  # Re-raise our custom exceptions
            except HTTPException as e:
                # Convert FastAPI HTTPException to PredatorException
                code = ErrorCode.INTERNAL_ERROR
                if e.status_code == 401:
                    code = ErrorCode.UNAUTHORIZED
                elif e.status_code == 403:
                    code = ErrorCode.FORBIDDEN
                elif e.status_code == 404:
                    code = ErrorCode.RESOURCE_NOT_FOUND
                elif e.status_code == 422:
                    code = ErrorCode.VALIDATION_ERROR
                elif e.status_code == 429:
                    code = ErrorCode.RATE_LIMIT_EXCEEDED
                elif e.status_code == 503:
                    code = ErrorCode.SERVICE_UNAVAILABLE

                predator_error = PredatorException(
                    code=code, message=str(e.detail), component=component, status_code=e.status_code
                )
                error_tracker.record_error(predator_error)
                raise predator_error
            except Exception as e:
                # Convert generic exceptions
                predator_error = PredatorException(
                    code=ErrorCode.INTERNAL_ERROR,
                    message=f"Unexpected error in {component}: {str(e)}",
                    component=component,
                    severity=ErrorSeverity.HIGH,
                )
                error_tracker.record_error(predator_error)
                raise predator_error

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except PredatorException:
                raise  # Re-raise our custom exceptions
            except Exception as e:
                # Convert generic exceptions
                predator_error = PredatorException(
                    code=ErrorCode.INTERNAL_ERROR,
                    message=f"Unexpected error in {component}: {str(e)}",
                    component=component,
                    severity=ErrorSeverity.HIGH,
                )
                error_tracker.record_error(predator_error)
                raise predator_error

        # Return appropriate wrapper based on function type
        import asyncio

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# FastAPI exception handlers
async def predator_exception_handler(request: Request, exc: PredatorException) -> JSONResponse:
    """Handle PredatorException"""
    # Create error context
    context = ErrorContext(
        request_id=getattr(request.state, "request_id", str(uuid.uuid4())),
        user_id=getattr(request.state, "user_id", None),
        session_id=getattr(request.state, "session_id", None),
        endpoint=str(request.url.path),
        method=request.method,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        additional_context=getattr(request.state, "context", {}),
    )

    # Record error
    error_tracker.record_error(exc, context)

    # Return standardized response
    response_data = exc.to_dict()

    # Add retry-after header if applicable
    headers = {}
    if hasattr(exc, "retry_after") and exc.retry_after:
        headers["Retry-After"] = str(exc.retry_after)

    return JSONResponse(status_code=exc.status_code, content=response_data, headers=headers)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle FastAPI validation errors"""
    field_errors = {}
    for error in exc.errors():
        field_name = " -> ".join(str(x) for x in error["loc"])
        field_errors[field_name] = error["msg"]

    predator_error = ValidationError(message="Request validation failed", field_errors=field_errors)

    return await predator_exception_handler(request, predator_error)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle generic HTTP exceptions"""
    code_mapping = {
        400: ErrorCode.VALIDATION_ERROR,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.RESOURCE_NOT_FOUND,
        422: ErrorCode.VALIDATION_ERROR,
        429: ErrorCode.RATE_LIMIT_EXCEEDED,
        500: ErrorCode.INTERNAL_ERROR,
        503: ErrorCode.SERVICE_UNAVAILABLE,
    }

    error_code = code_mapping.get(exc.status_code, ErrorCode.INTERNAL_ERROR)

    predator_error = PredatorException(
        code=error_code, message=str(exc.detail), status_code=exc.status_code, component="http"
    )

    return await predator_exception_handler(request, predator_error)


# Export main components
__all__ = [
    "ErrorCode",
    "ErrorSeverity",
    "ErrorDetails",
    "ErrorContext",
    "PredatorException",
    "AuthenticationError",
    "AuthorizationError",
    "PIIAccessError",
    "PlanLimitError",
    "ValidationError",
    "DataQualityError",
    "RateLimitError",
    "ServiceUnavailableError",
    "ErrorTracker",
    "handle_exceptions",
    "error_tracker",
    "predator_exception_handler",
    "validation_exception_handler",
    "http_exception_handler",
]
