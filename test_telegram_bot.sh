#!/bin/bash

# TeleBot Real Testing Script
# This script demonstrates how to test the bot with the new token in a real Telegram environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bot configuration
BOT_TOKEN="8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk"
BOT_USERNAME="@your_test_bot"  # Replace with actual bot username
WEBHOOK_URL="https://your-domain.com/webhook"  # Replace with your domain

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  TeleBot Real Environment Testing${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

print_status "Docker is running ✅"

# Stop any existing services
print_status "Stopping any existing TeleBot services..."
docker-compose -f docker-compose.test.yml down --remove-orphans

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.test.yml pull

# Build and start services
print_status "Building and starting TeleBot services..."
docker-compose -f docker-compose.test.yml up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("postgres" "redis" "vault" "backend")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.test.yml ps | grep -q "${service}.*Up"; then
        print_status "✅ $service is running"
    else
        print_error "❌ $service is not running"
        docker-compose -f docker-compose.test.yml logs $service
        exit 1
    fi
done

# Test bot token
print_status "Testing bot token..."
response=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")
if echo "$response" | grep -q '"ok":true'; then
    bot_username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    print_status "✅ Bot token is valid! Bot username: @$bot_username"
else
    print_error "❌ Bot token is invalid!"
    echo "Response: $response"
    exit 1
fi

# Set webhook (if WEBHOOK_URL is configured)
if [[ "$WEBHOOK_URL" != "https://your-domain.com/webhook" ]]; then
    print_status "Setting webhook URL..."
    webhook_response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
        -d "url=${WEBHOOK_URL}" \
        -d "allowed_updates=[\"message\",\"callback_query\"]")
    
    if echo "$webhook_response" | grep -q '"ok":true'; then
        print_status "✅ Webhook set successfully"
    else
        print_warning "⚠️  Webhook setting failed (this is okay for local testing)"
        echo "Response: $webhook_response"
    fi
else
    print_warning "⚠️  Webhook URL not configured. Using polling mode for local testing."
fi

# Test API endpoints
print_status "Testing backend API endpoints..."

# Health check
if curl -s -f "http://localhost:8000/health" > /dev/null; then
    print_status "✅ Backend health check passed"
else
    print_error "❌ Backend health check failed"
    docker-compose -f docker-compose.test.yml logs backend
fi

# Test user creation endpoint
user_test_response=$(curl -s -X POST "http://localhost:8000/api/v1/users" \
    -H "Content-Type: application/json" \
    -d '{"tg_id": 123456789, "username": "testuser", "first_name": "Test", "language_code": "en"}')

if echo "$user_test_response" | grep -q '"id"'; then
    print_status "✅ User creation API test passed"
else
    print_warning "⚠️  User creation API test failed (user might already exist)"
fi

# Test products endpoint
if curl -s -f "http://localhost:8000/api/v1/products" > /dev/null; then
    print_status "✅ Products API test passed"
else
    print_error "❌ Products API test failed"
fi

# Display testing instructions
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Manual Testing Instructions${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
print_status "Your TeleBot is now running and ready for testing!"
echo ""
echo -e "${YELLOW}Testing Steps:${NC}"
echo "1. Open Telegram and search for: @$bot_username"
echo "2. Send the /start command to begin testing"
echo "3. Test the following features:"
echo "   • Main menu navigation"
echo "   • Product browsing and filtering"
echo "   • API service selection"
echo "   • Order creation process"
echo "   • User center functionality"
echo "   • Language switching (English)"
echo "   • Compliance information display"
echo ""
echo -e "${YELLOW}Expected Bot Responses:${NC}"
echo "• Welcome message with service menu"
echo "• Professional API integration services"
echo "• Compliance with Telegram ToS"
echo "• No violations of platform rules"
echo ""
echo -e "${YELLOW}Service URLs:${NC}"
echo "• Backend API: http://localhost:8000"
echo "• Admin Panel: http://localhost:3000"
echo "• Vault UI: http://localhost:8200 (token: dev-root-token)"
echo "• Bot Username: @$bot_username"
echo ""
echo -e "${YELLOW}Monitoring Commands:${NC}"
echo "• View logs: docker-compose -f docker-compose.test.yml logs -f"
echo "• Check status: docker-compose -f docker-compose.test.yml ps"
echo "• Stop services: docker-compose -f docker-compose.test.yml down"
echo ""

# Monitor logs in background
print_status "Starting log monitoring (press Ctrl+C to stop)..."
echo ""
trap 'echo -e "\n${YELLOW}Log monitoring stopped. Services are still running.${NC}"; exit 0' INT

# Follow logs for all services
docker-compose -f docker-compose.test.yml logs -f --tail=50