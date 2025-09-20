"""
Database models for TeleBot Sales Platform
"""

from sqlalchemy import Column, Integer, String, Decimal, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """Telegram user model"""
    __tablename__ = "users"
    
    tg_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=True, index=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    language_code = Column(String(10), default="en")
    balance = Column(Decimal(10, 2), default=0.00)
    total_orders = Column(Integer, default=0)
    total_spent = Column(Decimal(10, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="user")

class Product(Base):
    """Product model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # session, api, etc.
    country = Column(String(100), nullable=True, index=True)
    type = Column(String(100), nullable=True)  # phone, email, etc.
    price = Column(Decimal(10, 2), nullable=False)
    cost_price = Column(Decimal(10, 2), nullable=True)
    stock = Column(Integer, default=0)
    file_path_encrypted = Column(String(500), nullable=True)  # Path to encrypted file
    status = Column(String(50), default="active")  # active, inactive, out_of_stock
    owner = Column(String(100), default="HQ")  # HQ or distributor ID
    validation_status = Column(String(50), default="pending")  # pending, valid, invalid
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="product")

class Order(Base):
    """Order model"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.tg_id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Decimal(10, 2), nullable=False)
    total_amount = Column(Decimal(18, 6), nullable=False, unique=True)  # Unique for payment matching
    status = Column(String(50), default="pending_payment")  # pending_payment, paid, delivering, completed, cancelled, expired
    payment_address = Column(String(255), nullable=False)
    download_token = Column(String(255), nullable=True)  # Temporary download token
    expires_at = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    payments = relationship("Payment", back_populates="order")

class Payment(Base):
    """Payment transaction model"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    tx_hash = Column(String(255), nullable=False, unique=True, index=True)
    from_address = Column(String(255), nullable=False)
    to_address = Column(String(255), nullable=False)
    amount = Column(Decimal(18, 6), nullable=False)
    token = Column(String(50), default="USDT-TRC20")
    confirmations = Column(Integer, default=0)
    status = Column(String(50), default="pending")  # pending, confirmed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="payments")

class Agent(Base):
    """Distributor/Agent model"""
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    api_key = Column(String(255), nullable=False, unique=True)
    commission_rate = Column(Decimal(5, 2), default=10.00)  # Percentage
    is_active = Column(Boolean, default=True)
    payment_address = Column(String(255), nullable=True)  # Agent's TRON address
    total_sales = Column(Decimal(10, 2), default=0.00)
    total_commission = Column(Decimal(10, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    """Audit log for important actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # Who performed the action
    action = Column(String(100), nullable=False)  # Action type
    resource_type = Column(String(100), nullable=False)  # What was affected
    resource_id = Column(String(100), nullable=True)  # ID of affected resource
    old_values = Column(Text, nullable=True)  # JSON of old values
    new_values = Column(Text, nullable=True)  # JSON of new values
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class APIEndpoint(Base):
    """API endpoint configuration for mobile API access"""
    __tablename__ = "api_endpoints"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    endpoint_url = Column(String(500), nullable=False)  # e.g., https://miha.uk/tgapi/{token}/{uuid}/{action}
    access_token = Column(String(255), nullable=False)
    uuid = Column(String(255), nullable=False)
    available_actions = Column(Text, nullable=True)  # JSON array of available actions
    rate_limit = Column(Integer, default=100)  # Requests per hour
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product")

class PaymentRule(Base):
    """Payment verification rules configuration"""
    __tablename__ = "payment_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(100), nullable=False, unique=True)
    min_confirmations = Column(Integer, default=1)
    payment_timeout_minutes = Column(Integer, default=15)
    allowed_tokens = Column(Text, default='["USDT-TRC20"]')  # JSON array
    min_amount = Column(Decimal(18, 6), default=0.000001)
    max_amount = Column(Decimal(18, 6), default=999999.999999)
    precision_digits = Column(Integer, default=6)  # For unique amount generation
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)