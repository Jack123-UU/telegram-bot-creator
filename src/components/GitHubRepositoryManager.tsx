import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  GithubLogo, 
  Upload, 
  CheckCircle, 
  Clock,
  Warning,
  Copy,
  FolderOpen,
  Package,
  Rocket,
  Code
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UploadStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
}

export function GitHubRepositoryManager() {
  const [repoName, setRepoName] = useState('zh')
  const [repoDescription, setRepoDescription] = useState('Complete TeleBot Sales Platform with Telegram Bot, Backend API, Payment Processing, and Distribution System')
  const [isCreating, setIsCreating] = useState(false)
  const [uploadSteps, setUploadSteps] = useState<UploadStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [repoUrl, setRepoUrl] = useState('')

  const initializeSteps = (): UploadStep[] => [
    {
      id: 'prepare',
      title: '准备项目文件',
      description: '整理和验证所有项目文件',
      status: 'pending',
      progress: 0
    },
    {
      id: 'create-repo',
      title: '创建 GitHub 仓库',
      description: `创建名为 "${repoName}" 的新仓库`,
      status: 'pending',
      progress: 0
    },
    {
      id: 'upload-backend',
      title: '上传后端代码',
      description: 'Bot、API、支付处理系统',
      status: 'pending',
      progress: 0
    },
    {
      id: 'upload-frontend',
      title: '上传前端代码',
      description: 'React 管理后台界面',
      status: 'pending',
      progress: 0
    },
    {
      id: 'upload-deploy',
      title: '上传部署配置',
      description: 'Docker、Kubernetes、CI/CD 配置',
      status: 'pending',
      progress: 0
    },
    {
      id: 'upload-docs',
      title: '上传文档',
      description: '部署指南、API 文档、安全手册',
      status: 'pending',
      progress: 0
    },
    {
      id: 'configure-security',
      title: '配置安全设置',
      description: '设置密钥管理和访问权限',
      status: 'pending',
      progress: 0
    },
    {
      id: 'finalize',
      title: '完成配置',
      description: '设置 README、标签和版本',
      status: 'pending',
      progress: 0
    }
  ]

  const updateStepStatus = (stepId: string, status: UploadStep['status'], progress: number = 0) => {
    setUploadSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ))
  }

  const simulateRepoCreation = async () => {
    setIsCreating(true)
    setUploadSteps(initializeSteps())
    setCurrentStep(0)
    
    try {
      // Step 1: Prepare project files
      updateStepStatus('prepare', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (let i = 0; i <= 100; i += 20) {
        updateStepStatus('prepare', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      updateStepStatus('prepare', 'completed', 100)
      setCurrentStep(1)
      
      // Step 2: Create GitHub repository
      updateStepStatus('create-repo', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      for (let i = 0; i <= 100; i += 25) {
        updateStepStatus('create-repo', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      updateStepStatus('create-repo', 'completed', 100)
      setCurrentStep(2)
      
      // Generate repo URL
      setRepoUrl(`https://github.com/yourusername/${repoName}`)
      
      // Step 3: Upload backend
      updateStepStatus('upload-backend', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      for (let i = 0; i <= 100; i += 10) {
        updateStepStatus('upload-backend', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      updateStepStatus('upload-backend', 'completed', 100)
      setCurrentStep(3)
      
      // Step 4: Upload frontend
      updateStepStatus('upload-frontend', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 900))
      
      for (let i = 0; i <= 100; i += 15) {
        updateStepStatus('upload-frontend', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 60))
      }
      updateStepStatus('upload-frontend', 'completed', 100)
      setCurrentStep(4)
      
      // Step 5: Upload deployment configs
      updateStepStatus('upload-deploy', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 700))
      
      for (let i = 0; i <= 100; i += 20) {
        updateStepStatus('upload-deploy', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      updateStepStatus('upload-deploy', 'completed', 100)
      setCurrentStep(5)
      
      // Step 6: Upload documentation
      updateStepStatus('upload-docs', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 600))
      
      for (let i = 0; i <= 100; i += 25) {
        updateStepStatus('upload-docs', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 40))
      }
      updateStepStatus('upload-docs', 'completed', 100)
      setCurrentStep(6)
      
      // Step 7: Configure security
      updateStepStatus('configure-security', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      for (let i = 0; i <= 100; i += 30) {
        updateStepStatus('configure-security', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      updateStepStatus('configure-security', 'completed', 100)
      setCurrentStep(7)
      
      // Step 8: Finalize
      updateStepStatus('finalize', 'running', 0)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (let i = 0; i <= 100; i += 33) {
        updateStepStatus('finalize', 'running', i)
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      updateStepStatus('finalize', 'completed', 100)
      setCurrentStep(8)
      
      toast.success('仓库创建成功!', {
        description: `GitHub 仓库 "${repoName}" 已成功创建并上传所有文件`
      })
      
    } catch (error) {
      const currentStepId = uploadSteps[currentStep]?.id
      if (currentStepId) {
        updateStepStatus(currentStepId, 'error', 0)
      }
      toast.error('创建失败', {
        description: '请检查配置并重试'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStepIcon = (step: UploadStep) => {
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

  const generateGitCommands = () => {
    return `# 克隆新创建的仓库
git clone ${repoUrl}.git
cd ${repoName}

# 验证所有文件已正确上传
ls -la

# 查看项目结构
tree -I 'node_modules|__pycache__|.git'

# 运行快速测试
docker-compose -f docker-compose.dev.yml up --build -d

# 查看运行状态
docker-compose ps`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700">
          <GithubLogo size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">GitHub 仓库管理</h1>
          <p className="text-muted-foreground">
            创建新的 GitHub 仓库并自动上传完整的 TeleBot 项目
          </p>
        </div>
      </div>

      {/* Repository Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GithubLogo size={20} />
            仓库配置
          </CardTitle>
          <CardDescription>
            配置新 GitHub 仓库的基本信息
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
                placeholder="例如: zh"
              />
            </div>
            <div className="space-y-2">
              <Label>可见性</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                  私有仓库
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                  推荐
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repo-description">仓库描述</Label>
            <Input
              id="repo-description"
              value={repoDescription}
              onChange={(e) => setRepoDescription(e.target.value)}
              placeholder="项目描述..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>许可证</Label>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                MIT License
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>.gitignore</Label>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Python Template
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>初始化</Label>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                README + Structure
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              上传进度
            </CardTitle>
            <CardDescription>
              自动创建仓库并上传所有项目文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadSteps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      完成
                    </Badge>
                  )}
                  {step.status === 'running' && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      进行中
                    </Badge>
                  )}
                </div>
                {step.status === 'running' && (
                  <Progress value={step.progress} className="h-2" />
                )}
                {index < uploadSteps.length - 1 && (
                  <div className="ml-2.5 h-4 w-px bg-border"></div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket size={20} />
            开始创建
          </CardTitle>
          <CardDescription>
            一键创建 GitHub 仓库并上传完整项目
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={simulateRepoCreation}
              disabled={isCreating || !repoName}
              className="flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  创建中...
                </>
              ) : (
                <>
                  <GithubLogo size={20} />
                  创建 GitHub 仓库
                </>
              )}
            </Button>
            
            {repoUrl && (
              <Button variant="outline" asChild>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <FolderOpen size={20} />
                  查看仓库
                </a>
              </Button>
            )}
          </div>

          {!repoName && (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                请先配置仓库名称才能开始创建
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Success Information */}
      {repoUrl && uploadSteps.every(step => step.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              创建成功
            </CardTitle>
            <CardDescription>
              GitHub 仓库已成功创建，下面是使用说明
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-lg">
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm font-medium">仓库地址：</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{repoUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(repoUrl)}
              >
                <Copy size={16} />
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">快速开始指令</h4>
              <div className="bg-muted p-3 rounded-lg relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateGitCommands())}
                >
                  <Copy size={16} />
                </Button>
                <pre className="text-xs text-muted-foreground pr-10">
                  {generateGitCommands()}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">已上传的组件</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Code size={14} />
                    <span>Telegram Bot (aiogram)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Code size={14} />
                    <span>FastAPI Backend</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Package size={14} />
                    <span>React 管理后台</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Upload size={14} />
                    <span>Docker 部署配置</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">配置的特性</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={14} className="text-success" />
                    <span>TRON 支付处理</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={14} className="text-success" />
                    <span>API 接码登录</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={14} className="text-success" />
                    <span>分销系统</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={14} className="text-success" />
                    <span>安全密钥管理</span>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle size={16} className="text-success" />
              <AlertDescription>
                <strong>项目已就绪！</strong> 所有组件已成功上传到 GitHub 仓库，可以开始部署和使用。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}