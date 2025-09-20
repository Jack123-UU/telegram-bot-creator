"""
Backend API for TeleBot Sales Platform
FastAPI application with TRON payment processing
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import redis.asyncio as redis
import os
import logging
from typing import Optional, List
import uvicorn
from decimal import Decimal
import asyncio
from datetime import datetime, timedelta
import secrets

from models import Base, User, Product, Order, Payment, Agent
from schemas import (
    UserCreate, UserResponse, ProductCreate, ProductResponse,
    OrderCreate, OrderResponse, PaymentCreate, PaymentResponse,
    PaymentNotification
)
from tron_client import TronClient
from vault_client import VaultClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DEV_DATABASE_URL") or "postgresql+asyncpg://telebot:changeme@localhost:5432/telebot_sales"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
VAULT_ADDR = os.getenv("VAULT_ADDR", "http://localhost:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN") or os.getenv("DEV_VAULT_TOKEN")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Security
security = HTTPBearer()

# Global variables
engine = None
redis_client = None
vault_client = None
tron_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global engine, redis_client, vault_client, tron_client
    
    # Startup
    logger.info("Starting TeleBot Sales API...")
    
    # Database
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Redis
    redis_client = redis.from_url(REDIS_URL)
    await redis_client.ping()
    
    # Vault client
    vault_client = VaultClient(VAULT_ADDR, VAULT_TOKEN)
    await vault_client.initialize_secrets()
    
    # TRON client
    tron_client = TronClient(vault_client)
    
    logger.info("All services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down services...")
    await redis_client.close()
    await engine.dispose()

# FastAPI app
app = FastAPI(
    title="TeleBot Sales API",
    description="Backend API for Telegram sales bot with TRON payment processing",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency injection
async def get_db() -> AsyncSession:
    """Get database session"""
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

async def get_redis():
    """Get Redis client"""
    return redis_client

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API token"""
    if ENVIRONMENT == "development":
        return True
    
    # In production, implement proper JWT token verification
    expected_token = await vault_client.get_secret("api/internal-token")
    if credentials.credentials != expected_token:
        raise HTTPException(status_code=401, detail="Invalid token")
    return True

# Routes

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "redis": "connected",
            "vault": "connected",
            "tron": "connected"
        }
    }

@app.post("/api/v1/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    try:
        # Check if user exists
        existing_user = await db.get(User, user_data.tg_id)
        if existing_user:
            return UserResponse.from_orm(existing_user)
        
        # Create new user
        user = User(
            tg_id=user_data.tg_id,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            language_code=user_data.language_code or "en",
            balance=Decimal("0.00"),
            total_orders=0,
            total_spent=Decimal("0.00"),
            created_at=datetime.utcnow()
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"Created user: {user.tg_id}")
        return UserResponse.from_orm(user)
        
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.get("/api/v1/users/{tg_id}", response_model=UserResponse)
async def get_user(
    tg_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get user by Telegram ID"""
    user = await db.get(User, tg_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@app.get("/api/v1/products", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    country: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List products with optional filtering"""
    from sqlalchemy import select
    
    query = select(Product).where(Product.status == "active")
    
    if category:
        query = query.where(Product.category == category)
    if country:
        query = query.where(Product.country == country)
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return [ProductResponse.from_orm(product) for product in products]

@app.post("/api/v1/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Create a new order with unique payment amount"""
    try:
        # Get user and product
        user = await db.get(User, order_data.tg_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        product = await db.get(Product, order_data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        if product.stock < order_data.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Calculate total amount with unique precision
        base_amount = product.price * order_data.quantity
        unique_suffix = await generate_unique_payment_amount()
        total_amount = base_amount + Decimal(f"0.00{unique_suffix}")
        
        # Create order
        order = Order(
            user_id=user.tg_id,
            product_id=product.id,
            quantity=order_data.quantity,
            unit_price=product.price,
            total_amount=total_amount,
            status="pending_payment",
            payment_address=await vault_client.get_secret("payment/tron-address"),
            expires_at=datetime.utcnow() + timedelta(minutes=15),
            created_at=datetime.utcnow()
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        # Schedule payment monitoring
        background_tasks.add_task(monitor_payment, order.id)
        
        logger.info(f"Created order {order.id} for user {user.tg_id}")
        return OrderResponse.from_orm(order)
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@app.post("/internal/payments/notify")
async def payment_notification(
    payment_data: PaymentNotification,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_token)
):
    """Internal endpoint for payment notifications from blockchain monitor"""
    try:
        # Find matching order by payment amount and address
        from sqlalchemy import select, and_
        
        query = select(Order).where(
            and_(
                Order.total_amount == payment_data.amount,
                Order.payment_address == payment_data.to_address,
                Order.status == "pending_payment"
            )
        )
        
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if not order:
            logger.warning(f"No matching order found for payment: {payment_data.tx_hash}")
            return {"status": "no_match"}
        
        # Create payment record
        payment = Payment(
            order_id=order.id,
            tx_hash=payment_data.tx_hash,
            from_address=payment_data.from_address,
            to_address=payment_data.to_address,
            amount=payment_data.amount,
            token=payment_data.token,
            confirmations=payment_data.confirmations,
            status="confirmed" if payment_data.confirmations >= 1 else "pending",
            created_at=datetime.utcnow()
        )
        
        db.add(payment)
        
        # Update order status
        if payment_data.confirmations >= 1:
            order.status = "paid"
            order.paid_at = datetime.utcnow()
            
            # Trigger delivery process
            await trigger_delivery(order.id, db)
        
        await db.commit()
        
        logger.info(f"Payment processed for order {order.id}: {payment_data.tx_hash}")
        return {"status": "success", "order_id": order.id}
        
    except Exception as e:
        logger.error(f"Error processing payment notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to process payment")

async def generate_unique_payment_amount() -> str:
    """Generate unique 4-digit suffix for payment amount"""
    # Simple implementation - in production, use distributed counter or UUID-based
    suffix = secrets.randbelow(10000)
    return f"{suffix:04d}"

async def monitor_payment(order_id: int):
    """Background task to monitor payment for an order"""
    # This would integrate with the TRON blockchain monitor
    # For now, it's a placeholder
    logger.info(f"Started payment monitoring for order {order_id}")

async def trigger_delivery(order_id: int, db: AsyncSession):
    """Trigger product delivery after payment confirmation"""
    try:
        order = await db.get(Order, order_id)
        if not order:
            return
        
        # Update order status
        order.status = "delivering"
        
        # Decrease product stock
        product = await db.get(Product, order.product_id)
        if product:
            product.stock -= order.quantity
        
        # In a real implementation, this would:
        # 1. Decrypt and retrieve the product file
        # 2. Generate a temporary download link
        # 3. Send the link to the user via bot
        
        order.status = "completed"
        order.delivered_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info(f"Delivery completed for order {order_id}")
        
    except Exception as e:
        logger.error(f"Error in delivery process: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if ENVIRONMENT == "development" else False
    )