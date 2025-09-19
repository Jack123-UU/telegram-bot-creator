# TeleBot Sales Platform

A comprehensive Telegram sales bot platform with TRON blockchain payment processing, designed for automated product sales with secure payment verification and easy deployment for distributors.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- A Telegram Bot Token (from @BotFather)
- TRON wallet address for payments

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd telebot-sales-platform
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development environment**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

4. **Access the services**
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Vault UI: http://localhost:8200 (token: `dev-root-token`)
- MinIO Console: http://localhost:9001 (admin/minioadmin123)

## 📁 Project Structure

```
telebot-sales-platform/
├── backend/                 # FastAPI backend service
│   ├── main.py             # Main API application
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── tron_client.py      # TRON blockchain integration
│   ├── vault_client.py     # HashiCorp Vault client
│   ├── init.sql            # Database initialization
│   ├── Dockerfile          # Backend container
│   └── requirements.txt    # Python dependencies
├── bot/                    # Telegram bot service
│   ├── main.py             # Bot application (aiogram)
│   ├── vault_client.py     # Vault client for bot
│   ├── Dockerfile          # Bot container
│   └── requirements.txt    # Bot dependencies
├── payment-monitor/        # TRON payment monitoring service
│   ├── main.py             # Payment monitor
│   ├── Dockerfile          # Monitor container
│   └── requirements.txt    # Monitor dependencies
├── frontend/               # React admin dashboard (future)
├── deploy/                 # Deployment configurations
│   ├── helm/               # Helm charts for Kubernetes
│   └── docker-compose/     # Docker Compose templates
├── docs/                   # Documentation
├── tests/                  # Test suites
├── docker-compose.dev.yml  # Development environment
├── docker-compose.prod.yml # Production template
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🏗️ Architecture

### Core Components

1. **Telegram Bot (aiogram)**: User interface for product browsing and ordering
2. **FastAPI Backend**: REST API for order management and business logic
3. **TRON Payment Monitor**: Blockchain monitoring service for payment verification
4. **PostgreSQL**: Primary database for orders, users, and products
5. **Redis**: Caching and FSM storage for the bot
6. **HashiCorp Vault**: Secure secrets management
7. **MinIO**: S3-compatible file storage for encrypted product files

### Payment Flow

1. User creates order through Telegram bot
2. System generates unique payment amount with precision suffix
3. User sends USDT-TRC20 to fixed TRON address
4. Payment monitor detects transaction on blockchain
5. Backend matches payment to order and triggers delivery
6. Encrypted product files are temporarily decrypted for download

## 🔐 Security Features

### Secrets Management
- All sensitive data stored in HashiCorp Vault
- Runtime secret injection (no secrets in containers)
- Separate secret paths with fine-grained RBAC
- Automatic secret rotation support

### Payment Security
- Unique payment amounts prevent order confusion
- Fixed payment address with transaction monitoring
- Multi-confirmation verification
- Encrypted file storage with AES-256

### Access Control
- Bot token and API keys secured in Vault
- Internal API authentication
- Admin role separation
- Audit logging for all critical operations

## 🛠️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://telebot:password@postgres:5432/telebot_sales

# Redis
REDIS_URL=redis://redis:6379/0

# Vault
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=your-vault-token

# TRON Network
TRON_NODE_URL=https://api.trongrid.io
PAYMENT_ADDRESS=TYourTronAddressHere

# Bot
BOT_TOKEN=your-bot-token-here

# Security
ENVIRONMENT=development
API_INTERNAL_TOKEN=your-internal-api-token
```

### Vault Secrets Structure

```
secret/
├── bot/
│   └── token              # Telegram bot token
├── tron/
│   └── private-key        # TRON wallet private key
├── payment/
│   └── tron-address       # Payment receiving address
├── api/
│   └── internal-token     # Internal API authentication
└── encryption/
    └── aes-key           # File encryption key
```

## 🤖 Bot Features

### User Interface
- Multi-language support (English/Chinese)
- Product browsing by category and country
- Real-time order status updates
- Payment tracking with QR codes
- User account information

### Product Categories
- **Session Files**: Telegram session/tdata files
- **API Login**: Mobile API access endpoints
- **Custom Categories**: Extensible category system

### Payment Integration
- Fixed TRON address with unique amounts
- USDT-TRC20 payment detection
- 15-minute payment windows
- Automatic order expiration

## 💳 TRON Payment Processing

### Payment Verification
- Unique payment amounts with 6-digit precision
- Real-time blockchain monitoring
- Confirmation requirement (default: 1 block)
- Anti-collision payment matching

### Supported Tokens
- USDT-TRC20 (primary)
- TRX (optional)
- Extensible for other TRC20 tokens

### Example Payment Flow
```
1. User orders $15.99 product
2. System generates $15.992847 (unique amount)
3. User sends exactly $15.992847 USDT to fixed address
4. Monitor detects payment within 30 seconds
5. Order automatically fulfilled after 1 confirmation
```

## 🚀 Deployment

### Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or deploy with Kubernetes
helm install telebot-sales ./deploy/helm/telebot-sales
```

### Distributor One-Click Deploy
```bash
# Copy distributor template
cp -r deploy/distributor-template my-store

# Configure your settings
cd my-store
vim .env

# Deploy
docker-compose up -d
```

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
pytest tests/

# Bot tests  
cd bot
pytest tests/
```

### Integration Tests
```bash
# Full system test
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Create test order
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"tg_id": 123456789, "product_id": 1, "quantity": 1}'

# Test payment notification
curl -X POST http://localhost:8000/internal/payments/notify \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: dev-internal-token" \
  -d '{
    "tx_hash": "test-tx-hash",
    "from_address": "TSender123456",
    "to_address": "TReceiver123456", 
    "amount": "15.992847",
    "token": "USDT-TRC20",
    "confirmations": 1
  }'
```

## 📊 Monitoring

### Health Checks
- `/health` endpoint for all services
- Prometheus metrics (future)
- Grafana dashboards (future)

### Logging
- Structured logging with request IDs
- Error tracking with Sentry (future)
- Audit logs for financial operations

## 🔧 API Reference

### Core Endpoints

#### Users
- `POST /api/v1/users` - Create/get user
- `GET /api/v1/users/{tg_id}` - Get user details

#### Products  
- `GET /api/v1/products` - List products
- `GET /api/v1/products?category=session` - Filter by category
- `GET /api/v1/products?country=US` - Filter by country

#### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{order_id}` - Get order status

#### Internal
- `POST /internal/payments/notify` - Payment notification (authenticated)

### API Authentication
- Internal endpoints require `X-Internal-Token` header
- Public endpoints are rate-limited
- Admin endpoints require additional authentication

## 🌍 Localization

### Supported Languages
- English (en)
- Chinese Simplified (zh)

### Adding New Languages
1. Add translations to `bot/main.py` TEXTS dictionary
2. Update language keyboard in bot
3. Test all user flows in new language

## 🛡️ Security Considerations

### Production Security Checklist
- [ ] Change all default passwords and tokens
- [ ] Enable TLS/SSL for all communications
- [ ] Configure firewall rules
- [ ] Set up proper backup procedures
- [ ] Enable audit logging
- [ ] Configure secret rotation
- [ ] Review access permissions
- [ ] Test disaster recovery procedures

### Legal Compliance Notice
⚠️ **Important**: Selling Telegram accounts or session files may violate Telegram's Terms of Service and local laws. Users are responsible for ensuring compliance with applicable laws and regulations in their jurisdiction.

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow PEP 8 for Python code
- Use type hints
- Add docstrings for public functions
- Write comprehensive tests

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core bot functionality
- ✅ TRON payment integration  
- ✅ Basic order management
- ✅ Docker deployment

### Phase 2 (Next)
- [ ] Web admin dashboard
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Automated testing suite

### Phase 3 (Future)
- [ ] Mobile app
- [ ] Advanced distributor features
- [ ] Machine learning for fraud detection
- [ ] Multi-blockchain support

## 📞 Support

### Getting Help
- Check the [documentation](./docs/)
- Search existing [issues](./issues)
- Join our [Telegram channel](https://t.me/telebot_sales_support)

### Reporting Bugs
1. Check if the issue already exists
2. Create a detailed bug report
3. Include logs and reproduction steps
4. Tag with appropriate labels

### Feature Requests
1. Describe the use case
2. Explain the expected behavior
3. Consider implementation complexity
4. Discuss with the community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. The developers are not responsible for any financial losses, legal issues, or other consequences arising from the use of this software. Users must ensure compliance with local laws and platform terms of service.