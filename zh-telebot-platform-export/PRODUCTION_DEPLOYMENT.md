# TeleBot Platform - Production Deployment Guide
# Complete guide for deploying TeleBot Platform securely in production

## 🏗️ Prerequisites

### Required Infrastructure
- Kubernetes cluster (1.21+) with RBAC enabled
- HashiCorp Vault instance (1.8+) for secret management
- PostgreSQL database (13+) with SSL/TLS
- Redis instance (6+) with AUTH and TLS
- Container registry (Docker Hub, ECR, or private registry)
- Load balancer with SSL termination
- Domain with valid SSL certificates

### Required Tools
- `kubectl` (1.21+)
- `helm` (3.6+)
- `vault` CLI (1.8+)
- `docker` (20.10+)
- `git` (2.30+)
- `openssl` (1.1.1+)

## 🔧 Pre-Deployment Setup

### 1. Clone and Prepare Repository
```bash
git clone <repository-url>
cd telebot-platform
```

### 2. Set Up HashiCorp Vault

#### Install Vault (if not already installed)
```bash
# Using Helm
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault \
  --namespace vault-system \
  --create-namespace \
  --set server.dev.enabled=false \
  --set server.ha.enabled=true \
  --set server.ha.replicas=3
```

#### Initialize and Configure Vault
```bash
# Initialize Vault
kubectl exec -n vault-system vault-0 -- vault operator init

# Unseal Vault (repeat for all replicas)
kubectl exec -n vault-system vault-0 -- vault operator unseal <unseal-key-1>
kubectl exec -n vault-system vault-0 -- vault operator unseal <unseal-key-2>
kubectl exec -n vault-system vault-0 -- vault operator unseal <unseal-key-3>

# Export Vault token
export VAULT_TOKEN=<root-token>
export VAULT_ADDR=https://vault.yourdomain.com:8200
```

### 3. Configure Environment Variables

Copy and customize the production environment template:
```bash
cp .env.production.template .env.production
```

Edit `.env.production` with your specific values:
- Domain names
- Database credentials
- API keys and tokens
- SSL certificate paths

### 4. Generate Secrets

#### Get Telegram Bot Token
1. Message @BotFather on Telegram
2. Create a new bot: `/newbot`
3. Follow instructions and save the token
4. Set webhook URL: `/setwebhook` → `https://api.yourdomain.com/webhook/telegram`

#### Generate TRON Wallet
```bash
# Using tronweb or similar tool
# Save both private key and address securely
```

#### Generate Strong Passwords
```bash
# Generate various secrets
openssl rand -hex 32  # For AES keys, internal tokens
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64  # For JWT secrets
```

## 🔐 Security Configuration

### 1. Set Up Production Secrets

Run the security setup script:
```bash
# Set required environment variables
export BOT_TOKEN="your_telegram_bot_token"
export TRON_PRIVATE_KEY="your_tron_private_key"
export TRON_ADDRESS="your_tron_address"
export VAULT_ADDR="https://vault.yourdomain.com:8200"

# Run setup script
./scripts/setup-production-security.sh
```

This script will:
- Configure Vault KV secrets engine
- Create security policies
- Set up AppRole authentication
- Generate and store all required secrets
- Provide role ID and secret ID for Kubernetes

### 2. Configure External Secrets Operator

#### Install External Secrets Operator
```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace
```

#### Create Vault Authentication Secret
```bash
kubectl create secret generic vault-auth-secret \
  --from-literal=vault-role-id='<role-id-from-script>' \
  --from-literal=vault-secret-id='<secret-id-from-script>' \
  --namespace telebot-platform
```

#### Apply External Secrets Configuration
```bash
kubectl apply -f config/external-secrets.yaml
```

### 3. Validate Environment Configuration

```bash
# Load environment variables
source .env.production

# Run validation script
./scripts/validate-env.sh
```

Fix any errors reported by the validation script before proceeding.

## 🚀 Application Deployment

### 1. Build and Push Container Images

```bash
# Build API image
docker build -t your-registry/telebot-api:latest ./backend

# Build Bot image
docker build -t your-registry/telebot-bot:latest ./bot

# Build Payment Monitor image
docker build -t your-registry/telebot-payment-monitor:latest ./payment-monitor

# Push all images
docker push your-registry/telebot-api:latest
docker push your-registry/telebot-bot:latest
docker push your-registry/telebot-payment-monitor:latest
```

### 2. Update Kubernetes Manifests

Edit `deploy/kubernetes/production.yaml` with your:
- Container image URLs
- Domain names
- Resource requirements
- Storage class names

### 3. Deploy Database and Redis

```bash
# Deploy PostgreSQL (example with Bitnami chart)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --namespace telebot-platform \
  --create-namespace \
  --set auth.postgresPassword=<secure-password> \
  --set auth.database=telebot_sales \
  --set primary.persistence.size=100Gi \
  --set primary.resources.requests.memory=1Gi \
  --set primary.resources.requests.cpu=500m

# Deploy Redis
helm install redis bitnami/redis \
  --namespace telebot-platform \
  --set auth.password=<secure-password> \
  --set master.persistence.size=20Gi \
  --set replica.replicaCount=2
```

### 4. Deploy Application

```bash
# Create namespace and apply security configurations
kubectl apply -f config/production-security.yaml

# Deploy application
kubectl apply -f deploy/kubernetes/production.yaml

# Wait for deployment to complete
kubectl rollout status deployment/telebot-api -n telebot-platform
kubectl rollout status deployment/telebot-bot -n telebot-platform
kubectl rollout status deployment/telebot-payment-monitor -n telebot-platform
```

### 5. Configure Ingress and SSL

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 🔍 Post-Deployment Verification

### 1. Health Checks

```bash
# Check pod status
kubectl get pods -n telebot-platform

# Check service endpoints
kubectl get endpoints -n telebot-platform

# Check ingress
kubectl get ingress -n telebot-platform

# Test health endpoints
curl -f https://api.yourdomain.com/health
curl -f https://api.yourdomain.com/health/ready
```

### 2. Secret Verification

```bash
# Check External Secrets status
kubectl get externalsecrets -n telebot-platform

# Verify secrets are created
kubectl get secrets -n telebot-platform

# Check secret synchronization
kubectl describe externalsecret telebot-bot-secrets -n telebot-platform
```

### 3. Functional Testing

```bash
# Test Telegram bot
# Send /start command to your bot

# Test API endpoints
curl -H "X-Internal-Token: <internal-token>" \
  https://api.yourdomain.com/api/v1/health

# Test payment webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: <internal-token>" \
  -d '{"tx_hash":"test","amount":"1.234567","to_address":"<tron-address>"}' \
  https://api.yourdomain.com/internal/payments/notify
```

## 📊 Monitoring Setup

### 1. Deploy Monitoring Stack

```bash
# Add Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=<secure-password>
```

### 2. Configure Alerts

Create alerting rules for:
- High error rates
- Database connection failures
- Payment processing delays
- Resource utilization
- Security events

### 3. Set Up Log Aggregation

```bash
# Deploy ELK stack (example)
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch --namespace logging --create-namespace
helm install kibana elastic/kibana --namespace logging
helm install filebeat elastic/filebeat --namespace logging
```

## 🔄 Backup and Recovery

### 1. Database Backups

```bash
# Set up automated backups
kubectl create cronjob postgres-backup \
  --image=postgres:13 \
  --schedule="0 2 * * *" \
  --restart=OnFailure \
  -- pg_dump $DATABASE_URL | gzip > /backup/postgres-$(date +\%Y\%m\%d).sql.gz
```

### 2. Secret Backups

```bash
# Backup Vault data
vault operator raft snapshot save backup.snap

# Store in secure location
aws s3 cp backup.snap s3://your-backup-bucket/vault/$(date +%Y%m%d)/
```

### 3. Application Data Backups

```bash
# Backup file storage
kubectl create cronjob file-backup \
  --image=amazon/aws-cli \
  --schedule="0 3 * * *" \
  -- aws s3 sync /app/data s3://your-backup-bucket/files/
```

## 🔒 Security Hardening

### 1. Network Security

```bash
# Apply network policies
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: telebot-platform
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
```

### 2. Pod Security

```bash
# Enable Pod Security Standards
kubectl label namespace telebot-platform \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted
```

### 3. RBAC Configuration

Review and apply least-privilege RBAC policies for all service accounts.

## 📋 Maintenance

### 1. Regular Updates

- Update container images monthly
- Apply security patches within 72 hours
- Rotate secrets quarterly
- Review access logs weekly

### 2. Monitoring

- Set up alerts for all critical metrics
- Review security events daily
- Monitor resource usage trends
- Track application performance

### 3. Backup Testing

- Test backup restoration monthly
- Verify disaster recovery procedures
- Document recovery times
- Update emergency contacts

## 🚨 Incident Response

### 1. Emergency Procedures

1. **Security Incident**
   - Isolate affected components
   - Collect forensic evidence
   - Notify security team
   - Follow incident response plan

2. **Service Outage**
   - Check health endpoints
   - Review application logs
   - Scale resources if needed
   - Activate backup systems

3. **Data Breach**
   - Immediately revoke access
   - Assess data exposure
   - Notify affected users
   - Comply with legal requirements

### 2. Emergency Contacts

- Security Team: security@yourdomain.com
- DevOps Team: devops@yourdomain.com
- Legal Team: legal@yourdomain.com

## ✅ Final Checklist

Before going live, ensure:

- [ ] All secrets properly configured in Vault
- [ ] SSL certificates valid and auto-renewing
- [ ] Monitoring and alerting operational
- [ ] Backup procedures tested
- [ ] Security scan completed with no critical issues
- [ ] Performance testing passed
- [ ] Documentation complete
- [ ] Team trained on emergency procedures
- [ ] Legal and compliance requirements met
- [ ] Insurance coverage in place

## 📞 Support

For issues with this deployment:
1. Check application logs: `kubectl logs -f deployment/telebot-api -n telebot-platform`
2. Review monitoring dashboards
3. Consult troubleshooting guide
4. Contact support team

---

**Remember**: Security is an ongoing process. Regularly review and update your security practices to address new threats and vulnerabilities.