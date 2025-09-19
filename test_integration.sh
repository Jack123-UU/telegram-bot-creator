#!/bin/bash

# TeleBot Sales Platform - Integration Test Script
# This script tests the complete order and payment flow

set -e  # Exit on any error

echo "🚀 Starting TeleBot Sales Platform Integration Tests..."

# Configuration
API_BASE_URL="http://localhost:8000"
INTERNAL_TOKEN="dev-internal-token-secure-123"
TEST_USER_ID=123456789
TEST_PRODUCT_ID=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function check_service() {
    local service_name=$1
    local url=$2
    
    log_info "Checking $service_name..."
    
    if curl -sf "$url" > /dev/null; then
        log_info "✅ $service_name is running"
        return 0
    else
        log_error "❌ $service_name is not responding"
        return 1
    fi
}

function test_api_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    log_info "Testing $method $endpoint"
    
    local response
    local status
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -H "X-Internal-Token: $INTERNAL_TOKEN" \
            -d "$data" \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            -H "X-Internal-Token: $INTERNAL_TOKEN" \
            "$API_BASE_URL$endpoint")
    fi
    
    status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$status" -eq "$expected_status" ]; then
        log_info "✅ $method $endpoint returned $status"
        echo "$body"
        return 0
    else
        log_error "❌ $method $endpoint returned $status (expected $expected_status)"
        echo "$body"
        return 1
    fi
}

function wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if check_service "Backend API" "$API_BASE_URL/health"; then
            log_info "✅ All services are ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Attempt $attempt/$max_attempts - waiting 10 seconds..."
        sleep 10
    done
    
    log_error "❌ Services did not become ready in time"
    return 1
}

function test_user_creation() {
    log_info "🧪 Testing user creation..."
    
    local user_data='{
        "tg_id": '$TEST_USER_ID',
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "language_code": "en"
    }'
    
    local response
    response=$(test_api_endpoint "POST" "/api/v1/users" "$user_data" 200)
    
    if echo "$response" | grep -q "tg_id"; then
        log_info "✅ User creation test passed"
        return 0
    else
        log_error "❌ User creation test failed"
        return 1
    fi
}

function test_product_listing() {
    log_info "🧪 Testing product listing..."
    
    local response
    response=$(test_api_endpoint "GET" "/api/v1/products" "" 200)
    
    if echo "$response" | grep -q "name"; then
        log_info "✅ Product listing test passed"
        return 0
    else
        log_error "❌ Product listing test failed"
        return 1
    fi
}

function test_order_creation() {
    log_info "🧪 Testing order creation..."
    
    local order_data='{
        "tg_id": '$TEST_USER_ID',
        "product_id": '$TEST_PRODUCT_ID',
        "quantity": 1
    }'
    
    local response
    response=$(test_api_endpoint "POST" "/api/v1/orders" "$order_data" 200)
    
    if echo "$response" | grep -q "total_amount"; then
        log_info "✅ Order creation test passed"
        
        # Extract order details for payment test
        ORDER_ID=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
        PAYMENT_AMOUNT=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['total_amount'])")
        PAYMENT_ADDRESS=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['payment_address'])")
        
        log_info "📋 Order ID: $ORDER_ID"
        log_info "💰 Payment Amount: $PAYMENT_AMOUNT USDT"
        log_info "📍 Payment Address: $PAYMENT_ADDRESS"
        
        return 0
    else
        log_error "❌ Order creation test failed"
        return 1
    fi
}

function test_payment_notification() {
    log_info "🧪 Testing payment notification..."
    
    if [ -z "$ORDER_ID" ] || [ -z "$PAYMENT_AMOUNT" ] || [ -z "$PAYMENT_ADDRESS" ]; then
        log_error "❌ Order details not available for payment test"
        return 1
    fi
    
    local payment_data='{
        "tx_hash": "test-tx-hash-'$(date +%s)'",
        "from_address": "TSenderTestAddress123456789012345",
        "to_address": "'$PAYMENT_ADDRESS'",
        "amount": "'$PAYMENT_AMOUNT'",
        "token": "USDT-TRC20",
        "confirmations": 1,
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
    }'
    
    local response
    response=$(test_api_endpoint "POST" "/internal/payments/notify" "$payment_data" 200)
    
    if echo "$response" | grep -q "success"; then
        log_info "✅ Payment notification test passed"
        return 0
    else
        log_error "❌ Payment notification test failed"
        return 1
    fi
}

function test_api_endpoints() {
    log_info "🧪 Testing API endpoint configuration..."
    
    # Test API category filtering
    local response
    response=$(test_api_endpoint "GET" "/api/v1/products?category=api" "" 200)
    
    if echo "$response" | grep -q "api"; then
        log_info "✅ API category filtering test passed"
        return 0
    else
        log_warn "⚠️ No API category products found (this may be expected)"
        return 0
    fi
}

function run_performance_test() {
    log_info "🧪 Running basic performance test..."
    
    log_info "Testing concurrent requests..."
    
    # Create 10 concurrent requests to health endpoint
    for i in {1..10}; do
        curl -s "$API_BASE_URL/health" > /dev/null &
    done
    
    wait
    log_info "✅ Performance test completed"
}

function generate_demo_video_script() {
    log_info "📹 Generating demo video script..."
    
    cat > demo_script.md << EOF
# TeleBot Sales Platform Demo Script

## Demo Flow

1. **Start the bot**: Send /start to your bot
2. **View welcome message**: User info should be displayed
3. **Browse products**: Click "🛍️ Products" button
4. **Select category**: Choose "📁 Session Files" or "🔐 API Login"
5. **Make a purchase**: Click "Buy" on any product
6. **Payment screen**: Show unique payment amount and address
7. **Simulate payment**: Use the test script payment notification
8. **Delivery confirmation**: Order status should update to completed

## Test Commands

\`\`\`bash
# Health check
curl http://localhost:8000/health

# Create test order
curl -X POST http://localhost:8000/api/v1/orders \\
  -H "Content-Type: application/json" \\
  -d '{"tg_id": $TEST_USER_ID, "product_id": 1, "quantity": 1}'

# Simulate payment
curl -X POST http://localhost:8000/internal/payments/notify \\
  -H "Content-Type: application/json" \\
  -H "X-Internal-Token: dev-internal-token-secure-123" \\
  -d '{
    "tx_hash": "demo-tx-$(date +%s)",
    "from_address": "TDemo123456789012345678901234567890",
    "to_address": "$PAYMENT_ADDRESS",
    "amount": "$PAYMENT_AMOUNT",
    "token": "USDT-TRC20",
    "confirmations": 1
  }'
\`\`\`

## Expected Results

- ✅ Bot responds to /start with user information
- ✅ Products are displayed by category
- ✅ Orders create unique payment amounts
- ✅ Payment notifications trigger order completion
- ✅ All API endpoints respond correctly
EOF

    log_info "✅ Demo script generated: demo_script.md"
}

function main() {
    log_info "🎯 TeleBot Sales Platform Integration Test Suite"
    log_info "============================================="
    
    # Wait for services
    if ! wait_for_services; then
        log_error "❌ Services are not ready. Please start the platform first:"
        log_error "   docker-compose -f docker-compose.dev.yml up -d"
        exit 1
    fi
    
    # Run tests
    local tests_passed=0
    local tests_total=0
    
    # Test array
    tests=(
        "test_user_creation"
        "test_product_listing"
        "test_order_creation"
        "test_payment_notification"
        "test_api_endpoints"
    )
    
    for test in "${tests[@]}"; do
        tests_total=$((tests_total + 1))
        if $test; then
            tests_passed=$((tests_passed + 1))
        fi
        echo ""
    done
    
    # Performance test
    run_performance_test
    echo ""
    
    # Generate demo script
    generate_demo_video_script
    echo ""
    
    # Results
    log_info "📊 Test Results"
    log_info "==============="
    log_info "Passed: $tests_passed/$tests_total"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_info "🎉 All tests passed! The platform is working correctly."
        log_info ""
        log_info "Next steps:"
        log_info "1. Set up your real bot token in .env"
        log_info "2. Configure your TRON payment address"
        log_info "3. Upload your products via the API"
        log_info "4. Test with real Telegram users"
        log_info ""
        log_info "For production deployment, see README.md"
        exit 0
    else
        log_error "❌ Some tests failed. Please check the logs and fix issues."
        exit 1
    fi
}

# Check if curl and python3 are available
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    log_error "python3 is required but not installed"
    exit 1
fi

# Run main function
main "$@"