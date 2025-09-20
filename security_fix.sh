#!/bin/bash

# TeleBot安全修复脚本
# 用于修复安全审计中发现的关键问题

set -e

echo "🔒 开始TeleBot安全修复..."

# 1. 备份敏感配置文件
echo "📦 备份配置文件..."
cp .env.example .env.example.backup
cp docker-compose.dev.yml docker-compose.dev.yml.backup

# 2. 生成安全的随机密钥
echo "🔑 生成安全密钥..."
generate_secure_key() {
    openssl rand -hex 32
}

BOT_TOKEN_PLACEHOLDER="TELEGRAM_BOT_TOKEN_HERE_$(generate_secure_key | cut -c1-16)"
DATABASE_PASSWORD="$(generate_secure_key | cut -c1-20)"
VAULT_TOKEN="vault-$(generate_secure_key | cut -c1-16)"
INTERNAL_TOKEN="internal-$(generate_secure_key | cut -c1-20)"
ENCRYPTION_KEY="$(generate_secure_key)"

# 3. 创建安全的环境配置模板
echo "📝 创建安全配置模板..."
cat > .env.production.template << EOF
# TeleBot Sales Platform - Production Environment
# 🚨 警告: 请在部署前填入真实的密钥值

# Telegram Bot Configuration
BOT_TOKEN=${BOT_TOKEN_PLACEHOLDER}
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Database Configuration (使用强密码)
DATABASE_URL=postgresql://telebot:${DATABASE_PASSWORD}@postgres:5432/telebot_sales
POSTGRES_DB=telebot_sales
POSTGRES_USER=telebot
POSTGRES_PASSWORD=${DATABASE_PASSWORD}

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# HashiCorp Vault Configuration (生产模式)
VAULT_ADDR=https://vault.your-domain.com
VAULT_TOKEN=${VAULT_TOKEN}

# TRON Blockchain Configuration
TRON_NODE_URL=https://api.trongrid.io
TRON_PRIVATE_KEY=YOUR_SECURE_TRON_PRIVATE_KEY
PAYMENT_ADDRESS=YOUR_TRON_PAYMENT_ADDRESS

# API Configuration
API_BASE_URL=https://api.your-domain.com
API_INTERNAL_TOKEN=${INTERNAL_TOKEN}

# Security Configuration
ENCRYPTION_KEY=${ENCRYPTION_KEY}
JWT_SECRET_KEY=$(generate_secure_key)

# Application Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Rate Limiting (生产级别)
RATE_LIMIT_PER_MINUTE=30
RATE_LIMIT_PER_HOUR=500

# Security Headers
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
TRUSTED_ORIGINS=https://your-domain.com

EOF

# 4. 创建安全的Docker Compose配置
echo "🐳 创建生产级Docker配置..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # PostgreSQL with security hardening
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"  # 只绑定本地
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis with authentication
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"  # 只绑定本地
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Production Vault (非dev模式)
  vault:
    image: vault:1.13
    cap_add:
      - IPC_LOCK
    environment:
      VAULT_ADDR: \${VAULT_ADDR}
      VAULT_API_ADDR: \${VAULT_ADDR}
    ports:
      - "127.0.0.1:8200:8200"
    volumes:
      - vault_data:/vault/data
      - ./vault-config.json:/vault/config/vault.json:ro
    command: vault server -config=/vault/config/vault.json
    healthcheck:
      test: ["CMD", "vault", "status"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # FastAPI Backend (安全加固)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
      - VAULT_ADDR=\${VAULT_ADDR}
      - VAULT_TOKEN=\${VAULT_TOKEN}
      - ENVIRONMENT=production
      - ALLOWED_HOSTS=\${ALLOWED_HOSTS}
      - TRUSTED_ORIGINS=\${TRUSTED_ORIGINS}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      vault:
        condition: service_healthy
    volumes:
      - uploaded_files:/app/uploads:ro
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Telegram Bot (安全加固)
  bot:
    build:
      context: ./bot
      dockerfile: Dockerfile.prod
    environment:
      - API_BASE_URL=http://backend:8000
      - BOT_TOKEN=\${BOT_TOKEN}
      - VAULT_ADDR=\${VAULT_ADDR}
      - VAULT_TOKEN=\${VAULT_TOKEN}
      - ENVIRONMENT=production
    depends_on:
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # Payment Monitor (生产级)
  payment-monitor:
    build:
      context: ./payment-monitor
      dockerfile: Dockerfile.prod
    environment:
      - API_BASE_URL=http://backend:8000
      - VAULT_ADDR=\${VAULT_ADDR}
      - VAULT_TOKEN=\${VAULT_TOKEN}
      - TRON_NODE_URL=\${TRON_NODE_URL}
      - ENVIRONMENT=production
    depends_on:
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # Nginx反向代理 (安全配置)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  vault_data:
  uploaded_files:

# 网络安全配置
networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

# 5. 创建安全的Vault配置
echo "🏦 创建Vault生产配置..."
cat > vault-config.json << EOF
{
  "storage": {
    "file": {
      "path": "/vault/data"
    }
  },
  "listener": {
    "tcp": {
      "address": "0.0.0.0:8200",
      "tls_disable": false,
      "tls_cert_file": "/vault/ssl/vault.crt",
      "tls_key_file": "/vault/ssl/vault.key"
    }
  },
  "seal": {
    "awskms": {
      "region": "us-east-1",
      "kms_key_id": "YOUR_KMS_KEY_ID"
    }
  },
  "cluster_addr": "https://vault:8201",
  "api_addr": "https://vault:8200",
  "disable_mlock": false,
  "ui": false
}
EOF

# 6. 创建PostgreSQL安全配置
echo "🐘 创建PostgreSQL安全配置..."
cat > postgresql.conf << EOF
# PostgreSQL安全配置
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 256MB

# 安全设置
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
password_encryption = scram-sha-256
log_statement = 'ddl'
log_min_duration_statement = 1000
log_connections = on
log_disconnections = on
EOF

# 7. 创建Nginx安全配置
echo "🌐 创建Nginx安全配置..."
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'";
    
    # 隐藏Nginx版本
    server_tokens off;
    
    # 速率限制
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=bot:10m rate=5r/s;
    
    upstream backend {
        server backend:8000;
    }
    
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://\$server_name\$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        location /webhook/ {
            limit_req zone=bot burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

# 8. 更新Backend安全代码
echo "💻 更新Backend安全配置..."
cat > backend/security_config.py << EOF
"""
安全配置模块
"""
import os
from typing import List

# CORS安全配置
ALLOWED_ORIGINS = os.getenv("TRUSTED_ORIGINS", "").split(",")
if not ALLOWED_ORIGINS or ALLOWED_ORIGINS == [""]:
    ALLOWED_ORIGINS = ["https://your-domain.com"]

# 安全头配置
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY", 
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'"
}

# 速率限制配置
RATE_LIMIT_SETTINGS = {
    "default": "100/hour",
    "orders": "10/minute",
    "auth": "5/minute"
}

# 输入验证配置
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_FILE_TYPES = {".session", ".tdata", ".zip", ".json"}
MAX_STRING_LENGTH = 1000
EOF

# 9. 创建部署检查脚本
echo "✅ 创建部署前安全检查..."
cat > security_check.py << EOF
#!/usr/bin/env python3
"""
部署前安全检查脚本
"""
import os
import re
import sys
from pathlib import Path

def check_hardcoded_secrets():
    """检查硬编码密钥"""
    issues = []
    secret_patterns = [
        r'dev-.*-token',
        r'dev_password_123',
        r'minioadmin123',
        r'dev-root-token'
    ]
    
    for pattern in secret_patterns:
        for file_path in Path('.').rglob('*.py'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if re.search(pattern, content):
                    issues.append(f"发现硬编码密钥在 {file_path}: {pattern}")
    
    return issues

def check_environment_config():
    """检查环境配置"""
    issues = []
    required_vars = [
        'BOT_TOKEN', 'DATABASE_URL', 'VAULT_TOKEN', 
        'ENCRYPTION_KEY', 'API_INTERNAL_TOKEN'
    ]
    
    for var in required_vars:
        if not os.getenv(var):
            issues.append(f"缺少环境变量: {var}")
    
    return issues

def main():
    """主检查函数"""
    print("🔍 开始安全检查...")
    
    issues = []
    issues.extend(check_hardcoded_secrets())
    issues.extend(check_environment_config())
    
    if issues:
        print("❌ 发现安全问题:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("✅ 安全检查通过!")

if __name__ == "__main__":
    main()
EOF

chmod +x security_check.py

echo "🎉 安全修复脚本执行完成!"
echo ""
echo "📋 下一步操作:"
echo "1. 检查并填写 .env.production.template 中的真实密钥"
echo "2. 运行 python security_check.py 进行安全验证"
echo "3. 使用 docker-compose -f docker-compose.prod.yml up 部署生产环境"
echo "4. 配置SSL证书和域名"
echo ""
echo "⚠️  重要提醒:"
echo "- 切勿将真实密钥提交到版本控制"
echo "- 定期轮换密钥"
echo "- 监控应用安全状态"
echo ""
echo "🔒 安全修复完成!"