# 能量兑换机器人 (Energy Exchange Bot)

基于 @nengliangduihuanbot 功能开发的 Telegram 机器人，提供完整的 TRC-20 能量服务和数字货币兑换功能。

## 功能特性

### 🛩️ 飞机会员服务
- 为自己或他人开通 Telegram Premium 会员
- 支持 1个月、3个月、6个月、12个月 套餐
- 付款后 5-10 分钟快速到账

### ⚡ 能量服务
- **能量质押/租用**: 基于质押池的能量租用服务
- **能量闪租**: 1分钟内到账的快速能量服务
- **限时能量**: 按小时/天计费的灵活能量方案
- 为 TRC-20 转账提供能量，避免 TRX 燃烧

### 👁️ 地址监听
- 实时监控波场链地址交易动态
- TRX/USDT 转账通知
- 智能合约交互提醒
- 大额交易预警

### 🔄 TRX/USDT 兑换
- 实时市场汇率兑换
- 秒级到账
- 最低 0.1% 手续费
- 支持大额兑换

### 💱 实时OTC汇率
- 欧易等主流平台汇率
- 多商家价格对比
- 实时更新汇率信息

### 👤 个人中心
- 账户余额管理
- 交易记录查询
- 用户等级系统
- 推荐佣金统计

### ⭐ 购买星星
- Telegram Stars 充值服务
- 支持多种套餐规格
- 即时到账

### 🆓 免费克隆
- 容器化管理系统
- 一键克隆部署
- 代理商发展工具
- 自定义分润规则

### 📞 客服支持
- 24小时在线客服
- 多语言支持
- 快速问题解决

## 技术架构

- **框架**: Python 3.11 + aiogram 3.x
- **数据库**: Redis + PostgreSQL
- **区块链**: TRON (TRC-20)
- **容器化**: Docker
- **监控**: Prometheus
- **日志**: structlog

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd energy-exchange-bot

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 2. 配置说明

在 `.env` 文件中配置以下必要参数：

```bash
# Telegram Bot Token (从 @BotFather 获取)
BOT_TOKEN=your-bot-token-here

# TRON 收款地址
PAYMENT_ADDRESS=your-tron-address

# 客服联系方式
CUSTOMER_SERVICE_ID=@your_support_bot

# Redis 连接 (可选，默认使用内存存储)
REDIS_URL=redis://localhost:6379
```

### 3. 运行机器人

```bash
# 直接运行
python main.py

# 或使用 Docker
docker build -t energy-exchange-bot .
docker run -d --env-file .env energy-exchange-bot
```

## Docker 部署

### 使用 Docker Compose

```yaml
version: '3.8'
services:
  energy-bot:
    build: .
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - PAYMENT_ADDRESS=${PAYMENT_ADDRESS}
      - CUSTOMER_SERVICE_ID=${CUSTOMER_SERVICE_ID}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

启动服务：

```bash
docker-compose up -d
```

## API 集成

### TRON 网络集成

机器人使用 TronPy 库与 TRON 网络交互：

- 监控 TRC-20 USDT 交易
- 处理 TRX 转账
- 能量质押和委托
- 实时余额查询

### 汇率 API

支持多个汇率数据源：

- 欧易 (OKX) API
- 火币 (Huobi) API  
- 币安 (Binance) API
- 自定义汇率源

## 安全特性

- 🔒 私钥安全存储
- 🛡️ 多重签名支持
- 🔐 用户数据加密
- 📊 交易风控监测
- 🚫 反洗钱检测

## 监控和日志

- Prometheus 指标监控
- 结构化日志记录
- 健康检查端点
- 性能监控面板

## 开发指南

### 添加新功能

1. 在 `UserStates` 中添加新状态
2. 创建对应的处理函数
3. 添加键盘按钮和回调处理
4. 更新主菜单

### 测试

```bash
# 运行测试
python -m pytest tests/

# 功能测试
python test_bot_functions.py
```

### 代码规范

- 使用 Black 格式化代码
- 遵循 PEP 8 规范
- 添加类型注解
- 编写单元测试

## 许可证

MIT License

## 支持

如有问题，请联系：
- Telegram: @your_support_bot
- Email: support@example.com
- GitHub Issues: [项目地址]/issues

## 更新日志

### v1.0.0 (2024-09-22)
- 初始版本发布
- 实现所有核心功能
- 支持 TRC-20 支付
- 完整的用户管理系统