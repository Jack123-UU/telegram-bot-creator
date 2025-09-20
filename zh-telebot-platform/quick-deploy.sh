#!/bin/bash

echo "🚀 TeleBot销售平台快速部署"
echo "================================"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

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
    echo ""
    echo "💡 获取Bot Token: https://t.me/BotFather"
    echo ""
    read -p "配置完成后按Enter继续..."
fi

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data/postgres data/redis logs

# 安装依赖
if [ -f package.json ]; then
    echo "📦 安装依赖..."
    npm install || echo "⚠️ NPM依赖安装失败，将在Docker中处理"
fi

# 启动服务
echo "🐳 启动Docker服务..."
if [ -f docker-compose.dev.yml ]; then
    docker-compose -f docker-compose.dev.yml up -d --build
else
    echo "❌ docker-compose.dev.yml 文件不存在"
    exit 1
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 20

# 检查服务状态
echo "🏥 检查服务状态..."
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址："
    echo "   - 管理后台: http://localhost:3000"
    echo "   - API接口: http://localhost:8000"
    echo "   - API文档: http://localhost:8000/docs"
    echo ""
    echo "📊 常用命令："
    echo "   - 查看日志: docker-compose -f docker-compose.dev.yml logs -f"
    echo "   - 停止服务: docker-compose -f docker-compose.dev.yml down"
    echo "   - 重启服务: docker-compose -f docker-compose.dev.yml restart"
    echo ""
    echo "🤖 测试Bot："
    echo "   1. 在Telegram中搜索你的Bot"
    echo "   2. 发送 /start 命令"
    echo "   3. 开始体验完整功能"
else
    echo "❌ 服务启动失败，查看日志："
    docker-compose -f docker-compose.dev.yml logs
fi
