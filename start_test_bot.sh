#!/bin/bash

# TeleBot Test Startup Script
# This script safely starts the bot services for testing with the configured token

echo "🤖 TeleBot销售平台 - 安全测试启动"
echo "=================================================="
echo "📅 启动时间: $(date)"
echo "🔑 使用测试Token: 8370071788:AAG***"
echo "=================================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "🔍 检查Docker服务状态..."
if ! docker info &> /dev/null; then
    echo "❌ Docker服务未运行，请启动Docker"
    exit 1
fi

echo "✅ Docker服务正常"

# Navigate to project directory
cd "$(dirname "$0")"

echo ""
echo "🏗️  构建和启动服务..."
echo "=================================================="

# Start the services
docker-compose -f docker-compose.dev.yml up --build -d

echo ""
echo "⏳ 等待服务启动完成..."
sleep 10

echo ""
echo "🔍 检查服务状态..."
echo "=================================================="

# Check service health
services=("postgres" "redis" "vault" "backend" "bot")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.dev.yml ps | grep -q "$service.*Up"; then
        echo "✅ $service: 运行中"
    else
        echo "❌ $service: 未运行"
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo "🎉 所有服务启动成功！"
    echo ""
    echo "📱 测试步骤:"
    echo "1. 在Telegram中搜索你的机器人"
    echo "2. 发送 /start 命令"
    echo "3. 测试菜单功能"
    echo ""
    echo "📊 查看日志:"
    echo "docker-compose -f docker-compose.dev.yml logs -f bot"
    echo ""
    echo "🛑 停止服务:"
    echo "docker-compose -f docker-compose.dev.yml down"
else
    echo "⚠️  某些服务启动失败，请检查日志:"
    echo "docker-compose -f docker-compose.dev.yml logs"
fi

echo ""
echo "=================================================="
echo "✅ 测试环境就绪"
echo "=================================================="