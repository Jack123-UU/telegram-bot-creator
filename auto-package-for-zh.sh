#!/bin/bash

# TeleBot项目一键打包导入脚本
# 自动化打包当前项目并导入到指定GitHub仓库

echo "🚀 TeleBot项目一键打包导入工具"
echo "================================="

# 创建打包目录
PACKAGE_DIR="telebot-package-$(date +%Y%m%d-%H%M%S)"
echo "📦 创建打包目录: $PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# 复制项目文件
echo "📁 复制项目文件..."

# 复制核心目录
for dir in backend bot deploy config scripts src; do
    if [ -d "$dir" ]; then
        echo "  ✅ 复制目录: $dir"
        cp -r "$dir" "$PACKAGE_DIR/"
    else
        echo "  ⚠️ 目录不存在: $dir"
    fi
done

# 复制配置文件
for file in \
    docker-compose.*.yml \
    package.json \
    package-lock.json \
    tsconfig.json \
    vite.config.ts \
    tailwind.config.js \
    components.json; do
    if [ -f "$file" ]; then
        echo "  ✅ 复制文件: $file"
        cp "$file" "$PACKAGE_DIR/"
    fi
done

# 复制文档文件
for file in \
    README.md \
    SECURITY.md \
    LICENSE \
    PRD.md \
    DEPLOYMENT.md \
    "测试结果报告.md" \
    "TELEGRAM_COMPLIANCE.md" \
    "BOT_SETUP_COMPLETE.md" \
    "FUNCTION_TEST_RESULTS.md"; do
    if [ -f "$file" ]; then
        echo "  ✅ 复制文档: $file"
        cp "$file" "$PACKAGE_DIR/"
    fi
done

# 创建项目清单
echo "📋 创建项目清单..."
cat > "$PACKAGE_DIR/PROJECT_MANIFEST.md" << 'EOF'
# TeleBot销售平台项目清单

## 📁 项目结构

```
telebot-platform/
├── backend/              # FastAPI后端服务
│   ├── app/             # 主应用代码
│   ├── alembic/         # 数据库迁移
│   ├── tests/           # 后端测试
│   └── requirements.txt # Python依赖
├── bot/                 # Telegram Bot机器人
│   ├── handlers/        # 消息处理器
│   ├── services/        # 业务服务
│   ├── utils/           # 工具函数
│   └── main.py          # Bot入口文件
├── deploy/              # 部署配置
│   ├── helm/           # Helm Charts
│   ├── k8s/            # Kubernetes配置
│   └── docker/         # Docker配置
├── config/              # 配置文件
│   ├── .env.example    # 环境变量模板
│   └── settings.py     # 应用设置
├── scripts/             # 自动化脚本
│   ├── init_db.py      # 数据库初始化
│   ├── backup.sh       # 备份脚本
│   └── deploy.sh       # 部署脚本
├── src/                 # React前端源码
│   ├── components/     # React组件
│   ├── pages/          # 页面组件
│   └── utils/          # 前端工具
├── docker-compose.*.yml # Docker编排文件
├── package.json         # Node.js依赖
└── README.md           # 项目说明
```

## 🚀 部署步骤

### 1. 环境准备
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 2. 配置设置
```bash
# 复制环境配置
cp config/.env.example config/.env

# 编辑配置文件
nano config/.env
```

### 3. 启动服务
```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境  
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 初始化数据
```bash
python scripts/init_db.py
```

### 5. 启动机器人
```bash
python bot/main.py
```

## 🔧 配置说明

### 必需环境变量
- `BOT_TOKEN`: Telegram Bot令牌
- `TRON_ADDRESS`: TRON收款地址
- `DATABASE_URL`: PostgreSQL连接字符串
- `REDIS_URL`: Redis连接字符串
- `VAULT_URL`: HashiCorp Vault地址

### 可选配置
- `WEBHOOK_URL`: Webhook地址
- `ADMIN_CHAT_ID`: 管理员聊天ID
- `LOG_LEVEL`: 日志级别
- `ENVIRONMENT`: 运行环境

## 🔒 安全注意事项

1. **密钥管理**: 使用HashiCorp Vault存储敏感信息
2. **网络安全**: 配置防火墙和SSL证书
3. **访问控制**: 设置管理员权限和2FA
4. **数据加密**: 敏感数据AES-256加密
5. **审计日志**: 启用完整的操作审计

## ⚠️ 法律合规

使用本系统请确保:
- 遵守当地法律法规
- 符合Telegram使用条款
- 获得必要经营许可
- 承担相应法律责任

## 📞 技术支持

- 📖 文档: README.md
- 🐛 问题: GitHub Issues
- 🔒 安全: security@example.com
EOF

# 创建部署指南
echo "📖 创建部署指南..."
cat > "$PACKAGE_DIR/QUICK_START.md" << 'EOF'
# TeleBot销售平台快速开始指南

## 🎯 一键部署

### 方式一: Docker Compose (推荐)

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd <repo-name>

# 2. 配置环境
cp config/.env.example config/.env
# 编辑 .env 文件，填入必要配置

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

### 方式二: 手动部署

```bash
# 1. 安装依赖
pip install -r backend/requirements.txt
npm install

# 2. 启动数据库
docker run -d --name postgres -e POSTGRES_DB=telebot -p 5432:5432 postgres:14
docker run -d --name redis -p 6379:6379 redis:6

# 3. 初始化数据库
python scripts/init_db.py

# 4. 启动后端
cd backend && python -m uvicorn app.main:app --reload

# 5. 启动前端
npm run dev

# 6. 启动机器人
python bot/main.py
```

## 🔑 关键配置

### Bot Token 获取
1. 在Telegram中找到 @BotFather
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 获取Bot Token并配置到 `.env`

### TRON钱包配置
1. 创建TRON钱包地址
2. 获取私钥并安全存储
3. 配置收款地址到系统
4. 测试支付确认功能

### 数据库配置
```bash
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/telebot

# Redis
REDIS_URL=redis://localhost:6379/0
```

## 🧪 测试验证

### 1. 健康检查
```bash
curl http://localhost:8000/health
```

### 2. Bot测试
- 在Telegram中找到您的机器人
- 发送 `/start` 命令
- 验证菜单和功能正常

### 3. 支付测试
- 创建测试订单
- 使用测试网络验证支付流程
- 确认自动发货功能

## 🛠️ 故障排除

### 常见问题

1. **Bot无响应**
   - 检查Token是否正确
   - 验证网络连接
   - 查看日志文件

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接字符串
   - 确认防火墙设置

3. **支付不确认**
   - 检查TRON节点连接
   - 验证收款地址
   - 查看支付监听服务

### 日志查看
```bash
# Docker Compose
docker-compose logs -f [service-name]

# 直接运行
tail -f logs/app.log
```

## 📈 监控运维

### 性能监控
- CPU和内存使用率
- 数据库连接数
- API响应时间
- Bot消息处理量

### 备份策略
```bash
# 数据库备份
pg_dump telebot > backup-$(date +%Y%m%d).sql

# 配置文件备份
tar -czf config-backup.tar.gz config/
```

## 🚀 生产部署

### 1. 域名和SSL
```bash
# 使用Let's Encrypt
certbot --nginx -d yourdomain.com
```

### 2. 反向代理
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:8000;
    }
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 3. 系统服务
```bash
# 创建systemd服务
sudo systemctl enable telebot
sudo systemctl start telebot
```

## 📞 获取帮助

- 📖 完整文档: README.md
- 🔧 配置说明: config/README.md
- 🐛 问题报告: GitHub Issues
- 💬 社区讨论: Discussions
EOF

# 创建一键导入脚本
echo "🔧 创建一键导入脚本..."
cat > "$PACKAGE_DIR/import-to-github.sh" << 'EOF'
#!/bin/bash

# TeleBot项目GitHub导入脚本
# 使用前请确保已安装并配置GitHub CLI

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# 配置项 (可通过环境变量覆盖)
REPO_NAME="${REPO_NAME:-zh}"
REPO_VISIBILITY="${REPO_VISIBILITY:-public}"
REPO_DESCRIPTION="${REPO_DESCRIPTION:-TeleBot销售平台 - 完整的Telegram机器人销售与分销系统}"

echo "🚀 TeleBot项目GitHub导入工具"
echo "=============================="
echo "仓库名称: $REPO_NAME"
echo "可见性: $REPO_VISIBILITY"
echo "描述: $REPO_DESCRIPTION"
echo "=============================="

# 检查GitHub CLI
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI未安装，请先安装: https://cli.github.com/"
    exit 1
fi

# 检查登录状态
if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI未登录，请先运行: gh auth login"
    exit 1
fi

print_success "GitHub CLI检查通过"

# 初始化Git仓库
print_warning "初始化Git仓库..."
git init
git add .
git commit -m "🎉 Initial commit: TeleBot销售平台完整导入

✨ 功能特性:
- 🤖 Telegram Bot销售系统
- 💰 TRON区块链支付处理  
- 🏪 分销商管理系统
- 🔒 企业级安全架构
- 🐳 Docker容器化部署
- 📊 实时监控与分析

🛠️ 技术栈:
- Python (aiogram + FastAPI)
- React + TypeScript
- PostgreSQL + Redis
- Docker + Kubernetes
- HashiCorp Vault

📦 项目结构:
- backend/     FastAPI后端服务
- bot/         Telegram Bot机器人
- deploy/      部署配置文件
- config/      配置文件模板
- scripts/     自动化脚本
- src/         React前端源码

🚀 快速开始:
1. 查看 README.md 了解项目
2. 阅读 QUICK_START.md 快速部署
3. 参考 PROJECT_MANIFEST.md 了解结构
4. 使用 docker-compose up 启动

🔒 安全合规:
- 通过完整安全审计
- 符合Telegram官方规定
- 包含法律风险提示
- 企业级权限控制

📋 部署文档:
- QUICK_START.md    快速开始指南
- PROJECT_MANIFEST.md    项目清单
- docker-compose.yml     容器编排
- config/.env.example    配置模板

⚠️ 法律声明:
使用本系统请确保遵守当地法律法规，
获得必要的经营许可，承担相应法律责任。

📞 技术支持:
- 完整文档和API说明
- GitHub Issues问题追踪
- 社区讨论和支持
"

# 创建GitHub仓库
print_warning "创建GitHub仓库..."
gh repo create "$REPO_NAME" --$REPO_VISIBILITY --description "$REPO_DESCRIPTION"

# 设置远程仓库
GITHUB_USER=$(gh api user --jq .login)
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main

# 推送代码
print_warning "推送代码到GitHub..."
git push -u origin main

# 创建Release
print_warning "创建Release版本..."
VERSION="v$(date +%Y.%m.%d)"
gh release create "$VERSION" \
    --title "TeleBot销售平台 $VERSION" \
    --notes "🎉 TeleBot销售平台完整版发布

## 🌟 主要功能

### 🤖 Telegram Bot系统
- 完整的销售流程自动化
- 多语言支持 (中文/英文)
- 智能客服与订单管理
- 用户中心与余额系统

### 💰 区块链支付
- TRON网络集成
- TRC20 USDT支付
- 唯一金额尾数识别
- 自动支付确认

### 🏪 分销系统  
- 一键克隆部署
- 多级代理管理
- 实时库存同步
- 佣金结算系统

### 🔒 安全架构
- HashiCorp Vault密钥管理
- 多因素身份验证
- 操作审计日志
- 企业级权限控制

### 🐳 容器化部署
- Docker容器支持
- Kubernetes编排
- Helm Charts配置
- 自动化CI/CD

## 📦 快速部署

### 开发环境
\`\`\`bash
git clone https://github.com/$GITHUB_USER/$REPO_NAME.git
cd $REPO_NAME
cp config/.env.example config/.env
# 编辑配置文件
docker-compose up -d
\`\`\`

### 生产环境
\`\`\`bash
# 使用Helm
helm install telebot ./deploy/helm/

# 或使用Docker Compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🔧 配置要点

1. **Bot Token**: 从@BotFather获取
2. **TRON地址**: 配置收款钱包
3. **数据库**: PostgreSQL + Redis
4. **安全**: Vault密钥管理
5. **监控**: 日志和性能监控

## ⚠️ 重要提醒

- 遵守当地法律法规
- 获得必要经营许可
- 确保数据安全保护
- 定期备份重要数据

## 📞 技术支持

- 📖 项目文档: README.md
- 🚀 快速开始: QUICK_START.md
- 📋 项目清单: PROJECT_MANIFEST.md
- 🐛 问题报告: GitHub Issues

---
TeleBot销售平台 - 企业级Telegram商务解决方案"

print_success "项目导入完成！"
echo
echo "🎉 导入结果："
echo "📍 仓库地址: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "📋 项目主页: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "🏷️ 最新版本: $VERSION"
echo
echo "🚀 下一步："
echo "1. 查看项目主页了解功能"
echo "2. 克隆仓库到本地开发"
echo "3. 配置环境变量"
echo "4. 启动开发环境测试"
echo "5. 阅读部署文档"
EOF

# 打包完成
echo "✅ 项目打包完成！"
echo
echo "📦 打包目录: $PACKAGE_DIR"
echo "📁 包含文件:"
ls -la "$PACKAGE_DIR" | grep -E '^d|^-' | awk '{print "  " $9}'
echo
echo "🚀 导入说明："
echo "1. 进入打包目录: cd $PACKAGE_DIR"
echo "2. 运行导入脚本: bash import-to-github.sh"
echo "3. 或手动创建仓库并推送代码"
echo
echo "📖 包含文档："
echo "  - PROJECT_MANIFEST.md  项目清单和结构说明"
echo "  - QUICK_START.md       快速开始部署指南"
echo "  - import-to-github.sh  一键导入GitHub脚本"
echo
echo "⚠️ 使用前请："
echo "  - 安装GitHub CLI: https://cli.github.com/"
echo "  - 登录GitHub: gh auth login"
echo "  - 配置环境变量（可选）"
echo
echo "🎯 一键导入命令："
echo "  cd $PACKAGE_DIR && bash import-to-github.sh"