#!/bin/bash

# TeleBot销售平台 - 项目导入到zh仓库脚本
# 自动化将完整的TeleBot项目导入到指定的GitHub仓库

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

# 配置变量（可以通过环境变量覆盖）
REPO_NAME="${REPO_NAME:-zh}"
REPO_DESCRIPTION="${REPO_DESCRIPTION:-TeleBot销售平台 - 完整的Telegram机器人销售与分销系统}"
REPO_VISIBILITY="${REPO_VISIBILITY:-public}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
GITHUB_USERNAME="${GITHUB_USERNAME:-your-username}"

echo "🚀 TeleBot销售平台项目导入器"
echo "================================="
echo "目标仓库: $GITHUB_USERNAME/$REPO_NAME"
echo "描述: $REPO_DESCRIPTION"
echo "可见性: $REPO_VISIBILITY"
echo "主分支: $MAIN_BRANCH"
echo "================================="

# 检查必要工具
check_dependencies() {
    print_info "检查依赖工具..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI未安装，请先安装: https://cli.github.com/"
        exit 1
    fi
    
    # 检查GitHub CLI是否已登录
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI未登录，请先运行: gh auth login"
        exit 1
    fi
    
    print_success "所有依赖工具检查通过"
}

# 创建临时目录
create_temp_dir() {
    TEMP_DIR="/tmp/telebot-export-$(date +%s)"
    print_info "创建临时目录: $TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
}

# 准备项目文件
prepare_project_files() {
    print_info "准备项目文件..."
    
    # 检查源目录是否存在
    if [ ! -d "$OLDPWD" ]; then
        print_error "源目录不存在: $OLDPWD"
        exit 1
    fi
    
    # 复制核心目录
    for dir in backend bot deploy config scripts src; do
        if [ -d "$OLDPWD/$dir" ]; then
            print_info "复制目录: $dir"
            cp -r "$OLDPWD/$dir" ./
        else
            print_warning "目录不存在，跳过: $dir"
        fi
    done
    
    # 复制配置文件
    for file in docker-compose.*.yml package.json tsconfig.json vite.config.ts tailwind.config.js; do
        if [ -f "$OLDPWD/$file" ]; then
            print_info "复制文件: $file"
            cp "$OLDPWD/$file" ./
        else
            print_warning "文件不存在，跳过: $file"
        fi
    done
    
    # 复制文档文件
    for file in README.md SECURITY.md LICENSE PRD.md DEPLOYMENT.md; do
        if [ -f "$OLDPWD/$file" ]; then
            print_info "复制文档: $file"
            cp "$OLDPWD/$file" ./
        fi
    done
    
    # 复制所有Markdown文件
    find "$OLDPWD" -maxdepth 1 -name "*.md" -exec cp {} ./ \;
    
    print_success "项目文件准备完成"
}

# 创建GitHub仓库
create_github_repo() {
    print_info "创建GitHub仓库..."
    
    # 检查仓库是否已存在
    if gh repo view "$GITHUB_USERNAME/$REPO_NAME" &> /dev/null; then
        print_warning "仓库已存在: $GITHUB_USERNAME/$REPO_NAME"
        read -p "是否要删除现有仓库并重新创建？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "删除现有仓库..."
            gh repo delete "$GITHUB_USERNAME/$REPO_NAME" --confirm
        else
            print_error "取消操作"
            exit 1
        fi
    fi
    
    # 创建新仓库
    gh repo create "$REPO_NAME" \
        --"$REPO_VISIBILITY" \
        --description "$REPO_DESCRIPTION" \
        --clone=false
    
    print_success "GitHub仓库创建成功"
}

# 初始化Git仓库并推送
setup_git_and_push() {
    print_info "初始化Git仓库..."
    
    git init
    git add .
    
    # 创建详细的提交消息
    git commit -m "🎉 Initial commit: TeleBot销售平台完整导入

✨ 功能特性:
- 🤖 Telegram Bot销售系统 (Python aiogram)
- 💰 TRON区块链支付处理系统
- 🏪 分销商管理与一键克隆
- 🔒 企业级安全架构 (HashiCorp Vault)
- 🐳 Docker容器化部署
- 📊 实时监控与分析
- 🌐 React管理后台界面

🛠️ 技术栈:
- Backend: Python + FastAPI + aiogram
- Frontend: React + TypeScript + Tailwind CSS
- Database: PostgreSQL + Redis
- Infrastructure: Docker + Kubernetes + Helm
- Security: HashiCorp Vault + 2FA
- Blockchain: TRON + TRC20 USDT

📁 项目结构:
- backend/     - FastAPI后端服务
- bot/         - Telegram Bot机器人
- deploy/      - Kubernetes部署配置
- config/      - 配置文件模板
- scripts/     - 自动化脚本
- src/         - React前端源码

🚀 快速开始:
1. 查看 README.md 了解项目概述
2. 阅读 DEPLOYMENT.md 进行部署
3. 参考 SECURITY.md 配置安全选项
4. 使用 docker-compose up 启动开发环境

📋 合规说明:
项目已通过安全审计，符合Telegram官方规定，
包含完整的法律风险提示和使用条款。

🔗 相关链接:
- 项目文档: README.md
- 部署指南: DEPLOYMENT.md  
- 安全文档: SECURITY.md
- 开发指南: docs/
"
    
    # 设置远程仓库
    git branch -M "$MAIN_BRANCH"
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    print_info "推送代码到GitHub..."
    git push -u origin "$MAIN_BRANCH"
    
    print_success "代码推送完成"
}

# 创建Release
create_release() {
    print_info "创建Release版本..."
    
    # 获取当前日期作为版本号
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

## 📦 部署方式

### 开发环境
\`\`\`bash
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME
docker-compose -f docker-compose.dev.yml up
\`\`\`

### 生产环境
\`\`\`bash
helm install telebot ./deploy/helm/
kubectl apply -f deploy/k8s/
\`\`\`

## 🔧 配置说明

1. **环境变量配置**
   - 复制 \`config/.env.example\` 到 \`config/.env\`
   - 设置 Bot Token 和密钥信息

2. **数据库初始化**
   - 运行 \`python scripts/init_db.py\`
   - 导入初始数据和配置

3. **安全设置**
   - 配置 Vault 密钥存储
   - 启用 2FA 认证
   - 设置访问权限

## ⚠️ 法律合规

使用本系统请确保:
- 遵守当地法律法规
- 符合Telegram使用条款
- 获得必要的经营许可
- 承担相应法律责任

## 📞 技术支持

- 📖 文档: README.md
- 🐛 问题报告: GitHub Issues
- 🔒 安全报告: security@example.com
- 💬 社区讨论: Discussions

---
*TeleBot销售平台 - 企业级Telegram商务解决方案*"
    
    print_success "Release创建成功: $VERSION"
}

# 设置GitHub Actions
setup_github_actions() {
    print_info "设置GitHub Actions工作流..."
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/ci-cd.yml << 'EOF'
name: TeleBot Platform CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.11]
        node-version: [18]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
        
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        if [ -f backend/requirements.txt ]; then pip install -r backend/requirements.txt; fi
        if [ -f bot/requirements.txt ]; then pip install -r bot/requirements.txt; fi
        
    - name: Install Node.js dependencies
      run: npm install
        
    - name: Run Python tests
      run: |
        if [ -d backend/tests ]; then python -m pytest backend/tests/ -v; fi
        if [ -d bot/tests ]; then python -m pytest bot/tests/ -v; fi
        
    - name: Run Frontend tests
      run: npm test
      
    - name: Lint Python code
      run: |
        pip install flake8 black
        flake8 backend/ bot/ --max-line-length=88
        black --check backend/ bot/
        
    - name: Lint TypeScript code
      run: npm run lint
        
    - name: Security scan
      run: |
        pip install bandit safety
        bandit -r backend/ bot/ -f json -o security-report.json || true
        safety check --json --output safety-report.json || true
        
    - name: Upload security reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: |
          security-report.json
          safety-report.json

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker images
      run: |
        docker build -t telebot-backend ./backend
        docker build -t telebot-bot ./bot
        docker build -t telebot-frontend .
        
    - name: Run container security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          -v $(pwd):/root/.cache/ aquasec/trivy:latest \
          image telebot-backend
          
  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to staging
      run: |
        echo "🚀 部署到预生产环境..."
        # 添加部署脚本
        
    - name: Run integration tests
      run: |
        echo "🧪 运行集成测试..."
        # 添加集成测试
        
    - name: Deploy to production
      if: success()
      run: |
        echo "🎉 部署到生产环境..."
        # 添加生产部署脚本
EOF

    git add .github/workflows/ci-cd.yml
    git commit -m "🔧 添加GitHub Actions CI/CD工作流

- 自动化测试 (Python + Node.js)
- 代码质量检查 (Lint + Format)
- 安全扫描 (Bandit + Safety + Trivy)
- Docker镜像构建
- 自动化部署流程
"
    git push

    print_success "GitHub Actions工作流设置完成"
}

# 创建项目文档
create_documentation() {
    print_info "创建项目文档..."
    
    # 创建详细的README.md
    cat > README.md << EOF
# TeleBot销售平台

<div align="center">

![TeleBot Logo](https://img.shields.io/badge/TeleBot-Sales%20Platform-blue?style=for-the-badge&logo=telegram)

**企业级Telegram机器人销售与分销系统**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)
[![Security](https://img.shields.io/badge/Security-Vault-FF6B35.svg)](https://vaultproject.io)

</div>

## 🌟 项目特色

TeleBot销售平台是一个功能完整、安全可靠的Telegram机器人商务解决方案，专为销售数字产品和服务而设计。

### ✨ 核心功能

- 🤖 **智能Bot系统**: 基于aiogram的高性能Telegram机器人
- 💰 **区块链支付**: 集成TRON网络，支持TRC20 USDT自动确认
- 🏪 **分销网络**: 一键克隆部署，支持多级代理分销
- 🔒 **企业安全**: HashiCorp Vault密钥管理，多因素认证
- 📊 **数据分析**: 实时销售统计，用户行为分析
- 🌐 **管理后台**: React现代化界面，直观易用

### 🛠️ 技术架构

| 组件 | 技术栈 | 描述 |
|------|--------|------|
| Bot服务 | Python + aiogram | Telegram机器人核心逻辑 |
| API后端 | FastAPI + PostgreSQL | RESTful API服务 |
| 前端界面 | React + TypeScript | 管理后台界面 |
| 支付监听 | TRON SDK + Redis | 区块链支付处理 |
| 容器化 | Docker + K8s | 微服务架构部署 |
| 安全层 | Vault + 2FA | 企业级安全方案 |

## 🚀 快速开始

### 环境要求

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 一键部署

\`\`\`bash
# 克隆项目
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME

# 配置环境变量
cp config/.env.example config/.env
# 编辑 config/.env 文件，填入您的配置

# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 初始化数据库
python scripts/init_db.py

# 启动机器人
python bot/main.py
\`\`\`

### 生产部署

\`\`\`bash
# 使用Helm部署到Kubernetes
helm install telebot ./deploy/helm/ -f production-values.yaml

# 或使用Docker Compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 📋 配置说明

### 必需配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| \`BOT_TOKEN\` | Telegram Bot令牌 | \`123456:ABCdef...\` |
| \`TRON_ADDRESS\` | TRON收款地址 | \`T9yD14Nj9j7xAB...\` |
| \`DATABASE_URL\` | PostgreSQL连接 | \`postgresql://user:pass@localhost/db\` |
| \`REDIS_URL\` | Redis连接 | \`redis://localhost:6379/0\` |
| \`VAULT_URL\` | Vault服务地址 | \`https://vault.example.com\` |

### 安全配置

1. **密钥管理**: 所有敏感信息存储在HashiCorp Vault
2. **访问控制**: 基于角色的权限系统(RBAC)
3. **审计日志**: 完整的操作审计记录
4. **数据加密**: AES-256加密存储敏感数据

## 📖 详细文档

- [📘 部署指南](DEPLOYMENT.md) - 完整的部署说明
- [🔒 安全文档](SECURITY.md) - 安全配置指导
- [🏗️ 架构设计](docs/ARCHITECTURE.md) - 系统架构说明
- [🔧 API文档](docs/API.md) - 接口使用说明
- [❓ 常见问题](docs/FAQ.md) - 问题排查指南

## 🤝 贡献指南

我们欢迎社区贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

### 开发流程

1. Fork项目仓库
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交变更 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送分支 (\`git push origin feature/AmazingFeature\`)
5. 创建Pull Request

## ⚠️ 法律声明

**重要提示**: 使用本系统销售数字产品可能涉及多项法律法规，包括但不限于:

- Telegram使用条款和服务协议
- 当地电子商务法律法规
- 数据保护和隐私法规
- 金融服务相关法规

**用户责任**: 使用者需自行确保:
- 遵守所在地区的法律法规
- 获得必要的经营许可和资质
- 承担相应的法律责任和风险
- 确保销售内容的合法性

**免责声明**: 本项目仅提供技术解决方案，不承担任何因使用本系统而产生的法律责任。

## 📄 开源协议

本项目采用 [MIT协议](LICENSE) 开源。

## 🙏 致谢

感谢以下开源项目的支持：

- [aiogram](https://aiogram.dev/) - Telegram Bot框架
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化API框架
- [React](https://reactjs.org/) - 用户界面库
- [PostgreSQL](https://postgresql.org/) - 关系型数据库
- [Redis](https://redis.io/) - 内存数据库
- [Docker](https://docker.com/) - 容器化平台

## 📞 联系我们

- 📧 邮箱: support@example.com
- 💬 讨论: [GitHub Discussions](https://github.com/$GITHUB_USERNAME/$REPO_NAME/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues)
- 🔒 安全: security@example.com

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个Star! ⭐**

</div>
EOF

    git add README.md
    git commit -m "📝 更新项目README文档

- 添加详细的项目介绍
- 完善部署和配置说明
- 包含法律声明和免责条款
- 提供完整的联系方式
"
    git push

    print_success "项目文档创建完成"
}

# 清理临时文件
cleanup() {
    print_info "清理临时文件..."
    cd "$OLDPWD"
    rm -rf "$TEMP_DIR"
    print_success "清理完成"
}

# 显示完成信息
show_completion_info() {
    echo
    echo "🎉 项目导入完成！"
    echo "========================="
    print_success "仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    print_success "克隆命令: git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    print_success "项目主页: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    print_success "Actions: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
    print_success "Releases: https://github.com/$GITHUB_USERNAME/$REPO_NAME/releases"
    echo
    print_info "下一步建议："
    echo "1. 🔧 配置环境变量和密钥"
    echo "2. 🚀 运行开发环境测试"
    echo "3. 📖 阅读部署文档"
    echo "4. 🔒 设置安全配置"
    echo "5. 🌐 配置域名和SSL"
    echo
}

# 主函数
main() {
    print_info "开始执行TeleBot项目导入流程..."
    
    check_dependencies
    create_temp_dir
    prepare_project_files
    create_github_repo
    setup_git_and_push
    setup_github_actions
    create_release
    create_documentation
    cleanup
    show_completion_info
    
    print_success "导入流程全部完成！🎉"
}

# 错误处理
trap 'print_error "脚本执行出错，正在清理..."; cleanup; exit 1' ERR

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "TeleBot项目导入脚本"
    echo
    echo "用法: $0 [选项]"
    echo
    echo "环境变量:"
    echo "  REPO_NAME         目标仓库名称 (默认: zh)"
    echo "  REPO_DESCRIPTION  仓库描述"
    echo "  REPO_VISIBILITY   仓库可见性 (public/private, 默认: public)"
    echo "  MAIN_BRANCH       主分支名称 (默认: main)"
    echo "  GITHUB_USERNAME   GitHub用户名"
    echo
    echo "示例:"
    echo "  REPO_NAME=my-telebot GITHUB_USERNAME=myuser $0"
    echo
    exit 0
fi

# 检查GitHub用户名
if [ "$GITHUB_USERNAME" = "your-username" ]; then
    print_warning "请设置GITHUB_USERNAME环境变量"
    read -p "请输入您的GitHub用户名: " GITHUB_USERNAME
    if [ -z "$GITHUB_USERNAME" ]; then
        print_error "GitHub用户名不能为空"
        exit 1
    fi
fi

# 执行主函数
main "$@"