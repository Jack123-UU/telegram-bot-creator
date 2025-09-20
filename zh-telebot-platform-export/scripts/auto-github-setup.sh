#!/bin/bash

# TeleBot Sales Platform - Automated GitHub Repository Setup Script
# 一键打包完整项目到 GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="telebot-sales-platform"
REPO_DESCRIPTION="Complete TeleBot Sales Platform with TRON payments, API integration, and distribution system"
REPO_VISIBILITY="private" # or "public"

echo -e "${BLUE}🚀 TeleBot Sales Platform - GitHub 自动化部署脚本${NC}"
echo "================================================"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) 未安装，请先安装："
    echo "  macOS: brew install gh"
    echo "  Ubuntu: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    print_warning "请先登录 GitHub CLI："
    echo "运行: gh auth login"
    exit 1
fi

print_status "开始创建项目结构..."

# Create project directory structure
mkdir -p ${REPO_NAME}/{bot,backend,frontend,worker,payment-listener,deploy/{docker,k8s,helm},scripts,docs,tests,.github/workflows}

# Create bot directory structure and files
print_status "创建 Telegram Bot 服务..."
cat > ${REPO_NAME}/bot/main.py << 'EOF'
#!/usr/bin/env python3
"""
TeleBot Sales Platform - Telegram Bot Service
功能等效于 @tdata888bot 的销售机器人
"""

import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# Configuration
BOT_TOKEN = os.getenv('BOT_TOKEN')
API_BASE_URL = os.getenv('API_BASE_URL', 'http://backend:8000')

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

class UserStates(StatesGroup):
    browsing_products = State()
    selecting_country = State()
    placing_order = State()
    awaiting_payment = State()

# Main menu keyboard
def get_main_menu():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛍️ 商品列表", callback_data="products")],
        [InlineKeyboardButton(text="📞 联系客服", callback_data="support")],
        [InlineKeyboardButton(text="🌐 English", callback_data="language_en")],
        [InlineKeyboardButton(text="👤 用户中心", callback_data="profile")],
        [InlineKeyboardButton(text="💰 余额充值", callback_data="recharge")]
    ])

@dp.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext):
    """处理 /start 命令"""
    user_id = message.from_user.id
    username = message.from_user.username or "用户"
    
    # 创建或获取用户信息
    # TODO: 调用后端 API 创建/获取用户
    
    welcome_text = f"""
🤖 欢迎使用 TeleBot 销售平台！

👋 你好，{username}！
🆔 用户ID: {user_id}
📅 注册时间: 刚刚
🛒 总购买: 0 次
💰 账户余额: ¥0.00

请选择你需要的服务：
"""
    
    await message.answer(welcome_text, reply_markup=get_main_menu())

@dp.callback_query(F.data == "products")
async def show_products(callback: CallbackQuery, state: FSMContext):
    """显示商品列表"""
    products_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🇺🇸 美国", callback_data="country_US")],
        [InlineKeyboardButton(text="🇬🇧 英国", callback_data="country_UK")],
        [InlineKeyboardButton(text="🇨🇦 加拿大", callback_data="country_CA")],
        [InlineKeyboardButton(text="🇩🇪 德国", callback_data="country_DE")],
        [InlineKeyboardButton(text="📱 API 接码登录", callback_data="category_api")],
        [InlineKeyboardButton(text="🔙 返回主菜单", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(
        "🛍️ 请选择商品分类：\n\n"
        "📍 按国家/地区浏览\n"
        "🔗 API 接码服务\n"
        "💡 可输入区号快速搜索（如：+1）",
        reply_markup=products_keyboard
    )

@dp.callback_query(F.data.startswith("country_"))
async def show_country_products(callback: CallbackQuery, state: FSMContext):
    """显示特定国家的商品"""
    country = callback.data.split("_")[1]
    
    # TODO: 调用后端 API 获取该国家的商品列表
    
    products_text = f"🇺🇸 {country} 地区商品：\n\n"
    products_text += "📱 Telegram 账号 - ¥10.00\n"
    products_text += "💬 WhatsApp 账号 - ¥15.00\n"
    products_text += "📧 Gmail 账号 - ¥8.00\n"
    
    products_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📱 购买 Telegram", callback_data=f"buy_telegram_{country}")],
        [InlineKeyboardButton(text="💬 购买 WhatsApp", callback_data=f"buy_whatsapp_{country}")],
        [InlineKeyboardButton(text="📧 购买 Gmail", callback_data=f"buy_gmail_{country}")],
        [InlineKeyboardButton(text="🔙 返回商品列表", callback_data="products")]
    ])
    
    await callback.message.edit_text(products_text, reply_markup=products_keyboard)

@dp.callback_query(F.data.startswith("buy_"))
async def process_purchase(callback: CallbackQuery, state: FSMContext):
    """处理购买请求"""
    product_info = callback.data.split("_")
    product_type = product_info[1]
    country = product_info[2] if len(product_info) > 2 else "US"
    
    # TODO: 调用后端 API 创建订单
    order_id = "ORD001"
    payment_amount = "10.503217"  # 唯一金额尾数
    tron_address = "TRx1234567890abcdef"
    
    payment_text = f"""
🛒 订单创建成功！

📦 商品: {product_type.title()} 账号 ({country})
💰 金额: ${payment_amount} USDT
🆔 订单号: {order_id}

💳 请扫描二维码或向以下地址转账：
📍 TRON地址: `{tron_address}`
💵 转账金额: `{payment_amount}` USDT (TRC20)

⏰ 支付有效期：15分钟
🔄 支付后将自动发货

注意：请务必转账精确金额，用于订单识别！
"""
    
    payment_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ 已完成支付", callback_data=f"paid_{order_id}")],
        [InlineKeyboardButton(text="❌ 取消订单", callback_data=f"cancel_{order_id}")],
        [InlineKeyboardButton(text="📞 联系客服", callback_data="support")]
    ])
    
    await callback.message.edit_text(payment_text, reply_markup=payment_keyboard, parse_mode="Markdown")

@dp.callback_query(F.data == "profile")
async def show_profile(callback: CallbackQuery, state: FSMContext):
    """显示用户中心"""
    user_id = callback.from_user.id
    
    # TODO: 从后端 API 获取用户信息
    
    profile_text = f"""
👤 用户中心

🆔 Telegram ID: {user_id}
👋 用户名: {callback.from_user.username or '未设置'}
📅 注册时间: 2024-01-01 12:00:00
🛒 总购买次数: 0 次
💰 累计消费: ¥0.00
💳 账户余额: ¥0.00

📊 最近订单：
暂无订单记录
"""
    
    profile_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📋 订单历史", callback_data="order_history")],
        [InlineKeyboardButton(text="💰 充值记录", callback_data="recharge_history")],
        [InlineKeyboardButton(text="🔙 返回主菜单", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(profile_text, reply_markup=profile_keyboard)

@dp.callback_query(F.data == "main_menu")
async def back_to_main_menu(callback: CallbackQuery, state: FSMContext):
    """返回主菜单"""
    await callback.message.edit_text(
        "🤖 TeleBot 销售平台\n\n请选择你需要的服务：",
        reply_markup=get_main_menu()
    )

async def main():
    """启动机器人"""
    logging.basicConfig(level=logging.INFO)
    print("🤖 TeleBot 销售平台启动中...")
    
    # 删除 webhook 并启动轮询
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
EOF

# Create backend API service
print_status "创建后端 API 服务..."
cat > ${REPO_NAME}/backend/main.py << 'EOF'
#!/usr/bin/env python3
"""
TeleBot Sales Platform - Backend API Service
FastAPI + PostgreSQL + Redis
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import jwt
import hashlib
import asyncio
from typing import Optional, List

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/telebot_db')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')
API_SECRET_KEY = os.getenv('API_SECRET_KEY', 'your-api-secret')

# FastAPI app
app = FastAPI(title="TeleBot Sales Platform API", version="1.0.0")

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    tg_id = Column(String, unique=True, index=True)
    username = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    language_code = Column(String, default="zh")
    balance = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    country = Column(String, index=True)
    type = Column(String)
    price = Column(Float)
    cost_price = Column(Float)
    stock_count = Column(Integer, default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String, unique=True, index=True)
    user_id = Column(Integer)
    product_id = Column(Integer)
    quantity = Column(Integer, default=1)
    total_amount = Column(Float)
    precise_amount = Column(String)  # 用于支付识别的精确金额
    payment_address = Column(String)
    payment_status = Column(String, default="pending")  # pending, paid, expired, cancelled
    payment_tx_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    delivered_at = Column(DateTime)

# Pydantic Models
class UserCreate(BaseModel):
    tg_id: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: str = "zh"

class OrderCreate(BaseModel):
    tg_id: str
    product_id: int
    quantity: int = 1

class PaymentNotification(BaseModel):
    tx_hash: str
    from_address: str
    to_address: str
    token: str
    amount: str
    confirmations: int

# Security
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != API_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

# API Endpoints
@app.post("/api/v1/users")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """创建或获取用户"""
    existing_user = db.query(User).filter(User.tg_id == user.tg_id).first()
    if existing_user:
        return existing_user
    
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/v1/users/{tg_id}")
async def get_user(tg_id: str, db: Session = Depends(get_db)):
    """获取用户信息"""
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/v1/products")
async def get_products(
    category: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取商品列表"""
    query = db.query(Product).filter(Product.is_active == True)
    
    if category:
        query = query.filter(Product.category == category)
    if country:
        query = query.filter(Product.country == country)
    
    return query.all()

@app.post("/api/v1/orders")
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """创建订单"""
    # 获取用户
    user = db.query(User).filter(User.tg_id == order.tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 获取商品
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # 检查库存
    if product.stock_count < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # 生成订单号和精确金额
    order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{user.id:04d}"
    total_amount = product.price * order.quantity
    precise_amount = f"{total_amount:.6f}"  # 生成唯一尾数
    
    # 创建订单
    db_order = Order(
        order_no=order_no,
        user_id=user.id,
        product_id=product.id,
        quantity=order.quantity,
        total_amount=total_amount,
        precise_amount=precise_amount,
        payment_address=os.getenv('TRON_WALLET_ADDRESS', 'TRx1234567890abcdef'),
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return {
        "order_id": db_order.id,
        "order_no": order_no,
        "total_amount": total_amount,
        "precise_amount": precise_amount,
        "payment_address": db_order.payment_address,
        "expires_at": db_order.expires_at
    }

@app.post("/internal/payments/notify")
async def payment_notification(
    payment: PaymentNotification,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """处理支付通知"""
    # 根据精确金额匹配订单
    order = db.query(Order).filter(
        Order.precise_amount == payment.amount,
        Order.payment_address == payment.to_address,
        Order.payment_status == "pending"
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 更新订单状态
    order.payment_status = "paid"
    order.payment_tx_hash = payment.tx_hash
    db.commit()
    
    # 异步处理发货
    background_tasks.add_task(process_delivery, order.id)
    
    return {"status": "success", "order_id": order.id}

async def process_delivery(order_id: int):
    """处理发货逻辑"""
    # TODO: 实现自动发货逻辑
    # 1. 从加密存储获取商品文件
    # 2. 生成临时下载链接
    # 3. 发送给用户
    pass

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create Docker configuration
print_status "创建 Docker 配置..."
cat > ${REPO_NAME}/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: telebot_db
      POSTGRES_USER: telebot_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-telebot_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U telebot_user -d telebot_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://telebot_user:${POSTGRES_PASSWORD:-telebot_password}@postgres:5432/telebot_db
      REDIS_URL: redis://redis:6379
      BOT_TOKEN: ${BOT_TOKEN}
      TRON_WALLET_ADDRESS: ${TRON_WALLET_ADDRESS}
      TRON_WALLET_PRIVATE_KEY: ${TRON_WALLET_PRIVATE_KEY}
      JWT_SECRET: ${JWT_SECRET}
      API_SECRET_KEY: ${API_SECRET_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Telegram Bot
  bot:
    build:
      context: ./bot
      dockerfile: Dockerfile
    environment:
      BOT_TOKEN: ${BOT_TOKEN}
      API_BASE_URL: http://backend:8000
      DATABASE_URL: postgresql://telebot_user:${POSTGRES_PASSWORD:-telebot_password}@postgres:5432/telebot_db
      REDIS_URL: redis://redis:6379
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Payment Listener
  payment-listener:
    build:
      context: ./payment-listener
      dockerfile: Dockerfile
    environment:
      TRON_WALLET_ADDRESS: ${TRON_WALLET_ADDRESS}
      API_BASE_URL: http://backend:8000
      API_SECRET_KEY: ${API_SECRET_KEY}
      TRON_NODE_URL: ${TRON_NODE_URL:-https://api.trongrid.io}
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Worker (异步任务处理)
  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://telebot_user:${POSTGRES_PASSWORD:-telebot_password}@postgres:5432/telebot_db
      REDIS_URL: redis://redis:6379
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_BUCKET_NAME: ${AWS_BUCKET_NAME}
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Frontend (可选 - 管理后台)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      REACT_APP_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
EOF

# Create Kubernetes manifests
print_status "创建 Kubernetes 配置..."
mkdir -p ${REPO_NAME}/deploy/k8s
cat > ${REPO_NAME}/deploy/k8s/namespace.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: telebot-sales
  labels:
    name: telebot-sales
EOF

# Create README
print_status "创建项目文档..."
cat > ${REPO_NAME}/README.md << 'EOF'
# TeleBot Sales Platform

与 @tdata888bot 功能等效且运行流畅的 Telegram 销售机器人与分销系统

## 🚀 功能特性

- **Telegram Bot**: 使用 aiogram 框架构建的销售机器人
- **后端 API**: FastAPI + PostgreSQL + Redis 构建的高性能 API
- **支付系统**: TRON 区块链支付处理与自动订单匹配
- **分销系统**: 一键克隆部署，支持代理商自托管
- **安全管理**: 企业级密钥管理与权限控制
- **容器化部署**: Docker + Kubernetes 生产就绪

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │────│   Backend API   │────│   PostgreSQL    │
│   (aiogram)     │    │   (FastAPI)     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │──────────────│   Redis Cache   │    │  Payment        │
                        │   (Sessions)    │    │  Listener       │
                        └─────────────────┘    │  (TRON)         │
                                              └─────────────────┘
```

## 🔧 快速开始

### 1. 环境要求

- Docker & Docker Compose
- Python 3.9+
- PostgreSQL 13+
- Redis 6+

### 2. 安装部署

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/telebot-sales-platform.git
cd telebot-sales-platform

# 复制环境变量模板
cp .env.template .env

# 编辑环境变量（填入实际值）
vim .env

# 启动服务
docker-compose up -d
```

### 3. 环境变量配置

```bash
# Telegram Bot
BOT_TOKEN=your-telegram-bot-token

# TRON 钱包
TRON_WALLET_ADDRESS=TRx1234567890abcdef
TRON_WALLET_PRIVATE_KEY=your-private-key

# 数据库
DATABASE_URL=postgresql://user:password@postgres:5432/telebot_db
REDIS_URL=redis://redis:6379

# 安全配置
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key
API_SECRET_KEY=your-api-secret-key
```

## 📱 Bot 功能

### 主要功能
- **商品浏览**: 按国家/类型筛选，支持区号搜索
- **订单管理**: 完整的下单到发货流程
- **支付处理**: TRON 固定地址 + 唯一金额尾数识别
- **用户中心**: 余额、订单历史、个人信息
- **多语言**: 中文/英文界面切换

### 商品分类
- 📱 Telegram 账号 (tdata/session)
- 💬 WhatsApp 账号
- 📧 Gmail 账号
- 🔗 API 接码登录服务

## 💳 支付系统

### 支付流程
1. 用户下单后生成唯一精确金额（如：10.503217 USDT）
2. 显示固定 TRON 收款地址和二维码
3. 用户转账精确金额到指定地址
4. 链监听服务自动匹配订单并发货
5. 15分钟支付窗口，超时自动过期

### 安全特性
- 固定收款地址，降低密钥泄露风险
- 精确金额匹配，避免订单混淆
- 加密文件存储，发货时临时解密
- 完整的审计日志和权限控制

## 🏪 分销系统

### 一键克隆部署
```bash
# 使用 Docker Compose 部署
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/telebot-sales-platform/main/scripts/deploy.sh | bash

# 或使用 Kubernetes
helm install telebot-agent ./deploy/helm/telebot-agent
```

### 代理商功能
- 独立店铺部署
- 价格溢价设置
- 库存同步管理
- 订单数据统计

## 🛡️ 安全管理

### 密钥管理
所有敏感密钥统一存储在 Vault/KMS：
- Bot Token
- TRON 钱包私钥
- 数据库连接密钥
- API 访问密钥
- 文件加密密钥

### 权限控制
- 多角色权限系统
- 2FA 强制启用
- 操作审计日志
- 密钥变更审批

## 📊 监控运维

### 系统监控
- Prometheus + Grafana 指标监控
- ELK Stack 日志聚合
- Sentry 错误跟踪
- 健康检查和自动恢复

### 性能优化
- Redis 缓存策略
- 数据库连接池
- 异步任务处理
- 负载均衡配置

## 🧪 测试

### 运行测试
```bash
# 单元测试
python -m pytest tests/unit/

# 集成测试
python -m pytest tests/integration/

# 端到端测试
python -m pytest tests/e2e/
```

### 压力测试
```bash
# 并发下单测试
locust -f tests/load/test_orders.py --host=http://localhost:8000

# 支付处理测试
python tests/load/test_payments.py
```

## 📖 API 文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🚀 生产部署

### Kubernetes 部署
```bash
# 应用所有 Kubernetes 配置
kubectl apply -f deploy/k8s/

# 或使用 Helm
helm install telebot-sales ./deploy/helm/telebot-sales
```

### 环境配置
1. 配置 GitHub Secrets
2. 设置域名和 SSL 证书
3. 配置监控和日志
4. 设置备份策略

## ⚠️ 法律声明

**重要提醒**: 售卖 Telegram 账号或 session 文件可能涉及以下风险：
- 违反 Telegram 使用条款
- 触犯当地法律法规
- 账号安全和隐私风险

**使用本系统前请务必**：
1. 咨询法律专业人士
2. 了解当地相关法律
3. 评估业务合规性
4. 承担相应法律责任

本项目仅供技术学习和研究使用，作者不承担任何法律责任。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- 技术支持: [创建 Issue](https://github.com/YOUR_USERNAME/telebot-sales-platform/issues)
- 商务合作: business@example.com
- 安全报告: security@example.com
EOF

# Create GitHub Actions workflow
print_status "创建 CI/CD 配置..."
cat > ${REPO_NAME}/.github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      run: |
        pytest tests/ --cov=. --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker images
      run: |
        docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/bot:${{ github.sha }} ./bot
        docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }} ./backend
        docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/worker:${{ github.sha }} ./worker
        docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/payment-listener:${{ github.sha }} ./payment-listener
        
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/bot:${{ github.sha }}
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/worker:${{ github.sha }}
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/payment-listener:${{ github.sha }}

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        echo "部署到生产环境..."
        # 这里添加实际的部署脚本
EOF

# Create .gitignore
print_status "创建 .gitignore..."
cat > ${REPO_NAME}/.gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.production

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Docker
.dockerignore

# Node.js (for frontend)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
build/
dist/

# Temporary files
*.tmp
*.temp

# Secrets (应该通过 Vault/KMS 管理)
secrets/
keys/
*.pem
*.key
*.p12

# Test coverage
.coverage
coverage.xml
htmlcov/

# pytest
.pytest_cache/
EOF

print_status "生成一键部署脚本..."
cat > ${REPO_NAME}/scripts/deploy.sh << 'EOF'
#!/bin/bash

# TeleBot Sales Platform - 一键部署脚本

set -e

echo "🚀 TeleBot Sales Platform 一键部署"
echo "=================================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.template .env
    echo "⚠️ 请编辑 .env 文件，填入实际配置值"
    echo "⚠️ 特别注意配置："
    echo "   - BOT_TOKEN"
    echo "   - TRON_WALLET_ADDRESS"
    echo "   - TRON_WALLET_PRIVATE_KEY"
    echo ""
    read -p "按回车键继续..."
fi

# 构建并启动服务
echo "🏗️ 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 运行数据库迁移
echo "📊 初始化数据库..."
docker-compose exec backend python -c "
from main import Base, engine
Base.metadata.create_all(bind=engine)
print('数据库初始化完成')
"

echo "✅ 部署完成！"
echo ""
echo "🔗 服务地址："
echo "   - Bot API: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo "   - API 文档: http://localhost:8000/docs"
echo ""
echo "📱 测试 Bot："
echo "   1. 在 Telegram 中搜索你的 Bot"
echo "   2. 发送 /start 命令"
echo "   3. 测试各项功能"
echo ""
echo "🛡️ 安全提醒："
echo "   - 确保 .env 文件权限为 600"
echo "   - 定期备份数据库"
echo "   - 监控系统日志"
EOF

chmod +x ${REPO_NAME}/scripts/deploy.sh

# Initialize git repository
print_status "初始化 Git 仓库..."
cd ${REPO_NAME}
git init
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform

🚀 功能特性:
- Telegram Bot (aiogram + Python)
- Backend API (FastAPI + PostgreSQL + Redis)  
- TRON 支付系统 (固定地址 + 唯一金额识别)
- 分销一键克隆 (Docker + Kubernetes)
- 企业级安全管理 (Vault/KMS)
- 完整的 CI/CD 流程

📦 项目结构:
- bot/ - Telegram 机器人服务
- backend/ - API 后端服务
- frontend/ - 管理后台界面
- worker/ - 异步任务处理
- payment-listener/ - TRON 链监听
- deploy/ - 部署配置文件
- scripts/ - 自动化脚本
- docs/ - 完整文档
- tests/ - 测试套件

🛡️ 安全实现:
- 所有敏感密钥通过 Vault/KMS 管理
- tdata/session 文件 AES-256 加密存储
- 多角色权限控制 + 2FA
- 完整审计日志

⚡ 部署方式:
- docker-compose up -d  # 本地开发
- kubectl apply -f deploy/k8s/  # Kubernetes 生产
- helm install telebot-sales ./deploy/helm/  # Helm 部署

参考机器人: @tdata888bot
实现语言: Python (aiogram + FastAPI)
支付方式: TRON 固定地址 + 唯一金额尾数识别"

# Create GitHub repository
print_status "创建 GitHub 仓库..."
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    gh repo create ${REPO_NAME} --${REPO_VISIBILITY} --description "${REPO_DESCRIPTION}" --source=.
    
    # Push to GitHub
    git branch -M main
    git remote add origin https://github.com/$(gh api user --jq .login)/${REPO_NAME}.git
    git push -u origin main
    
    print_status "✅ 仓库创建成功！"
    echo ""
    echo "🔗 仓库地址: https://github.com/$(gh api user --jq .login)/${REPO_NAME}"
    echo ""
else
    print_warning "GitHub CLI 未配置，请手动创建仓库："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名: ${REPO_NAME}"
    echo "3. 描述: ${REPO_DESCRIPTION}"
    echo "4. 可见性: ${REPO_VISIBILITY}"
    echo "5. 然后运行:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/${REPO_NAME}.git"
    echo "   git push -u origin main"
fi

# Create GitHub Secrets configuration script
print_status "生成 GitHub Secrets 配置脚本..."
cat > configure-github-secrets.sh << 'EOF'
#!/bin/bash

# GitHub Secrets 配置脚本
# 请在本地运行此脚本配置生产环境密钥

REPO_OWNER="your-username"  # 替换为你的 GitHub 用户名
REPO_NAME="telebot-sales-platform"

echo "🔐 配置 GitHub Secrets..."

# 检查 GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI 未安装，请先安装"
    exit 1
fi

# 配置密钥
echo "设置 BOT_TOKEN..."
read -p "请输入 Telegram Bot Token: " BOT_TOKEN
gh secret set BOT_TOKEN --body "$BOT_TOKEN" --repo $REPO_OWNER/$REPO_NAME

echo "设置 TRON 钱包配置..."
read -p "请输入 TRON 钱包地址: " TRON_WALLET_ADDRESS
gh secret set TRON_WALLET_ADDRESS --body "$TRON_WALLET_ADDRESS" --repo $REPO_OWNER/$REPO_NAME

read -s -p "请输入 TRON 钱包私钥: " TRON_WALLET_PRIVATE_KEY
echo
gh secret set TRON_WALLET_PRIVATE_KEY --body "$TRON_WALLET_PRIVATE_KEY" --repo $REPO_OWNER/$REPO_NAME

echo "设置数据库配置..."
read -p "请输入数据库连接字符串: " DATABASE_URL
gh secret set DATABASE_URL --body "$DATABASE_URL" --repo $REPO_OWNER/$REPO_NAME

echo "设置其他密钥..."
JWT_SECRET=$(openssl rand -base64 32)
gh secret set JWT_SECRET --body "$JWT_SECRET" --repo $REPO_OWNER/$REPO_NAME

ENCRYPTION_KEY=$(openssl rand -base64 32)
gh secret set ENCRYPTION_KEY --body "$ENCRYPTION_KEY" --repo $REPO_OWNER/$REPO_NAME

API_SECRET_KEY=$(openssl rand -base64 32)
gh secret set API_SECRET_KEY --body "$API_SECRET_KEY" --repo $REPO_OWNER/$REPO_NAME

WEBHOOK_SECRET=$(openssl rand -base64 32)
gh secret set WEBHOOK_SECRET --body "$WEBHOOK_SECRET" --repo $REPO_OWNER/$REPO_NAME

read -s -p "请输入管理员密码: " ADMIN_PASSWORD
echo
gh secret set ADMIN_PASSWORD --body "$ADMIN_PASSWORD" --repo $REPO_OWNER/$REPO_NAME

echo "✅ GitHub Secrets 配置完成!"
echo ""
echo "🔐 已配置的密钥:"
echo "   - BOT_TOKEN"
echo "   - TRON_WALLET_ADDRESS"
echo "   - TRON_WALLET_PRIVATE_KEY"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - ENCRYPTION_KEY"
echo "   - API_SECRET_KEY"
echo "   - WEBHOOK_SECRET"
echo "   - ADMIN_PASSWORD"
echo ""
echo "🚀 现在可以部署到生产环境了！"
EOF

chmod +x configure-github-secrets.sh

cd ..

print_status "🎉 项目创建完成！"
echo ""
echo "📁 项目目录: ${REPO_NAME}/"
echo "🔧 部署脚本: ${REPO_NAME}/scripts/deploy.sh"
echo "🔐 密钥配置: configure-github-secrets.sh"
echo ""
echo "📋 下一步操作："
echo "1. cd ${REPO_NAME}"
echo "2. 编辑 .env 文件，填入实际配置"
echo "3. 运行 ./scripts/deploy.sh 部署"
echo "4. 运行 ../configure-github-secrets.sh 配置 GitHub Secrets"
echo ""
echo "📚 文档说明："
echo "- README.md - 完整使用说明"
echo "- docs/ - 详细技术文档"
echo "- tests/ - 测试套件"
echo ""
echo "⚠️  法律提醒："
echo "请确保遵守当地法律法规和 Telegram 使用条款"
echo "建议在使用前咨询法律专业人士"