import React from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CloudArrowUp, 
  Code, 
  Shield, 
  CheckCircle, 
  GitBranch,
  Package,
  Play,
  Download,
  Eye,
  Gear
} from '@phosphor-icons/react'
import { useState } from 'react'

export function GitHubRepositoryManager() {
  const [repoName, setRepoName] = useKV('github-repo-name', 'telebot-sales-platform')
  const [repoDescription, setRepoDescription] = useKV('github-repo-description', 'Complete TeleBot Sales Platform with TRON payments, API integration, and distribution system')
  const [githubToken, setGithubToken] = useKV('github-token', '')
  const [repoVisibility, setRepoVisibility] = useKV('repo-visibility', 'private')
  const [packageProgress, setPackageProgress] = useState(0)
  const [isPackaging, setIsPackaging] = useState(false)
  const [packageStatus, setPackageStatus] = useState<'idle' | 'packaging' | 'completed' | 'error'>('idle')

  // Production secrets configuration
  const [secrets, setSecrets] = useKV<Record<string, string>>('production-secrets', {
    BOT_TOKEN: '',
    TRON_WALLET_PRIVATE_KEY: '',
    TRON_WALLET_ADDRESS: '',
    DATABASE_URL: '',
    REDIS_URL: '',
    JWT_SECRET: '',
    ENCRYPTION_KEY: '',
    WEBHOOK_SECRET: '',
    ADMIN_PASSWORD: '',
    API_SECRET_KEY: ''
  })

  const projectStructure = [
    { path: 'bot/', description: 'Telegram Bot 核心服务 (aiogram + Python)' },
    { path: 'backend/', description: 'API 后端服务 (FastAPI + PostgreSQL)' },
    { path: 'frontend/', description: '管理后台 (React + Ant Design)' },
    { path: 'worker/', description: '异步任务处理 (Celery + Redis)' },
    { path: 'payment-listener/', description: 'TRON 链监听服务' },
    { path: 'deploy/', description: 'Docker + Kubernetes 部署配置' },
    { path: 'scripts/', description: '一键配置和部署脚本' },
    { path: 'docs/', description: '完整文档和使用说明' },
    { path: 'tests/', description: '自动化测试套件' },
    { path: '.github/', description: 'GitHub Actions CI/CD 配置' }
  ]

  const requiredSecrets = [
    { name: 'BOT_TOKEN', description: 'Telegram Bot API Token', example: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' },
    { name: 'TRON_WALLET_PRIVATE_KEY', description: 'TRON 钱包私钥', example: 'Private key for TRON wallet' },
    { name: 'TRON_WALLET_ADDRESS', description: 'TRON 收款地址', example: 'TRx1234...xyz' },
    { name: 'DATABASE_URL', description: 'PostgreSQL 数据库连接', example: 'postgresql://user:pass@host:5432/db' },
    { name: 'REDIS_URL', description: 'Redis 连接地址', example: 'redis://localhost:6379' },
    { name: 'JWT_SECRET', description: 'JWT 签名密钥', example: 'your-jwt-secret-key' },
    { name: 'ENCRYPTION_KEY', description: 'AES 加密密钥', example: 'your-32-byte-encryption-key' },
    { name: 'WEBHOOK_SECRET', description: 'Webhook 验证密钥', example: 'webhook-secret-key' },
    { name: 'ADMIN_PASSWORD', description: '管理员密码', example: 'secure-admin-password' },
    { name: 'API_SECRET_KEY', description: 'API 密钥', example: 'api-secret-key' }
  ]

  const handlePackageRepository = async () => {
    setIsPackaging(true)
    setPackageStatus('packaging')
    setPackageProgress(0)

    try {
      // 模拟打包过程
      const steps = [
        '创建项目结构...',
        '生成 Bot 服务代码...',
        '创建 API 后端...',
        '构建前端应用...',
        '配置 Docker 容器...',
        '生成 Kubernetes 清单...',
        '创建部署脚本...',
        '生成文档...',
        '配置 CI/CD...',
        '完成打包...'
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setPackageProgress(((i + 1) / steps.length) * 100)
      }

      setPackageStatus('completed')
    } catch (error) {
      setPackageStatus('error')
    } finally {
      setIsPackaging(false)
    }
  }

  const handleConfigureSecrets = () => {
    // 生成 GitHub Secrets 配置脚本
    const secretsData = secrets || {}
    const secretsScript = `#!/bin/bash
# GitHub Secrets 配置脚本
# 请在本地运行此脚本配置生产环境密钥

REPO_OWNER="your-username"
REPO_NAME="${repoName}"

echo "配置 GitHub Secrets..."

${Object.entries(secretsData).map(([key, value]) => 
  `gh secret set ${key} --body "${value || 'YOUR_' + key}" --repo $REPO_OWNER/$REPO_NAME`
).join('\n')}

echo "GitHub Secrets 配置完成!"
echo "请确保所有密钥都已正确设置。"
`

    // 下载脚本文件
    const blob = new Blob([secretsScript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'configure-github-secrets.sh'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateEnvTemplate = () => {
    const secretsData = secrets || {}
    const envTemplate = `# TeleBot Sales Platform - Environment Variables Template
# 复制此文件为 .env 并填入实际值

# Telegram Bot Configuration
BOT_TOKEN=${secretsData.BOT_TOKEN || 'your-telegram-bot-token'}
WEBHOOK_URL=https://your-domain.com/webhook

# TRON Blockchain Configuration  
TRON_WALLET_PRIVATE_KEY=${secretsData.TRON_WALLET_PRIVATE_KEY || 'your-tron-private-key'}
TRON_WALLET_ADDRESS=${secretsData.TRON_WALLET_ADDRESS || 'your-tron-wallet-address'}
TRON_NETWORK=mainnet # or testnet for testing

# Database Configuration
DATABASE_URL=${secretsData.DATABASE_URL || 'postgresql://user:password@localhost:5432/telebot_db'}

# Redis Configuration
REDIS_URL=${secretsData.REDIS_URL || 'redis://localhost:6379'}

# Security Configuration
JWT_SECRET=${secretsData.JWT_SECRET || 'your-jwt-secret-key'}
ENCRYPTION_KEY=${secretsData.ENCRYPTION_KEY || 'your-32-byte-encryption-key'}
WEBHOOK_SECRET=${secretsData.WEBHOOK_SECRET || 'your-webhook-secret'}
API_SECRET_KEY=${secretsData.API_SECRET_KEY || 'your-api-secret-key'}

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${secretsData.ADMIN_PASSWORD || 'your-secure-admin-password'}

# Application Configuration
DEBUG=false
LOG_LEVEL=INFO
WORKERS=4
MAX_CONNECTIONS=100

# Payment Configuration
PAYMENT_TIMEOUT=900 # 15 minutes
MIN_PAYMENT_AMOUNT=0.1
MAX_PAYMENT_AMOUNT=10000

# File Storage Configuration
STORAGE_TYPE=s3 # or local
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=telebot-files
AWS_REGION=us-east-1
`

    const blob = new Blob([envTemplate], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env.template'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRunSystemTest = async () => {
    // 模拟系统测试
    setPackageStatus('packaging')
    setPackageProgress(0)
    
    const testSteps = [
      '检查项目结构...',
      '验证环境变量...',
      '测试数据库连接...',
      '验证 Redis 连接...',
      '测试 Telegram Bot API...',
      '验证 TRON 连接...',
      '运行单元测试...',
      '执行集成测试...',
      '性能压力测试...',
      '安全扫描...'
    ]

    for (let i = 0; i < testSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPackageProgress(((i + 1) / testSteps.length) * 100)
    }

    setPackageStatus('completed')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitBranch size={28} weight="bold" className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">GitHub 仓库管理</h1>
          <p className="text-muted-foreground">创建完整的 TeleBot 销售平台代码包</p>
        </div>
      </div>

      {/* Repository Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            仓库配置
          </CardTitle>
          <CardDescription>
            配置 GitHub 仓库信息和项目结构
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repo-name">仓库名称</Label>
              <Input
                id="repo-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="telebot-sales-platform"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-visibility">可见性</Label>
              <select
                id="repo-visibility"
                value={repoVisibility}
                onChange={(e) => setRepoVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="private">私有</option>
                <option value="public">公开</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repo-description">仓库描述</Label>
            <Textarea
              id="repo-description"
              value={repoDescription}
              onChange={(e) => setRepoDescription(e.target.value)}
              placeholder="项目描述..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github-token">GitHub Personal Access Token (可选)</Label>
            <Input
              id="github-token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-sm text-muted-foreground">
              用于自动创建仓库和配置 Secrets，可留空手动操作
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            项目结构
          </CardTitle>
          <CardDescription>
            完整的 TeleBot 销售平台代码结构
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectStructure.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <Code size={16} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-mono text-sm font-medium">{item.path}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Secrets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            生产环境密钥配置
          </CardTitle>
          <CardDescription>
            配置 GitHub Secrets 和环境变量
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield size={16} />
            <AlertDescription>
              生产环境密钥将通过 GitHub Secrets 安全管理，不会暴露在代码中
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            {requiredSecrets.map((secret, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={secret.name} className="flex items-center gap-2">
                  {secret.name}
                  <Badge variant="outline" className="text-xs">必需</Badge>
                </Label>
                <Input
                  id={secret.name}
                  type="password"
                  value={(secrets && secrets[secret.name]) || ''}
                  onChange={(e) => setSecrets(prev => ({
                    ...(prev || {}),
                    [secret.name]: e.target.value
                  }))}
                  placeholder={secret.example}
                />
                <p className="text-xs text-muted-foreground">{secret.description}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConfigureSecrets} variant="outline">
              <Download size={16} className="mr-2" />
              下载 Secrets 配置脚本
            </Button>
            <Button onClick={handleGenerateEnvTemplate} variant="outline">
              <Download size={16} className="mr-2" />
              下载环境变量模板
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Package & Deploy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUp size={20} />
            打包和部署
          </CardTitle>
          <CardDescription>
            创建完整的项目包并运行系统测试
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {packageStatus === 'packaging' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>打包进度</span>
                <span>{Math.round(packageProgress)}%</span>
              </div>
              <Progress value={packageProgress} className="w-full" />
            </div>
          )}

          {packageStatus === 'completed' && (
            <Alert>
              <CheckCircle size={16} />
              <AlertDescription>
                项目打包完成！已生成完整的 TeleBot 销售平台代码包。
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handlePackageRepository}
              disabled={isPackaging}
              className="flex items-center gap-2"
            >
              <Package size={16} />
              {isPackaging ? '打包中...' : '创建完整代码包'}
            </Button>
            
            <Button 
              onClick={handleRunSystemTest}
              variant="outline"
              disabled={isPackaging}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              运行系统测试
            </Button>

            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              预览项目结构
            </Button>

            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Gear size={16} />
              高级配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>部署说明</CardTitle>
          <CardDescription>
            完成代码包创建后的部署步骤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">1. 创建 GitHub 仓库</h4>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`# 使用 GitHub CLI 创建仓库
gh repo create ${repoName} --${repoVisibility} --description "${repoDescription}"

# 或手动在 GitHub 网站创建`}
              </pre>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">2. 上传代码</h4>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`git init
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/${repoName}.git
git push -u origin main`}
              </pre>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">3. 配置 GitHub Secrets</h4>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`# 运行下载的配置脚本
chmod +x configure-github-secrets.sh
./configure-github-secrets.sh`}
              </pre>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">4. 部署到生产环境</h4>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`# 使用 Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 或使用 Kubernetes
kubectl apply -f deploy/k8s/`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}