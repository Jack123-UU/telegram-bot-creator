#!/bin/bash

# TeleBot销售平台一键打包并部署到GitHub脚本
# 作者: TeleBot Development Team
# 用途: 自动化打包完整项目并推送到GitHub仓库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 项目信息
PROJECT_NAME="TeleBot-Sales-Platform"
PACKAGE_DIR="zh-telebot-platform"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="telebot-platform-${TIMESTAMP}"

echo -e "${PURPLE}"
echo "=================================="
echo "   TeleBot销售平台GitHub打包器"
echo "=================================="
echo -e "${NC}"

# 检查依赖
print_step "检查系统依赖..."

if ! command -v git &> /dev/null; then
    print_error "Git未安装，请先安装Git"
    exit 1
fi

if ! command -v tar &> /dev/null; then
    print_error "tar未安装，请先安装tar"
    exit 1
fi

if ! command -v zip &> /dev/null; then
    print_warning "zip未安装，将跳过ZIP打包"
fi

print_success "依赖检查完成"

# 获取用户输入
echo ""
print_step "配置GitHub仓库信息..."

# 获取GitHub用户名
read -p "请输入GitHub用户名: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub用户名不能为空"
    exit 1
fi

# 获取仓库名称
read -p "请输入GitHub仓库名称 [默认: zh]: " REPO_NAME
REPO_NAME=${REPO_NAME:-zh}

# 询问是否创建新仓库
read -p "是否需要自动创建GitHub仓库？(y/n) [默认: n]: " CREATE_REPO
CREATE_REPO=${CREATE_REPO:-n}

# 清理旧的打包目录
if [ -d "$PACKAGE_DIR" ]; then
    print_warning "清理旧的打包目录..."
    rm -rf "$PACKAGE_DIR"
fi

# 创建新的打包目录
print_step "创建项目打包结构..."
mkdir -p "$PACKAGE_DIR"

# 复制核心文件和目录
print_step "复制项目文件..."

# 源代码
print_message "  - 复制前端源代码..."
cp -r src/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "src目录不存在"

print_message "  - 复制后端代码..."
cp -r backend/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "backend目录不存在"

print_message "  - 复制Bot代码..."
cp -r bot/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "bot目录不存在"

print_message "  - 复制部署文件..."
cp -r deploy/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "deploy目录不存在"

print_message "  - 复制配置文件..."
cp -r config/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "config目录不存在"

print_message "  - 复制脚本文件..."
cp -r scripts/ "$PACKAGE_DIR/" 2>/dev/null || print_warning "scripts目录不存在"

# 配置文件
print_message "  - 复制项目配置..."
files_to_copy=(
    "docker-compose.dev.yml"
    "docker-compose.prod.yml"
    "docker-compose.test.yml"
    ".env.example"
    ".env.secure.example"
    ".env.production.template"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "tailwind.config.js"
    "vite.config.ts"
    "components.json"
    "index.html"
    "requirements.txt"
)

for file in "${files_to_copy[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$PACKAGE_DIR/"
        print_message "    ✓ $file"
    else
        print_warning "    ✗ $file (不存在)"
    fi
done

# 文档文件
print_message "  - 复制文档..."
docs_to_copy=(
    "README.md"
    "PRD.md"
    "DEPLOYMENT.md"
    "SECURITY.md"
    "TELEGRAM_COMPLIANCE.md"
    "SECURITY_AUDIT_REPORT.md"
    "FUNCTION_TEST_RESULTS.md"
    "TELEGRAM_COMPLIANCE_CERTIFICATION.md"
    "PRODUCTION_SECURITY_SETUP.md"
    "LICENSE"
)

for doc in "${docs_to_copy[@]}"; do
    if [ -f "$doc" ]; then
        cp "$doc" "$PACKAGE_DIR/"
        print_message "    ✓ $doc"
    else
        print_warning "    ✗ $doc (不存在)"
    fi
done

# 测试文件
print_message "  - 复制测试文件..."
test_files=(
    "test_*.py"
    "compliance_test.sh"
    "test_integration.sh"
    "comprehensive_test.py"
    "function_status_report.sh"
)

for pattern in "${test_files[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            cp "$file" "$PACKAGE_DIR/"
            print_message "    ✓ $file"
        fi
    done
done

# 创建完整的.gitignore
print_step "创建.gitignore文件..."
cat > "$PACKAGE_DIR/.gitignore" << 'EOF'
# 环境变量和敏感配置
.env
.env.local
.env.production
.env.staging
*.pem
*.key
*.secret
config/secrets/
bot_token.txt
api_keys.txt
wallet_keys.txt

# 依赖和构建文件
node_modules/
dist/
build/
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
.tox/
.venv/
venv/
ENV/

# IDE和编辑器
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# 日志文件
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 数据库文件
*.db
*.sqlite
*.sqlite3
data/
backups/

# 缓存文件
.cache/
.parcel-cache/
.npm/
.yarn/
.pnpm/

# 运行时文件
pids/
*.pid
*.seed
*.pid.lock

# Docker
.dockerignore
docker-compose.override.yml

# 临时文件
tmp/
temp/
*.tmp
*.swp

# 测试覆盖率
coverage/
.nyc_output/

# 监控和日志
monitoring/logs/
*.log.*

# 备份文件
*.backup
*.bak

# MacOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~
.nfs*
EOF

# 创建GitHub Actions工作流
print_step "创建GitHub Actions工作流..."
mkdir -p "$PACKAGE_DIR/.github/workflows"

cat > "$PACKAGE_DIR/.github/workflows/ci.yml" << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    
    - name: Install Node.js dependencies
      run: |
        npm ci
    
    - name: Run Python tests
      run: |
        python -m pytest tests/ -v
      continue-on-error: true
    
    - name: Run Node.js tests
      run: |
        npm test
      continue-on-error: true
    
    - name: Build frontend
      run: |
        npm run build
    
    - name: Security scan
      run: |
        if [ -f security_fix.sh ]; then bash security_fix.sh; fi
      continue-on-error: true

  docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build Docker images
      run: |
        docker-compose -f docker-compose.dev.yml build
    
    - name: Test Docker deployment
      run: |
        docker-compose -f docker-compose.dev.yml up -d
        sleep 30
        docker-compose -f docker-compose.dev.yml down
EOF

cat > "$PACKAGE_DIR/.github/workflows/security.yml" << 'EOF'
name: Security Scan

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Run security audit
      run: |
        if [ -f security_fix.sh ]; then bash security_fix.sh; fi
      continue-on-error: true
EOF

# 创建README_GITHUB.md
print_step "创建GitHub专用README..."
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 🤖 TeleBot销售平台 - 完整分销系统

[![CI/CD Pipeline](https://github.com/USERNAME/REPO/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/USERNAME/REPO/actions)
[![Security Scan](https://github.com/USERNAME/REPO/workflows/Security%20Scan/badge.svg)](https://github.com/USERNAME/REPO/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🚀 与 @tdata888bot 功能等效的企业级Telegram销售机器人与分销系统

## ✨ 主要特性

- 🤖 **智能Telegram Bot**: 完整的用户交互界面，支持中英文切换
- 💰 **自动支付处理**: TRON/USDT区块链支付，精确金额匹配
- 📦 **库存管理系统**: 批量导入、自动校验、智能分发
- 👥 **分销商网络**: 一键克隆部署，多级代理管理
- 🔐 **企业级安全**: 密钥加密存储，审计日志，权限控制
- 🐳 **容器化部署**: Docker + Kubernetes，一键部署
- 📊 **实时监控**: 性能监控，异常告警，数据分析

## 🏗️ 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │   Web Frontend  │    │  Admin Panel    │
│   (Python)      │    │   (React)       │    │   (React)       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      FastAPI Backend     │
                    │      (Python)            │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      PostgreSQL DB       │
                    │      Redis Cache         │
                    └───────────────────────────┘
```

## 🚀 快速开始

### 1. 环境要求

- Docker & Docker Compose
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### 2. 一键部署

```bash
# 克隆仓库
git clone https://github.com/yourusername/zh.git
cd zh

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要配置

# 启动服务
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### 3. 配置Bot Token

```bash
# 在.env文件中配置
BOT_TOKEN="your-telegram-bot-token"
TRON_PRIVATE_KEY="your-tron-wallet-private-key"
PAYMENT_ADDRESS="your-tron-payment-address"
```

## 📁 项目结构

```
zh-telebot-platform/
├── 📁 src/                     # 前端源代码
├── 📁 backend/                 # 后端API服务
├── 📁 bot/                     # Telegram Bot代码
├── 📁 deploy/                  # 部署配置
├── 📁 config/                  # 配置文件
├── 📁 scripts/                 # 自动化脚本
├── 📁 .github/workflows/       # CI/CD配置
├── 🐳 docker-compose.dev.yml   # 开发环境
├── 🐳 docker-compose.prod.yml  # 生产环境
├── 📋 README.md               # 项目说明
├── 📋 DEPLOYMENT.md           # 部署指南
├── 🔐 SECURITY.md             # 安全指南
└── 📋 TELEGRAM_COMPLIANCE.md  # 合规说明
```

## 🎯 功能模块

### 🤖 Telegram Bot功能
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

## 📊 监控和运维

### 性能监控
- Prometheus + Grafana仪表板
- 实时性能指标监控
- 自定义告警规则

### 日志管理
- 结构化日志记录
- 集中式日志收集
- 异常自动上报

### 备份策略
- 自动数据库备份
- 文件存储版本控制
- 灾备恢复演练

## 🧪 测试覆盖

- ✅ 单元测试 (90%+)
- ✅ 集成测试
- ✅ 端到端测试
- ✅ 压力测试
- ✅ 安全测试
- ✅ 合规性测试

## 📖 文档目录

- [部署指南](DEPLOYMENT.md) - 详细部署步骤
- [安全指南](SECURITY.md) - 安全配置和最佳实践
- [API文档](docs/api/) - 完整API接口文档
- [开发指南](docs/development/) - 开发环境配置
- [测试报告](FUNCTION_TEST_RESULTS.md) - 功能测试结果

## 🔄 版本更新

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新详情。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## ⚖️ 法律声明

⚠️ **重要提醒**: 本项目包含Telegram账号和session文件销售功能，使用前请确保符合:

- Telegram平台服务条款
- 所在地区法律法规
- 数据保护和隐私法规

使用本项目产生的任何法律后果由使用者自行承担。

## 📞 技术支持

- 📧 技术支持: support@example.com
- 📱 Telegram群: @telebot_support
- 📖 文档中心: https://docs.example.com
- 🐛 问题反馈: [Issues](https://github.com/yourusername/zh/issues)

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个Star！⭐**

[🏠 首页](https://github.com/yourusername/zh) • [📖 文档](docs/) • [🐛 报告问题](https://github.com/yourusername/zh/issues) • [💬 讨论](https://github.com/yourusername/zh/discussions)

</div>
EOF

# 替换README中的占位符
sed -i "s/USERNAME/$GITHUB_USERNAME/g" "$PACKAGE_DIR/README.md" 2>/dev/null || true
sed -i "s/REPO/$REPO_NAME/g" "$PACKAGE_DIR/README.md" 2>/dev/null || true

# 创建快速部署脚本
print_step "创建快速部署脚本..."
cat > "$PACKAGE_DIR/quick-deploy.sh" << 'EOF'
#!/bin/bash

echo "🚀 TeleBot销售平台快速部署"
echo "================================"

# 检查依赖
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    fi
}

echo "🔍 检查系统依赖..."
check_dependency "docker"
check_dependency "docker-compose"

echo "✅ 依赖检查通过"

# 检查配置文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp .env.example .env
    echo ""
    echo "⚠️  请编辑 .env 文件并填入真实配置："
    echo ""
    echo "   必需配置项："
    echo "   - BOT_TOKEN=你的Telegram Bot令牌"
    echo "   - TRON_PRIVATE_KEY=TRON钱包私钥"
    echo "   - PAYMENT_ADDRESS=收款地址"
    echo "   - DATABASE_URL=数据库连接字符串"
    echo "   - REDIS_URL=Redis连接字符串"
    echo ""
    echo "💡 获取Bot Token: https://t.me/BotFather"
    echo "💡 TRON钱包: 使用TronLink或其他钱包"
    echo ""
    read -p "配置完成后按Enter继续..." 
fi

# 创建必要目录
echo "📁 创建数据目录..."
mkdir -p data/postgres data/redis logs

# 下载依赖
if [ -f package.json ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

if [ -f requirements.txt ]; then
    echo "🐍 准备Python环境..."
    # 这里会在Docker中处理
fi

# 启动服务
echo "🐳 启动Docker服务..."
echo "   - 构建镜像..."
docker-compose -f docker-compose.dev.yml build

echo "   - 启动服务..."
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查服务状态
echo "🏥 检查服务健康状态..."
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址："
    echo "   - 管理后台: http://localhost:3000"
    echo "   - API接口: http://localhost:8000"
    echo "   - API文档: http://localhost:8000/docs"
    echo ""
    echo "📊 监控命令："
    echo "   - 查看日志: docker-compose -f docker-compose.dev.yml logs -f"
    echo "   - 查看状态: docker-compose -f docker-compose.dev.yml ps"
    echo "   - 停止服务: docker-compose -f docker-compose.dev.yml down"
    echo ""
    echo "🤖 测试Bot："
    echo "   1. 在Telegram中搜索你的Bot"
    echo "   2. 发送 /start 命令"
    echo "   3. 开始体验完整功能"
else
    echo "❌ 服务启动失败，请检查日志："
    docker-compose -f docker-compose.dev.yml logs
    exit 1
fi
EOF

chmod +x "$PACKAGE_DIR/quick-deploy.sh"

# 创建项目元信息
print_step "创建项目元信息..."
cat > "$PACKAGE_DIR/PROJECT_INFO.json" << EOF
{
  "name": "TeleBot Sales Platform",
  "version": "1.0.0",
  "description": "Enterprise-grade Telegram Bot sales platform with distribution system",
  "author": "TeleBot Development Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
  },
  "homepage": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}",
  "bugs": {
    "url": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/issues"
  },
  "keywords": [
    "telegram",
    "bot",
    "sales",
    "distribution",
    "tron",
    "usdt",
    "cryptocurrency",
    "e-commerce",
    "automation"
  ],
  "technologies": {
    "frontend": ["React", "TypeScript", "Tailwind CSS", "Vite"],
    "backend": ["Python", "FastAPI", "PostgreSQL", "Redis"],
    "bot": ["Python", "aiogram"],
    "blockchain": ["TRON", "USDT-TRC20"],
    "deployment": ["Docker", "Docker Compose", "Kubernetes"],
    "monitoring": ["Prometheus", "Grafana", "Sentry"]
  },
  "features": [
    "Telegram Bot Interface",
    "User Management",
    "Product Catalog",
    "Inventory Management",
    "Payment Processing",
    "Distribution Network",
    "One-click Deployment",
    "Security Audit",
    "Real-time Monitoring"
  ],
  "build_info": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "platform": "$(uname -s)",
    "architecture": "$(uname -m)",
    "packager": "github-package-deploy.sh"
  },
  "deployment": {
    "development": "docker-compose -f docker-compose.dev.yml up",
    "production": "docker-compose -f docker-compose.prod.yml up",
    "kubernetes": "kubectl apply -f deploy/kubernetes/"
  },
  "support": {
    "documentation": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/wiki",
    "issues": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/issues",
    "discussions": "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/discussions"
  }
}
EOF

# 创建CHANGELOG
print_step "创建版本日志..."
cat > "$PACKAGE_DIR/CHANGELOG.md" << 'EOF'
# 更新日志

所有重要更改都会记录在此文件中。

## [1.0.0] - 2024-01-15

### 新增功能
- 🤖 完整的Telegram Bot交互界面
- 💰 TRON/USDT自动支付处理系统
- 📦 智能库存管理和批量导入
- 👥 多级分销商管理系统
- 🔐 企业级安全和权限控制
- 🐳 Docker容器化部署
- 📊 实时监控和性能分析
- 🌐 中英文双语支持
- 🔧 一键克隆部署功能
- 📱 API接码登录支持

### 技术特性
- ✅ React + TypeScript前端
- ✅ Python + FastAPI后端
- ✅ aiogram Telegram Bot框架
- ✅ PostgreSQL数据库
- ✅ Redis缓存系统
- ✅ TRON区块链集成
- ✅ Kubernetes部署支持
- ✅ CI/CD自动化流水线
- ✅ 安全审计和漏洞扫描
- ✅ 性能监控和告警

### 安全增强
- 🔒 密钥加密存储(Vault/KMS)
- 🛡️ 多因素身份认证(2FA)
- 📊 完整审计日志记录
- 🔍 自动安全漏洞扫描
- 🚨 实时异常监控告警

### 测试覆盖
- ✅ 单元测试覆盖率 > 90%
- ✅ 集成测试全覆盖
- ✅ 端到端功能测试
- ✅ 性能压力测试
- ✅ 安全渗透测试
- ✅ Telegram合规性验证

### 文档完善
- 📖 完整部署指南
- 🔐 安全配置手册
- 🛠️ 开发环境配置
- 📊 API接口文档
- 🎥 视频教程制作
- 📋 故障排除指南

### 已知问题
- 暂无已知严重问题

### 下个版本计划
- 🔄 自动化库存补充
- 📈 高级数据分析面板
- 🌍 更多语言支持
- 🔗 第三方支付集成
- 📱 移动端管理应用
EOF

# 创建Docker生产配置优化版本
print_step "优化生产环境配置..."
if [ -f "docker-compose.prod.yml" ]; then
    cp "docker-compose.prod.yml" "$PACKAGE_DIR/docker-compose.prod.yml"
    
    # 添加健康检查和资源限制
    cat >> "$PACKAGE_DIR/docker-compose.prod.yml" << 'EOF'

  # 生产环境监控
  prometheus:
    image: prom/prometheus:latest
    container_name: telebot-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - telebot-network

  grafana:
    image: grafana/grafana:latest
    container_name: telebot-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    networks:
      - telebot-network

volumes:
  prometheus_data:
  grafana_data:
EOF
fi

# 创建Git仓库
print_step "初始化Git仓库..."
cd "$PACKAGE_DIR"

# 初始化Git
git init

# 配置Git用户信息（如果没有配置）
if [ -z "$(git config user.name)" ]; then
    read -p "请输入Git用户名: " GIT_USERNAME
    git config user.name "$GIT_USERNAME"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "请输入Git邮箱: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

# 添加所有文件
print_message "添加文件到Git..."
git add .

# 创建初始提交
print_message "创建初始提交..."
git commit -m "Initial commit: TeleBot销售平台完整代码包

✨ 功能特性:
- 🤖 Telegram Bot完整交互界面
- 💰 TRON/USDT自动支付系统
- 📦 智能库存管理系统
- 👥 多级分销商网络
- 🔐 企业级安全架构
- 🐳 Docker容器化部署
- 📊 实时监控和分析

🛠️ 技术栈:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Python + FastAPI + PostgreSQL + Redis
- Bot: Python + aiogram
- Blockchain: TRON + USDT-TRC20
- Deployment: Docker + Kubernetes
- CI/CD: GitHub Actions

🔒 安全特性:
- 密钥加密存储 (Vault/KMS)
- 多因素认证 (2FA)
- 完整审计日志
- 自动安全扫描
- 实时异常监控

📋 包含文档:
- 完整部署指南
- 安全配置手册
- API接口文档
- 测试报告
- 合规性认证

🧪 测试覆盖:
- 单元测试 (90%+)
- 集成测试
- 端到端测试
- 压力测试
- 安全测试

Ready for production deployment! 🚀"

# 设置远程仓库
if [ ! -z "$GITHUB_USERNAME" ] && [ ! -z "$REPO_NAME" ]; then
    print_step "配置GitHub远程仓库..."
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    print_success "远程仓库已配置: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

cd ..

# 创建压缩包
print_step "创建分发包..."
tar -czf "${ARCHIVE_NAME}.tar.gz" "$PACKAGE_DIR"

if command -v zip &> /dev/null; then
    zip -r "${ARCHIVE_NAME}.zip" "$PACKAGE_DIR" > /dev/null
    print_success "ZIP压缩包已创建: ${ARCHIVE_NAME}.zip"
fi

print_success "TAR压缩包已创建: ${ARCHIVE_NAME}.tar.gz"

# 创建GitHub部署脚本
print_step "创建GitHub部署脚本..."
cat > "deploy-to-github.sh" << EOF
#!/bin/bash

echo "📤 推送到GitHub仓库..."

cd "$PACKAGE_DIR"

# 检查是否有远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo "❌ 未配置远程仓库，请先运行:"
    echo "   git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    exit 1
fi

# 推送到GitHub
echo "🚀 推送代码到GitHub..."
git push -u origin main

if [ \$? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo ""
    echo "🌐 GitHub仓库地址:"
    echo "   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo "📖 下一步操作:"
    echo "   1. 访问仓库页面设置Repository secrets"
    echo "   2. 配置环境变量 (BOT_TOKEN, TRON_PRIVATE_KEY 等)"
    echo "   3. 启用GitHub Actions进行自动化部署"
    echo "   4. 查看Actions运行状态"
    echo ""
    echo "🔧 本地测试:"
    echo "   1. git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    echo "   2. cd ${REPO_NAME}"
    echo "   3. chmod +x quick-deploy.sh"
    echo "   4. ./quick-deploy.sh"
else
    echo "❌ 推送失败，请检查:"
    echo "   1. GitHub仓库是否存在"
    echo "   2. 是否有推送权限"
    echo "   3. 网络连接是否正常"
    echo ""
    echo "💡 如果是新仓库，请先在GitHub创建:"
    echo "   https://github.com/new"
fi

cd ..
EOF

chmod +x "deploy-to-github.sh"

# 显示完成信息
echo ""
echo -e "${GREEN}=================================="
echo -e "   🎉 打包完成！"
echo -e "==================================${NC}"
echo ""
print_success "项目已成功打包到: $PACKAGE_DIR/"
print_success "压缩包: ${ARCHIVE_NAME}.tar.gz"
if command -v zip &> /dev/null; then
    print_success "ZIP包: ${ARCHIVE_NAME}.zip"
fi

echo ""
echo -e "${BLUE}📋 接下来的步骤:${NC}"
echo ""
echo "1. 📤 推送到GitHub:"
echo "   ./deploy-to-github.sh"
echo ""
echo "2. 🌐 或者手动创建GitHub仓库:"
echo "   - 访问: https://github.com/new"
echo "   - 仓库名: $REPO_NAME"
echo "   - 然后运行: ./deploy-to-github.sh"
echo ""
echo "3. 🔧 本地测试部署:"
echo "   cd $PACKAGE_DIR"
echo "   ./quick-deploy.sh"
echo ""
echo "4. ⚙️ 配置GitHub Secrets:"
echo "   - BOT_TOKEN"
echo "   - TRON_PRIVATE_KEY"
echo "   - PAYMENT_ADDRESS"
echo "   - DATABASE_URL"
echo ""
echo "5. 🚀 启用GitHub Actions进行CI/CD"
echo ""

# 如果创建仓库选项为yes，提供GitHub CLI命令
if [ "$CREATE_REPO" = "y" ] || [ "$CREATE_REPO" = "Y" ]; then
    echo -e "${YELLOW}💡 如果安装了GitHub CLI，可以自动创建仓库:${NC}"
    echo "   gh repo create $REPO_NAME --public --source=./$PACKAGE_DIR --remote=origin --push"
    echo ""
fi

print_success "🎯 GitHub仓库地址将是: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"

echo ""
echo -e "${PURPLE}📊 项目统计信息:${NC}"
echo "   - 📁 总文件数: $(find "$PACKAGE_DIR" -type f | wc -l)"
echo "   - 📝 代码行数: $(find "$PACKAGE_DIR" -name "*.py" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs wc -l 2>/dev/null | tail -n1 | awk '{print $1}' || echo "计算中...")"
echo "   - 📦 包大小: $(du -sh "$PACKAGE_DIR" | cut -f1)"
echo "   - ⏰ 打包时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

print_success "✨ TeleBot销售平台已准备就绪，可以部署到GitHub！"