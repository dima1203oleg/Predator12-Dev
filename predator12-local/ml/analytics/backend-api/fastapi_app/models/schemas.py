from pydantic import BaseModel, Field, EmailStr, validator, root_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import re

# Base models with common fields
class BaseSchema(BaseModel):
    class Config:
        orm_mode = True

# Authentication and User schemas
class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    permissions: List[str] = []

class RoleBase(BaseSchema):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserBase(BaseSchema):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserResponse(UserBase):
    id: int
    roles: List[RoleResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# Tender schemas
class TenderBase(BaseSchema):
    tender_id: str
    title: str
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    procurement_method: Optional[str] = None
    procurement_entity: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    award_date: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class TenderCreate(TenderBase):
    pass

class TenderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    procurement_method: Optional[str] = None
    procurement_entity: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    award_date: Optional[datetime] = None
    winner_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None

class TenderResponse(TenderBase):
    id: int
    winner_id: Optional[int] = None
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class TenderDetailResponse(TenderResponse):
    companies: List['CompanyResponse'] = []
    winner: Optional['CompanyResponse'] = None

# Company schemas
class CompanyBase(BaseSchema):
    name: str
    company_id: str
    tax_id: Optional[str] = None
    registration_date: Optional[datetime] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    registration_date: Optional[datetime] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None

class CompanyResponse(CompanyBase):
    id: int
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class CompanyDetailResponse(CompanyResponse):
    tenders: List[TenderResponse] = []
    persons: List['PersonResponse'] = []

# Person schemas
class PersonBase(BaseSchema):
    name: str
    person_id: str
    tax_id: Optional[str] = None
    birth_date: Optional[datetime] = None
    nationality: Optional[str] = None
    position: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    birth_date: Optional[datetime] = None
    nationality: Optional[str] = None
    position: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None

class PersonResponse(PersonBase):
    id: int
    risk_score: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class PersonDetailResponse(PersonResponse):
    companies: List[CompanyResponse] = []
    connections: List['PersonConnectionResponse'] = []

class PersonConnectionResponse(BaseModel):
    person: PersonResponse
    connection_type: str
    strength: float

# Analysis schemas
class AnalysisRequest(BaseModel):
    analysis_type: str = Field(..., description="Type of analysis to perform")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Parameters for the analysis")
    
    @validator('analysis_type')
    def validate_analysis_type(cls, v):
        valid_types = ['tender_collusion', 'lobbying_influence', 'customs_scheme', 'network_graph']
        if v not in valid_types:
            raise ValueError(f"Analysis type must be one of: {', '.join(valid_types)}")
        return v

class AnalysisResponse(BaseModel):
    id: int
    analysis_type: str
    name: str
    description: Optional[str] = None
    parameters: Dict[str, Any]
    result: Dict[str, Any]
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class NetworkGraphRequest(BaseModel):
    name: str
    description: Optional[str] = None
    graph_type: str = Field(..., description="Type of network graph to create")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Parameters for graph creation")
    
    @validator('graph_type')
    def validate_graph_type(cls, v):
        valid_types = ['tender_network', 'company_network', 'person_network', 'mixed_network']
        if v not in valid_types:
            raise ValueError(f"Graph type must be one of: {', '.join(valid_types)}")
        return v

class NetworkGraphResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    graph_type: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# Update forward references for nested models
TenderDetailResponse.update_forward_refs()
CompanyDetailResponse.update_forward_refs()
PersonDetailResponse.update_forward_refs()
