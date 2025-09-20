#!/bin/bash

# Test Bot Startup Script
# This script runs the TeleBot with your test token

echo "🤖 Starting TeleBot Sales Platform with Test Token..."
echo "Bot Token: 8370071788:AAGrc3JKDs-lb_ITqZMAe8ufmQsB_3Qp5cA"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  No .env file found, using default values"
fi

# Check if bot token is set
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ BOT_TOKEN not found in environment"
    exit 1
fi

echo "📋 Configuration:"
echo "  • Bot Token: ${BOT_TOKEN:0:10}..."
echo "  • Environment: ${ENVIRONMENT:-development}"
echo "  • Backend URL: ${API_BASE_URL:-http://localhost:8000}"
echo "  • Redis URL: ${REDIS_URL:-redis://localhost:6379}"
echo ""

# Option 1: Run with Docker Compose (recommended)
echo "🐳 Starting with Docker Compose..."
echo "This will start all services: bot, backend, database, redis, vault"
echo ""

# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Alternative: Run bot directly (if you have Python environment set up)
# echo "🐍 Alternative: Run bot directly with Python"
# echo "cd bot && python main.py"