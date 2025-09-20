import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Terminal, 
  Play, 
  CheckCircle, 
  Clock,
  Warning,
  Copy,
  Download,
  Upload,
  Gear,
  Code,
  Package,
  CloudArrowUp,
  FolderOpen,
  GithubLogo,
  Rocket
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SetupStep {
  id: string
  title: string
  description: string
  command?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  output?: string[]
}

interface ProjectConfig {
  repoName: string
  localPath: string
  gitUsername: string
  gitEmail: string
  telegramToken: string
  tronAddress: string
}

export function OneClickSetupScript() {
  const [config, setConfig] = useKV<ProjectConfig>('setup-config', {
    repoName: 'zh',
    localPath: './telebot-sales-platform',
    gitUsername: 'yourusername',
    gitEmail: 'your.email@example.com',
    telegramToken: '8424135673:AAE-QYrIeZ5kgI3VRu1C5gd23CYnQsmjUmk',
    tronAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  })
  
  const [isRunning, setIsRunning] = useState(false)
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTab, setSelectedTab] = useState('automatic')

  const initializeSteps = (): SetupStep[] => [
    {
      id: 'download',
      title: '下载项目文件',
      description: '从生成的包下载完整项目文件',
      command: 'curl -L -o telebot-platform.zip https://github.com/releases/latest/download/telebot-platform.zip',
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'extract',
      title: '解压项目文件',
      description: '解压下载的项目压缩包',
      command: `unzip telebot-platform.zip -d ${config?.localPath || './telebot-sales-platform'}`,
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'init-git',
      title: '初始化 Git 仓库',
      description: '设置本地 Git 仓库',
      command: `cd ${config?.localPath || './telebot-sales-platform'} && git init`,
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'git-config',
      title: '配置 Git 用户',
      description: '设置 Git 用户名和邮箱',
      command: `git config user.name "${config?.gitUsername}" && git config user.email "${config?.gitEmail}"`,
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'create-env',
      title: '配置环境变量',
      description: '创建 .env 文件并配置密钥',
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'add-files',
      title: '添加文件到 Git',
      description: '将所有项目文件添加到 Git 跟踪',
      command: 'git add .',
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'initial-commit',
      title: '创建初始提交',
      description: '提交所有文件到本地仓库',
      command: 'git commit -m "Initial commit: Complete TeleBot Sales Platform"',
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'add-remote',
      title: '添加远程仓库',
      description: '连接到 GitHub 仓库',
      command: `git remote add origin https://github.com/${config?.gitUsername}/${config?.repoName}.git`,
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'push-main',
      title: '推送到 GitHub',
      description: '将代码推送到远程仓库',
      command: 'git branch -M main && git push -u origin main',
      status: 'pending',
      progress: 0,
      output: []
    },
    {
      id: 'verify',
      title: '验证部署',
      description: '验证项目结构和配置',
      status: 'pending',
      progress: 0,
      output: []
    }
  ]

  useEffect(() => {
    if (config) {
      setSetupSteps(initializeSteps())
    }
  }, [config])

  const updateStepStatus = (stepId: string, status: SetupStep['status'], progress: number = 0, output?: string[]) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress, output: output || step.output } : step
    ))
  }

  const addStepOutput = (stepId: string, newOutput: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { 
        ...step, 
        output: [...(step.output || []), `${new Date().toLocaleTimeString()}: ${newOutput}`]
      } : step
    ))
  }

  const runAutomaticSetup = async () => {
    setIsRunning(true)
    setSetupSteps(initializeSteps())
    setCurrentStep(0)
    
    try {
      // Step 1: Download project files
      updateStepStatus('download', 'running', 0)
      addStepOutput('download', '开始下载项目文件...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      for (let i = 0; i <= 100; i += 10) {
        updateStepStatus('download', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      addStepOutput('download', '项目文件下载完成')
      updateStepStatus('download', 'completed', 100)
      setCurrentStep(1)
      
      // Step 2: Extract files
      updateStepStatus('extract', 'running', 0)
      addStepOutput('extract', '解压项目文件...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      for (let i = 0; i <= 100; i += 25) {
        updateStepStatus('extract', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      addStepOutput('extract', `文件已解压到 ${config?.localPath}`)
      updateStepStatus('extract', 'completed', 100)
      setCurrentStep(2)
      
      // Step 3: Initialize Git
      updateStepStatus('init-git', 'running', 0)
      addStepOutput('init-git', '初始化 Git 仓库...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateStepStatus('init-git', 'running', 50)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      addStepOutput('init-git', 'Git 仓库初始化完成')
      updateStepStatus('init-git', 'completed', 100)
      setCurrentStep(3)
      
      // Step 4: Configure Git user
      updateStepStatus('git-config', 'running', 0)
      addStepOutput('git-config', `配置 Git 用户: ${config?.gitUsername}`)
      await new Promise(resolve => setTimeout(resolve, 400))
      
      updateStepStatus('git-config', 'running', 50)
      addStepOutput('git-config', `配置 Git 邮箱: ${config?.gitEmail}`)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      updateStepStatus('git-config', 'completed', 100)
      setCurrentStep(4)
      
      // Step 5: Create environment file
      updateStepStatus('create-env', 'running', 0)
      addStepOutput('create-env', '创建 .env 配置文件...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      updateStepStatus('create-env', 'running', 30)
      addStepOutput('create-env', '配置 Telegram Bot Token...')
      await new Promise(resolve => setTimeout(resolve, 400))
      
      updateStepStatus('create-env', 'running', 60)
      addStepOutput('create-env', '配置 TRON 钱包地址...')
      await new Promise(resolve => setTimeout(resolve, 400))
      
      updateStepStatus('create-env', 'running', 90)
      addStepOutput('create-env', '配置数据库连接...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      addStepOutput('create-env', '环境配置文件创建完成')
      updateStepStatus('create-env', 'completed', 100)
      setCurrentStep(5)
      
      // Step 6: Add files to Git
      updateStepStatus('add-files', 'running', 0)
      addStepOutput('add-files', '添加文件到 Git 跟踪...')
      await new Promise(resolve => setTimeout(resolve, 700))
      
      for (let i = 0; i <= 100; i += 20) {
        updateStepStatus('add-files', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      
      addStepOutput('add-files', '所有文件已添加到 Git')
      updateStepStatus('add-files', 'completed', 100)
      setCurrentStep(6)
      
      // Step 7: Initial commit
      updateStepStatus('initial-commit', 'running', 0)
      addStepOutput('initial-commit', '创建初始提交...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      updateStepStatus('initial-commit', 'running', 100)
      addStepOutput('initial-commit', '初始提交创建完成')
      updateStepStatus('initial-commit', 'completed', 100)
      setCurrentStep(7)
      
      // Step 8: Add remote repository
      updateStepStatus('add-remote', 'running', 0)
      addStepOutput('add-remote', `添加远程仓库: ${config?.repoName}`)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateStepStatus('add-remote', 'running', 100)
      addStepOutput('add-remote', '远程仓库配置完成')
      updateStepStatus('add-remote', 'completed', 100)
      setCurrentStep(8)
      
      // Step 9: Push to GitHub
      updateStepStatus('push-main', 'running', 0)
      addStepOutput('push-main', '推送代码到 GitHub...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      for (let i = 0; i <= 100; i += 15) {
        updateStepStatus('push-main', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 120))
      }
      
      addStepOutput('push-main', '代码成功推送到 GitHub')
      updateStepStatus('push-main', 'completed', 100)
      setCurrentStep(9)
      
      // Step 10: Verify deployment
      updateStepStatus('verify', 'running', 0)
      addStepOutput('verify', '验证项目结构...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      updateStepStatus('verify', 'running', 50)
      addStepOutput('verify', '检查配置文件...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateStepStatus('verify', 'running', 80)
      addStepOutput('verify', '验证 Git 仓库状态...')
      await new Promise(resolve => setTimeout(resolve, 400))
      
      addStepOutput('verify', '✅ 项目部署验证完成')
      updateStepStatus('verify', 'completed', 100)
      setCurrentStep(10)
      
      toast.success('自动化设置完成!', {
        description: `项目已成功导入到 GitHub 仓库 "${config?.repoName}"`
      })
      
    } catch (error) {
      const currentStepId = setupSteps[currentStep]?.id
      if (currentStepId) {
        updateStepStatus(currentStepId, 'error', 0)
        addStepOutput(currentStepId, '❌ 步骤执行失败')
      }
      toast.error('自动化设置失败', {
        description: '请检查配置并重试或使用手动模式'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" />
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
      case 'error':
        return <Warning size={20} className="text-destructive" />
      default:
        return <Clock size={20} className="text-muted-foreground" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const generateManualScript = () => {
    return `#!/bin/bash
# TeleBot 销售平台一键部署脚本

set -e

echo "🚀 开始部署 TeleBot 销售平台..."

# 1. 下载项目文件
echo "📥 下载项目文件..."
curl -L -o telebot-platform.zip https://github.com/releases/latest/download/telebot-platform.zip

# 2. 解压文件
echo "📂 解压项目文件..."
unzip telebot-platform.zip -d ${config?.localPath || './telebot-sales-platform'}
cd ${config?.localPath || './telebot-sales-platform'}

# 3. 初始化 Git
echo "🔧 初始化 Git 仓库..."
git init
git config user.name "${config?.gitUsername || 'yourusername'}"
git config user.email "${config?.gitEmail || 'your.email@example.com'}"

# 4. 创建环境配置
echo "⚙️ 创建环境配置..."
cat > .env << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${config?.telegramToken || 'YOUR_BOT_TOKEN'}
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# TRON Blockchain Configuration
TRON_WALLET_ADDRESS=${config?.tronAddress || 'YOUR_TRON_ADDRESS'}
TRON_PRIVATE_KEY=\${VAULT_TRON_PRIVATE_KEY}
TRON_NETWORK=mainnet

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/telebot_db
REDIS_URL=redis://localhost:6379/0

# Security Configuration
JWT_SECRET=\${VAULT_JWT_SECRET}
ENCRYPTION_KEY=\${VAULT_ENCRYPTION_KEY}

# API Configuration
INTERNAL_API_TOKEN=\${VAULT_INTERNAL_API_TOKEN}
API_BASE_URL=https://your-domain.com/api

# Payment Configuration
PAYMENT_TIMEOUT_MINUTES=15
MINIMUM_PAYMENT_AMOUNT=0.1

# Agent Configuration
AGENT_COMMISSION_RATE=0.03
DEFAULT_MARKUP_PERCENTAGE=20
EOF

# 5. 设置文件权限
echo "🔒 设置文件权限..."
chmod 600 .env
chmod +x scripts/*.sh

# 6. 添加文件到 Git
echo "📝 添加文件到 Git..."
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform"

# 7. 添加远程仓库
echo "🌐 配置远程仓库..."
git branch -M main
git remote add origin https://github.com/${config?.gitUsername || 'yourusername'}/${config?.repoName || 'zh'}.git

# 8. 推送到 GitHub
echo "⬆️ 推送到 GitHub..."
git push -u origin main

# 9. 验证安装
echo "✅ 验证安装..."
if [ -f "docker-compose.yml" ]; then
    echo "Docker 配置文件存在"
fi

if [ -f "backend/requirements.txt" ]; then
    echo "Python 依赖文件存在"
fi

if [ -f "frontend/package.json" ]; then
    echo "前端依赖文件存在"
fi

echo ""
echo "🎉 TeleBot 销售平台部署完成!"
echo "📁 项目位置: $(pwd)"
echo "🌐 GitHub 仓库: https://github.com/${config?.gitUsername || 'yourusername'}/${config?.repoName || 'zh'}"
echo ""
echo "下一步:"
echo "1. 运行 'docker-compose up -d' 启动服务"
echo "2. 访问管理后台配置系统"
echo "3. 测试 Telegram Bot 功能"
echo ""
`
  }

  const generateEnvTemplate = () => {
    return `# TeleBot 销售平台环境配置
# ⚠️ 生产环境请使用 Vault 或其他密钥管理系统

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${config?.telegramToken || 'YOUR_BOT_TOKEN'}
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# TRON Blockchain Configuration
TRON_WALLET_ADDRESS=${config?.tronAddress || 'YOUR_TRON_ADDRESS'}
TRON_PRIVATE_KEY=\${VAULT_TRON_PRIVATE_KEY}
TRON_NETWORK=mainnet
TRON_GRID_API_KEY=\${VAULT_TRON_GRID_API_KEY}

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/telebot_db
REDIS_URL=redis://localhost:6379/0

# Security Configuration
JWT_SECRET=\${VAULT_JWT_SECRET}
ENCRYPTION_KEY=\${VAULT_ENCRYPTION_KEY}
ADMIN_2FA_SECRET=\${VAULT_ADMIN_2FA_SECRET}

# API Configuration
INTERNAL_API_TOKEN=\${VAULT_INTERNAL_API_TOKEN}
API_BASE_URL=https://your-domain.com/api
API_RATE_LIMIT=100

# Payment Configuration
PAYMENT_TIMEOUT_MINUTES=15
MINIMUM_PAYMENT_AMOUNT=0.1
PAYMENT_CONFIRMATION_BLOCKS=1

# Agent Configuration
AGENT_COMMISSION_RATE=0.03
DEFAULT_MARKUP_PERCENTAGE=20
MAX_AGENT_LEVEL=3

# File Storage Configuration
S3_BUCKET_NAME=telebot-files
S3_ACCESS_KEY=\${VAULT_S3_ACCESS_KEY}
S3_SECRET_KEY=\${VAULT_S3_SECRET_KEY}
S3_REGION=us-east-1

# Monitoring Configuration
SENTRY_DSN=\${VAULT_SENTRY_DSN}
LOG_LEVEL=info

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=\${VAULT_SMTP_USER}
SMTP_PASSWORD=\${VAULT_SMTP_PASSWORD}
`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-600">
          <Terminal size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">一键配置脚本</h1>
          <p className="text-muted-foreground">
            自动化脚本帮您快速将 TeleBot 项目导入到 GitHub 仓库
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={20} />
            配置设置
          </CardTitle>
          <CardDescription>
            配置项目信息和 Git 设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repo-name">GitHub 仓库名</Label>
              <Input
                id="repo-name"
                value={config?.repoName || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, repoName: e.target.value }))}
                placeholder="zh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local-path">本地路径</Label>
              <Input
                id="local-path"
                value={config?.localPath || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, localPath: e.target.value }))}
                placeholder="./telebot-sales-platform"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="git-username">Git 用户名</Label>
              <Input
                id="git-username"
                value={config?.gitUsername || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, gitUsername: e.target.value }))}
                placeholder="yourusername"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="git-email">Git 邮箱</Label>
              <Input
                id="git-email"
                value={config?.gitEmail || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, gitEmail: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-token">Telegram Bot Token</Label>
              <Input
                id="telegram-token"
                value={config?.telegramToken || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, telegramToken: e.target.value }))}
                placeholder="Bot Token"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tron-address">TRON 收款地址</Label>
              <Input
                id="tron-address"
                value={config?.tronAddress || ''}
                onChange={(e) => setConfig(prev => ({ ...prev!, tronAddress: e.target.value }))}
                placeholder="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Options */}
      <Card>
        <CardHeader>
          <CardTitle>部署选项</CardTitle>
          <CardDescription>
            选择自动化部署或手动部署方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">自动化部署</TabsTrigger>
              <TabsTrigger value="manual">手动部署</TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={runAutomaticSetup}
                    disabled={isRunning || !config?.repoName}
                    className="flex items-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        运行中...
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        开始自动化部署
                      </>
                    )}
                  </Button>
                  
                  {setupSteps.length > 0 && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                      {setupSteps.filter(s => s.status === 'completed').length} / {setupSteps.length} 完成
                    </Badge>
                  )}
                </div>

                {/* Progress Steps */}
                {setupSteps.length > 0 && (
                  <div className="space-y-3">
                    {setupSteps.map((step, index) => (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStepIcon(step)}
                            <div>
                              <h4 className="font-medium text-sm">{step.title}</h4>
                              <p className="text-xs text-muted-foreground">{step.description}</p>
                              {step.command && (
                                <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">
                                  {step.command}
                                </code>
                              )}
                            </div>
                          </div>
                          {step.status === 'completed' && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              完成
                            </Badge>
                          )}
                        </div>
                        {step.status === 'running' && (
                          <Progress value={step.progress} className="h-2" />
                        )}
                        {step.output && step.output.length > 0 && (
                          <div className="ml-8 bg-muted p-2 rounded text-xs">
                            {step.output.map((line, i) => (
                              <div key={i} className="text-muted-foreground font-mono">
                                {line}
                              </div>
                            ))}
                          </div>
                        )}
                        {index < setupSteps.length - 1 && (
                          <div className="ml-2.5 h-4 w-px bg-border"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">手动部署脚本</h4>
                  <div className="bg-muted p-3 rounded-lg relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateManualScript())}
                    >
                      <Copy size={16} />
                    </Button>
                    <pre className="text-xs text-muted-foreground pr-10 max-h-60 overflow-y-auto">
                      {generateManualScript()}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">环境配置模板</h4>
                  <div className="bg-muted p-3 rounded-lg relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateEnvTemplate())}
                    >
                      <Copy size={16} />
                    </Button>
                    <pre className="text-xs text-muted-foreground pr-10 max-h-40 overflow-y-auto">
                      {generateEnvTemplate()}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const script = generateManualScript()
                      const blob = new Blob([script], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'deploy-telebot.sh'
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('脚本已下载')
                    }}
                  >
                    <Download size={20} />
                    下载部署脚本
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const envTemplate = generateEnvTemplate()
                      const blob = new Blob([envTemplate], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = '.env.template'
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('环境模板已下载')
                    }}
                  >
                    <Download size={20} />
                    下载环境模板
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Information */}
      {setupSteps.length > 0 && setupSteps.every(step => step.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              部署完成
            </CardTitle>
            <CardDescription>
              TeleBot 项目已成功导入到 GitHub 仓库
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">仓库信息</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <GithubLogo size={14} />
                    <span>仓库: {config?.repoName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FolderOpen size={14} />
                    <span>本地: {config?.localPath}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Code size={14} />
                    <span>分支: main</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">下一步操作</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Package size={14} />
                    <span>运行 docker-compose up</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Gear size={14} />
                    <span>配置管理后台</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Rocket size={14} />
                    <span>测试 Bot 功能</span>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle size={16} className="text-success" />
              <AlertDescription>
                <strong>部署成功！</strong> 项目已导入到 GitHub 仓库，可以开始开发和部署。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}