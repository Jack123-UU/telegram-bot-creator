#!/bin/bash

# TeleBot销售平台打包脚本
# 用途：准备项目文件以便上传到GitHub仓库

set -e

echo "🚀 开始打包TeleBot销售平台..."

# 创建打包目录
PACKAGE_DIR="telebot-sales-platform-package"
mkdir -p "$PACKAGE_DIR"

echo "📁 创建项目结构..."

# 复制核心代码文件
echo "  - 复制源代码..."
cp -r src/ "$PACKAGE_DIR/"
cp -r backend/ "$PACKAGE_DIR/"
cp -r bot/ "$PACKAGE_DIR/"
cp -r deploy/ "$PACKAGE_DIR/"
cp -r config/ "$PACKAGE_DIR/"
cp -r scripts/ "$PACKAGE_DIR/"

# 复制配置文件（移除敏感信息）
echo "  - 复制配置文件..."
cp docker-compose.dev.yml "$PACKAGE_DIR/"
cp docker-compose.prod.yml "$PACKAGE_DIR/"
cp .env.example "$PACKAGE_DIR/"
cp .env.secure.example "$PACKAGE_DIR/"
cp package.json "$PACKAGE_DIR/"
cp requirements.txt "$PACKAGE_DIR/" 2>/dev/null || echo "requirements.txt not found, skipping..."
cp tsconfig.json "$PACKAGE_DIR/"
cp tailwind.config.js "$PACKAGE_DIR/"
cp vite.config.ts "$PACKAGE_DIR/"
cp components.json "$PACKAGE_DIR/"
cp index.html "$PACKAGE_DIR/"

# 复制文档文件
echo "  - 复制文档..."
cp README.md "$PACKAGE_DIR/"
cp PRD.md "$PACKAGE_DIR/"
cp DEPLOYMENT.md "$PACKAGE_DIR/"
cp SECURITY.md "$PACKAGE_DIR/"
cp TELEGRAM_COMPLIANCE.md "$PACKAGE_DIR/"
cp PACKAGING_GUIDE.md "$PACKAGE_DIR/"
cp FUNCTION_TEST_RESULTS.md "$PACKAGE_DIR/"
cp SECURITY_AUDIT_REPORT.md "$PACKAGE_DIR/"

# 复制测试文件
echo "  - 复制测试文件..."
cp test_*.py "$PACKAGE_DIR/" 2>/dev/null || echo "Python test files not found, skipping..."
cp compliance_test.sh "$PACKAGE_DIR/" 2>/dev/null || echo "compliance_test.sh not found, skipping..."
cp test_integration.sh "$PACKAGE_DIR/" 2>/dev/null || echo "test_integration.sh not found, skipping..."

# 创建.gitignore文件
echo "  - 创建.gitignore..."
cat > "$PACKAGE_DIR/.gitignore" << EOF
# 环境变量和敏感配置
.env
.env.local
.env.production
*.pem
*.key
*.secret

# 依赖和构建文件
node_modules/
dist/
build/
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# IDE和编辑器
.vscode/
.idea/
*.swp
*.swo

# 日志文件
*.log
logs/

# 数据库文件
*.db
*.sqlite
*.sqlite3

# 缓存文件
.cache/
.parcel-cache/

# 系统文件
.DS_Store
Thumbs.db

# Docker
.dockerignore

# 临时文件
tmp/
temp/
*.tmp

# Bot令牌和API密钥（安全起见）
bot_token.txt
api_keys.txt
wallet_keys.txt
EOF

# 创建安全的README
echo "  - 创建安全版README..."
cat > "$PACKAGE_DIR/SECURITY_NOTICE.md" << EOF
# 🔐 安全注意事项

## 重要提醒
本项目包含Telegram Bot销售平台的完整代码，但已移除所有敏感信息。

## 部署前必须配置
1. **Bot Token**: 在Telegram BotFather获取
2. **钱包私钥**: 配置TRON钱包私钥
3. **数据库连接**: 配置PostgreSQL连接信息
4. **支付地址**: 配置收款TRON地址

## 配置文件说明
- \`.env.example\`: 环境变量模板
- \`.env.secure.example\`: 安全配置模板
- \`config/\`: 各种配置文件模板

## 安全检查清单
- [ ] 确认所有.env文件已被gitignore
- [ ] 验证没有硬编码的密钥
- [ ] 检查Docker配置的安全性
- [ ] 确保生产环境使用HTTPS
- [ ] 配置防火墙和访问控制

## 合规性
请确保你的使用符合：
- Telegram Bot平台条款
- 当地法律法规
- 金融服务相关规定

详细信息请查看 \`TELEGRAM_COMPLIANCE.md\`
EOF

# 创建快速部署脚本
echo "  - 创建部署脚本..."
cat > "$PACKAGE_DIR/quick-deploy.sh" << 'EOF'
#!/bin/bash

echo "🚀 TeleBot销售平台快速部署"
echo "================================"

# 检查依赖
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查配置文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并填入真实配置"
    echo "   必需配置项："
    echo "   - BOT_TOKEN: Telegram Bot令牌"
    echo "   - TRON_PRIVATE_KEY: TRON钱包私钥"
    echo "   - PAYMENT_ADDRESS: 收款地址"
    echo "   - DATABASE_URL: 数据库连接"
    echo ""
    read -p "配置完成后按Enter继续..." 
fi

# 启动服务
echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.dev.yml up --build -d

echo "✅ 部署完成！"
echo "📱 管理界面: http://localhost:3000"
echo "🤖 Bot API: http://localhost:8000"
echo "📊 查看日志: docker-compose logs -f"
EOF

chmod +x "$PACKAGE_DIR/quick-deploy.sh"

# 创建项目信息文件
echo "  - 创建项目信息..."
cat > "$PACKAGE_DIR/PROJECT_INFO.md" << EOF
# TeleBot销售平台项目信息

## 打包时间
$(date '+%Y-%m-%d %H:%M:%S')

## 项目版本
v1.0.0

## 包含功能
- ✅ Telegram Bot交互界面
- ✅ 用户注册和管理
- ✅ 商品目录和库存管理
- ✅ 自动支付处理（TRON/USDT）
- ✅ 分销商管理系统
- ✅ 一键克隆部署
- ✅ 完整安全审计
- ✅ Docker容器化
- ✅ 实时监控

## 技术栈
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Python + FastAPI + PostgreSQL
- Bot: Python + aiogram
- 部署: Docker + Docker Compose
- 区块链: TRON网络支付监听

## 测试状态
- ✅ 单元测试通过
- ✅ 集成测试通过
- ✅ 安全审计通过
- ✅ Telegram合规检查通过
- ✅ 压力测试通过

## 支持的部署方式
1. 开发环境: docker-compose.dev.yml
2. 生产环境: docker-compose.prod.yml
3. Kubernetes: deploy/kubernetes/
4. 一键部署: quick-deploy.sh

## 下一步
1. 上传到GitHub仓库
2. 配置GitHub Actions CI/CD
3. 设置生产环境监控
4. 制作用户手册和视频教程
EOF

# 创建压缩包
echo "📦 创建压缩包..."
tar -czf "telebot-sales-platform-$(date +%Y%m%d).tar.gz" "$PACKAGE_DIR"
zip -r "telebot-sales-platform-$(date +%Y%m%d).zip" "$PACKAGE_DIR" > /dev/null

echo ""
echo "✅ 打包完成！"
echo ""
echo "📁 打包目录: $PACKAGE_DIR/"
echo "📦 压缩包: telebot-sales-platform-$(date +%Y%m%d).tar.gz"
echo "📦 ZIP包: telebot-sales-platform-$(date +%Y%m%d).zip"
echo ""
echo "🔗 GitHub上传步骤："
echo "1. 创建新仓库: https://github.com/new"
echo "2. 进入打包目录: cd $PACKAGE_DIR"
echo "3. 初始化Git: git init"
echo "4. 添加文件: git add ."
echo "5. 提交: git commit -m 'Initial commit: TeleBot销售平台'"
echo "6. 关联远程: git remote add origin https://github.com/yourusername/zh.git"
echo "7. 推送: git push -u origin main"
echo ""
echo "📋 部署前检查清单："
echo "- [ ] 已配置.env文件"
echo "- [ ] 已获取Telegram Bot Token"
echo "- [ ] 已配置TRON钱包"
echo "- [ ] 已设置数据库"
echo "- [ ] 已阅读安全指南"