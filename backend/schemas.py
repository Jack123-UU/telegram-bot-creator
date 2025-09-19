"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    tg_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = "en"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    tg_id: int
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    language_code: str
    balance: Decimal
    total_orders: int
    total_spent: Decimal
    is_active: bool
    created_at: datetime

# Product schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    country: Optional[str] = None
    type: Optional[str] = None
    price: Decimal
    cost_price: Optional[Decimal] = None
    stock: int = 0
    owner: str = "HQ"

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str]
    category: str
    country: Optional[str]
    type: Optional[str]
    price: Decimal
    stock: int
    status: str
    owner: str
    validation_status: str
    created_at: datetime

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    status: Optional[str] = None

# Order schemas
class OrderCreate(BaseModel):
    tg_id: int
    product_id: int
    quantity: int = 1

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    status: str
    payment_address: str
    expires_at: datetime
    paid_at: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime

# Payment schemas
class PaymentCreate(BaseModel):
    order_id: int
    tx_hash: str
    from_address: str
    to_address: str
    amount: Decimal
    token: str = "USDT-TRC20"
    confirmations: int = 0

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    order_id: int
    tx_hash: str
    from_address: str
    to_address: str
    amount: Decimal
    token: str
    confirmations: int
    status: str
    created_at: datetime

class PaymentNotification(BaseModel):
    """Schema for blockchain payment notifications"""
    tx_hash: str
    from_address: str
    to_address: str
    amount: Decimal
    token: str
    confirmations: int
    block_height: Optional[int] = None
    timestamp: Optional[datetime] = None

# Agent schemas
class AgentCreate(BaseModel):
    name: str
    email: str
    commission_rate: Decimal = Decimal("10.00")
    payment_address: Optional[str] = None

class AgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    api_key: str
    commission_rate: Decimal
    is_active: bool
    payment_address: Optional[str]
    total_sales: Decimal
    total_commission: Decimal
    created_at: datetime

# API Endpoint schemas
class APIEndpointCreate(BaseModel):
    product_id: int
    endpoint_url: str
    access_token: str
    uuid: str
    available_actions: Optional[List[str]] = None
    rate_limit: int = 100

class APIEndpointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    product_id: int
    endpoint_url: str
    access_token: str
    uuid: str
    available_actions: Optional[str]
    rate_limit: int
    is_active: bool
    created_at: datetime

class APIEndpointBulkImport(BaseModel):
    """Schema for bulk importing API endpoints"""
    endpoints: List[APIEndpointCreate]
    validate_urls: bool = True
    auto_activate: bool = False

# Payment Rule schemas
class PaymentRuleCreate(BaseModel):
    rule_name: str
    min_confirmations: int = 1
    payment_timeout_minutes: int = 15
    allowed_tokens: List[str] = ["USDT-TRC20"]
    min_amount: Decimal = Decimal("0.000001")
    max_amount: Decimal = Decimal("999999.999999")
    precision_digits: int = 6

class PaymentRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    rule_name: str
    min_confirmations: int
    payment_timeout_minutes: int
    allowed_tokens: str  # JSON string
    min_amount: Decimal
    max_amount: Decimal
    precision_digits: int
    is_active: bool
    created_at: datetime

# System configuration schemas
class SystemConfig(BaseModel):
    bot_token: Optional[str] = None
    payment_address: Optional[str] = None
    tron_node_url: Optional[str] = None
    default_language: str = "en"
    max_order_timeout: int = 30  # minutes
    auto_delivery: bool = True

class SystemStatus(BaseModel):
    status: str
    timestamp: datetime
    services: dict
    version: str = "1.0.0"

# Error schemas
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

# Bulk operation schemas
class BulkProductImport(BaseModel):
    products: List[ProductCreate]
    validate_files: bool = True
    auto_activate: bool = False

class BulkImportResult(BaseModel):
    total_processed: int
    successful: int
    failed: int
    errors: List[str]
    created_ids: List[int]

# Analytics schemas
class SalesAnalytics(BaseModel):
    period_start: datetime
    period_end: datetime
    total_orders: int
    total_revenue: Decimal
    top_products: List[dict]
    top_countries: List[dict]
    conversion_rate: float

class UserAnalytics(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    average_order_value: Decimal
    user_retention_rate: float