#!/bin/bash

# TeleBot Deployment Script for Real Telegram Testing
# Bot Token: 8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk

set -e

echo "🚀 TeleBot Deployment Script"
echo "============================"
echo ""

# Configuration
BOT_TOKEN="8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk"
ENVIRONMENT=${1:-production}  # production or development
DOMAIN=${2:-localhost}

echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo "Bot Token: ${BOT_TOKEN:0:10}***"
echo ""

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    echo "✅ Docker Compose is available"
}

# Function to create necessary directories
create_directories() {
    echo "📁 Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p storage/encrypted
    mkdir -p monitoring
    mkdir -p nginx
    mkdir -p backend
    mkdir -p bot
    mkdir -p payment-listener
    
    echo "✅ Directories created"
}

# Function to generate configuration files
generate_configs() {
    echo "⚙️ Generating configuration files..."
    
    # Create init-db.sql
    cat > init-db.sql << 'EOF'
-- TeleBot Database Initialization Script

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'zh',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    description TEXT,
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    owner VARCHAR(100) DEFAULT 'HQ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,6) NOT NULL,
    precise_amount DECIMAL(10,6) NOT NULL,
    payment_address VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    from_address VARCHAR(100),
    to_address VARCHAR(100),
    amount DECIMAL(10,6) NOT NULL,
    token VARCHAR(50),
    confirmations INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Services table (new feature)
CREATE TABLE IF NOT EXISTS api_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    auth_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, category, country, type, price, description) VALUES
('US Phone Number', 'phone', 'US', 'SMS', 2.50, 'US phone number for SMS verification'),
('UK Phone Number', 'phone', 'UK', 'SMS', 3.00, 'UK phone number for SMS verification'),
('API Login Service', 'api', 'Global', 'LOGIN', 5.00, 'API login endpoint access');

INSERT INTO api_services (service_name, api_endpoint, price, description) VALUES
('Telegram API Login', 'https://miha.uk/tgapi/{token}/{uuid}/GetHTML', 10.00, 'Direct Telegram API login access'),
('Bulk API Access', 'https://miha.uk/tgapi/bulk/{token}/process', 25.00, 'Bulk API processing service');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tg_id ON users(tg_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
EOF

    # Create Nginx configuration
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /webhook {
            proxy_pass http://api/webhook;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /health {
            proxy_pass http://api/health;
        }
    }
}
EOF

    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'telebot-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
EOF

    echo "✅ Configuration files generated"
}

# Function to create Docker files
create_dockerfiles() {
    echo "🐳 Creating Dockerfiles..."
    
    # Backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    # Bot Dockerfile
    cat > bot/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy bot code
COPY . .

# Run the bot
CMD ["python", "bot.py"]
EOF

    # Payment Listener Dockerfile
    cat > payment-listener/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy listener code
COPY . .

# Run the payment listener
CMD ["python", "listener.py"]
EOF

    echo "✅ Dockerfiles created"
}

# Function to create sample application files
create_sample_apps() {
    echo "📝 Creating sample application files..."
    
    # Backend requirements.txt
    cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
asyncpg==0.29.0
redis==5.0.1
pydantic==2.5.0
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.1.2
aiofiles==23.2.1
python-multipart==0.0.6
cryptography==41.0.8
requests==2.31.0
aiogram==3.3.0
celery==5.3.4
prometheus-client==0.19.0
pycryptodome==3.19.0
tronpy==0.4.0
EOF

    # Bot requirements.txt
    cat > bot/requirements.txt << 'EOF'
aiogram==3.3.0
aioredis==2.0.1
aiohttp==3.9.1
asyncpg==0.29.0
python-dotenv==1.0.0
loguru==0.7.2
EOF

    # Payment Listener requirements.txt
    cat > payment-listener/requirements.txt << 'EOF'
tronpy==0.4.0
requests==2.31.0
redis==5.0.1
asyncpg==0.29.0
python-dotenv==1.0.0
schedule==1.2.0
loguru==0.7.2
EOF

    # Simple FastAPI main.py
    cat > backend/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import os
import asyncio
from datetime import datetime

app = FastAPI(title="TeleBot API", version="1.0.0")

BOT_TOKEN = os.getenv("BOT_TOKEN", "8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk")

@app.get("/")
async def root():
    return {"message": "TeleBot API Server", "status": "running", "bot_token": BOT_TOKEN[:10] + "***"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/webhook")
async def webhook(data: dict):
    """Telegram webhook endpoint"""
    print(f"Received webhook data: {data}")
    return {"status": "ok"}

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "username": f"user_{user_id}", "balance": 0.0}

@app.get("/api/v1/products")
async def get_products():
    return {
        "products": [
            {"id": 1, "name": "US Phone Number", "price": 2.50, "category": "phone"},
            {"id": 2, "name": "API Login Service", "price": 5.00, "category": "api"},
        ]
    }

@app.post("/api/v1/orders")
async def create_order(order_data: dict):
    order_no = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}"
    return {
        "order_no": order_no,
        "amount": 10.003241,
        "payment_address": "TYs8kpCAh8Qk1G2fJhS8KrB6WQG6vSxD9K",
        "status": "pending"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

    # Simple Bot script
    cat > bot/bot.py << 'EOF'
import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Bot token
BOT_TOKEN = os.getenv("BOT_TOKEN", "8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk")

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Create main menu keyboard
def get_main_menu():
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🛍️ 商品列表"), KeyboardButton(text="👤 用户中心")],
            [KeyboardButton(text="🔌 API接码服务"), KeyboardButton(text="💰 余额充值")],
            [KeyboardButton(text="🌐 English"), KeyboardButton(text="📞 联系客服")]
        ],
        resize_keyboard=True
    )
    return keyboard

@dp.message(Command("start"))
async def start_command(message: types.Message):
    user_id = message.from_user.id
    username = message.from_user.username or "用户"
    
    welcome_text = f"""
🎉 欢迎使用 TeleBot 销售平台！

👋 你好 @{username}！
🆔 用户ID: {user_id}
📅 注册时间: {message.date.strftime('%Y-%m-%d %H:%M:%S')}
💰 账户余额: $0.00
📦 历史订单: 0

请选择您需要的服务:
    """
    
    await message.answer(welcome_text, reply_markup=get_main_menu())

@dp.message(lambda message: message.text == "🛍️ 商品列表")
async def show_products(message: types.Message):
    products_text = """
📦 可用商品列表:

1️⃣ 美国手机号码 - $2.50
   📱 支持SMS验证
   🌍 区号: +1

2️⃣ 英国手机号码 - $3.00
   📱 支持SMS验证
   🌍 区号: +44

3️⃣ API接码登录 - $5.00
   🔌 API endpoint access
   🌐 全球可用

点击下方按钮选择商品:
    """
    await message.answer(products_text)

@dp.message(lambda message: message.text == "🔌 API接码服务")
async def show_api_services(message: types.Message):
    api_text = """
🔌 API接码服务:

🌟 新功能上线！

📍 服务端点样例:
https://miha.uk/tgapi/uWCSVDgG6XMaMT5C/fa7e47cc-d2d2-4ead-bfc1-039a7135f057/GetHTML

💰 价格: $10.00
⚡ 即时访问
🔒 安全加密

立即下单获取您的专属API访问权限！
    """
    await message.answer(api_text)

@dp.message(lambda message: message.text == "👤 用户中心")
async def show_user_center(message: types.Message):
    user_info = f"""
👤 用户中心

🆔 TG ID: {message.from_user.id}
👤 用户名: @{message.from_user.username or 'N/A'}
📅 注册时间: {message.date.strftime('%Y-%m-%d')}
💰 账户余额: $0.00
📦 总订单数: 0
💸 总消费: $0.00

🔄 最近订单: 暂无
    """
    await message.answer(user_info)

@dp.message(lambda message: message.text == "🌐 English")
async def switch_language(message: types.Message):
    english_text = """
🌐 Language switched to English

👋 Welcome to TeleBot Sales Platform!

🛍️ Available Services:
• Phone Numbers (US, UK, etc.)
• API Integration Services  
• Premium Account Access

💰 Secure TRON Payment System
🔒 Encrypted File Delivery
⚡ Instant Processing

Choose your service from the menu below:
    """
    await message.answer(english_text, reply_markup=get_main_menu())

@dp.message()
async def echo_handler(message: types.Message):
    await message.answer(f"收到消息: {message.text}\n\n请使用下方菜单选择服务 👇")

async def main():
    print(f"🤖 Bot starting with token: {BOT_TOKEN[:10]}***")
    print("🚀 TeleBot is ready!")
    
    # Start polling
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
EOF

    # Simple Payment Listener
    cat > payment-listener/listener.py << 'EOF'
import asyncio
import os
import time
import requests
from tronpy import Tron
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TRON_WALLET = os.getenv("TRON_WALLET_ADDRESS", "TYs8kpCAh8Qk1G2fJhS8KrB6WQG6vSxD9K")
API_BASE_URL = os.getenv("API_BASE_URL", "http://api:8000")

async def monitor_payments():
    """Monitor TRON network for payments"""
    logger.info(f"🔍 Starting payment monitoring for address: {TRON_WALLET}")
    
    while True:
        try:
            # Simulate payment monitoring
            logger.info("⏰ Checking for new payments...")
            
            # Here you would implement real TRON network monitoring
            # For demo purposes, we'll just log the monitoring activity
            
            # Simulate finding a payment
            if time.time() % 300 < 10:  # Every 5 minutes for 10 seconds
                logger.info("💰 Payment detected! Processing...")
                
                # Notify API about payment
                try:
                    response = requests.post(f"{API_BASE_URL}/internal/payments/notify", json={
                        "tx_hash": f"0x{int(time.time())}abc",
                        "from_address": "TSenderAddress123",
                        "to_address": TRON_WALLET,
                        "amount": "10.003241",
                        "token": "USDT-TRC20",
                        "confirmations": 1
                    })
                    logger.info(f"✅ Payment notification sent: {response.status_code}")
                except Exception as e:
                    logger.error(f"❌ Failed to notify API: {e}")
            
            await asyncio.sleep(30)  # Check every 30 seconds
            
        except Exception as e:
            logger.error(f"❌ Error in payment monitoring: {e}")
            await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(monitor_payments())
EOF

    echo "✅ Sample application files created"
}

# Function to start services
start_services() {
    echo "🚀 Starting TeleBot services..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "Starting development environment..."
        docker-compose -f docker-compose.dev.yml down --remove-orphans
        docker-compose -f docker-compose.dev.yml up --build -d
        
        echo ""
        echo "🎉 Development environment started!"
        echo ""
        echo "📊 Services:"
        echo "  - API: http://localhost:8001"
        echo "  - Nginx: http://localhost:8080"
        echo "  - Adminer: http://localhost:8090"
        echo "  - Redis Commander: http://localhost:8091"
        echo ""
        echo "🤖 Bot Token: $BOT_TOKEN"
        echo ""
        
    else
        echo "Starting production environment..."
        docker-compose -f docker-compose.prod.yml down --remove-orphans
        docker-compose -f docker-compose.prod.yml up --build -d
        
        echo ""
        echo "🎉 Production environment started!"
        echo ""
        echo "📊 Services:"
        echo "  - API: http://localhost:8000"
        echo "  - Nginx: http://localhost:80"
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Grafana: http://localhost:3000"
        echo ""
        echo "🤖 Bot Token: $BOT_TOKEN"
        echo ""
    fi
}

# Function to show service status
show_status() {
    echo "📊 Service Status:"
    echo "=================="
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        docker-compose -f docker-compose.prod.yml ps
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Recent Logs:"
    echo "==============="
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose -f docker-compose.dev.yml logs --tail=50
    else
        docker-compose -f docker-compose.prod.yml logs --tail=50
    fi
}

# Function to stop services
stop_services() {
    echo "⏹️ Stopping TeleBot services..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose -f docker-compose.prod.yml down
    fi
    
    echo "✅ Services stopped"
}

# Function to test the bot
test_bot() {
    echo "🧪 Testing Bot Functionality..."
    
    # Test API health
    echo "Testing API health..."
    curl -f http://localhost:8000/health || echo "❌ API health check failed"
    
    # Test webhook
    echo "Testing webhook..."
    curl -X POST http://localhost:8000/webhook -H "Content-Type: application/json" -d '{"test": true}' || echo "❌ Webhook test failed"
    
    echo ""
    echo "🔗 Bot Links:"
    echo "  Telegram: https://t.me/test_8424135673_bot"
    echo "  API Docs: http://localhost:8000/docs"
    echo ""
    echo "📱 Test Commands in Telegram:"
    echo "  /start - Initialize bot"
    echo "  🛍️ 商品列表 - View products"
    echo "  🔌 API接码服务 - API services"
    echo "  👤 用户中心 - User center"
    echo ""
}

# Main execution
main() {
    case ${1:-start} in
        "start")
            check_docker
            check_docker_compose
            create_directories
            generate_configs
            create_dockerfiles
            create_sample_apps
            start_services
            sleep 10
            show_status
            test_bot
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 5
            start_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "test")
            test_bot
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|test} [environment] [domain]"
            echo ""
            echo "Examples:"
            echo "  $0 start production your-domain.com"
            echo "  $0 start development"
            echo "  $0 stop"
            echo "  $0 status"
            echo "  $0 logs"
            echo "  $0 test"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"