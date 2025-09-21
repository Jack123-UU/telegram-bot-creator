# 副驾驶 使用说明（GitHub Copilot Chat Assistant）

目的  
- 说明在此仓库中由“副驾驶”执行改动的约定、边界和具体步骤（尤其用于实现代理支持、修复测试、或发布小型运维变更）。

安全与约束（必须遵守）
- 绝对不要把任何密钥、token、私钥、密码等以明文提交到仓库（包括示例、docker-compose、脚本）。所有敏感信息必须用环境变量 / CI Secrets 注入。
- 任何会影响生产凭据或私有密钥的改动，必须在 PR 描述中明确指出并经人工审核。
- 保持向后兼容：如果未设置代理环境变量，行为不得改变。

允许的改动范围（示例）
- 增加对 HTTP_PROXY/HTTPS_PROXY/NO_PROXY 或 PROXY_URL 的支持（脚本、Docker compose、aiohttp 的 trust_env）。
- 更新部署脚本（deploy-telegram-bot.sh）以导出代理环境变量（不写入凭据）。
- 在测试与示例代码中把 aiohttp.ClientSession 改为 ClientSession(trust_env=True)，并把 session 传给 aiogram.Bot。
- 为 requests 添加可选 proxies 参数（基于 PROXY_URL）。
- 添加或更新文档（DEPLOYMENT.md / README）说明如何在受限网络下部署。
- 在多个副本的 docker-compose.prod.yml 中一致性地传递 HTTP_PROXY/HTTPS_PROXY/NO_PROXY 环境变量。

禁止的改动
- 在任何文件中新增或替换为真实凭据（包括代理带凭据、token、密码）。
- 删除或绕过安全检查（例如把 NO_PROXY 设置为空来暴露内部服务）。
- 直接推送到主分支（main/master）。所有改动必须通过 PR 审核合并。

分支与提交约定
- 分支命名：功能性改动采用 `add/<feature>` 或 `fix/<short-desc>`，本任务默认 `add/proxy-support`。
- 单次 PR 保持单一目标：例如“添加代理支持” 不要同时包含“重构数据库模型”的改动。
- 提交信息模板（单条提交）：
  Add proxy support: honor HTTP_PROXY/HTTPS_PROXY and optional PROXY_URL
- 如果需要多次提交，请在 PR 描述中写清每个提交的目的。

PR 模板（可直接复制到 PR 描述）
- 标题：添加代理支持（支持 HTTP_PROXY/HTTPS_PROXY 与可选 PROXY_URL）
- 描述：
  1. 在 test_bot_functions.py、test_bot_token.py、bot/bot.py 中启用 aiohttp.ClientSession(trust_env=True)，并把 session 传给 aiogram.Bot。
  2. 在 payment-listener/listener.py 中为 requests.post 添加可选 proxies（基于 PROXY_URL）。
  3. 更新 deploy-telegram-bot.sh：读取并 export PROXY_URL -> HTTP_PROXY/HTTPS_PROXY/NO_PROXY。
  4. 在 root 与 zh-telebot-platform-export、zh-telebot-platform 下的 docker-compose.prod.yml 中，为关键服务注入 HTTP_PROXY/HTTPS_PROXY/NO_PROXY 环境变量。
  5. 新增 DEPLOYMENT.md，说明在本地与 CI（GitHub Actions）如何注入代理环境变量和秘密管理。
  6. 不包含任何凭据替换；若需要替换凭据为占位符，需额外确认。
- 验证步骤（检查项）：
  - [ ] 若未设置 PROXY_URL/HTTP_PROXY，功能与原行为一致。
  - [ ] aiohttp session 在异常或退出时被正确关闭，避免资源泄露。
  - [ ] docker-compose 中正确传递代理变量。
  - [ ] README/DEPLOYMENT.md 包含 CI/Secrets 示例。
- 审核人注意事项：检查是否有敏感数据被意外提交。

常用命令（可复制执行）
- 创建分支并推送（本地）
  git checkout -b add/proxy-support
  # 应用修改
  git add -A
  git commit -m "Add proxy support: honor HTTP_PROXY/HTTPS_PROXY and optional PROXY_URL"
  git push origin add/proxy-support
- 通过 gh 打开 PR（若安装 gh CLI）
  gh pr create --title "Add proxy support: respect HTTP_PROXY/HTTPS_PROXY and optional PROXY_URL" --body "见 DEPLOYMENT.md；不包含凭据替换。" --base main --head add/proxy-support

补丁 / .patch 链接模板（当分支或 PR 已存在时可用）
- compare 分支 patch：
  https://github.com/Jack123-UU/telegram-bot-creator/compare/main...add/proxy-support.patch
  https://github.com/Jack123-UU/telegram-bot-creator/compare/main...add/proxy-support.diff
- PR patch（替换 PR_NUMBER）：
  https://github.com/Jack123-UU/telegram-bot-creator/pull/PR_NUMBER.patch

如何本地应用补丁
- 下载：
  curl -L -o changes.patch 'https://github.com/Jack123-UU/telegram-bot-creator/compare/main...add/proxy-support.patch'
- 应用（保留提交信息）：
  git checkout -b add/proxy-support-from-patch
  git am < changes.patch
- 或使用 git apply：
  git apply changes.patch
  git add -A
  git commit -m "Apply patch"

建议的具体文件清单（针对“添加代理支持”任务）
- test_bot_functions.py — ClientSession(trust_env=True)，在请求处可选 proxy=PROXY_URL。
- test_bot_token.py — 用 session = aiohttp.ClientSession(trust_env=True) 并传入 Bot(token=..., session=session)，结束时 await session.close()。
- bot/bot.py（样例） — 创建并传入 session，优雅关闭。
- payment-listener/listener.py — requests.post(..., proxies=proxies)（当 PROXY_URL 存在时）。
- deploy-telegram-bot.sh — 读取 PROXY_URL 并 export HTTP_PROXY/HTTPS_PROXY/NO_PROXY。
- docker-compose.prod.yml（及两个 zh- 副本） — 在关键服务的 environment 中添加 HTTP_PROXY/HTTPS_PROXY/NO_PROXY。
- DEPLOYMENT.md — 新文档，说明代理与 CI 使用方式。

调试与验证建议
- 在受限网络环境中测试：先在 shell 导出 PROXY_URL，启动服务并确认对外请求（api.telegram.org、api.github.com）能通过代理访问。
- 若可见代理日志/流量，确认请求确实走代理；否则在容器内查看环境变量是否注入正确。
- 在单元/集成测试中模拟无代理和有代理两种情形，确保行为一致。

联系人与审批流程
- 所有变更在 PR 中至少一名有写权限的维护者审批后合并。
- 若变更影响生产部署（docker-compose、deploy 脚本），需在合并前与运维或负责人沟通确认。

---

将上述内容保存为 `.github/副驾驶-instructions.md`。如需我生成对应的 patch 文件（.patch），或把具体的代码片段 / 自动化修改脚本（patch_apply.sh）一并加入仓库，请回复“生成 patch” 或 “生成 patch_apply.sh”。
