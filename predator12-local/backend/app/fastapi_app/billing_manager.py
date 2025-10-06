"""
Billing & Usage Monitoring Manager
==================================

Production-ready billing middleware for Predator Analytics Nexus Core.
Implements usage tracking, throttling, legal compliance, and billing dashboards.

Delta Revision 1.1 - Critical Component A8
"""

import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional

from redis import asyncio as aioredis
from sqlalchemy import text

logger = logging.getLogger("billing_manager")


class UsageType(Enum):
    """Usage types for billing."""

    API_CALL = "api_call"
    DATA_INGESTION = "data_ingestion"
    ML_INFERENCE = "ml_inference"
    STORAGE = "storage"
    EXPORT = "export"
    PARSING = "parsing"
    ANALYTICS = "analytics"


class PlanTier(Enum):
    """Service plan tiers."""

    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


@dataclass
class UsageRecord:
    """Single usage record."""

    user_id: str
    organization_id: str
    usage_type: UsageType
    quantity: Decimal
    unit: str  # requests, GB, hours, etc.
    timestamp: datetime
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    cost_usd: Optional[Decimal] = None
    trace_id: Optional[str] = None


@dataclass
class QuotaLimits:
    """Quota limits per plan tier."""

    api_calls_per_hour: int
    data_ingestion_gb_per_day: int
    ml_inference_calls_per_hour: int
    storage_gb_max: int
    export_calls_per_day: int
    parsing_hours_per_month: int


@dataclass
class UsageSummary:
    """Usage summary for billing period."""

    user_id: str
    period_start: datetime
    period_end: datetime
    total_cost_usd: Decimal
    usage_by_type: Dict[str, Decimal]
    quota_usage: Dict[str, float]  # percentage used
    throttle_incidents: int


class BillingManager:
    """
    Production-ready billing and usage tracking manager.

    Features:
    - Real-time usage tracking
    - Quota enforcement with throttling
    - Cost calculation per service tier
    - Legal compliance (GDPR, audit trails)
    - Usage dashboards data
    - Anomaly detection for abuse
    """

    def __init__(self, redis_client: aioredis.Redis, db_session_factory):
        self.redis = redis_client
        self.db_session_factory = db_session_factory

        # Pricing matrix (USD)
        self.pricing = {
            PlanTier.FREE: {
                UsageType.API_CALL: Decimal("0.0"),
                UsageType.DATA_INGESTION: Decimal("0.0"),
                UsageType.ML_INFERENCE: Decimal("0.0"),
                UsageType.STORAGE: Decimal("0.0"),
                UsageType.EXPORT: Decimal("0.0"),
                UsageType.PARSING: Decimal("0.0"),
            },
            PlanTier.BASIC: {
                UsageType.API_CALL: Decimal("0.001"),  # per call
                UsageType.DATA_INGESTION: Decimal("0.10"),  # per GB
                UsageType.ML_INFERENCE: Decimal("0.01"),  # per call
                UsageType.STORAGE: Decimal("0.023"),  # per GB/month
                UsageType.EXPORT: Decimal("0.05"),  # per export
                UsageType.PARSING: Decimal("1.50"),  # per hour
            },
            PlanTier.PRO: {
                UsageType.API_CALL: Decimal("0.0008"),
                UsageType.DATA_INGESTION: Decimal("0.08"),
                UsageType.ML_INFERENCE: Decimal("0.008"),
                UsageType.STORAGE: Decimal("0.019"),
                UsageType.EXPORT: Decimal("0.04"),
                UsageType.PARSING: Decimal("1.20"),
            },
            PlanTier.ENTERPRISE: {
                UsageType.API_CALL: Decimal("0.0005"),
                UsageType.DATA_INGESTION: Decimal("0.05"),
                UsageType.ML_INFERENCE: Decimal("0.005"),
                UsageType.STORAGE: Decimal("0.015"),
                UsageType.EXPORT: Decimal("0.03"),
                UsageType.PARSING: Decimal("0.90"),
            },
        }

        # Quota limits per tier
        self.quotas = {
            PlanTier.FREE: QuotaLimits(
                api_calls_per_hour=100,
                data_ingestion_gb_per_day=1,
                ml_inference_calls_per_hour=50,
                storage_gb_max=5,
                export_calls_per_day=2,
                parsing_hours_per_month=1,
            ),
            PlanTier.BASIC: QuotaLimits(
                api_calls_per_hour=1000,
                data_ingestion_gb_per_day=10,
                ml_inference_calls_per_hour=500,
                storage_gb_max=100,
                export_calls_per_day=20,
                parsing_hours_per_month=20,
            ),
            PlanTier.PRO: QuotaLimits(
                api_calls_per_hour=10000,
                data_ingestion_gb_per_day=100,
                ml_inference_calls_per_hour=5000,
                storage_gb_max=1000,
                export_calls_per_day=200,
                parsing_hours_per_month=200,
            ),
            PlanTier.ENTERPRISE: QuotaLimits(
                api_calls_per_hour=100000,
                data_ingestion_gb_per_day=1000,
                ml_inference_calls_per_hour=50000,
                storage_gb_max=10000,
                export_calls_per_day=2000,
                parsing_hours_per_month=2000,
            ),
        }

    async def record_usage(self, record: UsageRecord) -> bool:
        """
        Record usage event with cost calculation and quota checking.

        Args:
            record: Usage record to track

        Returns:
            bool: True if usage recorded, False if quota exceeded
        """
        try:
            # Get user's plan tier
            plan_tier = await self._get_user_plan(record.user_id)

            # Calculate cost
            unit_cost = self.pricing[plan_tier][record.usage_type]
            record.cost_usd = unit_cost * record.quantity

            # Check quota limits
            if not await self._check_quota(record, plan_tier):
                await self._record_throttle_incident(record.user_id, record.usage_type)
                return False

            # Store usage record
            await self._store_usage_record(record)

            # Update usage counters
            await self._update_usage_counters(record)

            # Check for usage anomalies
            await self._detect_usage_anomaly(record)

            logger.info(
                f"Usage recorded: {record.user_id} - {record.usage_type.value} - ${record.cost_usd}"
            )
            return True

        except Exception as e:
            logger.error(f"Error recording usage: {e}")
            return False

    async def _get_user_plan(self, user_id: str) -> PlanTier:
        """Get user's current plan tier."""
        try:
            # Check Redis cache first
            cached_plan = await self.redis.get(f"user_plan:{user_id}")
            if cached_plan:
                return PlanTier(cached_plan.decode())

            # Query database
            async with self.db_session_factory() as session:
                result = await session.execute(
                    text("SELECT plan_tier FROM users WHERE id = :user_id"), {"user_id": user_id}
                )
                row = result.fetchone()

                if row:
                    plan_tier = PlanTier(row[0])
                    # Cache for 1 hour
                    await self.redis.setex(f"user_plan:{user_id}", 3600, plan_tier.value)
                    return plan_tier

                # Default to FREE for new users
                return PlanTier.FREE

        except Exception as e:
            logger.error(f"Error getting user plan: {e}")
            return PlanTier.FREE

    async def _check_quota(self, record: UsageRecord, plan_tier: PlanTier) -> bool:
        """Check if usage is within quota limits."""
        try:
            quota = self.quotas[plan_tier]
            current_hour = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
            current_day = current_hour.replace(hour=0)
            current_month = current_day.replace(day=1)

            # Check different quota types based on usage type
            if record.usage_type == UsageType.API_CALL:
                key = f"quota:api_calls:{record.user_id}:{current_hour.timestamp()}"
                current = int(await self.redis.get(key) or 0)
                return current < quota.api_calls_per_hour

            elif record.usage_type == UsageType.DATA_INGESTION:
                key = f"quota:data_ingestion:{record.user_id}:{current_day.timestamp()}"
                current = float(await self.redis.get(key) or 0)
                return current + float(record.quantity) <= quota.data_ingestion_gb_per_day

            elif record.usage_type == UsageType.ML_INFERENCE:
                key = f"quota:ml_inference:{record.user_id}:{current_hour.timestamp()}"
                current = int(await self.redis.get(key) or 0)
                return current < quota.ml_inference_calls_per_hour

            elif record.usage_type == UsageType.STORAGE:
                key = f"quota:storage:{record.user_id}"
                current = float(await self.redis.get(key) or 0)
                return current <= quota.storage_gb_max

            elif record.usage_type == UsageType.EXPORT:
                key = f"quota:exports:{record.user_id}:{current_day.timestamp()}"
                current = int(await self.redis.get(key) or 0)
                return current < quota.export_calls_per_day

            elif record.usage_type == UsageType.PARSING:
                key = f"quota:parsing:{record.user_id}:{current_month.timestamp()}"
                current = float(await self.redis.get(key) or 0)
                return current + float(record.quantity) <= quota.parsing_hours_per_month

            return True

        except Exception as e:
            logger.error(f"Error checking quota: {e}")
            return True  # Allow on error to avoid blocking

    async def _update_usage_counters(self, record: UsageRecord):
        """Update Redis usage counters for quota tracking."""
        try:
            current_time = datetime.now(timezone.utc)
            current_hour = current_time.replace(minute=0, second=0, microsecond=0)
            current_day = current_hour.replace(hour=0)
            current_month = current_day.replace(day=1)

            pipe = self.redis.pipeline()

            if record.usage_type == UsageType.API_CALL:
                key = f"quota:api_calls:{record.user_id}:{current_hour.timestamp()}"
                pipe.incr(key)
                pipe.expire(key, 3600)  # 1 hour TTL

            elif record.usage_type == UsageType.DATA_INGESTION:
                key = f"quota:data_ingestion:{record.user_id}:{current_day.timestamp()}"
                pipe.incrbyfloat(key, float(record.quantity))
                pipe.expire(key, 86400)  # 1 day TTL

            elif record.usage_type == UsageType.ML_INFERENCE:
                key = f"quota:ml_inference:{record.user_id}:{current_hour.timestamp()}"
                pipe.incr(key)
                pipe.expire(key, 3600)  # 1 hour TTL

            elif record.usage_type == UsageType.STORAGE:
                key = f"quota:storage:{record.user_id}"
                pipe.set(key, float(record.quantity))  # Absolute value for storage

            elif record.usage_type == UsageType.EXPORT:
                key = f"quota:exports:{record.user_id}:{current_day.timestamp()}"
                pipe.incr(key)
                pipe.expire(key, 86400)  # 1 day TTL

            elif record.usage_type == UsageType.PARSING:
                key = f"quota:parsing:{record.user_id}:{current_month.timestamp()}"
                pipe.incrbyfloat(key, float(record.quantity))
                pipe.expire(key, 2592000)  # 30 days TTL

            await pipe.execute()

        except Exception as e:
            logger.error(f"Error updating usage counters: {e}")

    async def _store_usage_record(self, record: UsageRecord):
        """Store usage record in database for billing."""
        try:
            async with self.db_session_factory() as session:
                await session.execute(
                    text(
                        """
                        INSERT INTO usage_records 
                        (user_id, organization_id, usage_type, quantity, unit, 
                         timestamp, resource_id, metadata, cost_usd, trace_id)
                        VALUES 
                        (:user_id, :organization_id, :usage_type, :quantity, :unit,
                         :timestamp, :resource_id, :metadata, :cost_usd, :trace_id)
                    """
                    ),
                    {
                        "user_id": record.user_id,
                        "organization_id": record.organization_id,
                        "usage_type": record.usage_type.value,
                        "quantity": float(record.quantity),
                        "unit": record.unit,
                        "timestamp": record.timestamp,
                        "resource_id": record.resource_id,
                        "metadata": json.dumps(record.metadata) if record.metadata else None,
                        "cost_usd": float(record.cost_usd) if record.cost_usd else None,
                        "trace_id": record.trace_id,
                    },
                )
                await session.commit()

        except Exception as e:
            logger.error(f"Error storing usage record: {e}")

    async def _detect_usage_anomaly(self, record: UsageRecord):
        """Detect unusual usage patterns for fraud prevention."""
        try:
            # Get historical average for this user/type
            window_key = f"usage_history:{record.user_id}:{record.usage_type.value}"
            history = await self.redis.lrange(window_key, 0, 23)  # Last 24 hours

            if len(history) >= 10:  # Minimum data points
                values = [float(x) for x in history]
                avg = sum(values) / len(values)
                current_value = float(record.quantity)

                # Flag if 5x above average
                if current_value > avg * 5:
                    await self._flag_usage_anomaly(record, current_value, avg)

            # Add current usage to history
            await self.redis.lpush(window_key, str(record.quantity))
            await self.redis.ltrim(window_key, 0, 23)  # Keep only 24 values
            await self.redis.expire(window_key, 86400)  # 24 hour TTL

        except Exception as e:
            logger.error(f"Error detecting usage anomaly: {e}")

    async def _flag_usage_anomaly(self, record: UsageRecord, current: float, average: float):
        """Flag suspicious usage for review."""
        try:
            alert = {
                "user_id": record.user_id,
                "usage_type": record.usage_type.value,
                "current_value": current,
                "average_value": average,
                "multiplier": current / average if average > 0 else 0,
                "timestamp": record.timestamp.isoformat(),
                "trace_id": record.trace_id,
            }

            # Store alert for review
            await self.redis.lpush("usage_anomaly_alerts", json.dumps(alert))

            logger.warning(f"Usage anomaly detected: {alert}")

        except Exception as e:
            logger.error(f"Error flagging usage anomaly: {e}")

    async def _record_throttle_incident(self, user_id: str, usage_type: UsageType):
        """Record quota exceeded incident."""
        try:
            incident = {
                "user_id": user_id,
                "usage_type": usage_type.value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "throttled",
            }

            await self.redis.lpush("throttle_incidents", json.dumps(incident))

            # Update throttle counter for user
            daily_key = f"throttles:{user_id}:{datetime.now(timezone.utc).date()}"
            await self.redis.incr(daily_key)
            await self.redis.expire(daily_key, 86400)

        except Exception as e:
            logger.error(f"Error recording throttle incident: {e}")

    async def get_usage_summary(self, user_id: str, period_days: int = 30) -> UsageSummary:
        """Generate usage summary for billing dashboard."""
        try:
            end_time = datetime.now(timezone.utc)
            start_time = end_time - timedelta(days=period_days)

            async with self.db_session_factory() as session:
                # Get usage by type
                result = await session.execute(
                    text(
                        """
                        SELECT usage_type, SUM(quantity) as total_quantity, SUM(cost_usd) as total_cost
                        FROM usage_records 
                        WHERE user_id = :user_id 
                        AND timestamp >= :start_time 
                        AND timestamp <= :end_time
                        GROUP BY usage_type
                    """
                    ),
                    {"user_id": user_id, "start_time": start_time, "end_time": end_time},
                )

                usage_by_type = {}
                total_cost = Decimal("0")

                for row in result:
                    usage_by_type[row[0]] = Decimal(str(row[1]))
                    total_cost += Decimal(str(row[2] or 0))

                # Get quota usage percentages
                quota_usage = await self._get_quota_usage_percentages(user_id)

                # Get throttle incidents
                throttle_key = f"throttles:{user_id}:*"
                throttle_keys = await self.redis.keys(throttle_key)
                throttle_incidents = 0
                for key in throttle_keys:
                    throttle_incidents += int(await self.redis.get(key) or 0)

                return UsageSummary(
                    user_id=user_id,
                    period_start=start_time,
                    period_end=end_time,
                    total_cost_usd=total_cost,
                    usage_by_type=usage_by_type,
                    quota_usage=quota_usage,
                    throttle_incidents=throttle_incidents,
                )

        except Exception as e:
            logger.error(f"Error generating usage summary: {e}")
            return UsageSummary(
                user_id=user_id,
                period_start=start_time,
                period_end=end_time,
                total_cost_usd=Decimal("0"),
                usage_by_type={},
                quota_usage={},
                throttle_incidents=0,
            )

    async def _get_quota_usage_percentages(self, user_id: str) -> Dict[str, float]:
        """Get current quota usage as percentages."""
        try:
            plan_tier = await self._get_user_plan(user_id)
            quota = self.quotas[plan_tier]

            current_time = datetime.now(timezone.utc)
            current_hour = current_time.replace(minute=0, second=0, microsecond=0)
            current_day = current_hour.replace(hour=0)
            current_month = current_day.replace(day=1)

            quota_usage = {}

            # API calls (hourly)
            key = f"quota:api_calls:{user_id}:{current_hour.timestamp()}"
            current = int(await self.redis.get(key) or 0)
            quota_usage["api_calls"] = (current / quota.api_calls_per_hour) * 100

            # Data ingestion (daily)
            key = f"quota:data_ingestion:{user_id}:{current_day.timestamp()}"
            current = float(await self.redis.get(key) or 0)
            quota_usage["data_ingestion"] = (current / quota.data_ingestion_gb_per_day) * 100

            # ML inference (hourly)
            key = f"quota:ml_inference:{user_id}:{current_hour.timestamp()}"
            current = int(await self.redis.get(key) or 0)
            quota_usage["ml_inference"] = (current / quota.ml_inference_calls_per_hour) * 100

            # Storage (absolute)
            key = f"quota:storage:{user_id}"
            current = float(await self.redis.get(key) or 0)
            quota_usage["storage"] = (current / quota.storage_gb_max) * 100

            # Exports (daily)
            key = f"quota:exports:{user_id}:{current_day.timestamp()}"
            current = int(await self.redis.get(key) or 0)
            quota_usage["exports"] = (current / quota.export_calls_per_day) * 100

            # Parsing (monthly)
            key = f"quota:parsing:{user_id}:{current_month.timestamp()}"
            current = float(await self.redis.get(key) or 0)
            quota_usage["parsing"] = (current / quota.parsing_hours_per_month) * 100

            return quota_usage

        except Exception as e:
            logger.error(f"Error getting quota usage: {e}")
            return {}

    async def get_billing_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive billing dashboard data."""
        try:
            # Get current plan and limits
            plan_tier = await self._get_user_plan(user_id)
            quota = self.quotas[plan_tier]

            # Get usage summary for current month
            summary = await self.get_usage_summary(user_id, 30)

            # Get quota usage
            quota_usage = await self._get_quota_usage_percentages(user_id)

            # Get recent usage trends (last 7 days)
            trends = await self._get_usage_trends(user_id, 7)

            # Get alerts and incidents
            alerts = await self._get_recent_alerts(user_id, 7)

            return {
                "user_id": user_id,
                "plan_tier": plan_tier.value,
                "current_period": {
                    "start": summary.period_start.isoformat(),
                    "end": summary.period_end.isoformat(),
                    "total_cost_usd": float(summary.total_cost_usd),
                    "usage_by_type": {k: float(v) for k, v in summary.usage_by_type.items()},
                    "throttle_incidents": summary.throttle_incidents,
                },
                "quota_limits": asdict(quota),
                "quota_usage_percent": quota_usage,
                "usage_trends": trends,
                "recent_alerts": alerts,
                "pricing": {
                    k.value: {uk.value: float(uv) for uk, uv in v.items()}
                    for k, v in self.pricing.items()
                },
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Error generating billing dashboard data: {e}")
            return {"error": str(e)}

    async def _get_usage_trends(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get daily usage trends for charts."""
        try:
            trends = []
            end_date = datetime.now(timezone.utc).date()

            for i in range(days):
                date = end_date - timedelta(days=i)
                start_time = datetime.combine(date, datetime.min.time())
                end_time = datetime.combine(date, datetime.max.time())

                async with self.db_session_factory() as session:
                    result = await session.execute(
                        text(
                            """
                            SELECT usage_type, SUM(quantity) as total_quantity, SUM(cost_usd) as total_cost
                            FROM usage_records 
                            WHERE user_id = :user_id 
                            AND timestamp >= :start_time 
                            AND timestamp <= :end_time
                            GROUP BY usage_type
                        """
                        ),
                        {"user_id": user_id, "start_time": start_time, "end_time": end_time},
                    )

                    day_usage = {"date": date.isoformat(), "usage": {}}
                    total_cost = 0

                    for row in result:
                        day_usage["usage"][row[0]] = float(row[1])
                        total_cost += float(row[2] or 0)

                    day_usage["total_cost"] = total_cost
                    trends.append(day_usage)

            return list(reversed(trends))  # Chronological order

        except Exception as e:
            logger.error(f"Error getting usage trends: {e}")
            return []

    async def _get_recent_alerts(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get recent alerts and incidents for user."""
        try:
            alerts = []

            # Get throttle incidents
            throttle_incidents = await self.redis.lrange("throttle_incidents", 0, 50)
            for incident_data in throttle_incidents:
                try:
                    incident = json.loads(incident_data)
                    if incident["user_id"] == user_id:
                        incident_time = datetime.fromisoformat(incident["timestamp"])
                        if (datetime.now(timezone.utc) - incident_time).days <= days:
                            alerts.append(
                                {
                                    "type": "throttle",
                                    "message": f"Quota exceeded for {incident['usage_type']}",
                                    "timestamp": incident["timestamp"],
                                    "severity": "warning",
                                }
                            )
                except Exception:
                    continue

            # Get usage anomaly alerts
            anomaly_alerts = await self.redis.lrange("usage_anomaly_alerts", 0, 50)
            for alert_data in anomaly_alerts:
                try:
                    alert = json.loads(alert_data)
                    if alert["user_id"] == user_id:
                        alert_time = datetime.fromisoformat(alert["timestamp"])
                        if (datetime.now(timezone.utc) - alert_time).days <= days:
                            alerts.append(
                                {
                                    "type": "anomaly",
                                    "message": f"Unusual {alert['usage_type']} usage detected ({alert['multiplier']:.1f}x normal)",
                                    "timestamp": alert["timestamp"],
                                    "severity": "info",
                                }
                            )
                except Exception:
                    continue

            # Sort by timestamp (newest first)
            alerts.sort(key=lambda x: x["timestamp"], reverse=True)
            return alerts[:20]  # Limit to 20 most recent

        except Exception as e:
            logger.error(f"Error getting recent alerts: {e}")
            return []


# Global billing manager instance
billing_manager: Optional[BillingManager] = None


def get_billing_manager() -> Optional[BillingManager]:
    """Get the global billing manager instance."""
    return billing_manager


def initialize_billing_manager(redis_client: aioredis.Redis, db_session_factory):
    """Initialize the global billing manager."""
    global billing_manager
    billing_manager = BillingManager(redis_client, db_session_factory)
    return billing_manager
