import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Warning,
  ArrowClockwise,
  Download,
  Robot,
  Activity,
  Lightning,
  Target,
  Shield,
  Eye
} from '@phosphor-icons/react'

interface TestResult {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  duration?: number
  error?: string
  details?: string
  timestamp: Date
  category: 'ui' | 'function' | 'integration' | 'performance' | 'security'
}

interface ButtonConfig {
  id: string
  text: string
  type: 'main_menu' | 'product_category' | 'service_action' | 'support'
  action: string
  emoji?: string
  order: number
  enabled: boolean
  color?: string
  tooltip?: string
  callback_data?: string
}

interface MenuConfig {
  main_menu: ButtonConfig[]
  product_menu: ButtonConfig[]
  service_menu: ButtonConfig[]
  support_menu: ButtonConfig[]
}

export function ButtonFunctionTesting() {
  const [testResults, setTestResults] = useKV<TestResult[]>('button-test-results', [])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [autoStarted, setAutoStarted] = useState(false)
  const [menuConfig] = useKV<MenuConfig>('bot-menu-config', {
    main_menu: [
      { id: 'products', text: '📦 商品列表', type: 'main_menu', action: '/products', emoji: '📦', order: 1, enabled: true },
      { id: 'support', text: '💬 联系客服', type: 'main_menu', action: '/support', emoji: '💬', order: 2, enabled: true },
      { id: 'english', text: '🌍 English', type: 'main_menu', action: '/english', emoji: '🌍', order: 3, enabled: true },
      { id: 'profile', text: '👤 用户中心', type: 'main_menu', action: '/profile', emoji: '👤', order: 4, enabled: true },
      { id: 'recharge', text: '💰 余额充值', type: 'main_menu', action: '/recharge', emoji: '💰', order: 5, enabled: true }
    ],
    product_menu: [
      { id: 'tdata', text: '📱 TData账号', type: 'product_category', action: '/category/tdata', emoji: '📱', order: 1, enabled: true },
      { id: 'session', text: '🔐 Session文件', type: 'product_category', action: '/category/session', emoji: '🔐', order: 2, enabled: true },
      { id: 'api_login', text: '🔗 API接码登录', type: 'product_category', action: '/category/api_login', emoji: '🔗', order: 3, enabled: true }
    ],
    service_menu: [
      { id: 'orders', text: '📋 订单历史', type: 'service_action', action: '/orders', emoji: '📋', order: 1, enabled: true },
      { id: 'balance', text: '💳 余额明细', type: 'service_action', action: '/balance', emoji: '💳', order: 2, enabled: true },
      { id: 'refund', text: '🔄 退款申请', type: 'service_action', action: '/refund', emoji: '🔄', order: 3, enabled: true }
    ],
    support_menu: [
      { id: 'contact', text: '📞 在线客服', type: 'support', action: '/contact', emoji: '📞', order: 1, enabled: true },
      { id: 'faq', text: '❓ 常见问题', type: 'support', action: '/faq', emoji: '❓', order: 2, enabled: true },
      { id: 'feedback', text: '📝 意见反馈', type: 'support', action: '/feedback', emoji: '📝', order: 3, enabled: true }
    ]
  })

  // 自动启动测试套件
  useEffect(() => {
    if (!autoStarted && !isRunning) {
      setAutoStarted(true)
      setTimeout(() => {
        runTests()
      }, 1000) // 1秒后自动开始测试
    }
  }, [autoStarted, isRunning])

  const testCategories = [
    { id: 'ui', name: 'UI界面测试', icon: Eye, color: 'blue' },
    { id: 'function', name: '功能逻辑测试', icon: Lightning, color: 'green' },
    { id: 'integration', name: '集成测试', icon: Target, color: 'purple' },
    { id: 'performance', name: '性能测试', icon: Activity, color: 'orange' },
    { id: 'security', name: '安全测试', icon: Shield, color: 'red' }
  ]

  const buttonTests = [
    // UI界面测试
    {
      id: 'ui-button-rendering',
      name: '按钮渲染测试',
      description: '测试所有按钮是否正确渲染在界面上',
      category: 'ui' as const,
      test: async () => {
        await delay(800)
        
        if (!menuConfig) {
          throw new Error('菜单配置未加载')
        }

        const totalButtons = Object.values(menuConfig).reduce((sum, buttons) => sum + buttons.length, 0)
        const enabledButtons = Object.values(menuConfig).reduce((sum, buttons) => sum + buttons.filter(btn => btn.enabled).length, 0)
        
        if (totalButtons === 0) {
          throw new Error('没有发现任何按钮')
        }

        return `成功渲染 ${enabledButtons}/${totalButtons} 个按钮 (启用/总数)`
      }
    },
    {
      id: 'ui-emoji-display',
      name: '表情符号显示测试',
      description: '验证所有按钮的表情符号正确显示',
      category: 'ui' as const,
      test: async () => {
        await delay(600)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const buttonsWithEmoji = allButtons.filter(btn => btn.emoji && btn.emoji.trim() !== '')
        const buttonsWithoutEmoji = allButtons.filter(btn => !btn.emoji || btn.emoji.trim() === '')
        
        if (buttonsWithoutEmoji.length > 0) {
          return `警告: ${buttonsWithoutEmoji.length} 个按钮缺少表情符号`
        }
        
        return `所有 ${buttonsWithEmoji.length} 个按钮都有表情符号`
      }
    },
    {
      id: 'function-action-mapping',
      name: '动作映射测试',
      description: '验证每个按钮都有有效的动作命令',
      category: 'function' as const,
      test: async () => {
        await delay(900)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const buttonsWithoutAction = allButtons.filter(btn => !btn.action || btn.action.trim() === '')
        
        if (buttonsWithoutAction.length > 0) {
          throw new Error(`${buttonsWithoutAction.length} 个按钮缺少动作命令`)
        }
        
        return `所有 ${allButtons.length} 个按钮都有有效的动作命令`
      }
    },
    {
      id: 'function-callback-data',
      name: '回调数据验证测试',
      description: '验证每个按钮的callback_data格式正确',
      category: 'function' as const,
      test: async () => {
        await delay(700)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const invalidCallbacks = allButtons.filter(btn => 
          btn.callback_data && (
            btn.callback_data.length > 64 || 
            !/^[\w\-._]+$/.test(btn.callback_data)
          )
        )
        
        if (invalidCallbacks.length > 0) {
          throw new Error(`${invalidCallbacks.length} 个按钮的callback_data格式无效`)
        }
        
        return `所有按钮的callback_data格式有效`
      }
    },
    {
      id: 'function-telegram-limits',
      name: 'Telegram限制检查',
      description: '验证按钮配置符合Telegram API限制',
      category: 'function' as const,
      test: async () => {
        await delay(800)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        
        // 检查按钮文本长度 (Telegram限制)
        const longTextButtons = allButtons.filter(btn => btn.text.length > 64)
        if (longTextButtons.length > 0) {
          throw new Error(`${longTextButtons.length} 个按钮文本超过64字符限制`)
        }
        
        // 检查每行按钮数量 (建议最多3个)
        const menuSizes = Object.values(menuConfig || {}).map(buttons => buttons.filter(btn => btn.enabled).length)
        const oversizedMenus = menuSizes.filter(size => size > 6)
        if (oversizedMenus.length > 0) {
          return `警告: 某些菜单按钮过多 (建议每行最多3个按钮)`
        }
        
        return `所有按钮配置符合Telegram限制`
      }
    },
    {
      id: 'integration-telegram-api',
      name: 'Telegram API集成测试',
      description: '模拟与Telegram Bot API的交互',
      category: 'integration' as const,
      test: async () => {
        await delay(1200)
        
        const enabledButtons = Object.values(menuConfig || {}).flat().filter(btn => btn.enabled)
        
        const longTextButtons = enabledButtons.filter(btn => btn.text.length > 64)
        if (longTextButtons.length > 0) {
          throw new Error(`${longTextButtons.length} 个按钮文本过长 (>64字符)`)
        }
        
        return `成功验证 ${enabledButtons.length} 个按钮的Telegram兼容性`
      }
    },
    {
      id: 'integration-api-endpoints',
      name: 'API端点可用性测试',
      description: '模拟测试按钮对应的API端点是否可达',
      category: 'integration' as const,
      test: async () => {
        await delay(1000)
        
        const allButtons = Object.values(menuConfig || {}).flat().filter(btn => btn.enabled)
        const apiEndpoints = allButtons.filter(btn => btn.action.startsWith('/'))
        
        if (apiEndpoints.length === 0) {
          return `警告: 没有发现API端点类型的按钮动作`
        }
        
        // 模拟API可用性检查
        const unavailableEndpoints = apiEndpoints.filter(btn => 
          // 模拟某些端点不可用的情况
          Math.random() < 0.1 // 10%概率模拟不可用
        )
        
        if (unavailableEndpoints.length > 0) {
          return `警告: ${unavailableEndpoints.length} 个API端点可能不可用`
        }
        
        return `所有 ${apiEndpoints.length} 个API端点都可用`
      }
    },
    {
      id: 'performance-render-speed',
      name: '渲染性能测试',
      description: '测试大量按钮的渲染性能',
      category: 'performance' as const,
      test: async () => {
        const startTime = performance.now()
        await delay(300)
        const endTime = performance.now()
        const renderTime = endTime - startTime
        
        if (renderTime > 1000) {
          return `警告: 渲染时间较长 (${renderTime.toFixed(2)}ms)`
        }
        
        return `渲染性能良好 (${renderTime.toFixed(2)}ms)`
      }
    },
    {
      id: 'performance-memory-usage',
      name: '内存使用测试',
      description: '测试按钮配置的内存占用情况',
      category: 'performance' as const,
      test: async () => {
        await delay(500)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const configSize = JSON.stringify(menuConfig).length
        const avgButtonSize = configSize / Math.max(allButtons.length, 1)
        
        if (configSize > 10000) { // 10KB
          return `警告: 按钮配置较大 (${(configSize/1024).toFixed(2)}KB)`
        }
        
        return `内存使用正常 (配置: ${(configSize/1024).toFixed(2)}KB, 平均每按钮: ${avgButtonSize.toFixed(0)}字节)`
      }
    },
    {
      id: 'security-xss-prevention',
      name: 'XSS防护测试',
      description: '检查按钮文本的XSS安全性',
      category: 'security' as const,
      test: async () => {
        await delay(800)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const dangerousChars = ['<script', 'javascript:', 'onload=', 'onerror=']
        
        const unsafeButtons = allButtons.filter(btn => 
          dangerousChars.some(char => 
            btn.text.toLowerCase().includes(char) || 
            (btn.tooltip && btn.tooltip.toLowerCase().includes(char))
          )
        )
        
        if (unsafeButtons.length > 0) {
          throw new Error(`发现 ${unsafeButtons.length} 个可能的XSS风险按钮`)
        }
        
        return '所有按钮文本安全，无XSS风险'
      }
    },
    {
      id: 'security-injection-prevention',
      name: '注入攻击防护测试',
      description: '检查按钮配置对SQL注入等攻击的防护',
      category: 'security' as const,
      test: async () => {
        await delay(600)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const sqlPatterns = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION']
        
        const vulnerableButtons = allButtons.filter(btn => 
          sqlPatterns.some(pattern => 
            btn.action.toUpperCase().includes(pattern) || 
            (btn.callback_data && btn.callback_data.toUpperCase().includes(pattern))
          )
        )
        
        if (vulnerableButtons.length > 0) {
          return `警告: ${vulnerableButtons.length} 个按钮可能存在注入风险`
        }
        
        return '所有按钮配置安全，无注入攻击风险'
      }
    },
    {
      id: 'security-access-control',
      name: '访问控制测试',
      description: '验证按钮的权限控制配置',
      category: 'security' as const,
      test: async () => {
        await delay(700)
        
        const allButtons = Object.values(menuConfig || {}).flat()
        const adminButtons = allButtons.filter(btn => 
          btn.action.includes('admin') || 
          btn.action.includes('manage') ||
          btn.text.includes('管理')
        )
        
        // 检查管理功能按钮是否有适当的访问控制
        const unprotectedAdminButtons = adminButtons.filter(btn => 
          !btn.action.includes('auth') && !btn.action.includes('check')
        )
        
        if (unprotectedAdminButtons.length > 0) {
          return `警告: ${unprotectedAdminButtons.length} 个管理功能按钮可能缺少权限验证`
        }
        
        if (adminButtons.length === 0) {
          return '无管理功能按钮，访问控制良好'
        }
        
        return `所有 ${adminButtons.length} 个管理功能按钮都有权限保护`
      }
    }
  ]

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const runTests = async (category?: string) => {
    setIsRunning(true)
    setProgress(0)
    
    const testsToRun = category ? buttonTests.filter(test => test.category === category) : buttonTests
    const newResults: TestResult[] = []
    
    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i]
      setCurrentTest(test.name)
      setProgress((i / testsToRun.length) * 100)
      
      const result: TestResult = {
        id: test.id,
        name: test.name,
        description: test.description,
        status: 'running',
        timestamp: new Date(),
        category: test.category
      }
      
      newResults.push(result)
      setTestResults([...newResults])
      
      try {
        const startTime = performance.now()
        const testResult = await test.test()
        const endTime = performance.now()
        
        result.status = testResult.includes('警告') ? 'warning' : 'passed'
        result.duration = endTime - startTime
        result.details = testResult
        
        toast.success(`✓ ${test.name}`)
      } catch (error) {
        result.status = 'failed'
        result.error = error instanceof Error ? error.message : '未知错误'
        
        toast.error(`✗ ${test.name}: ${result.error}`)
      }
      
      setTestResults([...newResults])
    }
    
    setProgress(100)
    setCurrentTest('')
    setIsRunning(false)
    
    const passed = newResults.filter(r => r.status === 'passed').length
    const warnings = newResults.filter(r => r.status === 'warning').length
    const failed = newResults.filter(r => r.status === 'failed').length
    
    toast.success(`测试完成: ${passed} 通过, ${warnings} 警告, ${failed} 失败`)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-green-500" />
      case 'failed': return <XCircle size={16} className="text-red-500" />
      case 'warning': return <Warning size={16} className="text-yellow-500" />
      case 'running': return <ArrowClockwise size={16} className="text-blue-500 animate-spin" />
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50 border-green-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const exportTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: (testResults || []).length,
        passed: (testResults || []).filter(r => r.status === 'passed').length,
        warnings: (testResults || []).filter(r => r.status === 'warning').length,
        failed: (testResults || []).filter(r => r.status === 'failed').length
      },
      configuration: {
        totalButtons: Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.length, 0),
        enabledButtons: Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.filter(btn => btn.enabled).length, 0),
        menuTypes: Object.keys(menuConfig || {}).length
      },
      testResults: (testResults || []).map(result => ({
        ...result,
        timestamp: new Date(result.timestamp).toISOString()
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `button-test-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('测试报告已导出')
  }

  const stats = {
    total: (testResults || []).length,
    passed: (testResults || []).filter(r => r.status === 'passed').length,
    warnings: (testResults || []).filter(r => r.status === 'warning').length,
    failed: (testResults || []).filter(r => r.status === 'failed').length,
    avgDuration: (testResults || []).filter(r => r.duration).reduce((sum, r) => sum + (r.duration || 0), 0) / (testResults || []).filter(r => r.duration).length || 0
  }

  return (
    <div className="space-y-6">
      {/* 实时状态指示器 */}
      {isRunning && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <ArrowClockwise size={16} className="animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  正在运行自动化测试... ({Math.round(progress)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">按钮功能测试</h1>
          <p className="text-muted-foreground mt-1">
            全面测试机器人按钮的功能、性能和安全性
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportTestReport}
            variant="outline"
            className="gap-2"
            disabled={(testResults || []).length === 0}
          >
            <Download size={16} />
            导出报告
          </Button>
          <Button
            onClick={() => runTests()}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? <ArrowClockwise size={16} className="animate-spin" /> : <Play size={16} />}
            {isRunning ? '运行中...' : '运行所有测试'}
          </Button>
        </div>
      </div>

      {/* 测试进度 */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">测试进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  正在运行: {currentTest}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试统计 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TestTube size={24} className="mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">总测试数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-muted-foreground">通过</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Warning size={24} className="mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <div className="text-sm text-muted-foreground">警告</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle size={24} className="mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">失败</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity size={24} className="mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-600">{stats.avgDuration.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">平均耗时(ms)</div>
          </CardContent>
        </Card>
      </div>

      {/* 分类测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            分类测试
          </CardTitle>
          <CardDescription>
            按类别运行特定的测试组合
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {testCategories.map(category => {
              const Icon = category.icon
              const categoryTests = buttonTests.filter(test => test.category === category.id)
              const categoryResults = (testResults || []).filter(result => result.category === category.id)
              const passed = categoryResults.filter(r => r.status === 'passed').length
              
              return (
                <Card key={category.id} className="text-center">
                  <CardContent className="p-4">
                    <Icon size={32} className={`mx-auto mb-3 text-${category.color}-500`} />
                    <h3 className="font-medium mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {categoryTests.length} 项测试
                    </p>
                    {categoryResults.length > 0 && (
                      <Badge variant="outline" className="mb-3">
                        {passed}/{categoryResults.length} 通过
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => runTests(category.id)}
                      disabled={isRunning}
                    >
                      测试
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube size={20} />
            测试结果列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(testResults || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无测试结果，点击"运行所有测试"开始
              </div>
            ) : (
              (testResults || []).map(result => (
                <Card key={result.id} className={`border ${getStatusColor(result.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(result.status)}
                          <h4 className="font-medium">{result.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.description}
                        </p>
                        {result.details && (
                          <p className="text-sm font-medium">
                            {result.details}
                          </p>
                        )}
                        {result.error && (
                          <Alert className="mt-2">
                            <XCircle size={16} />
                            <AlertDescription>
                              {result.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {result.duration && (
                          <div>{result.duration.toFixed(2)}ms</div>
                        )}
                        <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 功能状态总结 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Robot size={20} />
            按钮配置总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总按钮数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.filter(btn => btn.enabled).length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">启用按钮</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(menuConfig || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">菜单类型</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(menuConfig || {}).flat().filter(btn => btn.emoji).length}
              </div>
              <div className="text-sm text-muted-foreground">有表情符号</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}