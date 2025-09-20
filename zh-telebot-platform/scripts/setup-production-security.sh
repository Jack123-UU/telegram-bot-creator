#!/bin/bash

# TeleBot Platform - Production Security Setup Script
# This script helps setup secure environment variables for production deployment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_NAMESPACE="${VAULT_NAMESPACE:-}"
VAULT_MOUNT_PATH="${VAULT_MOUNT_PATH:-secret}"
VAULT_KV_VERSION="${VAULT_KV_VERSION:-v2}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    local deps=("vault" "kubectl" "openssl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            print_error "$dep is not installed. Please install it first."
            exit 1
        fi
    done
    
    print_success "All dependencies are installed"
}

# Function to generate secure random passwords
generate_password() {
    local length="${1:-32}"
    openssl rand -hex "$length"
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Function to check Vault connectivity
check_vault_connection() {
    print_status "Checking Vault connection..."
    
    if ! vault status &> /dev/null; then
        print_error "Cannot connect to Vault at $VAULT_ADDR"
        print_error "Please ensure Vault is running and VAULT_TOKEN is set"
        exit 1
    fi
    
    print_success "Connected to Vault at $VAULT_ADDR"
}

# Function to enable KV secrets engine
setup_vault_kv() {
    print_status "Setting up Vault KV secrets engine..."
    
    # Check if secrets engine already exists
    if vault secrets list | grep -q "secret/"; then
        print_warning "KV secrets engine already exists at secret/"
    else
        vault secrets enable -path=secret kv-v2
        print_success "Enabled KV v2 secrets engine at secret/"
    fi
}

# Function to create Vault policy for TeleBot
create_vault_policy() {
    print_status "Creating Vault policy for TeleBot..."
    
    cat > /tmp/telebot-policy.hcl << 'EOF'
# TeleBot Platform Vault Policy
# Allows read access to telebot secrets

path "secret/data/telebot/*" {
  capabilities = ["read"]
}

path "secret/metadata/telebot/*" {
  capabilities = ["list", "read"]
}

# Allow token renewal
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow token lookup
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF

    vault policy write telebot-policy /tmp/telebot-policy.hcl
    rm /tmp/telebot-policy.hcl
    
    print_success "Created telebot-policy"
}

# Function to setup AppRole authentication
setup_vault_approle() {
    print_status "Setting up Vault AppRole authentication..."
    
    # Enable AppRole auth method
    if ! vault auth list | grep -q "approle/"; then
        vault auth enable approle
        print_success "Enabled AppRole auth method"
    else
        print_warning "AppRole auth method already enabled"
    fi
    
    # Create AppRole for TeleBot
    vault write auth/approle/role/telebot \
        token_policies="telebot-policy" \
        token_ttl=1h \
        token_max_ttl=4h \
        bind_secret_id=true \
        secret_id_ttl=24h
    
    # Get role ID
    local role_id=$(vault read -field=role_id auth/approle/role/telebot/role-id)
    print_success "Created AppRole 'telebot' with Role ID: $role_id"
    
    # Generate secret ID
    local secret_id=$(vault write -field=secret_id -f auth/approle/role/telebot/secret-id)
    print_success "Generated Secret ID (store securely!)"
    
    echo "VAULT_ROLE_ID=$role_id"
    echo "VAULT_SECRET_ID=$secret_id"
}

# Function to generate and store secrets in Vault
setup_telebot_secrets() {
    print_status "Generating and storing TeleBot secrets..."
    
    # Generate secrets
    local bot_token="${BOT_TOKEN:-}"
    local webhook_secret=$(generate_password 32)
    local internal_token=$(generate_password 32)
    local jwt_secret=$(generate_jwt_secret)
    local aes_key=$(generate_password 32)
    local api_key=$(generate_password 32)
    local tron_private_key="${TRON_PRIVATE_KEY:-}"
    local tron_address="${TRON_ADDRESS:-}"
    local payment_webhook_secret=$(generate_password 32)
    
    # Database credentials
    local db_username="${DB_USERNAME:-telebot}"
    local db_password="${DB_PASSWORD:-$(generate_password 24)}"
    local db_host="${DB_HOST:-postgres.telebot-platform.svc.cluster.local}"
    local db_port="${DB_PORT:-5432}"
    local db_name="${DB_NAME:-telebot_sales}"
    
    # Redis credentials
    local redis_password="${REDIS_PASSWORD:-$(generate_password 24)}"
    local redis_host="${REDIS_HOST:-redis.telebot-platform.svc.cluster.local}"
    local redis_port="${REDIS_PORT:-6379}"
    
    # Storage credentials
    local minio_access_key="${MINIO_ACCESS_KEY:-$(generate_password 16)}"
    local minio_secret_key="${MINIO_SECRET_KEY:-$(generate_password 32)}"
    local s3_bucket="${S3_BUCKET:-telebot-files}"
    local s3_region="${S3_REGION:-us-east-1}"
    
    # Monitoring
    local sentry_dsn="${SENTRY_DSN:-}"
    local grafana_api_key="${GRAFANA_API_KEY:-$(generate_password 32)}"
    local alertmanager_webhook="${ALERTMANAGER_WEBHOOK:-}"
    
    # Validate required secrets
    if [[ -z "$bot_token" ]]; then
        print_error "BOT_TOKEN environment variable is required"
        print_error "Get your bot token from @BotFather on Telegram"
        exit 1
    fi
    
    if [[ -z "$tron_private_key" ]] || [[ -z "$tron_address" ]]; then
        print_warning "TRON_PRIVATE_KEY and TRON_ADDRESS not provided"
        print_warning "Payment functionality will be limited"
    fi
    
    # Store secrets in Vault
    print_status "Storing bot secrets..."
    vault kv put secret/telebot/bot \
        token="$bot_token" \
        webhook_secret="$webhook_secret"
    
    print_status "Storing API secrets..."
    vault kv put secret/telebot/api \
        internal_token="$internal_token" \
        jwt_secret="$jwt_secret" \
        api_key="$api_key"
    
    print_status "Storing encryption secrets..."
    vault kv put secret/telebot/encryption \
        aes_key="$aes_key"
    
    if [[ -n "$tron_private_key" ]] && [[ -n "$tron_address" ]]; then
        print_status "Storing payment secrets..."
        vault kv put secret/telebot/payment \
            tron_private_key="$tron_private_key" \
            tron_address="$tron_address" \
            webhook_secret="$payment_webhook_secret"
    fi
    
    print_status "Storing database secrets..."
    vault kv put secret/telebot/database \
        username="$db_username" \
        password="$db_password" \
        host="$db_host" \
        port="$db_port" \
        database="$db_name"
    
    print_status "Storing Redis secrets..."
    vault kv put secret/telebot/redis \
        password="$redis_password" \
        host="$redis_host" \
        port="$redis_port"
    
    print_status "Storing storage secrets..."
    vault kv put secret/telebot/storage \
        access_key="$minio_access_key" \
        secret_key="$minio_secret_key" \
        bucket_name="$s3_bucket" \
        region="$s3_region"
    
    if [[ -n "$sentry_dsn" ]]; then
        print_status "Storing monitoring secrets..."
        vault kv put secret/telebot/monitoring \
            sentry_dsn="$sentry_dsn" \
            grafana_api_key="$grafana_api_key" \
            alertmanager_webhook="$alertmanager_webhook"
    fi
    
    print_success "All secrets stored in Vault"
}

# Function to create Kubernetes namespace
create_k8s_namespace() {
    print_status "Creating Kubernetes namespace..."
    
    kubectl create namespace telebot-platform --dry-run=client -o yaml | kubectl apply -f -
    print_success "Created/updated telebot-platform namespace"
}

# Function to deploy External Secrets Operator
deploy_external_secrets() {
    print_status "Deploying External Secrets configuration..."
    
    # Check if External Secrets Operator is installed
    if ! kubectl get crd externalsecrets.external-secrets.io &> /dev/null; then
        print_warning "External Secrets Operator not found"
        print_warning "Please install it first: https://external-secrets.io/latest/introduction/getting-started/"
        return 1
    fi
    
    # Apply External Secrets configuration
    kubectl apply -f config/external-secrets.yaml -n telebot-platform
    print_success "Applied External Secrets configuration"
}

# Function to generate production environment file
generate_production_env() {
    print_status "Generating production environment template..."
    
    cat > .env.production << EOF
# TeleBot Platform - Production Environment Configuration
# 🚨 DO NOT COMMIT THIS FILE TO VERSION CONTROL 🚨

# Environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
ENABLE_DOCS=false

# Security
ALLOWED_ORIGINS=https://telebot.yourdomain.com,https://admin.yourdomain.com
RATE_LIMIT_PER_MINUTE=100
CORS_ENABLED=true

# Health Checks
HEALTH_CHECK_INTERVAL=30
METRICS_ENABLED=true

# File Upload
MAX_UPLOAD_SIZE=104857600  # 100MB
UPLOAD_PATH=/app/uploads

# Session Configuration
SESSION_TIMEOUT=900  # 15 minutes
MAX_SESSIONS_PER_USER=3

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY=1
EXPONENTIAL_BACKOFF=true

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
FAILURE_THRESHOLD=5
RECOVERY_TIMEOUT=60

# Cache Configuration
CACHE_TTL=3600  # 1 hour
CACHE_MAX_SIZE=1000

# Payment Configuration
PAYMENT_CONFIRMATION_BLOCKS=3
PAYMENT_TIMEOUT_MINUTES=15
UNIQUE_AMOUNT_DECIMALS=6

# Notification Configuration
EMAIL_NOTIFICATIONS=true
TELEGRAM_NOTIFICATIONS=true
WEBHOOK_NOTIFICATIONS=true

# Audit Configuration
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=daily
BACKUP_RETENTION_DAYS=30

# Compliance
GDPR_COMPLIANCE=true
DATA_RETENTION_DAYS=2555  # 7 years
ANONYMOUS_ANALYTICS=true

# Performance
WORKER_PROCESSES=4
MAX_CONNECTIONS=1000
REQUEST_TIMEOUT=30
KEEP_ALIVE_TIMEOUT=5

# Monitoring
METRICS_PORT=9090
HEALTH_PORT=8080

EOF

    print_success "Generated .env.production template"
    print_warning "Please review and customize .env.production for your environment"
}

# Function to validate secrets
validate_secrets() {
    print_status "Validating stored secrets..."
    
    local paths=(
        "secret/telebot/bot"
        "secret/telebot/api"
        "secret/telebot/encryption"
        "secret/telebot/database"
        "secret/telebot/redis"
        "secret/telebot/storage"
    )
    
    for path in "${paths[@]}"; do
        if vault kv get "$path" &> /dev/null; then
            print_success "✓ $path"
        else
            print_error "✗ $path"
        fi
    done
}

# Function to show next steps
show_next_steps() {
    print_status "Setup completed! Next steps:"
    echo ""
    echo "1. Install External Secrets Operator if not already installed:"
    echo "   helm repo add external-secrets https://charts.external-secrets.io"
    echo "   helm install external-secrets external-secrets/external-secrets -n external-secrets-system --create-namespace"
    echo ""
    echo "2. Create Vault authentication secret in Kubernetes:"
    echo "   kubectl create secret generic vault-auth-secret \\"
    echo "     --from-literal=vault-role-id='$VAULT_ROLE_ID' \\"
    echo "     --from-literal=vault-secret-id='$VAULT_SECRET_ID' \\"
    echo "     -n telebot-platform"
    echo ""
    echo "3. Apply the External Secrets configuration:"
    echo "   kubectl apply -f config/external-secrets.yaml"
    echo ""
    echo "4. Deploy the TeleBot application:"
    echo "   helm install telebot ./deploy/helm/telebot -n telebot-platform"
    echo ""
    echo "5. Monitor secret synchronization:"
    echo "   kubectl get externalsecrets -n telebot-platform"
    echo "   kubectl get secrets -n telebot-platform"
    echo ""
    print_warning "Remember to:"
    print_warning "- Regularly rotate secrets"
    print_warning "- Monitor Vault audit logs"
    print_warning "- Backup Vault data"
    print_warning "- Test disaster recovery procedures"
}

# Main function
main() {
    echo "🔐 TeleBot Platform - Production Security Setup"
    echo "=============================================="
    echo ""
    
    # Check if running with required environment variables
    if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
        echo "Usage: $0 [options]"
        echo ""
        echo "Required environment variables:"
        echo "  BOT_TOKEN              - Telegram bot token from @BotFather"
        echo "  TRON_PRIVATE_KEY       - TRON wallet private key (optional)"
        echo "  TRON_ADDRESS           - TRON wallet address (optional)"
        echo ""
        echo "Optional environment variables:"
        echo "  VAULT_ADDR             - Vault server address (default: http://localhost:8200)"
        echo "  DB_USERNAME            - Database username (default: telebot)"
        echo "  DB_PASSWORD            - Database password (auto-generated)"
        echo "  SENTRY_DSN             - Sentry error tracking DSN"
        echo ""
        echo "Examples:"
        echo "  BOT_TOKEN='your_bot_token' $0"
        echo "  BOT_TOKEN='your_bot_token' TRON_PRIVATE_KEY='your_key' TRON_ADDRESS='your_address' $0"
        exit 0
    fi
    
    check_dependencies
    check_vault_connection
    setup_vault_kv
    create_vault_policy
    setup_vault_approle
    setup_telebot_secrets
    create_k8s_namespace
    generate_production_env
    validate_secrets
    
    echo ""
    print_success "🎉 Production security setup completed successfully!"
    echo ""
    show_next_steps
}

# Run main function
main "$@"