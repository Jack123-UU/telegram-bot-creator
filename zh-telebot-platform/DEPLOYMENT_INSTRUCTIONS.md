# 🚀 TeleBot销售平台部署说明

## 📋 部署前准备

### 1. 系统要求
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB RAM
- 至少 20GB 存储空间

### 2. 获取必要信息
- **Telegram Bot Token**: 从 @BotFather 获取
- **TRON钱包**: 创建TRON钱包并获取私钥
- **收款地址**: TRON钱包地址（T开头）

## 🔧 快速部署步骤

### 步骤1: 克隆代码
```bash
git clone https://github.com/yourusername/zh.git
cd zh
```

### 步骤2: 配置环境
```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

### 步骤3: 配置必要参数
在 `.env` 文件中配置：
```env
# Telegram Bot配置
BOT_TOKEN=你的Bot令牌

# TRON钱包配置  
TRON_PRIVATE_KEY=你的TRON钱包私钥
PAYMENT_ADDRESS=你的TRON收款地址

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/telebot_db
REDIS_URL=redis://localhost:6379

# 安全配置
SECRET_KEY=随机生成的密钥
ADMIN_PASSWORD=管理员密码
```

### 步骤4: 启动服务
```bash
# 给脚本执行权限
chmod +x quick-deploy.sh

# 运行部署脚本
./quick-deploy.sh
```

### 步骤5: 验证部署
- 访问 http://localhost:3000 查看管理界面
- 访问 http://localhost:8000/docs 查看API文档
- 在Telegram中测试Bot功能

## 🔒 安全配置

### 1. 生产环境配置
```bash
# 使用生产环境配置
docker-compose -f docker-compose.prod.yml up -d
```

### 2. SSL证书配置
```bash
# 安装Certbot
sudo apt install certbot

# 获取SSL证书
sudo certbot certonly --standalone -d yourdomain.com
```

### 3. 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 📊 监控配置

### 1. 查看服务状态
```bash
docker-compose ps
```

### 2. 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f bot
docker-compose logs -f backend
```

### 3. 性能监控
```bash
# 查看资源使用
docker stats

# 查看磁盘使用
df -h
```

## 🛠️ 常见问题

### Q1: Bot无法启动
**解决方案**:
1. 检查BOT_TOKEN是否正确
2. 验证网络连接
3. 查看Bot日志: `docker-compose logs bot`

### Q2: 支付监听异常
**解决方案**:
1. 检查TRON私钥配置
2. 验证收款地址
3. 检查网络连接到TRON节点

### Q3: 数据库连接失败
**解决方案**:
1. 检查DATABASE_URL配置
2. 确认数据库服务运行
3. 验证用户权限

### Q4: 前端无法访问
**解决方案**:
1. 检查端口是否被占用
2. 验证防火墙设置
3. 查看前端构建日志

## 📞 技术支持

如果遇到问题：
1. 查看项目文档
2. 搜索已有Issues
3. 提交新的Issue
4. 联系技术支持

---

📧 技术支持: support@example.com
🐛 问题反馈: https://github.com/yourusername/zh/issues
