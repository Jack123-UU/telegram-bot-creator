```markdown
# TeleBot Creator / TeleBot 销售平台

简要说明 | Short description
----------------------------
这是一个用于快速部署与管理企业级 Telegram 销售与分销平台的仓库，包含前端、后端、Telegram bot、支付监控与容器化部署配置。该项目支持 TRON/USDT 支付、库存与分销管理、以及一键容器化部署和监控集成。

This repository contains a production-ready Telegram sales & distribution platform (frontend, backend, Telegram bot, payment monitoring, and deployment scripts). Supports TRON/USDT payments, inventory & distributor management, containerized deployment, and monitoring.

快速开始 | Quick start
---------------------
1. 克隆仓库 / Clone:
```bash
git clone https://github.com/Jack123-UU/telegram-bot-creator.git
cd telegram-bot-creator
```

2. 列出完整仓库文件（避免 API 截断）/ Get full repo listing:
```bash
# 可选：设置 GITHUB_TOKEN 以提高 API 限额
GITHUB_TOKEN=your_token python3 scripts/list_repo_contents.py --owner Jack123-UU --repo telegram-bot-creator --branch main
# 输出文件: all_contents.json
```

3. 配置环境 / Configure:
- 复制环境模板并编辑 .env（示例在 zh-telebot-platform/ 或 config/ 中）
- 必需变量示例：BOT_TOKEN, TRON_PRIVATE_KEY, PAYMENT_ADDRESS, DATABASE_URL

4. 本地启动（示例）/ Run locally (example):
```bash
# 示例：使用 docker-compose 启动（开发/生产文件各自不同）
docker compose -f docker-compose.dev.yml up --build
```

文件结构概览 | Project layout
----------------------------
- src/ — 前端或核心 TypeScript 源码（UI）
- bot/ — Telegram Bot 代码（Python / aiogram）
- backend/ — 后端服务 (FastAPI 等)
- deploy/, scripts/, config/ — 部署与运维脚本与配置
- docker-compose.* — 开发/生产/测试容器配置
- zh-telebot-platform/ — 中文平台导出与交付说明与示例

重要文件 | Important files
- README.md (本文件)
- DEPLOYMENT.md — 部署指南
- SECURITY.md — 安全配置与建议
- scripts/list_repo_contents.py — 列出完整仓库树的脚本（解决 contents API 截断）
- docker-compose.*.yml — 容器编排配置
- package.json / package-lock.json — 前端构建与依赖

安全与合规 | Security & Compliance
----------------------------
- 请务必保护敏感信息（不要在仓库中提交私钥或令牌）。
- 生产部署请使用密钥管理（Vault/KMS）、限定访问权限并启用审计日志。
- 项目包含 Telegram 帐号/销售相关功能，请确保遵守 Telegram 服务条款与当地法律法规。

如何让我继续（How I can help next）
- 我可以把本 README 草稿提交为 PR 或直接替换（请授权我创建 PR 或推送到分支）。  
- 我可以进一步读取并汇总 package.json、docker-compose、src、bot、backend 的关键入口与依赖，并给出检测/修复建议。  
- 如果你把脚本生成的 all_contents.json 发给我，我将基于它生成完整的文件清单、敏感项扫描与下一步修复方案。

联系方式 | Contact
- 如果需要我直接创建 PR 或修改文件，请回复“替换 README 并创建 PR”，或告诉我下一步优先级（例如“先检查 package.json”）。
```