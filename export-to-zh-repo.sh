#!/bin/bash
# TeleBot销售平台 - 导入zh仓库脚本
# 创建完整的项目结构用于GitHub仓库导入

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始准备TeleBot销售平台项目导入zh仓库...${NC}"

# 创建目标目录
TARGET_DIR="zh-telebot-platform-export"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

echo -e "${YELLOW}📁 创建项目目录结构...${NC}"

# 复制核心项目文件
cp -r src "$TARGET_DIR/"
cp -r backend "$TARGET_DIR/"
cp -r bot "$TARGET_DIR/"
cp -r config "$TARGET_DIR/"
cp -r deploy "$TARGET_DIR/"
cp -r scripts "$TARGET_DIR/"

# 复制前端配置文件
cp index.html "$TARGET_DIR/"
cp package.json "$TARGET_DIR/"
cp package-lock.json "$TARGET_DIR/"
cp tsconfig.json "$TARGET_DIR/"
cp vite.config.ts "$TARGET_DIR/"
cp tailwind.config.js "$TARGET_DIR/"
cp components.json "$TARGET_DIR/"

# 复制Docker配置
cp docker-compose.dev.yml "$TARGET_DIR/"
cp docker-compose.prod.yml "$TARGET_DIR/"
cp docker-compose.test.yml "$TARGET_DIR/"

# 复制文档
cp README.md "$TARGET_DIR/"
cp PRD.md "$TARGET_DIR/"
cp SECURITY.md "$TARGET_DIR/"
cp DEPLOYMENT.md "$TARGET_DIR/"
cp LICENSE "$TARGET_DIR/"

# 复制重要的测试和部署脚本
cp *.sh "$TARGET_DIR/" 2>/dev/null || true
cp *.py "$TARGET_DIR/" 2>/dev/null || true

# 创建项目专用的README
cat > "$TARGET_DIR/ZH_REPO_README.md" << 'EOF'
# TeleBot销售平台 - 完整版

## 项目概述
这是一个完整的Telegram机器人销售平台，具有以下特性：
- 🤖 Telegram Bot (aiogram框架)
- 💰 TRON区块链支付处理
- 🛡️ 企业级安全架构
- 🐳 Docker容器化部署
- 🔄 分销商一键克隆系统
- 📊 完整管理后台

## 快速开始

### 1. 环境准备
```bash
# 克隆项目
git clone <your-zh-repo-url>
cd zh-telebot-platform

# 安装依赖
npm install
cd backend && pip install -r requirements.txt
cd ../bot && pip install -r requirements.txt
```

### 2. 配置环境变量
```bash
# 复制配置文件
cp config/env.example config/.env

# 编辑配置文件，设置：
# - BOT_TOKEN: 你的Telegram Bot Token
# - TRON_WALLET_ADDRESS: TRON收款地址
# - DATABASE_URL: 数据库连接字符串
```

### 3. 启动服务

#### 开发环境
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d
```

#### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 验证部署
```bash
# 运行系统测试
./test_integration.sh
```

## 主要功能

### 🤖 Telegram机器人
- 用户注册和管理
- 商品浏览和购买
- 订单状态跟踪
- 多语言支持（中文/英文）
- 客服系统

### 💰 支付系统
- TRON区块链支付
- 唯一金额尾数识别
- 自动支付确认
- 退款处理

### 🛡️ 安全特性
- Vault密钥管理
- 2FA双因子认证
- 操作审计日志
- 加密文件存储

### 📊 管理后台
- 商品库存管理
- 订单管理
- 用户管理
- 销售统计
- 系统监控

### 🔄 分销系统
- 一键克隆部署
- 库存同步
- 价格管理
- 佣金结算

## 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Python + FastAPI
- **机器人**: Python + aiogram
- **数据库**: PostgreSQL + Redis
- **区块链**: TRON
- **容器**: Docker + Kubernetes
- **安全**: HashiCorp Vault

## 部署选项

### 1. Docker部署 (推荐)
```bash
# 一键部署
./deploy-telegram-bot.sh
```

### 2. Kubernetes部署
```bash
# 使用Helm部署
helm install telebot-platform ./deploy/helm/
```

### 3. 分销商克隆部署
```bash
# 分销商一键克隆
./scripts/clone-for-distributor.sh
```

## 配置指南

### 机器人Token配置
1. 在BotFather创建新的机器人
2. 获取Bot Token
3. 在配置文件中设置BOT_TOKEN

### TRON钱包配置
1. 创建TRON钱包
2. 获取钱包地址和私钥
3. 在Vault中安全存储

### 数据库配置
1. 部署PostgreSQL数据库
2. 运行数据库迁移
3. 配置Redis缓存

## 安全注意事项
1. 所有敏感信息必须存储在Vault中
2. 启用2FA双因子认证
3. 定期更新依赖包
4. 监控系统日志

## 许可证
[许可证信息]

## 支持
如有问题，请提交Issue或联系开发团队。
EOF

# 创建部署指南
cat > "$TARGET_DIR/QUICK_DEPLOYMENT.md" << 'EOF'
# 快速部署指南

## 一键部署到GitHub

### 1. 创建GitHub仓库
```bash
# 在GitHub上创建新仓库 "zh-telebot-platform"
```

### 2. 推送代码
```bash
cd zh-telebot-platform-export
git init
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform"
git branch -M main
git remote add origin https://github.com/your-username/zh-telebot-platform.git
git push -u origin main
```

### 3. 配置GitHub Secrets
在GitHub仓库设置中添加以下Secrets：
- `BOT_TOKEN`: Telegram Bot Token
- `TRON_WALLET_ADDRESS`: TRON收款地址
- `TRON_PRIVATE_KEY`: TRON私钥
- `DATABASE_URL`: 数据库连接字符串
- `REDIS_URL`: Redis连接字符串

### 4. 启用GitHub Actions
推送代码后，GitHub Actions会自动：
- 运行测试
- 构建Docker镜像
- 部署到生产环境

### 5. 验证部署
```bash
# 检查服务状态
curl https://your-domain.com/health

# 测试Telegram机器人
# 在Telegram中发送 /start 给你的机器人
```

## 本地开发

### 1. 环境准备
```bash
# 安装Node.js 18+
# 安装Python 3.11+
# 安装Docker
```

### 2. 快速启动
```bash
# 克隆项目
git clone https://github.com/your-username/zh-telebot-platform.git
cd zh-telebot-platform

# 一键启动开发环境
./scripts/dev-setup.sh
```

### 3. 访问服务
- 前端管理界面: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 生产部署

### 使用Docker Compose
```bash
# 配置环境变量
cp config/env.example config/.env
# 编辑 .env 文件

# 启动生产服务
docker-compose -f docker-compose.prod.yml up -d
```

### 使用Kubernetes
```bash
# 部署到K8s集群
helm install telebot-platform ./deploy/helm/ \
  --set bot.token="YOUR_BOT_TOKEN" \
  --set tron.walletAddress="YOUR_WALLET_ADDRESS"
```

## 监控和维护

### 健康检查
```bash
# 检查所有服务状态
./scripts/health-check.sh
```

### 日志查看
```bash
# 查看机器人日志
docker logs telebot-bot

# 查看后端日志
docker logs telebot-backend
```

### 数据备份
```bash
# 备份数据库
./scripts/backup-database.sh
```
EOF

# 创建GitHub Actions配置
mkdir -p "$TARGET_DIR/.github/workflows"

cat > "$TARGET_DIR/.github/workflows/ci-cd.yml" << 'EOF'
name: TeleBot Platform CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: telebot_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'
    
    - name: Install frontend dependencies
      run: npm ci
    
    - name: Install backend dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Install bot dependencies
      run: |
        cd bot
        pip install -r requirements.txt
    
    - name: Run frontend tests
      run: npm test
    
    - name: Run backend tests
      run: |
        cd backend
        pytest tests/
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/telebot_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run bot tests
      run: |
        cd bot
        pytest tests/
      env:
        BOT_TOKEN: ${{ secrets.TEST_BOT_TOKEN }}
    
    - name: Build frontend
      run: npm run build
    
    - name: Run integration tests
      run: ./test_integration.sh
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/telebot_test
        REDIS_URL: redis://localhost:6379
        BOT_TOKEN: ${{ secrets.TEST_BOT_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security scan
      run: |
        # 安全扫描脚本
        ./security_fix.sh
    
    - name: Upload security report
      uses: actions/upload-artifact@v3
      with:
        name: security-report
        path: security-report.json

  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker images
      run: |
        # 构建所有Docker镜像
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml push
    
    - name: Deploy to production
      run: |
        # 部署到生产环境
        ./deploy-telegram-bot.sh
      env:
        BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
        TRON_WALLET_ADDRESS: ${{ secrets.TRON_WALLET_ADDRESS }}
        TRON_PRIVATE_KEY: ${{ secrets.TRON_PRIVATE_KEY }}
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        REDIS_URL: ${{ secrets.REDIS_URL }}
EOF

# 创建项目信息文件
cat > "$TARGET_DIR/PROJECT_INFO.json" << 'EOF'
{
  "name": "TeleBot Sales Platform",
  "version": "1.0.0",
  "description": "Complete Telegram Bot Sales Platform with TRON Payment Integration",
  "repository": "https://github.com/your-username/zh-telebot-platform",
  "author": "TeleBot Team",
  "license": "MIT",
  "features": [
    "Telegram Bot with aiogram",
    "TRON Blockchain Payment",
    "Enterprise Security",
    "Docker Deployment",
    "Distributor Cloning",
    "Admin Dashboard",
    "Multi-language Support",
    "Real-time Monitoring"
  ],
  "tech_stack": {
    "frontend": ["React", "TypeScript", "Tailwind CSS"],
    "backend": ["Python", "FastAPI", "PostgreSQL", "Redis"],
    "bot": ["Python", "aiogram"],
    "blockchain": ["TRON", "TRC-20"],
    "security": ["HashiCorp Vault", "2FA"],
    "deployment": ["Docker", "Kubernetes", "GitHub Actions"]
  },
  "deployment_options": [
    "Docker Compose",
    "Kubernetes with Helm",
    "One-click Distributor Clone"
  ],
  "created": "2024-12-28",
  "status": "Production Ready"
}
EOF

# 创建.gitignore文件
cat > "$TARGET_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.py[cod]
*$py.class

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
config/.env*
!config/env.example

# Build outputs
dist/
build/
*.egg-info/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pids/

# Runtime data
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Database
*.sqlite
*.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Security
vault/
secrets/
*.key
*.pem
*.crt

# Testing
test-results/
test-outputs/

# Temporary files
tmp/
temp/
*.tmp

# Docker
docker-compose.override.yml

# Package files
*.tar.gz
*.zip

# Documentation builds
docs/_build/
EOF

# 创建环境变量示例文件
mkdir -p "$TARGET_DIR/config"
cat > "$TARGET_DIR/config/env.example" << 'EOF'
# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
BOT_USERNAME=your_bot_username

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/telebot_db
REDIS_URL=redis://localhost:6379/0

# TRON Blockchain Configuration
TRON_WALLET_ADDRESS=your_tron_wallet_address
TRON_PRIVATE_KEY=your_tron_private_key
TRON_NETWORK=mainnet
TRON_API_KEY=your_tronapi_key

# Security Configuration
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Vault Configuration (Production)
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=your_vault_token
VAULT_PATH=secret/telebot

# API Configuration
API_BASE_URL=https://api.yourdomain.com
INTERNAL_API_TOKEN=your_internal_api_token

# Payment Configuration
PAYMENT_TIMEOUT=900
PAYMENT_CONFIRMATION_BLOCKS=12
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# File Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your_sentry_dsn
PROMETHEUS_PORT=9090

# Development
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
EOF

echo -e "${GREEN}✅ 项目结构创建完成！${NC}"

# 创建目录大小统计
echo -e "${YELLOW}📊 项目统计信息：${NC}"
echo "目录大小: $(du -sh "$TARGET_DIR" | cut -f1)"
echo "文件数量: $(find "$TARGET_DIR" -type f | wc -l)"
echo "代码行数: $(find "$TARGET_DIR" -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs wc -l | tail -1)"

# 生成导入指令
echo -e "${BLUE}🔧 导入zh仓库的命令：${NC}"
echo "cd $TARGET_DIR"
echo "git init"
echo "git add ."
echo "git commit -m \"Initial commit: Complete TeleBot Sales Platform\""
echo "git branch -M main"
echo "git remote add origin https://github.com/your-username/zh-telebot-platform.git"
echo "git push -u origin main"

echo -e "${GREEN}🎉 项目导出完成！可以开始导入zh仓库了${NC}"
echo -e "${YELLOW}📁 导出目录: $TARGET_DIR${NC}"
echo -e "${BLUE}📚 查看部署指南: $TARGET_DIR/QUICK_DEPLOYMENT.md${NC}"