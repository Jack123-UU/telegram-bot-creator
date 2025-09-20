# 🤖 TeleBot销售平台 - 完整分销系统

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/yourusername/zh)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](docker-compose.yml)

> 🚀 与 @tdata888bot 功能等效的企业级Telegram销售机器人与分销系统

## ✨ 主要特性

- 🤖 **智能Telegram Bot**: 完整的用户交互界面，支持中英文切换
- 💰 **自动支付处理**: TRON/USDT区块链支付，精确金额匹配
- 📦 **库存管理系统**: 批量导入、自动校验、智能分发
- 👥 **分销商网络**: 一键克隆部署，多级代理管理
- 🔐 **企业级安全**: 密钥加密存储，审计日志，权限控制
- 🐳 **容器化部署**: Docker + Kubernetes，一键部署
- 📊 **实时监控**: 性能监控，异常告警，数据分析

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/zh.git
cd zh
```

### 2. 配置环境

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

必需配置项：
- `BOT_TOKEN`: Telegram Bot令牌
- `TRON_PRIVATE_KEY`: TRON钱包私钥  
- `PAYMENT_ADDRESS`: 收款地址
- `DATABASE_URL`: 数据库连接

### 3. 一键部署

```bash
# 给脚本执行权限
chmod +x quick-deploy.sh

# 启动服务
./quick-deploy.sh
```

### 4. 访问服务

- 🌐 管理后台: http://localhost:3000
- 🔌 API接口: http://localhost:8000  
- 📚 API文档: http://localhost:8000/docs

## 📁 项目结构

```
zh/
├── 📁 src/                     # 前端源代码
├── 📁 backend/                 # 后端API服务
├── 📁 bot/                     # Telegram Bot代码
├── 📁 deploy/                  # 部署配置
├── 📁 config/                  # 配置文件
├── 📁 scripts/                 # 自动化脚本
├── 📁 .github/workflows/       # CI/CD配置
├── 🐳 docker-compose.dev.yml   # 开发环境
├── 🐳 docker-compose.prod.yml  # 生产环境
└── 📋 README.md               # 项目说明
```

## 🎯 核心功能

### 🤖 Telegram Bot
- ✅ 用户注册与管理
- ✅ 商品浏览与搜索  
- ✅ 在线下单与支付
- ✅ 自动发货系统
- ✅ 订单历史查询
- ✅ 多语言支持

### 💰 支付系统
- ✅ TRON/USDT支付
- ✅ 唯一金额识别
- ✅ 自动到账确认
- ✅ 支付异常处理
- ✅ 退款管理

### 📦 库存管理
- ✅ 批量导入工具
- ✅ 自动有效性校验
- ✅ 库存预警系统
- ✅ 分类管理
- ✅ API接码支持

### 👥 分销系统
- ✅ 多级代理管理
- ✅ 佣金自动结算
- ✅ 一键克隆部署
- ✅ 库存同步
- ✅ 收益统计

## 🔐 安全特性

- 🔒 **密钥加密存储**: 使用Vault/KMS管理敏感信息
- 🛡️ **访问控制**: 细粒度权限管理和2FA认证
- 📊 **审计日志**: 完整的操作记录和异常监控
- 🔍 **安全扫描**: 自动化安全漏洞检测
- 🚨 **异常告警**: 实时监控和告警通知

## 🛠️ 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Python + FastAPI + PostgreSQL + Redis
- **Bot框架**: Python + aiogram
- **区块链**: TRON + USDT-TRC20
- **部署**: Docker + Kubernetes
- **监控**: Prometheus + Grafana
- **CI/CD**: GitHub Actions

## 📖 详细文档

- [部署指南](DEPLOYMENT.md) - 详细部署步骤
- [安全指南](SECURITY.md) - 安全配置和最佳实践  
- [API文档](docs/api/) - 完整API接口文档
- [开发指南](docs/development/) - 开发环境配置

## 🧪 测试

```bash
# 运行测试套件
npm test

# Python测试
python -m pytest

# 集成测试
./test_integration.sh
```

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## ⚖️ 法律声明

⚠️ **重要提醒**: 本项目包含Telegram账号销售功能，使用前请确保符合：
- Telegram平台服务条款
- 所在地区法律法规  
- 数据保护和隐私法规

使用本项目产生的任何法律后果由使用者自行承担。

## 📞 支持

- 🐛 [问题反馈](https://github.com/yourusername/zh/issues)
- 💬 [讨论区](https://github.com/yourusername/zh/discussions)
- 📧 技术支持: support@example.com

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

⭐ **如果这个项目对你有帮助，请给我们一个Star！** ⭐
