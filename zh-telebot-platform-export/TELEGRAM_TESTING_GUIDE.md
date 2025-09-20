# TeleBot Docker 真实环境测试指南

## 概述
本文档详细说明如何使用 Docker 部署和测试集成了真实 Bot Token (`8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk`) 的 TeleBot 销售平台。

## 前置要求

### 系统要求
- Docker 20.0+ 
- Docker Compose 2.0+
- 至少 4GB RAM
- 10GB 可用存储空间

### 必需软件
```bash
# 检查 Docker 安装
docker --version
docker-compose --version

# 检查系统资源
free -h
df -h
```

## 快速启动

### 1. 开发环境（推荐首次测试）
```bash
# 启动开发环境
./deploy-telegram-bot.sh start development

# 检查服务状态
./deploy-telegram-bot.sh status

# 查看日志
./deploy-telegram-bot.sh logs
```

### 2. 生产环境
```bash
# 启动生产环境
./deploy-telegram-bot.sh start production your-domain.com

# 监控服务
docker-compose -f docker-compose.prod.yml ps
```

## 服务架构

### 核心服务
1. **PostgreSQL Database** (端口: 5432)
   - 用户数据存储
   - 订单和支付记录
   - 产品和库存管理

2. **Redis Cache** (端口: 6379)
   - 会话存储
   - 任务队列
   - 缓存层

3. **FastAPI Backend** (端口: 8000)
   - RESTful API 服务
   - 业务逻辑处理
   - Webhook 接收

4. **Telegram Bot**
   - 用户交互界面
   - 命令处理
   - 消息路由

5. **Payment Listener**
   - TRON 网络监听
   - 支付确认
   - 自动发货

6. **Nginx Proxy** (端口: 80/443)
   - 反向代理
   - SSL 终端
   - 负载均衡

### 监控服务
- **Prometheus** (端口: 9090) - 指标收集
- **Grafana** (端口: 3000) - 可视化仪表板

## 真实测试流程

### Phase 1: 基础连接测试
```bash
# 1. 启动所有服务
./deploy-telegram-bot.sh start development

# 2. 验证 API 健康状态
curl http://localhost:8001/health

# 3. 测试 Webhook 端点
curl -X POST http://localhost:8001/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook_test"}'
```

### Phase 2: Telegram Bot 功能测试

#### 步骤 1: 连接 Bot
1. 在 Telegram 中搜索: `@test_8424135673_bot`
2. 或直接访问: `https://t.me/test_8424135673_bot`
3. 点击 "Start" 或发送 `/start`

#### 步骤 2: 基础功能测试
```
测试命令序列:
1. /start - 初始化用户
2. 🛍️ 商品列表 - 查看产品
3. 🔌 API接码服务 - 新功能测试
4. 👤 用户中心 - 用户信息
5. 🌐 English - 语言切换
6. 💰 余额充值 - 支付流程
```

#### 步骤 3: 订单流程测试
1. 选择商品 → 创建订单
2. 获取支付信息（TRON地址 + 精确金额）
3. 模拟支付（开发环境自动确认）
4. 验证自动发货

### Phase 3: API 服务测试

#### 新增 API 接码功能
```bash
# 测试 API 端点格式
curl "http://localhost:8001/api/v1/services/api-login" \
  -H "Authorization: Bearer test-token"

# 测试批量导入
curl -X POST "http://localhost:8001/api/v1/import/api-services" \
  -F "file=@api-services.csv" \
  -H "Authorization: Bearer admin-token"
```

#### API 端点示例
- 格式: `https://miha.uk/tgapi/{token}/{uuid}/GetHTML`
- 测试: `https://miha.uk/tgapi/uWCSVDgG6XMaMT5C/fa7e47cc-d2d2-4ead-bfc1-039a7135f057/GetHTML`

### Phase 4: 支付系统测试

#### TRON 支付监听
```bash
# 检查支付监听器日志
docker-compose logs payment-listener

# 模拟支付确认
curl -X POST http://localhost:8001/internal/payments/notify \
  -H "Content-Type: application/json" \
  -d '{
    "tx_hash": "0x1234567890abcdef",
    "from_address": "TFromAddress123",
    "to_address": "TYs8kpCAh8Qk1G2fJhS8KrB6WQG6vSxD9K",
    "amount": "10.003241",
    "token": "USDT-TRC20",
    "confirmations": 1
  }'
```

#### 支付验证流程
1. 用户下单 → 生成唯一金额
2. 显示固定 TRON 地址 + 二维码
3. 用户支付精确金额
4. 系统自动识别并确认
5. 触发自动发货

## 高级测试场景

### 并发测试
```bash
# 并发用户测试
for i in {1..10}; do
  curl -X POST http://localhost:8001/api/v1/orders \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": $i, \"product_id\": 1}" &
done
wait
```

### 压力测试
```bash
# 使用 Apache Bench 进行压力测试
ab -n 1000 -c 10 http://localhost:8001/health

# 使用 wrk 进行性能测试
wrk -t4 -c100 -d30s http://localhost:8001/api/v1/products
```

### 故障恢复测试
```bash
# 模拟数据库故障
docker-compose stop postgres
# 观察系统响应
docker-compose logs api
# 恢复服务
docker-compose start postgres
```

## 监控和诊断

### 实时监控
```bash
# 查看所有服务状态
docker-compose ps

# 实时日志监控
docker-compose logs -f

# 特定服务日志
docker-compose logs -f bot
docker-compose logs -f payment-listener
```

### 性能指标
- 访问 Prometheus: http://localhost:9090
- 访问 Grafana: http://localhost:3000
  - 用户名: admin
  - 密码: admin_secure_password_2024

### 关键指标监控
1. **响应时间**: API 响应 < 200ms
2. **可用性**: 服务正常运行时间 > 99.9%
3. **并发处理**: 支持 100+ 并发用户
4. **内存使用**: < 70%
5. **CPU 使用**: < 60%

## 安全配置

### 生产环境安全清单
- [ ] 更改所有默认密码
- [ ] 启用 SSL/TLS 证书
- [ ] 配置防火墙规则
- [ ] 启用日志审计
- [ ] 定期安全扫描
- [ ] 数据备份策略

### 敏感信息管理
```bash
# 使用环境变量文件
cat > .env.prod << EOF
BOT_TOKEN=8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk
TRON_PRIVATE_KEY=your_secure_private_key
DATABASE_PASSWORD=your_secure_db_password
REDIS_PASSWORD=your_secure_redis_password
EOF
```

## 故障排除

### 常见问题解决

#### 1. Bot 无响应
```bash
# 检查 bot 容器状态
docker-compose logs bot

# 验证 Token 有效性
curl "https://api.telegram.org/bot8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk/getMe"

# 重启 bot 服务
docker-compose restart bot
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready

# 查看连接日志
docker-compose logs postgres

# 重置数据库连接
docker-compose restart postgres api
```

#### 3. 支付监听器异常
```bash
# 检查 TRON 网络连接
docker-compose exec payment-listener curl https://api.trongrid.io

# 重启支付监听
docker-compose restart payment-listener
```

## 部署最佳实践

### 开发流程
1. 本地开发环境测试
2. Docker 开发环境验证
3. 集成测试运行
4. 生产环境部署
5. 持续监控

### 发布检查清单
- [ ] 所有测试通过
- [ ] 数据库迁移完成
- [ ] 配置文件更新
- [ ] 监控告警配置
- [ ] 回滚计划准备

### 维护建议
- 每日检查服务状态
- 每周检查系统资源
- 每月更新安全补丁
- 每季度进行全面测试

## 联系和支持

### 技术支持
- 日志位置: `./logs/`
- 配置文件: `./nginx/`, `./monitoring/`
- 数据备份: `./backups/`

### 紧急联系
如遇紧急技术问题，请：
1. 收集错误日志
2. 记录复现步骤
3. 检查监控指标
4. 联系技术支持团队

---

**重要提醒**: 
- 本测试使用真实 Bot Token，请确保测试环境安全
- 生产部署前请更换所有默认密码和密钥
- 定期备份重要数据和配置文件