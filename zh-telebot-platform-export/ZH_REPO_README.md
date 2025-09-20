# 🤖 TeleBot销售平台 - 完整版

[![CI/CD](https://github.com/zh-username/zh-telebot-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/zh-username/zh-telebot-platform/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-green.svg)](https://python.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com)

一个功能完整的Telegram机器人销售平台，支持TRON区块链支付、企业级安全架构和分销商一键克隆系统。

## ✨ 主要特性

### 🤖 Telegram机器人
- **智能交互**: 基于aiogram框架的现代化机器人
- **多语言支持**: 中文/英文切换
- **用户管理**: 自动注册、用户中心、购买历史
- **商品浏览**: 按国家/类型筛选、区号快速查找
- **订单流程**: 下单→支付→自动发货

### 💰 TRON区块链支付
- **固定收款地址**: 企业级TRON钱包集成
- **精确匹配**: 唯一金额尾数识别技术
- **自动确认**: 链上监听和支付验证
- **安全可靠**: 15分钟支付窗口，自动退款

### 🛡️ 企业级安全
- **Vault密钥管理**: HashiCorp Vault统一管理敏感信息
- **2FA认证**: 双因子认证保护管理后台
- **操作审计**: 完整的操作日志和审计跟踪
- **加密存储**: AES-256加密文件存储

### 🚀 容器化部署
- **Docker支持**: 完整的Docker Compose配置
- **Kubernetes**: Helm Charts企业级部署
- **CI/CD**: GitHub Actions自动化部署
- **一键部署**: 简化的部署脚本

### 🔄 分销系统
- **一键克隆**: 分销商独立部署模板
- **库存同步**: 实时库存管理和同步
- **价格管理**: 灵活的价格策略设置
- **佣金结算**: 自动化佣金计算

### 📊 管理后台
- **现代界面**: React + TypeScript + Tailwind CSS
- **实时监控**: 系统状态和性能监控
- **数据统计**: 销售报表和用户分析
- **API文档**: Swagger/OpenAPI自动生成

## 🏗️ 技术架构

```
┌─────────────────┬─────────────────┬─────────────────┐
│   前端管理界面    │   Telegram Bot  │   后端API服务    │
│  React + TS     │  Python+aiogram │  FastAPI+Python │
└─────────────────┴─────────────────┴─────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
    ┌─────────────────┬─────────────────┬─────────────────┐
    │   PostgreSQL    │     Redis       │   TRON 区块链    │
    │   主数据库      │    缓存/队列     │   支付处理       │
    └─────────────────┴─────────────────┴─────────────────┘
                             │
         ┌─────────────────────────────────────┐
         │        HashiCorp Vault              │
         │        密钥管理和安全存储            │
         └─────────────────────────────────────┘
```

## 🚀 快速开始

### 前置要求
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### 1. 克隆项目
```bash
git clone https://github.com/your-username/zh-telebot-platform.git
cd zh-telebot-platform
```

### 2. 环境配置
```bash
# 复制环境变量模板
cp config/env.example config/.env

# 编辑配置文件
nano config/.env
```

必需配置项：
```env
# Telegram Bot
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username

# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/telebot
REDIS_URL=redis://localhost:6379/0

# TRON钱包
TRON_WALLET_ADDRESS=your_tron_wallet_address
TRON_PRIVATE_KEY=your_tron_private_key

# 安全密钥
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
```

### 3. 启动服务

#### 开发环境
```bash
# 一键启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose ps
```

#### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 验证部署
```bash
# 健康检查
curl http://localhost:8000/health

# API文档
open http://localhost:8000/docs

# 前端界面
open http://localhost:3000
```

### 5. 测试机器人
1. 在Telegram中找到你的机器人
2. 发送 `/start` 命令
3. 测试完整购买流程

## 📁 项目结构

```
zh-telebot-platform/
├── backend/                 # FastAPI后端服务
│   ├── app/                # 应用核心代码
│   ├── tests/              # 后端测试
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile         # 后端Docker镜像
├── bot/                    # Telegram机器人
│   ├── handlers/          # 消息处理器
│   ├── services/          # 业务逻辑
│   ├── tests/             # 机器人测试
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile        # 机器人Docker镜像
├── src/                   # 前端React应用
│   ├── components/        # React组件
│   ├── hooks/            # 自定义Hooks
│   └── types/           # TypeScript类型
├── config/               # 配置文件
│   ├── env.example       # 环境变量模板
│   └── vault/           # Vault配置
├── deploy/               # 部署配置
│   ├── helm/            # Kubernetes Helm Charts
│   └── docker/          # Docker配置
├── scripts/              # 部署和管理脚本
├── docs/                 # 项目文档
└── tests/               # 集成测试
```

## 🔧 配置指南

### Telegram Bot设置
1. 向 [@BotFather](https://t.me/BotFather) 申请机器人
2. 获取Bot Token
3. 设置机器人命令和菜单

### TRON钱包配置
```bash
# 生成新钱包 (如果需要)
tronpy wallet generate

# 配置收款地址
export TRON_WALLET_ADDRESS="TYour..."
export TRON_PRIVATE_KEY="your_private_key"
```

### 数据库初始化
```bash
# 运行数据库迁移
cd backend
python -m alembic upgrade head
```

### Vault密钥管理
```bash
# 启动Vault (开发模式)
vault server -dev

# 存储敏感配置
vault kv put secret/telebot \
  bot_token="your_bot_token" \
  tron_private_key="your_private_key"
```

## 🧪 测试

### 运行所有测试
```bash
# 前端测试
npm test

# 后端测试
cd backend && pytest

# 机器人测试
cd bot && pytest

# 集成测试
./scripts/test-integration.sh
```

### 功能测试
```bash
# 测试机器人功能
python test_bot_functions.py

# 测试支付流程
python test_payment_flow.py

# 测试API端点
./test_api_endpoints.sh
```

## 🚀 生产部署

### Docker Compose部署
```bash
# 配置生产环境变量
cp config/env.example config/.env.prod

# 启动生产服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f
```

### Kubernetes部署
```bash
# 安装Helm Chart
helm repo add telebot ./deploy/helm
helm install telebot-platform telebot/telebot \
  --set bot.token="your_bot_token" \
  --set tron.address="your_tron_address"

# 查看部署状态
kubectl get pods -l app=telebot
```

### 一键分销商部署
```bash
# 生成分销商部署包
./scripts/generate-distributor-package.sh

# 分销商使用
./distributor-deploy.sh --token YOUR_TOKEN --wallet YOUR_WALLET
```

## 📊 监控和维护

### 系统监控
- **Prometheus**: 指标收集
- **Grafana**: 可视化监控
- **Alertmanager**: 告警通知

### 日志管理
```bash
# 查看实时日志
docker-compose logs -f bot backend

# 错误日志
grep ERROR /var/log/telebot/*.log
```

### 数据备份
```bash
# 数据库备份
./scripts/backup-database.sh

# 文件备份
./scripts/backup-files.sh
```

### 安全维护
```bash
# 密钥轮换
./scripts/rotate-keys.sh

# 安全扫描
./scripts/security-scan.sh

# 审计报告
./scripts/generate-audit-report.sh
```

## 🔐 安全考虑

### 生产环境安全清单
- [ ] 使用强密码和密钥
- [ ] 启用2FA双因子认证
- [ ] 配置防火墙规则
- [ ] 定期更新依赖包
- [ ] 监控异常活动
- [ ] 定期备份数据
- [ ] 审计操作日志

### 合规性说明
⚠️ **重要提醒**: 
- 销售Telegram账号或session文件可能违反Telegram服务条款
- 请确保遵守当地法律法规
- 使用前请咨询法律专业人士
- 用户需自行承担法律责任

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🆘 支持和联系

- 📖 [文档Wiki](https://github.com/your-username/zh-telebot-platform/wiki)
- 🐛 [问题反馈](https://github.com/your-username/zh-telebot-platform/issues)
- 💬 [讨论区](https://github.com/your-username/zh-telebot-platform/discussions)
- 📧 邮件: support@your-domain.com

## 🎯 路线图

- [ ] 移动端管理应用
- [ ] 多币种支付支持
- [ ] AI客服集成
- [ ] 高级数据分析
- [ ] 第三方API集成
- [ ] 多租户支持

---

**免责声明**: 本软件仅供学习和研究使用。请确保在使用前了解并遵守相关法律法规。