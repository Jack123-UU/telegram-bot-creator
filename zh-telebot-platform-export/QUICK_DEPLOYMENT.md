# 🚀 快速部署指南

## 一键导入GitHub仓库

### 1. 准备GitHub仓库
```bash
# 在GitHub上创建新仓库: zh-telebot-platform
# 勾选: Add a README file, Add .gitignore (Node), Choose a license (MIT)
```

### 2. 本地操作
```bash
# 进入导出目录
cd zh-telebot-platform-export

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "🎉 Initial commit: Complete TeleBot Sales Platform

Features:
- 🤖 Telegram Bot with aiogram framework
- 💰 TRON blockchain payment integration  
- 🛡️ Enterprise security with Vault
- 🐳 Docker containerization
- 🔄 One-click distributor cloning
- 📊 React admin dashboard
- 🌍 Multi-language support (CN/EN)
- 📱 API integration with mobile support"

# 设置主分支
git branch -M main

# 添加远程仓库 (替换为你的用户名)
git remote add origin https://github.com/YOUR_USERNAME/zh-telebot-platform.git

# 推送到GitHub
git push -u origin main
```

### 3. 配置GitHub Secrets
在GitHub仓库设置页面 → Secrets and variables → Actions，添加以下Secrets：

**必需的Secrets:**
```
BOT_TOKEN=8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk
TRON_WALLET_ADDRESS=TYourTronWalletAddressHere
TRON_PRIVATE_KEY=YourTronPrivateKeyHere
DATABASE_URL=postgresql://username:password@your-db-host:5432/telebot_db
REDIS_URL=redis://your-redis-host:6379/0
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

**可选的Secrets (Docker部署):**
```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### 4. 启用GitHub Actions
推送代码后，GitHub Actions会自动:
- ✅ 运行代码测试
- 🔍 执行安全扫描
- 🏗️ 构建Docker镜像
- 🚀 部署到生产环境

## 本地开发环境

### 快速启动
```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/zh-telebot-platform.git
cd zh-telebot-platform

# 2. 环境配置
cp config/env.example config/.env
# 编辑 .env 文件设置你的配置

# 3. 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 访问服务
- **前端管理界面**: http://localhost:3000
- **后端API**: http://localhost:8000  
- **API文档**: http://localhost:8000/docs
- **Grafana监控**: http://localhost:3001
- **Prometheus**: http://localhost:9090

## 生产环境部署

### 1. 服务器准备
```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 克隆项目
git clone https://github.com/YOUR_USERNAME/zh-telebot-platform.git
cd zh-telebot-platform
```

### 2. 环境配置
```bash
# 复制生产环境配置
cp config/env.example config/.env.prod

# 编辑生产配置
nano config/.env.prod
```

生产环境配置示例:
```env
# 生产环境标识
ENVIRONMENT=production
DEBUG=false

# Telegram Bot (使用你的真实Token)
BOT_TOKEN=8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk
BOT_USERNAME=your_bot_username

# 数据库 (生产数据库)
DATABASE_URL=postgresql://username:password@db-host:5432/telebot_prod
REDIS_URL=redis://redis-host:6379/0

# TRON钱包 (生产钱包)
TRON_WALLET_ADDRESS=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
TRON_PRIVATE_KEY=your_production_private_key
TRON_NETWORK=mainnet

# 安全密钥 (生产用强密钥)
SECRET_KEY=production-super-secret-key
JWT_SECRET=production-jwt-secret
ENCRYPTION_KEY=production-encryption-key

# 外部服务
SENTRY_DSN=https://your-sentry-dsn
```

### 3. 启动生产服务
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 初始化数据库
docker-compose exec backend python -m alembic upgrade head

# 验证服务
curl http://your-domain.com/health
```

### 4. 配置域名和SSL
```bash
# 使用Nginx反向代理
sudo apt install nginx certbot python3-certbot-nginx

# 配置域名
sudo nano /etc/nginx/sites-available/telebot-platform

# 申请SSL证书
sudo certbot --nginx -d your-domain.com
```

### 5. 设置监控
```bash
# 访问Grafana设置监控面板
open https://your-domain.com:3001

# 配置告警通知
# 设置Telegram/邮件通知
```

## Kubernetes部署 (高级)

### 1. 准备Helm Chart
```bash
# 添加Helm仓库
helm repo add telebot ./deploy/helm
helm repo update

# 自定义values.yaml
cp deploy/helm/values.yaml my-values.yaml
```

### 2. 部署到K8s
```bash
# 创建命名空间
kubectl create namespace telebot-platform

# 安装应用
helm install telebot-platform telebot/telebot \
  --namespace telebot-platform \
  --values my-values.yaml \
  --set bot.token="8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk" \
  --set tron.address="T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"

# 查看部署状态
kubectl get pods -n telebot-platform
```

## 分销商一键克隆

### 1. 生成分销商包
```bash
# 运行分销商打包脚本
./scripts/generate-distributor-package.sh

# 生成的文件: distributor-telebot-platform.tar.gz
```

### 2. 分销商部署
```bash
# 分销商解压并部署
tar -xzf distributor-telebot-platform.tar.gz
cd distributor-telebot-platform

# 一键部署 (分销商只需设置自己的Token)
./deploy-distributor.sh \
  --bot-token "DISTRIBUTOR_BOT_TOKEN" \
  --tron-address "DISTRIBUTOR_TRON_ADDRESS" \
  --markup-rate "0.15"  # 15%加价
```

## 验证和测试

### 1. 功能测试清单
```bash
# API健康检查
curl http://your-domain.com/health

# 数据库连接测试  
curl http://your-domain.com/api/v1/health/db

# Redis连接测试
curl http://your-domain.com/api/v1/health/redis

# TRON网络测试
curl http://your-domain.com/api/v1/health/tron
```

### 2. Telegram机器人测试
- [ ] 发送 `/start` 命令
- [ ] 注册新用户
- [ ] 浏览商品列表  
- [ ] 测试下单流程
- [ ] 验证支付页面
- [ ] 检查语言切换
- [ ] 测试客服功能

### 3. 管理后台测试
- [ ] 登录管理后台
- [ ] 查看用户列表
- [ ] 管理商品库存
- [ ] 查看订单记录
- [ ] 检查支付日志
- [ ] 测试系统设置

## 故障排除

### 常见问题

**1. 机器人不响应**
```bash
# 检查机器人服务
docker-compose logs bot

# 验证Token有效性
curl "https://api.telegram.org/bot8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk/getMe"
```

**2. 支付无法确认**
```bash
# 检查TRON网络连接
docker-compose logs payment-monitor

# 验证钱包地址
curl "https://api.trongrid.io/v1/accounts/T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"
```

**3. 数据库连接失败**
```bash
# 检查数据库状态
docker-compose logs postgres

# 测试连接
docker-compose exec backend python -c "from app.database import test_connection; test_connection()"
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f bot
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看错误日志
docker-compose logs --tail=100 | grep ERROR
```

### 性能监控
```bash
# 系统资源使用
docker stats

# 服务健康状态
curl http://localhost:8000/metrics
```

## 维护和更新

### 定期维护任务
```bash
# 1. 更新代码
git pull origin main

# 2. 重启服务
docker-compose down
docker-compose pull
docker-compose up -d

# 3. 数据库备份
./scripts/backup-database.sh

# 4. 清理日志
docker system prune -f

# 5. 更新依赖
npm audit fix
pip-audit
```

### 安全更新
```bash
# 轮换密钥
./scripts/rotate-keys.sh

# 安全扫描
./scripts/security-scan.sh

# 更新依赖
./scripts/update-dependencies.sh
```

---

## 📞 支持联系

如果在部署过程中遇到问题:

1. 📖 查看完整文档: [项目Wiki](https://github.com/YOUR_USERNAME/zh-telebot-platform/wiki)
2. 🐛 提交Issue: [GitHub Issues](https://github.com/YOUR_USERNAME/zh-telebot-platform/issues)  
3. 💬 加入讨论: [GitHub Discussions](https://github.com/YOUR_USERNAME/zh-telebot-platform/discussions)
4. 📧 邮件支持: your-email@example.com

## 🎯 下一步

部署完成后，建议:
1. 设置监控告警
2. 配置自动备份
3. 建立运维文档
4. 培训操作人员
5. 制定应急预案

祝您部署顺利! 🎉