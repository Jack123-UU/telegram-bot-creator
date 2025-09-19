# TeleBot Sales Platform - Complete Deployment Guide

## 🚀 Quick Start (Development)

### 1. Prerequisites
```bash
# Required software
- Docker & Docker Compose
- Git
- Python 3.11+ (for development)
- Node.js 18+ (for frontend development)

# Get Telegram Bot Token
1. Message @BotFather on Telegram
2. Create new bot: /newbot
3. Follow instructions and save your bot token

# Get TRON Wallet
1. Create TRON wallet (TronLink, etc.)
2. Get your address (starts with 'T')
3. Export private key (keep secure!)
```

### 2. Clone and Setup
```bash
# Clone repository
git clone <your-repo-url>
cd telebot-sales-platform

# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

### 3. Configure Environment
Edit `.env` file with your actual values:
```bash
# Essential settings
BOT_TOKEN=your-telegram-bot-token-from-botfather
TRON_PRIVATE_KEY=your-tron-wallet-private-key
PAYMENT_ADDRESS=your-tron-wallet-address

# Database (use defaults for development)
DATABASE_URL=postgresql://telebot:dev_password_123@postgres:5432/telebot_sales
REDIS_URL=redis://redis:6379/0

# Vault (use defaults for development)
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=dev-root-token
```

### 4. Start Development Environment
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 5. Run Integration Tests
```bash
# Wait for services to be ready (2-3 minutes)
# Then run integration tests
./test_integration.sh
```

### 6. Access Your Platform
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Vault UI**: http://localhost:8200 (token: `dev-root-token`)
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │    Frontend     │    │     Admin       │
│     Users       │    │   Dashboard     │    │    Users        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
    ┌─────▼──────────────────────▼──────────────────────▼─────┐
    │                 API Gateway                             │
    └─────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────▼───────────────────────────────────┐
    │              FastAPI Backend                            │
    │  • Order Management  • User Management                  │
    │  • Product Catalog   • Payment Processing              │
    │  • Agent System      • Security & Auth                 │
    └─────────┬───────────────────────────────┬───────────────┘
              │                               │
    ┌─────────▼──────┐              ┌─────────▼──────┐
    │   PostgreSQL   │              │  Redis Cache   │
    │   Database     │              │  & Sessions    │
    └────────────────┘              └────────────────┘
              │                               │
    ┌─────────▼───────────────────────────────▼───────────────┐
    │                Telegram Bot                             │
    │  • aiogram Framework  • Multi-language Support         │
    │  • Product Browsing   • Order Creation                 │
    │  • Payment Tracking   • User Management                │
    └─────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────▼───────────────────────────────────┐
    │              Payment Monitor                            │
    │  • TRON Blockchain Monitoring                          │
    │  • Payment Verification                                │
    │  • Automatic Order Fulfillment                        │
    └─────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────▼───────────────────────────────────┐
    │              Security Layer                             │
    │  • HashiCorp Vault   • Encrypted Storage               │
    │  • Secret Management • Audit Logging                   │
    │  • Access Control    • Key Rotation                    │
    └─────────────────────────────────────────────────────────┘
```

## 📊 Component Details

### Backend API (FastAPI)
- **Purpose**: Core business logic and API endpoints
- **Port**: 8000
- **Features**:
  - User management
  - Product catalog
  - Order processing
  - Payment verification
  - Agent/distributor system
  - Security and authentication

### Telegram Bot (aiogram)
- **Purpose**: User interface for customers
- **Features**:
  - Multi-language support (English/Chinese)
  - Product browsing and filtering
  - Order creation and tracking
  - Payment processing
  - User account management

### Payment Monitor (Custom)
- **Purpose**: TRON blockchain monitoring
- **Features**:
  - Real-time transaction monitoring
  - Payment verification
  - Automatic order fulfillment
  - Error handling and retry logic

### Security (Vault)
- **Purpose**: Secrets management
- **Features**:
  - Encrypted secret storage
  - Access control and policies
  - Audit logging
  - Secret rotation

## 🔧 Configuration Guide

### Bot Configuration
```python
# In bot/main.py, configure these settings:

# Language support
SUPPORTED_LANGUAGES = ['en', 'zh']

# Payment settings
PAYMENT_TIMEOUT = 15  # minutes
MIN_CONFIRMATIONS = 1

# Rate limiting
MAX_REQUESTS_PER_MINUTE = 20
```

### Payment Configuration
```python
# In backend/main.py, configure payment settings:

# TRON network settings
TRON_NODE_URL = "https://api.trongrid.io"  # Or your own node
SUPPORTED_TOKENS = ["USDT-TRC20"]

# Payment verification
MIN_CONFIRMATIONS = 1
PAYMENT_PRECISION = 6  # Decimal places for unique amounts
```

### Database Configuration
```sql
-- Essential database settings in backend/init.sql

-- Performance indexes
CREATE INDEX idx_orders_payment_amount ON orders(total_amount);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);

-- Cleanup function
SELECT cleanup_expired_orders();  -- Run periodically
```

## 🏭 Production Deployment

### 1. Prepare Production Environment
```bash
# Create production directory
mkdir telebot-production
cd telebot-production

# Copy necessary files
cp -r ../telebot-sales-platform/deploy/ .
cp ../telebot-sales-platform/docker-compose.prod.yml docker-compose.yml
```

### 2. Configure Production Secrets
```bash
# Create production .env
cat > .env << EOF
# Production settings
ENVIRONMENT=production
DEBUG=false

# Real bot token
BOT_TOKEN=your-real-bot-token

# Real TRON settings
TRON_PRIVATE_KEY=your-real-private-key
PAYMENT_ADDRESS=your-real-tron-address
TRON_NODE_URL=https://your-tron-node.com

# Secure database
DATABASE_URL=postgresql://user:secure_pass@prod-db:5432/telebot_sales

# Production Vault
VAULT_ADDR=https://vault.yourdomain.com
VAULT_TOKEN=your-production-vault-token

# Security settings
API_INTERNAL_TOKEN=your-secure-internal-token
ENCRYPTION_KEY=your-32-byte-encryption-key
JWT_SECRET_KEY=your-jwt-secret-key

# Domain settings
DOMAIN=yourdomain.com
TLS_EMAIL=admin@yourdomain.com
EOF
```

### 3. Deploy with Docker Compose
```bash
# Start production deployment
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Setup Monitoring
```bash
# Install monitoring tools
docker-compose -f monitoring.yml up -d

# Access monitoring
# Prometheus: http://yourdomain.com:9090
# Grafana: http://yourdomain.com:3000
```

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] Change all default passwords
- [ ] Generate strong encryption keys
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Enable audit logging
- [ ] Configure backup procedures

### Runtime Security
- [ ] Monitor system health
- [ ] Review audit logs
- [ ] Update dependencies regularly
- [ ] Rotate secrets periodically
- [ ] Monitor payment transactions
- [ ] Backup database daily

### Access Control
- [ ] Limit admin access
- [ ] Use strong passwords
- [ ] Enable 2FA where possible
- [ ] Regular access reviews
- [ ] Monitor failed login attempts

## 📈 Scaling Guide

### Horizontal Scaling
```yaml
# Scale backend API
docker-compose up -d --scale backend=3

# Scale payment monitor
docker-compose up -d --scale payment-monitor=2

# Scale bot (if needed)
docker-compose up -d --scale bot=2
```

### Performance Optimization
```sql
-- Database optimization
VACUUM ANALYZE;

-- Index maintenance
REINDEX DATABASE telebot_sales;

-- Connection pooling (in production)
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'
```

### Load Balancing
```nginx
# Nginx configuration for load balancing
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🎯 Testing Strategy

### Unit Tests
```bash
# Backend tests
cd backend
pytest tests/ -v

# Bot tests
cd bot
pytest tests/ -v
```

### Integration Tests
```bash
# Full system test
./test_integration.sh

# Performance test
ab -n 1000 -c 10 http://localhost:8000/health
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 🚨 Troubleshooting

### Common Issues

**Bot not responding**
```bash
# Check bot status
docker-compose logs bot

# Verify bot token
curl "https://api.telegram.org/bot$BOT_TOKEN/getMe"

# Restart bot service
docker-compose restart bot
```

**Payment not detected**
```bash
# Check payment monitor
docker-compose logs payment-monitor

# Verify TRON connection
curl "https://api.trongrid.io/v1/accounts/$PAYMENT_ADDRESS"

# Check database for orders
psql $DATABASE_URL -c "SELECT * FROM orders WHERE status='pending_payment';"
```

**Database connection error**
```bash
# Check database status
docker-compose logs postgres

# Test connection
docker-compose exec backend python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('$DATABASE_URL')
    print(await conn.fetchval('SELECT version()'))
    await conn.close()
asyncio.run(test())
"
```

**Vault secrets not loading**
```bash
# Check Vault status
curl $VAULT_ADDR/v1/sys/health

# List secrets
vault kv list secret/

# Test secret access
vault kv get secret/bot/token
```

### Performance Issues

**High CPU usage**
```bash
# Check container stats
docker stats

# Monitor processes
docker-compose exec backend top

# Check database queries
psql $DATABASE_URL -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**Memory leaks**
```bash
# Monitor memory usage
docker-compose exec backend python -c "
import psutil
import gc
print(f'Memory: {psutil.virtual_memory().percent}%')
print(f'GC objects: {len(gc.get_objects())}')
"
```

## 📋 Maintenance Guide

### Daily Tasks
- Check system health dashboard
- Review error logs
- Monitor payment transactions
- Verify bot responsiveness

### Weekly Tasks
- Review audit logs
- Update system dependencies
- Check database performance
- Backup verification

### Monthly Tasks
- Security audit
- Performance optimization
- Capacity planning
- Disaster recovery testing

## 🆘 Support

### Documentation
- API Documentation: `/docs` endpoint
- System Health: `/health` endpoint
- Metrics: Prometheus endpoint

### Community
- GitHub Issues: Report bugs and feature requests
- Telegram Support: @telebot_sales_support
- Email: support@yourdomain.com

### Professional Support
- Enterprise support available
- Custom development services
- 24/7 monitoring options
- SLA guarantees

---

## ⚠️ Legal Notice

This software is provided for educational and development purposes. Users are responsible for:
- Compliance with local laws and regulations
- Telegram Terms of Service compliance
- Financial regulations compliance
- Data protection and privacy laws

The developers are not responsible for any legal issues arising from the use of this software.