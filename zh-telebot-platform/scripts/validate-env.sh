#!/bin/bash

# TeleBot Platform - Environment Variables Validation Script
# This script validates that all required environment variables are properly configured

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validation results
ERRORS=0
WARNINGS=0
PASSED=0

print_header() {
    echo -e "${BLUE}🔍 TeleBot Platform - Environment Variables Validation${NC}"
    echo "================================================================"
    echo
}

print_section() {
    echo -e "${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a variable is set and not empty
check_required_var() {
    local var_name="$1"
    local description="$2"
    local value="${!var_name:-}"
    
    if [[ -z "$value" ]]; then
        print_error "$var_name is not set - $description"
        return 1
    else
        print_success "$var_name is set"
        return 0
    fi
}

# Function to check if a variable is set (optional)
check_optional_var() {
    local var_name="$1"
    local description="$2"
    local value="${!var_name:-}"
    
    if [[ -z "$value" ]]; then
        print_warning "$var_name is not set - $description (optional)"
        return 1
    else
        print_success "$var_name is set"
        return 0
    fi
}

# Function to validate password strength
validate_password_strength() {
    local var_name="$1"
    local password="${!var_name:-}"
    
    if [[ -z "$password" ]]; then
        return 1
    fi
    
    local length=${#password}
    if [[ $length -lt 32 ]]; then
        print_warning "$var_name is shorter than recommended 32 characters (current: $length)"
        return 1
    fi
    
    if [[ ! "$password" =~ [A-Z] ]]; then
        print_warning "$var_name should contain uppercase letters"
        return 1
    fi
    
    if [[ ! "$password" =~ [a-z] ]]; then
        print_warning "$var_name should contain lowercase letters"
        return 1
    fi
    
    if [[ ! "$password" =~ [0-9] ]]; then
        print_warning "$var_name should contain numbers"
        return 1
    fi
    
    if [[ ! "$password" =~ [^A-Za-z0-9] ]]; then
        print_warning "$var_name should contain special characters"
        return 1
    fi
    
    print_success "$var_name meets password strength requirements"
    return 0
}

# Function to validate URL format
validate_url() {
    local var_name="$1"
    local url="${!var_name:-}"
    
    if [[ -z "$url" ]]; then
        return 1
    fi
    
    if [[ ! "$url" =~ ^https?:// ]]; then
        print_error "$var_name is not a valid URL (must start with http:// or https://)"
        return 1
    fi
    
    print_success "$var_name is a valid URL"
    return 0
}

# Function to validate email format
validate_email() {
    local var_name="$1"
    local email="${!var_name:-}"
    
    if [[ -z "$email" ]]; then
        return 1
    fi
    
    if [[ ! "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        print_error "$var_name is not a valid email address"
        return 1
    fi
    
    print_success "$var_name is a valid email address"
    return 0
}

# Function to validate TRON address
validate_tron_address() {
    local var_name="$1"
    local address="${!var_name:-}"
    
    if [[ -z "$address" ]]; then
        return 1
    fi
    
    if [[ ! "$address" =~ ^T[A-Za-z0-9]{33}$ ]]; then
        print_error "$var_name is not a valid TRON address (must start with T and be 34 characters)"
        return 1
    fi
    
    print_success "$var_name is a valid TRON address"
    return 0
}

# Function to validate numeric values
validate_numeric() {
    local var_name="$1"
    local min_val="$2"
    local max_val="$3"
    local value="${!var_name:-}"
    
    if [[ -z "$value" ]]; then
        return 1
    fi
    
    if ! [[ "$value" =~ ^[0-9]+$ ]]; then
        print_error "$var_name is not a valid number"
        return 1
    fi
    
    if [[ $value -lt $min_val ]] || [[ $value -gt $max_val ]]; then
        print_error "$var_name is out of range ($min_val-$max_val), current: $value"
        return 1
    fi
    
    print_success "$var_name is valid ($value)"
    return 0
}

# Main validation function
main() {
    print_header
    
    # Environment Configuration
    print_section "Environment Configuration"
    check_required_var "ENVIRONMENT" "Deployment environment (production/staging/development)"
    check_required_var "LOG_LEVEL" "Logging level (DEBUG/INFO/WARNING/ERROR)"
    
    if [[ "${ENVIRONMENT:-}" == "production" ]]; then
        if [[ "${DEBUG:-false}" == "true" ]]; then
            print_error "DEBUG should be false in production environment"
        else
            print_success "DEBUG is properly set for production"
        fi
        
        if [[ "${ENABLE_DOCS:-true}" == "true" ]]; then
            print_warning "API documentation is enabled in production (consider disabling)"
        else
            print_success "API documentation is disabled in production"
        fi
    fi
    
    echo
    
    # Vault Configuration
    print_section "Vault Configuration"
    check_required_var "VAULT_ADDR" "Vault server address"
    check_required_var "VAULT_ROLE_ID" "Vault AppRole role ID"
    check_required_var "VAULT_SECRET_ID" "Vault AppRole secret ID"
    
    if check_required_var "VAULT_ADDR" ""; then
        validate_url "VAULT_ADDR"
    fi
    
    echo
    
    # Bot Configuration
    print_section "Telegram Bot Configuration"
    check_required_var "BOT_TOKEN" "Telegram bot token from @BotFather"
    
    if [[ -n "${BOT_TOKEN:-}" ]]; then
        local token_parts=(${BOT_TOKEN//:/ })
        if [[ ${#token_parts[@]} -ne 2 ]]; then
            print_error "BOT_TOKEN format is invalid (should contain one colon)"
        else
            print_success "BOT_TOKEN format is valid"
        fi
    fi
    
    echo
    
    # Database Configuration
    print_section "Database Configuration"
    check_required_var "DATABASE_URL" "PostgreSQL connection string"
    check_required_var "REDIS_URL" "Redis connection string"
    
    # Validate database connection string format
    if [[ -n "${DATABASE_URL:-}" ]]; then
        if [[ "$DATABASE_URL" =~ ^postgresql:// ]] || [[ "$DATABASE_URL" =~ ^postgresql\+asyncpg:// ]]; then
            print_success "DATABASE_URL format is valid"
        else
            print_error "DATABASE_URL should start with postgresql:// or postgresql+asyncpg://"
        fi
    fi
    
    # Validate Redis connection string format
    if [[ -n "${REDIS_URL:-}" ]]; then
        if [[ "$REDIS_URL" =~ ^redis:// ]]; then
            print_success "REDIS_URL format is valid"
        else
            print_error "REDIS_URL should start with redis://"
        fi
    fi
    
    echo
    
    # API Security
    print_section "API Security Configuration"
    check_required_var "INTERNAL_TOKEN" "Internal API authentication token"
    check_required_var "JWT_SECRET_KEY" "JWT signing key"
    check_required_var "AES_KEY" "AES encryption key"
    
    validate_password_strength "INTERNAL_TOKEN"
    validate_password_strength "JWT_SECRET_KEY"
    validate_password_strength "AES_KEY"
    
    echo
    
    # Payment Configuration
    print_section "Payment Configuration (TRON)"
    
    if check_optional_var "TRON_PRIVATE_KEY" "TRON wallet private key"; then
        if [[ ${#TRON_PRIVATE_KEY} -ne 64 ]]; then
            print_error "TRON_PRIVATE_KEY should be 64 characters (32 bytes hex)"
        else
            print_success "TRON_PRIVATE_KEY length is correct"
        fi
    fi
    
    if check_optional_var "TRON_ADDRESS" "TRON wallet address"; then
        validate_tron_address "TRON_ADDRESS"
    fi
    
    echo
    
    # Storage Configuration
    print_section "Storage Configuration"
    check_optional_var "MINIO_ACCESS_KEY" "MinIO/S3 access key"
    check_optional_var "MINIO_SECRET_KEY" "MinIO/S3 secret key"
    check_optional_var "S3_BUCKET" "S3 bucket name"
    
    echo
    
    # Monitoring Configuration
    print_section "Monitoring Configuration"
    check_optional_var "SENTRY_DSN" "Sentry error tracking DSN"
    check_optional_var "GRAFANA_API_KEY" "Grafana API key"
    
    if [[ -n "${SENTRY_DSN:-}" ]]; then
        validate_url "SENTRY_DSN"
    fi
    
    echo
    
    # Email Configuration
    print_section "Email Configuration"
    check_optional_var "SMTP_HOST" "SMTP server hostname"
    check_optional_var "SMTP_USERNAME" "SMTP username"
    check_optional_var "SMTP_PASSWORD" "SMTP password"
    check_optional_var "ADMIN_EMAIL" "Administrator email address"
    
    if [[ -n "${ADMIN_EMAIL:-}" ]]; then
        validate_email "ADMIN_EMAIL"
    fi
    
    echo
    
    # Performance Configuration
    print_section "Performance Configuration"
    check_optional_var "API_PORT" "API server port"
    check_optional_var "WORKER_PROCESSES" "Number of worker processes"
    check_optional_var "DB_POOL_SIZE" "Database connection pool size"
    check_optional_var "REDIS_POOL_SIZE" "Redis connection pool size"
    
    if [[ -n "${API_PORT:-}" ]]; then
        validate_numeric "API_PORT" 1024 65535
    fi
    
    if [[ -n "${WORKER_PROCESSES:-}" ]]; then
        validate_numeric "WORKER_PROCESSES" 1 16
    fi
    
    if [[ -n "${DB_POOL_SIZE:-}" ]]; then
        validate_numeric "DB_POOL_SIZE" 5 100
    fi
    
    if [[ -n "${REDIS_POOL_SIZE:-}" ]]; then
        validate_numeric "REDIS_POOL_SIZE" 5 100
    fi
    
    echo
    
    # Security Configuration
    print_section "Security Configuration"
    check_optional_var "ALLOWED_ORIGINS" "CORS allowed origins"
    check_optional_var "RATE_LIMIT_PER_MINUTE" "API rate limit"
    check_optional_var "SESSION_TIMEOUT" "Session timeout in seconds"
    
    if [[ -n "${RATE_LIMIT_PER_MINUTE:-}" ]]; then
        validate_numeric "RATE_LIMIT_PER_MINUTE" 10 1000
    fi
    
    if [[ -n "${SESSION_TIMEOUT:-}" ]]; then
        validate_numeric "SESSION_TIMEOUT" 300 3600
    fi
    
    echo
    
    # Summary
    print_section "Validation Summary"
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo -e "${RED}❌ Errors: $ERRORS${NC}"
    echo
    
    if [[ $ERRORS -gt 0 ]]; then
        print_error "Validation failed! Please fix the errors above before deploying."
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        print_warning "Validation completed with warnings. Review the warnings above."
        exit 0
    else
        print_success "All validations passed! Your environment is ready for deployment."
        exit 0
    fi
}

# Check if help is requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "TeleBot Platform - Environment Variables Validation"
    echo ""
    echo "This script validates that all required environment variables are properly configured."
    echo ""
    echo "Usage:"
    echo "  $0                 # Validate current environment"
    echo "  $0 --help         # Show this help message"
    echo ""
    echo "Before running this script, ensure your environment variables are loaded:"
    echo "  source .env.production"
    echo "  $0"
    echo ""
    echo "Or validate a specific environment file:"
    echo "  set -a && source .env.production && set +a && $0"
    exit 0
fi

# Run main validation
main