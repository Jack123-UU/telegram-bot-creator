#!/bin/bash

# 能量兑换机器人启动脚本
# Usage: ./start_energy_bot.sh [production|development]

set -e

# 默认环境
ENVIRONMENT=${1:-development}

echo "🚀 启动能量兑换机器人..."
echo "📦 环境: $ENVIRONMENT"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -r requirements.txt

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，从示例复制..."
    cp .env.example .env
    echo "❗ 请编辑 .env 文件配置你的 BOT_TOKEN 等参数"
    exit 1
fi

# 加载环境变量
set -o allexport
source .env
set +o allexport

# 检查必要的环境变量
if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "your-bot-token-here" ]; then
    echo "❌ 请在 .env 文件中配置有效的 BOT_TOKEN"
    exit 1
fi

# 生产环境额外检查
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$PAYMENT_ADDRESS" ] || [ "$PAYMENT_ADDRESS" = "your-tron-address" ]; then
        echo "❌ 生产环境必须配置有效的 PAYMENT_ADDRESS"
        exit 1
    fi
    
    if [ -z "$CUSTOMER_SERVICE_ID" ] || [ "$CUSTOMER_SERVICE_ID" = "@your_support_bot" ]; then
        echo "❌ 生产环境必须配置有效的 CUSTOMER_SERVICE_ID"
        exit 1
    fi
fi

# 测试功能
echo "🧪 运行功能测试..."
python test_bot.py

if [ $? -ne 0 ]; then
    echo "❌ 功能测试失败，请检查配置"
    exit 1
fi

echo "✅ 功能测试通过"

# 启动机器人
echo "🤖 启动机器人..."
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔄 生产模式启动..."
    nohup python main.py > bot.log 2>&1 &
    PID=$!
    echo $PID > bot.pid
    echo "✅ 机器人已在后台启动 (PID: $PID)"
    echo "📋 日志文件: bot.log"
    echo "🛑 停止机器人: kill $PID 或 ./stop_energy_bot.sh"
else
    echo "🔧 开发模式启动..."
    python main.py
fi