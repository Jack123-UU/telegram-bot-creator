#!/bin/bash
# GitHub仓库导入脚本 - zh-telebot-platform
# 一键将项目推送到GitHub仓库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 TeleBot销售平台 - GitHub仓库导入助手${NC}"
echo "=================================================="

# 检查当前目录
if [ ! -f "ZH_REPO_README.md" ]; then
    echo -e "${RED}❌ 错误: 请在zh-telebot-platform-export目录中运行此脚本${NC}"
    exit 1
fi

# 获取用户输入
echo -e "${YELLOW}请输入你的GitHub用户名:${NC}"
read -p "GitHub用户名: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub用户名不能为空${NC}"
    exit 1
fi

REPO_NAME="zh-telebot-platform"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo -e "${BLUE}📋 仓库信息:${NC}"
echo "  用户名: $GITHUB_USERNAME"
echo "  仓库名: $REPO_NAME"
echo "  仓库URL: $REPO_URL"
echo ""

# 确认继续
echo -e "${YELLOW}请确认:${NC}"
echo "1. 你已在GitHub上创建了名为 '$REPO_NAME' 的仓库"
echo "2. 你有推送到该仓库的权限"
echo ""
read -p "继续? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

echo -e "${BLUE}🔧 开始Git操作...${NC}"

# 初始化Git仓库
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
else
    echo "Git仓库已存在"
fi

# 添加所有文件
echo "添加文件到Git..."
git add .

# 检查是否有更改需要提交
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  没有文件需要提交${NC}"
else
    # 提交更改
    echo "提交更改..."
    git commit -m "🎉 Initial commit: Complete TeleBot Sales Platform

🌟 项目特性:
- 🤖 Telegram机器人 (aiogram框架)
- 💰 TRON区块链支付集成
- 🛡️ 企业级安全架构 (Vault密钥管理)
- 🐳 Docker容器化部署
- 🔄 分销商一键克隆系统
- 📊 React管理后台
- 🌍 多语言支持 (中文/英文)
- 📱 移动API接码集成
- 📈 实时监控和分析
- 🔐 2FA认证和审计日志

🛠️ 技术栈:
- 前端: React + TypeScript + Tailwind CSS
- 后端: Python + FastAPI + PostgreSQL + Redis
- 机器人: Python + aiogram
- 区块链: TRON + USDT-TRC20
- 安全: HashiCorp Vault + 2FA
- 部署: Docker + Kubernetes + GitHub Actions

📦 部署选项:
- Docker Compose (快速部署)
- Kubernetes + Helm (企业级)
- 分销商一键克隆

🚀 快速开始:
1. 复制 config/env.example 到 config/.env
2. 设置你的配置 (Bot Token, TRON钱包等)
3. 运行: docker-compose -f docker-compose.dev.yml up -d
4. 访问: http://localhost:3000

⚠️  免责声明: 
请确保遵守Telegram服务条款和当地法律法规。
账号交易可能涉及法律风险，使用者需自行承担责任。

📚 查看完整文档: ZH_REPO_README.md"
fi

# 设置分支
echo "设置主分支..."
git branch -M main

# 添加远程仓库
echo "添加远程仓库..."
if git remote get-url origin >/dev/null 2>&1; then
    echo "远程仓库已存在，更新URL..."
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

# 推送到GitHub
echo -e "${BLUE}📤 推送到GitHub...${NC}"
echo "推送到: $REPO_URL"

if git push -u origin main; then
    echo -e "${GREEN}✅ 成功推送到GitHub!${NC}"
else
    echo -e "${RED}❌ 推送失败${NC}"
    echo -e "${YELLOW}可能的原因:${NC}"
    echo "1. 仓库不存在或无权限访问"
    echo "2. 需要配置Git认证 (GitHub Token或SSH密钥)"
    echo "3. 网络连接问题"
    echo ""
    echo -e "${BLUE}解决方案:${NC}"
    echo "1. 检查仓库是否存在: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. 配置GitHub认证:"
    echo "   - 个人访问Token: https://github.com/settings/tokens"
    echo "   - SSH密钥: https://github.com/settings/keys"
    echo "3. 手动推送:"
    echo "   git push -u origin main"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 项目已成功导入GitHub仓库!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📋 接下来的步骤:${NC}"
echo ""
echo "1. 🔗 访问你的仓库:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "2. ⚙️  配置GitHub Secrets (必需):"
echo "   进入仓库 → Settings → Secrets and variables → Actions"
echo "   添加以下Secrets:"
echo "   - BOT_TOKEN=8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk"
echo "   - TRON_WALLET_ADDRESS=你的TRON钱包地址"
echo "   - TRON_PRIVATE_KEY=你的TRON私钥"
echo "   - DATABASE_URL=数据库连接字符串"
echo "   - REDIS_URL=Redis连接字符串"
echo ""
echo "3. 🚀 启用GitHub Actions:"
echo "   推送完成后会自动触发CI/CD流程"
echo ""
echo "4. 📖 查看部署指南:"
echo "   - 完整README: ZH_REPO_README.md"
echo "   - 快速部署: QUICK_DEPLOYMENT.md"
echo "   - 生产部署: PRODUCTION_DEPLOYMENT.md"
echo ""
echo "5. 🏃‍♂️ 本地开发:"
echo "   cd zh-telebot-platform"
echo "   cp config/env.example config/.env"
echo "   # 编辑 .env 文件设置配置"
echo "   docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "6. 🧪 测试Telegram机器人:"
echo "   在Telegram中搜索你的机器人并发送 /start"
echo ""
echo -e "${YELLOW}⚠️  重要提醒:${NC}"
echo "- 请确保遵守Telegram服务条款"
echo "- 账号交易可能涉及法律风险"
echo "- 生产环境请使用强密钥和启用2FA"
echo "- 定期备份数据和更新依赖"
echo ""
echo -e "${GREEN}✨ 部署成功，祝你使用愉快!${NC}"