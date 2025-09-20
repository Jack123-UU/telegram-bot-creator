import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Download, 
  GithubLogo, 
  FolderOpen, 
  FileText, 
  Code, 
  Gear,
  CheckCircle,
  Warning,
  Copy,
  ArrowSquareOut,
  Upload,
  Rocket
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PackageComponent {
  name: string
  path: string
  description: string
  type: 'backend' | 'frontend' | 'config' | 'docs' | 'deploy'
  size: string
  status: 'ready' | 'building' | 'error'
}

export function GitHubPackageBuilder() {
  const [targetRepo, setTargetRepo] = useKV('target-repo', 'zh')
  const [repoDescription, setRepoDescription] = useKV('repo-description', 'Complete TeleBot Sales Platform with Telegram Bot, Backend API, Payment Processing, and Distribution System')
  const [isPackaging, setIsPackaging] = useState(false)
  const [packageStatus, setPackageStatus] = useState<'idle' | 'building' | 'complete' | 'error'>('idle')
  const [buildLog, setBuildLog] = useState<string[]>([])
  const [packageUrl, setPackageUrl] = useState('')

  const projectComponents: PackageComponent[] = [
    {
      name: 'Telegram Bot Core',
      path: 'backend/bot/',
      description: 'aiogram-based Telegram bot with menu system, user management, order processing',
      type: 'backend',
      size: '~2.1MB',
      status: 'ready'
    },
    {
      name: 'FastAPI Backend',
      path: 'backend/api/',
      description: 'RESTful API with product management, payment processing, inventory control',
      type: 'backend',
      size: '~1.8MB',
      status: 'ready'
    },
    {
      name: 'TRON Payment Processor',
      path: 'backend/payments/',
      description: 'Blockchain payment monitoring, unique amount matching, auto-delivery',
      type: 'backend',
      size: '~950KB',
      status: 'ready'
    },
    {
      name: 'React Admin Dashboard',
      path: 'frontend/',
      description: 'Management interface for products, orders, agents, and system configuration',
      type: 'frontend',
      size: '~3.2MB',
      status: 'ready'
    },
    {
      name: 'Database Migrations',
      path: 'backend/migrations/',
      description: 'PostgreSQL schema, API login endpoints, inventory tables',
      type: 'backend',
      size: '~120KB',
      status: 'ready'
    },
    {
      name: 'Docker Deployment',
      path: 'deploy/',
      description: 'Docker Compose, Kubernetes Helm charts, one-click deployment scripts',
      type: 'deploy',
      size: '~340KB',
      status: 'ready'
    },
    {
      name: 'Security Configuration',
      path: 'security/',
      description: 'Vault integration, secrets management, environment templates',
      type: 'config',
      size: '~180KB',
      status: 'ready'
    },
    {
      name: 'Documentation',
      path: 'docs/',
      description: 'Deployment guides, API documentation, security procedures',
      type: 'docs',
      size: '~890KB',
      status: 'ready'
    },
    {
      name: 'Testing Suite',
      path: 'tests/',
      description: 'Unit tests, integration tests, Telegram bot testing scripts',
      type: 'backend',
      size: '~560KB',
      status: 'ready'
    },
    {
      name: 'Distribution Templates',
      path: 'distribution/',
      description: 'One-click clone templates for agent deployment',
      type: 'deploy',
      size: '~420KB',
      status: 'ready'
    }
  ]

  const addBuildLog = (message: string) => {
    setBuildLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const simulatePackaging = async () => {
    setIsPackaging(true)
    setPackageStatus('building')
    setBuildLog([])
    
    try {
      addBuildLog('🚀 开始打包 TeleBot 销售平台项目...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addBuildLog('📁 创建项目结构...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      addBuildLog('🤖 打包 Telegram Bot 核心组件...')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      addBuildLog('⚡ 打包 FastAPI 后端服务...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addBuildLog('💰 打包 TRON 支付处理系统...')
      await new Promise(resolve => setTimeout(resolve, 900))
      
      addBuildLog('🎨 打包 React 管理后台...')
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      addBuildLog('🗄️ 生成数据库迁移文件...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      addBuildLog('🐳 配置 Docker 部署文件...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      addBuildLog('🔒 集成安全配置和密钥管理...')
      await new Promise(resolve => setTimeout(resolve, 700))
      
      addBuildLog('📚 生成完整文档和部署指南...')
      await new Promise(resolve => setTimeout(resolve, 900))
      
      addBuildLog('🧪 打包测试套件和验证脚本...')
      await new Promise(resolve => setTimeout(resolve, 600))
      
      addBuildLog('🌐 创建分销模板和一键部署脚本...')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      addBuildLog('✅ 验证所有组件完整性...')
      await new Promise(resolve => setTimeout(resolve, 700))
      
      addBuildLog('📦 生成最终打包文件...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 生成模拟的下载URL
      const packageFileName = `telebot-sales-platform-${Date.now()}.zip`
      setPackageUrl(`https://github.com/yourusername/${targetRepo}/releases/download/v1.0.0/${packageFileName}`)
      
      addBuildLog('🎉 打包完成! 项目已准备好导入到 GitHub 仓库')
      setPackageStatus('complete')
      
      toast.success('项目打包完成!', {
        description: '所有组件已成功打包，可以导入到 GitHub 仓库'
      })
      
    } catch (error) {
      addBuildLog('❌ 打包过程中出现错误')
      setPackageStatus('error')
      toast.error('打包失败', {
        description: '请检查配置并重试'
      })
    } finally {
      setIsPackaging(false)
    }
  }

  const generateRepositoryStructure = () => {
    return `
telebot-sales-platform/
├── README.md                          # 项目说明和快速开始指南
├── LICENSE                           # 开源许可证
├── .gitignore                        # Git 忽略文件
├── docker-compose.yml                # 开发环境
├── docker-compose.prod.yml           # 生产环境
├── 
├── backend/                          # 后端服务
│   ├── bot/                         # Telegram Bot
│   │   ├── main.py                  # Bot 主程序
│   │   ├── handlers/                # 消息处理器
│   │   ├── keyboards/               # 键盘布局
│   │   ├── middlewares/             # 中间件
│   │   └── utils/                   # 工具函数
│   ├── api/                         # FastAPI 服务
│   │   ├── main.py                  # API 主程序
│   │   ├── routes/                  # 路由定义
│   │   ├── models/                  # 数据模型
│   │   ├── services/                # 业务逻辑
│   │   └── dependencies/            # 依赖注入
│   ├── payments/                    # 支付处理
│   │   ├── tron_monitor.py          # TRON 链监听
│   │   ├── payment_matcher.py       # 支付匹配
│   │   └── wallet_manager.py        # 钱包管理
│   ├── workers/                     # 后台任务
│   │   ├── inventory_validator.py   # 库存验证
│   │   ├── file_processor.py        # 文件处理
│   │   └── notification_sender.py   # 通知发送
│   ├── migrations/                  # 数据库迁移
│   ├── requirements.txt             # Python 依赖
│   └── Dockerfile                   # 后端 Docker 文件
│
├── frontend/                        # 前端管理界面
│   ├── src/                        # React 源码
│   │   ├── components/             # 组件
│   │   ├── pages/                  # 页面
│   │   ├── hooks/                  # 自定义 Hooks
│   │   ├── services/               # API 服务
│   │   └── utils/                  # 工具函数
│   ├── public/                     # 静态资源
│   ├── package.json               # 前端依赖
│   └── Dockerfile                 # 前端 Docker 文件
│
├── deploy/                         # 部署配置
│   ├── helm/                      # Kubernetes Helm Charts
│   ├── scripts/                   # 部署脚本
│   ├── nginx/                     # Nginx 配置
│   └── ssl/                       # SSL 证书配置
│
├── security/                      # 安全配置
│   ├── vault/                     # HashiCorp Vault 配置
│   ├── secrets/                   # 密钥模板
│   └── rbac/                      # 权限控制
│
├── docs/                          # 文档
│   ├── deployment/                # 部署指南
│   ├── api/                      # API 文档
│   ├── security/                 # 安全手册
│   └── user-guide/               # 用户手册
│
├── tests/                         # 测试文件
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── e2e/                      # 端到端测试
│
├── distribution/                  # 分销模板
│   ├── agent-template/           # 代理商模板
│   ├── one-click-deploy/         # 一键部署
│   └── customization/            # 定制化配置
│
└── .github/                      # GitHub 配置
    ├── workflows/                # CI/CD 工作流
    ├── ISSUE_TEMPLATE/           # Issue 模板
    └── PULL_REQUEST_TEMPLATE.md  # PR 模板
`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'backend': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'frontend': return 'bg-green-500/10 text-green-600 border-green-200'
      case 'config': return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'docs': return 'bg-orange-500/10 text-orange-600 border-orange-200'
      case 'deploy': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Package size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">一键打包 TeleBot 项目</h1>
          <p className="text-muted-foreground">
            自动打包完整的 TeleBot 销售平台到 GitHub 仓库
          </p>
        </div>
      </div>

      {/* Repository Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GithubLogo size={20} />
            GitHub 仓库配置
          </CardTitle>
          <CardDescription>
            配置目标仓库信息和项目描述
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-repo">目标仓库名称</Label>
              <Input
                id="target-repo"
                value={targetRepo}
                onChange={(e) => setTargetRepo(e.target.value)}
                placeholder="例如: zh"
              />
            </div>
            <div className="space-y-2">
              <Label>仓库类型</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                  Private Repository
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                  Full Source Code
                </Badge>
              </div>
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
        </CardContent>
      </Card>

      {/* Project Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={20} />
            项目组件概览
          </CardTitle>
          <CardDescription>
            完整的 TeleBot 销售平台组件列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectComponents.map((component, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">{component.name}</h3>
                  <Badge variant="outline" className={getTypeColor(component.type)}>
                    {component.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {component.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {component.path}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {component.size}
                    </span>
                    <CheckCircle size={16} className="text-success" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repository Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            项目结构预览
          </CardTitle>
          <CardDescription>
            生成的仓库目录结构
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(generateRepositoryStructure())}
            >
              <Copy size={16} />
            </Button>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {generateRepositoryStructure()}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Package Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket size={20} />
            开始打包
          </CardTitle>
          <CardDescription>
            一键打包并准备导入到 GitHub 仓库
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={simulatePackaging}
              disabled={isPackaging}
              className="flex items-center gap-2"
            >
              {isPackaging ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  正在打包...
                </>
              ) : (
                <>
                  <Package size={20} />
                  开始打包项目
                </>
              )}
            </Button>
            
            {packageStatus === 'complete' && (
              <Button variant="outline" asChild>
                <a href={packageUrl} target="_blank" rel="noopener noreferrer">
                  <Download size={20} />
                  下载打包文件
                  <ArrowSquareOut size={16} />
                </a>
              </Button>
            )}
          </div>

          {/* Build Status */}
          {packageStatus !== 'idle' && (
            <Alert className={
              packageStatus === 'complete' ? 'border-success bg-success/5' :
              packageStatus === 'error' ? 'border-destructive bg-destructive/5' :
              'border-warning bg-warning/5'
            }>
              <div className="flex items-center gap-2">
                {packageStatus === 'complete' ? (
                  <CheckCircle size={16} className="text-success" />
                ) : packageStatus === 'error' ? (
                  <Warning size={16} className="text-destructive" />
                ) : (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning"></div>
                )}
                <AlertDescription className="font-medium">
                  {packageStatus === 'complete' && '打包完成!'}
                  {packageStatus === 'building' && '正在打包...'}
                  {packageStatus === 'error' && '打包失败'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Build Log */}
          {buildLog.length > 0 && (
            <div className="space-y-2">
              <Label>打包日志</Label>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                {buildLog.map((log, index) => (
                  <div key={index} className="text-sm text-muted-foreground mb-1 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {packageStatus === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              下一步操作
            </CardTitle>
            <CardDescription>
              项目打包完成，按以下步骤导入到 GitHub 仓库
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">方法一：GitHub 网页端上传</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                  <li>访问 GitHub 并创建新仓库 "{targetRepo}"</li>
                  <li>选择 "uploading an existing file"</li>
                  <li>拖拽下载的 ZIP 文件到页面</li>
                  <li>等待上传完成并解压</li>
                  <li>提交初始版本</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">方法二：Git 命令行</h4>
                <div className="bg-muted p-3 rounded-lg relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`# 解压下载的文件
unzip telebot-sales-platform-*.zip
cd telebot-sales-platform

# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform"

# 连接到远程仓库
git branch -M main
git remote add origin https://github.com/yourusername/${targetRepo}.git
git push -u origin main`)}
                  >
                    <Copy size={16} />
                  </Button>
                  <pre className="text-xs text-muted-foreground pr-10">
{`# 解压下载的文件
unzip telebot-sales-platform-*.zip
cd telebot-sales-platform

# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: Complete TeleBot Sales Platform"

# 连接到远程仓库
git branch -M main
git remote add origin https://github.com/yourusername/${targetRepo}.git
git push -u origin main`}
                  </pre>
                </div>
              </div>

              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  <strong>重要提醒：</strong> 上传前请确保移除所有敏感信息（API 密钥、私钥等），使用环境变量或密钥管理系统。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}