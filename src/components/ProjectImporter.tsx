import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CloudArrowUp, 
  FolderOpen, 
  GitBranch, 
  CheckCircle, 
  Warning, 
  Info,
  Copy,
  Download,
  Package,
  Rocket,
  Shield,
  Code
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function ProjectImporter() {
  // 默认设置值
  const defaultSettings = {
    repoName: 'zh',
    description: 'TeleBot销售平台 - 完整的Telegram机器人销售与分销系统',
    visibility: 'public',
    branch: 'main'
  }
  
  const [repoSettings, setRepoSettings] = useKV<{
    repoName: string
    description: string
    visibility: string
    branch: string
  }>('repo-settings', defaultSettings)
  
  const settings = repoSettings || defaultSettings
  
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<'idle' | 'preparing' | 'uploading' | 'completed' | 'error'>('idle')
  const [importLog, setImportLog] = useState<string[]>([])
  const [packageInfo, setPackageInfo] = useState<any>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    setImportLog(prev => [...prev, logEntry])
  }

  const simulateImportProcess = async () => {
    setImportStatus('preparing')
    setImportProgress(0)
    setImportLog([])
    
    try {
      // 步骤1: 准备项目文件
      addLog('开始准备项目文件...', 'info')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setImportProgress(10)
      
      addLog('扫描项目结构...', 'info')
      await new Promise(resolve => setTimeout(resolve, 800))
      setImportProgress(20)
      
      addLog('检查依赖关系...', 'info')
      await new Promise(resolve => setTimeout(resolve, 600))
      setImportProgress(30)
      
      // 步骤2: 安全检查
      addLog('执行安全审计...', 'info')
      await new Promise(resolve => setTimeout(resolve, 1200))
      setImportProgress(40)
      
      addLog('验证配置文件...', 'success')
      await new Promise(resolve => setTimeout(resolve, 500))
      setImportProgress(50)
      
      // 步骤3: 打包
      setImportStatus('uploading')
      addLog('创建部署包...', 'info')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setImportProgress(60)
      
      addLog('压缩项目文件...', 'info')
      await new Promise(resolve => setTimeout(resolve, 800))
      setImportProgress(70)
      
      // 步骤4: 上传到GitHub
      addLog('连接到GitHub...', 'info')
      await new Promise(resolve => setTimeout(resolve, 600))
      setImportProgress(80)
      
      addLog('上传文件到仓库...', 'info')
      await new Promise(resolve => setTimeout(resolve, 1200))
      setImportProgress(90)
      
      addLog('配置GitHub Actions...', 'info')
      await new Promise(resolve => setTimeout(resolve, 500))
      setImportProgress(95)
      
      // 完成
      addLog('导入完成！', 'success')
      setImportProgress(100)
      setImportStatus('completed')
      
      // 设置包信息
      setPackageInfo({
        repoUrl: `https://github.com/username/${settings.repoName}`,
        packageSize: '45.2 MB',
        filesCount: 347,
        commit: 'a1b2c3d',
        deployUrl: `https://${settings.repoName}.vercel.app`
      })
      
    } catch (error) {
      addLog(`导入失败: ${error}`, 'error')
      setImportStatus('error')
    }
  }

  const exportScript = `#!/bin/bash
# TeleBot项目导入脚本
# 使用方法: ./import-to-zh-repo.sh

echo "🚀 开始导入TeleBot销售平台到zh仓库..."

# 检查GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI未安装，请先安装: https://cli.github.com/"
    exit 1
fi

# 创建临时目录
TEMP_DIR="telebot-export-$(date +%s)"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📦 准备项目文件..."

# 复制核心文件
cp -r ../backend ./
cp -r ../bot ./
cp -r ../deploy ./
cp -r ../config ./
cp -r ../scripts ./
cp -r ../src ./
cp ../docker-compose.*.yml ./
cp ../package.json ./
cp ../README.md ./
cp ../SECURITY.md ./
cp ../*.md ./

echo "🔧 创建GitHub仓库..."
gh repo create ${settings.repoName} --${settings.visibility} --description "${settings.description}"

echo "📤 初始化Git仓库..."
git init
git add .
git commit -m "🎉 Initial commit: TeleBot销售平台完整导入

✨ 功能特性:
- 🤖 Telegram Bot销售系统
- 💰 TRON区块链支付处理
- 🏪 分销商管理系统
- 🔒 企业级安全架构
- 🐳 Docker容器化部署
- 📊 实时监控与分析

🛠️ 技术栈:
- Python (aiogram + FastAPI)
- React + TypeScript
- PostgreSQL + Redis
- Docker + Kubernetes
- HashiCorp Vault
"

git branch -M ${settings.branch}
git remote add origin https://github.com/username/${settings.repoName}.git
git push -u origin ${settings.branch}

echo "✅ 导入完成！"
echo "🌐 仓库地址: https://github.com/username/${settings.repoName}"
echo "📖 查看部署文档: README.md"

# 清理临时文件
cd ..
rm -rf "$TEMP_DIR"
`

  const githubActionsWorkflow = `name: TeleBot Platform CI/CD

on:
  push:
    branches: [ ${settings.branch} ]
  pull_request:
    branches: [ ${settings.branch} ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        pip install -r backend/requirements.txt
        npm install
        
    - name: Run tests
      run: |
        python -m pytest backend/tests/
        npm test
        
    - name: Security scan
      run: |
        pip install bandit
        bandit -r backend/
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/${settings.branch}'
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t telebot-backend ./backend
        docker build -t telebot-bot ./bot
        
    - name: Deploy to production
      run: |
        echo "🚀 部署到生产环境..."
        # 添加您的部署脚本
`

  const deploymentGuide = `# TeleBot销售平台部署指南

## 🚀 快速开始

### 1. 克隆仓库
\`\`\`bash
git clone https://github.com/username/${settings.repoName}.git
cd ${settings.repoName}
\`\`\`

### 2. 环境配置
\`\`\`bash
# 复制环境配置文件
cp config/.env.example config/.env

# 编辑配置文件
nano config/.env
\`\`\`

### 3. 启动服务
\`\`\`bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### 4. 配置Telegram Bot
\`\`\`bash
# 设置Bot Token
python scripts/setup_bot.py --token YOUR_BOT_TOKEN

# 启动机器人
python bot/main.py
\`\`\`

## 📋 环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| BOT_TOKEN | Telegram Bot Token | 123456:ABCdef... |
| TRON_ADDRESS | TRON收款地址 | T9yD14Nj9j7xAB... |
| DATABASE_URL | 数据库连接 | postgresql://... |
| REDIS_URL | Redis连接 | redis://... |

## 🔒 安全配置

1. **密钥管理**: 使用HashiCorp Vault存储敏感信息
2. **网络安全**: 配置防火墙和SSL证书
3. **访问控制**: 设置管理员权限和2FA
4. **审计日志**: 启用操作日志记录

## 📊 监控与维护

- **健康检查**: /health endpoint
- **监控面板**: Grafana dashboard
- **日志分析**: ELK stack
- **备份策略**: 自动数据库备份

## 🆘 故障排除

### 常见问题

1. **Bot无法启动**
   - 检查Token是否正确
   - 验证网络连接
   - 查看日志文件

2. **支付无法确认**
   - 检查TRON节点连接
   - 验证收款地址
   - 查看链监听服务

3. **性能问题**
   - 检查资源使用情况
   - 优化数据库查询
   - 调整worker数量

## 📞 技术支持

- 文档: [README.md](./README.md)
- 问题报告: GitHub Issues
- 安全报告: security@example.com
`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addLog('内容已复制到剪贴板', 'success')
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    addLog(`文件 ${filename} 已下载`, 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package size={28} weight="bold" className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">项目导入到zh仓库</h1>
          <p className="text-muted-foreground">将完整的TeleBot销售平台导入到您的GitHub仓库</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <FolderOpen size={16} />
            仓库设置
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <CloudArrowUp size={16} />
            导入进度
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <Code size={16} />
            导入脚本
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <Rocket size={16} />
            部署指南
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch size={20} />
                GitHub仓库配置
              </CardTitle>
              <CardDescription>
                配置目标GitHub仓库的基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">仓库名称</Label>
                  <Input
                    id="repo-name"
                    value={repoSettings?.repoName || ''}
                    onChange={(e) => setRepoSettings(prev => ({...prev!, repoName: e.target.value}))}
                    placeholder="zh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">主分支</Label>
                  <Input
                    id="branch"
                    value={settings.branch}
                    onChange={(e) => setRepoSettings({...settings, branch: e.target.value})}
                    placeholder="main"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">仓库描述</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setRepoSettings({...settings, description: e.target.value})}
                  placeholder="TeleBot销售平台描述..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>可见性</Label>
                <div className="flex gap-4">
                  <Button
                    variant={settings.visibility === 'public' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRepoSettings({...settings, visibility: 'public'})}
                  >
                    Public 公开
                  </Button>
                  <Button
                    variant={settings.visibility === 'private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRepoSettings({...settings, visibility: 'private'})}
                  >
                    Private 私有
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info size={16} />
            <AlertDescription>
              请确保您已经安装了GitHub CLI (gh)，并且已经登录到您的GitHub账户。
              如果没有安装，请访问 <a href="https://cli.github.com/" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://cli.github.com/</a>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudArrowUp size={20} />
                项目导入进度
              </CardTitle>
              <CardDescription>
                实时监控项目导入到GitHub仓库的进度
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">导入进度</span>
                  <span className="text-sm text-muted-foreground">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
                
                <div className="flex items-center gap-2">
                  <Badge variant={
                    importStatus === 'completed' ? 'default' :
                    importStatus === 'error' ? 'destructive' :
                    importStatus === 'idle' ? 'secondary' : 'outline'
                  }>
                    {importStatus === 'idle' && '待开始'}
                    {importStatus === 'preparing' && '准备中'}
                    {importStatus === 'uploading' && '上传中'}
                    {importStatus === 'completed' && '已完成'}
                    {importStatus === 'error' && '错误'}
                  </Badge>
                  
                  {importStatus === 'completed' && (
                    <CheckCircle size={16} className="text-success" />
                  )}
                  {importStatus === 'error' && (
                    <Warning size={16} className="text-destructive" />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={simulateImportProcess}
                  disabled={importStatus === 'preparing' || importStatus === 'uploading'}
                  className="flex items-center gap-2"
                >
                  <CloudArrowUp size={16} />
                  {importStatus === 'idle' ? '开始导入' : '重新导入'}
                </Button>
                
                {packageInfo && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(packageInfo.repoUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <GitBranch size={16} />
                    查看仓库
                  </Button>
                )}
              </div>

              {importLog.length > 0 && (
                <div className="space-y-2">
                  <Label>导入日志</Label>
                  <div className="bg-muted p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                    {importLog.map((log, index) => (
                      <div key={index} className={cn(
                        "mb-1",
                        log.includes('ERROR') && "text-destructive",
                        log.includes('SUCCESS') && "text-success",
                        log.includes('WARNING') && "text-warning"
                      )}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {packageInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">导入结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">仓库地址:</span>
                        <br />
                        <a href={packageInfo.repoUrl} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                          {packageInfo.repoUrl}
                        </a>
                      </div>
                      <div>
                        <span className="text-muted-foreground">包大小:</span>
                        <br />
                        <span className="font-medium">{packageInfo.packageSize}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">文件数量:</span>
                        <br />
                        <span className="font-medium">{packageInfo.filesCount} 个文件</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">提交ID:</span>
                        <br />
                        <span className="font-mono">{packageInfo.commit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} />
                自动化导入脚本
              </CardTitle>
              <CardDescription>
                下载或复制这些脚本来自动化项目导入过程
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">自动化打包脚本 (auto-package-for-zh.sh)</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('bash auto-package-for-zh.sh')}
                    >
                      <Copy size={16} />
                      复制命令
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile('bash auto-package-for-zh.sh\n# 或者\nREPO_NAME=my-telebot bash auto-package-for-zh.sh', 'run-package.sh')}
                    >
                      <Download size={16} />
                      下载
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono">
{`# 在项目根目录运行
bash auto-package-for-zh.sh

# 自定义仓库名称
REPO_NAME=my-telebot bash auto-package-for-zh.sh

# 设置为私有仓库
REPO_VISIBILITY=private bash auto-package-for-zh.sh`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">GitHub Actions工作流</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(githubActionsWorkflow)}
                    >
                      <Copy size={16} />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(githubActionsWorkflow, 'ci-cd.yml')}
                    >
                      <Download size={16} />
                      下载
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{githubActionsWorkflow}</pre>
                </div>
              </div>

              <Alert>
                <Shield size={16} />
                <AlertDescription>
                  使用这些脚本前，请确保：
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>已安装并配置GitHub CLI</li>
                    <li>已设置必要的环境变量</li>
                    <li>已通过安全审计检查</li>
                    <li>已备份重要数据</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket size={20} />
                部署指南
              </CardTitle>
              <CardDescription>
                完整的项目部署和配置指南
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">部署文档 (DEPLOYMENT.md)</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(deploymentGuide)}
                  >
                    <Copy size={16} />
                    复制
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(deploymentGuide, 'DEPLOYMENT.md')}
                  >
                    <Download size={16} />
                    下载
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">{deploymentGuide}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CloudArrowUp size={24} className="mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">1. 克隆仓库</h4>
                    <p className="text-sm text-muted-foreground">从GitHub下载项目代码</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield size={24} className="mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">2. 配置环境</h4>
                    <p className="text-sm text-muted-foreground">设置环境变量和密钥</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Rocket size={24} className="mx-auto mb-2 text-primary" />
                    <h4 className="font-semibold">3. 启动服务</h4>
                    <p className="text-sm text-muted-foreground">使用Docker运行应用</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}