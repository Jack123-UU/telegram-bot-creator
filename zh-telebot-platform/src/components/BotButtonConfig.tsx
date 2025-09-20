import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  Gear, 
  Plus, 
  Trash, 
  PencilSimple, 
  Check, 
  X, 
  DeviceMobile,
  ArrowCounterClockwise,
  Info,
  Warning,
  ShoppingCart,
  Robot,
  Headset,
  Wallet,
  Globe,
  User,
  Eye,
  Code,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Copy,
  Sparkle,
  Palette,
  Layout
} from '@phosphor-icons/react'

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

interface LayoutTemplate {
  id: string
  name: string
  description: string
  layout: '2x3' | '3x2' | '1x6' | '2x2' | 'adaptive'
  buttonStyle: 'standard' | 'compact' | 'large'
}

const layoutTemplates: LayoutTemplate[] = [
  { id: 'standard', name: '标准布局', description: '2行3列，适合大多数场景', layout: '2x3', buttonStyle: 'standard' },
  { id: 'compact', name: '紧凑布局', description: '3行2列，节省空间', layout: '3x2', buttonStyle: 'compact' },
  { id: 'minimal', name: '极简布局', description: '单行6列，极简体验', layout: '1x6', buttonStyle: 'compact' },
  { id: 'square', name: '方形布局', description: '2行2列，对称美观', layout: '2x2', buttonStyle: 'large' },
  { id: 'adaptive', name: '自适应布局', description: '根据按钮数量自动调整', layout: 'adaptive', buttonStyle: 'standard' }
]

const emojiCategories = {
  common: ['📱', '💻', '🔧', '⚙️', '🛠️', '📞', '💰', '🎯', '🚀', '⭐'],
  social: ['👤', '👥', '💬', '📢', '📨', '📧', '📋', '📊', '📈', '📉'],
  shopping: ['🛒', '💳', '💎', '🏪', '🛍️', '💸', '💵', '🔖', '🎁', '📦'],
  tech: ['🖥️', '⌨️', '🖱️', '💾', '🔌', '🔋', '📡', '🌐', '📊', '📈'],
  flags: ['🇺🇸', '🇨🇳', '🇬🇧', '🇯🇵', '🇰🇷', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇷🇺'],
  symbols: ['🔥', '⚡', '🌟', '💫', '✨', '🎉', '🎊', '🏆', '🥇', '🎯']
}

export function BotButtonConfig() {
  const [menuConfig, setMenuConfig] = useKV<MenuConfig>('bot-menu-config', {
    main_menu: [
      { id: '1', text: '🔧 API Services', type: 'main_menu', action: 'show_api_services', emoji: '🔧', order: 1, enabled: true, color: '#3b82f6' },
      { id: '2', text: '🛠️ Development Tools', type: 'main_menu', action: 'show_dev_tools', emoji: '🛠️', order: 2, enabled: true, color: '#10b981' },
      { id: '3', text: '📞 Support', type: 'main_menu', action: 'show_support', emoji: '📞', order: 3, enabled: true, color: '#f59e0b' },
      { id: '4', text: '🌐 English', type: 'main_menu', action: 'change_language', emoji: '🌐', order: 4, enabled: true, color: '#8b5cf6' },
      { id: '5', text: '👤 User Center', type: 'main_menu', action: 'user_center', emoji: '👤', order: 5, enabled: true, color: '#06b6d4' },
      { id: '6', text: '💰 Balance', type: 'main_menu', action: 'balance', emoji: '💰', order: 6, enabled: true, color: '#eab308' }
    ],
    product_menu: [
      { id: 'p1', text: '🔌 API Integration', type: 'product_category', action: 'show_api_integration', emoji: '🔌', order: 1, enabled: true },
      { id: 'p2', text: '🤖 Bot Development', type: 'product_category', action: 'show_bot_development', emoji: '🤖', order: 2, enabled: true },
      { id: 'p3', text: '⚙️ Automation', type: 'product_category', action: 'show_automation', emoji: '⚙️', order: 3, enabled: true },
      { id: 'p4', text: '📱 API 接码登录', type: 'product_category', action: 'show_api_login', emoji: '📱', order: 4, enabled: true }
    ],
    service_menu: [
      { id: 's1', text: '📞 Consult: Custom API', type: 'service_action', action: 'consult_custom_api', emoji: '📞', order: 1, enabled: true },
      { id: 's2', text: '📞 Consult: Integration', type: 'service_action', action: 'consult_integration', emoji: '📞', order: 2, enabled: true },
      { id: 's3', text: '📞 Consult: Webhooks', type: 'service_action', action: 'consult_webhooks', emoji: '📞', order: 3, enabled: true }
    ],
    support_menu: [
      { id: 'sup1', text: '🏠 Main Menu', type: 'support', action: 'main_menu', emoji: '🏠', order: 1, enabled: true },
      { id: 'sup2', text: '📞 Support', type: 'support', action: 'contact_support', emoji: '📞', order: 2, enabled: true },
      { id: 'sup3', text: '🛡️ Terms & Compliance', type: 'support', action: 'terms_compliance', emoji: '🛡️', order: 3, enabled: true }
    ]
  })

  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null)
  const [isAddingButton, setIsAddingButton] = useState(false)
  const [newButtonMenu, setNewButtonMenu] = useState<keyof MenuConfig>('main_menu')
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useKV<LayoutTemplate>('selected-layout-template', layoutTemplates[0])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<keyof typeof emojiCategories>('common')
  const [previewLayout, setPreviewLayout] = useState<keyof MenuConfig>('main_menu')

  const getMenuIcon = (menuType: keyof MenuConfig) => {
    switch (menuType) {
      case 'main_menu': return <Robot size={20} className="text-blue-500" />
      case 'product_menu': return <ShoppingCart size={20} className="text-green-500" />
      case 'service_menu': return <Gear size={20} className="text-purple-500" />
      case 'support_menu': return <Headset size={20} className="text-orange-500" />
    }
  }

  const getMenuTitle = (menuType: keyof MenuConfig) => {
    switch (menuType) {
      case 'main_menu': return '主菜单按钮'
      case 'product_menu': return '产品分类按钮'
      case 'service_menu': return '服务操作按钮'
      case 'support_menu': return '支持菜单按钮'
    }
  }

  const updateButton = (menuType: keyof MenuConfig, buttonId: string, updates: Partial<ButtonConfig>) => {
    setMenuConfig(current => {
      if (!current) {
        return {
          main_menu: [],
          product_menu: [],
          service_menu: [],
          support_menu: []
        }
      }
      return {
        ...current,
        [menuType]: current[menuType].map(btn => 
          btn.id === buttonId ? { ...btn, ...updates } : btn
        )
      }
    })
  }

  const deleteButton = (menuType: keyof MenuConfig, buttonId: string) => {
    setMenuConfig(current => {
      if (!current) {
        return {
          main_menu: [],
          product_menu: [],
          service_menu: [],
          support_menu: []
        }
      }
      return {
        ...current,
        [menuType]: current[menuType].filter(btn => btn.id !== buttonId)
      }
    })
    toast.success('按钮已删除')
  }

  const addNewButton = (menuType: keyof MenuConfig, newButton: Omit<ButtonConfig, 'id'>) => {
    const button: ButtonConfig = {
      ...newButton,
      id: Date.now().toString(),
    }
    
    setMenuConfig(current => {
      if (!current) {
        return {
          main_menu: [],
          product_menu: [],
          service_menu: [],
          support_menu: []
        }
      }
      return {
        ...current,
        [menuType]: [...current[menuType], button].sort((a, b) => a.order - b.order)
      }
    })
    setIsAddingButton(false)
    toast.success('新按钮已添加')
  }

  const exportConfig = () => {
    const configJson = JSON.stringify({
      menuConfig,
      selectedTemplate,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalButtons: Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.length, 0),
        enabledButtons: Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.filter(btn => btn.enabled).length, 0)
      }
    }, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bot-menu-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('配置已导出')
  }

  const exportAsCode = () => {
    const codeTemplate = `
// TeleBot 按钮配置代码
// 生成时间: ${new Date().toLocaleString()}
// 布局模板: ${selectedTemplate?.name}

const botMenuConfig = ${JSON.stringify(menuConfig, null, 2)};

const layoutTemplate = ${JSON.stringify(selectedTemplate, null, 2)};

// 使用示例:
// const mainMenuButtons = botMenuConfig.main_menu.filter(btn => btn.enabled);
// const keyboard = createKeyboard(mainMenuButtons, layoutTemplate);
`
    
    const blob = new Blob([codeTemplate], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bot-config-code-${new Date().toISOString().split('T')[0]}.js`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('代码已导出')
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        
        // 兼容新旧格式
        if (config.menuConfig) {
          setMenuConfig(config.menuConfig)
          if (config.selectedTemplate) {
            setSelectedTemplate(config.selectedTemplate)
          }
          toast.success(`配置已导入 (${config.metadata?.version || '未知版本'})`)
        } else {
          // 旧格式
          setMenuConfig(config)
          toast.success('配置已导入 (旧格式)')
        }
      } catch {
        toast.error('配置文件格式错误')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // 清空文件输入
  }

  const resetToDefault = () => {
    setMenuConfig({
      main_menu: [
        { id: '1', text: '🔧 API Services', type: 'main_menu', action: 'show_api_services', emoji: '🔧', order: 1, enabled: true },
        { id: '2', text: '🛠️ Development Tools', type: 'main_menu', action: 'show_dev_tools', emoji: '🛠️', order: 2, enabled: true },
        { id: '3', text: '📞 Support', type: 'main_menu', action: 'show_support', emoji: '📞', order: 3, enabled: true },
        { id: '4', text: '🌐 English', type: 'main_menu', action: 'change_language', emoji: '🌐', order: 4, enabled: true },
        { id: '5', text: '👤 User Center', type: 'main_menu', action: 'user_center', emoji: '👤', order: 5, enabled: true },
        { id: '6', text: '💰 Balance', type: 'main_menu', action: 'balance', emoji: '💰', order: 6, enabled: true }
      ],
      product_menu: [
        { id: 'p1', text: '🔌 API Integration', type: 'product_category', action: 'show_api_integration', emoji: '🔌', order: 1, enabled: true },
        { id: 'p2', text: '🤖 Bot Development', type: 'product_category', action: 'show_bot_development', emoji: '🤖', order: 2, enabled: true },
        { id: 'p3', text: '⚙️ Automation', type: 'product_category', action: 'show_automation', emoji: '⚙️', order: 3, enabled: true },
        { id: 'p4', text: '📱 API 接码登录', type: 'product_category', action: 'show_api_login', emoji: '📱', order: 4, enabled: true }
      ],
      service_menu: [
        { id: 's1', text: '📞 Consult: Custom API', type: 'service_action', action: 'consult_custom_api', emoji: '📞', order: 1, enabled: true },
        { id: 's2', text: '📞 Consult: Integration', type: 'service_action', action: 'consult_integration', emoji: '📞', order: 2, enabled: true },
        { id: 's3', text: '📞 Consult: Webhooks', type: 'service_action', action: 'consult_webhooks', emoji: '📞', order: 3, enabled: true }
      ],
      support_menu: [
        { id: 'sup1', text: '🏠 Main Menu', type: 'support', action: 'main_menu', emoji: '🏠', order: 1, enabled: true },
        { id: 'sup2', text: '📞 Support', type: 'support', action: 'contact_support', emoji: '📞', order: 2, enabled: true },
        { id: 'sup3', text: '🛡️ Terms & Compliance', type: 'support', action: 'terms_compliance', emoji: '🛡️', order: 3, enabled: true }
      ]
    })
    toast.success('配置已重置为默认值')
  }

  const moveButton = (menuType: keyof MenuConfig, buttonId: string, direction: 'up' | 'down') => {
    setMenuConfig(current => {
      if (!current) {
        return {
          main_menu: [],
          product_menu: [],
          service_menu: [],
          support_menu: []
        }
      }
      
      const buttons = [...current[menuType]]
      const index = buttons.findIndex(btn => btn.id === buttonId)
      
      if (direction === 'up' && index > 0) {
        [buttons[index], buttons[index - 1]] = [buttons[index - 1], buttons[index]]
        // Update order values
        buttons[index].order = index + 1
        buttons[index - 1].order = index
      } else if (direction === 'down' && index < buttons.length - 1) {
        [buttons[index], buttons[index + 1]] = [buttons[index + 1], buttons[index]]
        // Update order values
        buttons[index].order = index + 1
        buttons[index + 1].order = index + 2
      }
      
      return {
        ...current,
        [menuType]: buttons
      }
    })
  }

  const duplicateButton = (menuType: keyof MenuConfig, button: ButtonConfig) => {
    const newButton: ButtonConfig = {
      ...button,
      id: Date.now().toString(),
      text: `${button.text} (副本)`,
      order: button.order + 1
    }
    
    setMenuConfig(current => {
      if (!current) {
        return {
          main_menu: [],
          product_menu: [],
          service_menu: [],
          support_menu: []
        }
      }
      return {
        ...current,
        [menuType]: [...current[menuType], newButton]
      }
    })
    toast.success('按钮已复制')
  }

  const applyTemplate = (template: LayoutTemplate) => {
    setSelectedTemplate(template)
    toast.success(`已应用 ${template.name} 布局模板`)
  }

  const generateLayoutPreview = (buttons: ButtonConfig[], template: LayoutTemplate) => {
    const enabledButtons = buttons.filter(btn => btn.enabled).sort((a, b) => a.order - b.order)
    
    const getLayoutClass = () => {
      switch (template.layout) {
        case '2x3': return 'grid-cols-3 grid-rows-2'
        case '3x2': return 'grid-cols-2 grid-rows-3'
        case '1x6': return 'grid-cols-6 grid-rows-1'
        case '2x2': return 'grid-cols-2 grid-rows-2'
        case 'adaptive': return enabledButtons.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
        default: return 'grid-cols-3'
      }
    }

    const getButtonSize = () => {
      switch (template.buttonStyle) {
        case 'compact': return 'text-xs py-1 px-2'
        case 'large': return 'text-base py-3 px-4'
        default: return 'text-sm py-2 px-3'
      }
    }

    return { layoutClass: getLayoutClass(), buttonSize: getButtonSize() }
  }

  if (!menuConfig) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">机器人按钮配置</h1>
          <p className="text-muted-foreground mt-1">
            自定义Telegram机器人的底部按钮布局和文本（无需修改代码）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <DeviceMobile size={16} />
            {previewMode ? '编辑模式' : '预览模式'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Gear size={16} />
                管理配置
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>配置管理</DialogTitle>
                <DialogDescription>
                  导入、导出或重置按钮配置
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button onClick={exportConfig} className="w-full gap-2">
                  <Download size={16} />
                  导出配置文件 (JSON)
                </Button>
                <Button onClick={exportAsCode} variant="outline" className="w-full gap-2">
                  <Code size={16} />
                  导出为代码文件
                </Button>
                <div>
                  <Label htmlFor="import-config" className="cursor-pointer">
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <span>
                        <Upload size={16} />
                        导入配置文件
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="import-config"
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </div>
                <Button onClick={resetToDefault} variant="destructive" className="w-full gap-2">
                  <ArrowCounterClockwise size={16} />
                  重置为默认配置
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 信息提示 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div className="text-blue-800">
              <h3 className="font-medium mb-1">配置说明</h3>
              <p className="text-sm">
                通过此界面可以修改机器人的底部按钮名称、顺序和功能，无需修改代码。
                配置保存后，重启机器人服务即可生效。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 布局模板选择器 */}
      {!previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout size={20} />
              布局模板
            </CardTitle>
            <CardDescription>
              选择不同的按钮布局样式，影响Telegram机器人中按钮的排列方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {layoutTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                      <div className="flex justify-center">
                        <Badge variant={selectedTemplate?.id === template.id ? "default" : "outline"} className="text-xs">
                          {template.layout}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {previewMode ? (
        /* 预览模式 - 增强版 */
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Label>预览菜单:</Label>
            <Select value={previewLayout} onValueChange={(value) => setPreviewLayout(value as keyof MenuConfig)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_menu">主菜单</SelectItem>
                <SelectItem value="product_menu">产品菜单</SelectItem>
                <SelectItem value="service_menu">服务菜单</SelectItem>
                <SelectItem value="support_menu">支持菜单</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-2 border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DeviceMobile size={20} />
                Telegram 机器人界面预览 - {getMenuTitle(previewLayout)}
              </CardTitle>
              <CardDescription>
                使用 {selectedTemplate?.name} 布局模板 ({selectedTemplate?.layout})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                <div className="bg-white text-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Robot size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">TeleBot Assistant</div>
                      <div className="text-sm text-gray-500">在线</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    欢迎使用 TeleBot 销售平台！请选择以下选项：
                  </div>
                </div>
                
                {/* 按钮预览区域 */}
                <div className="space-y-3">
                  {(() => {
                    const buttons = (menuConfig?.[previewLayout] || [])
                      .filter(btn => btn.enabled)
                      .sort((a, b) => a.order - b.order)
                    
                    const { layoutClass, buttonSize } = generateLayoutPreview(buttons, selectedTemplate!)
                    
                    return (
                      <div className={`grid gap-2 ${layoutClass}`}>
                        {buttons.map(btn => (
                          <div
                            key={btn.id}
                            className={`bg-white hover:bg-gray-50 text-gray-700 rounded-lg border cursor-pointer transition-all text-center font-medium ${buttonSize}`}
                            style={{ borderColor: btn.color || '#e5e7eb' }}
                          >
                            <span className="mr-1">{btn.emoji}</span>
                            {btn.text.replace(btn.emoji || '', '').trim()}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-blue-100">
                  <span>布局: {selectedTemplate?.layout}</span>
                  <span>按钮数: {(menuConfig?.[previewLayout] || []).filter(btn => btn.enabled).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 所有菜单预览概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(menuConfig || {}).map(([menuType, buttons]) => (
              <Card key={menuType}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getMenuIcon(menuType as keyof MenuConfig)}
                    {getMenuTitle(menuType as keyof MenuConfig)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {buttons
                      .filter(btn => btn.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map(btn => (
                        <div
                          key={btn.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <span className="text-base">{btn.emoji}</span>
                          <span className="flex-1">{btn.text.replace(btn.emoji || '', '').trim()}</span>
                          <Badge variant="outline" className="text-xs">
                            {btn.order}
                          </Badge>
                        </div>
                      ))}
                  </div>
                  {buttons.filter(btn => btn.enabled).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      没有启用的按钮
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* 编辑模式 */
        <Tabs defaultValue="main_menu" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main_menu" className="flex items-center gap-2">
              <Robot size={16} />
              主菜单
            </TabsTrigger>
            <TabsTrigger value="product_menu" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              产品菜单
            </TabsTrigger>
            <TabsTrigger value="service_menu" className="flex items-center gap-2">
              <Gear size={16} />
              服务菜单
            </TabsTrigger>
            <TabsTrigger value="support_menu" className="flex items-center gap-2">
              <Headset size={16} />
              支持菜单
            </TabsTrigger>
          </TabsList>

          {Object.entries(menuConfig).map(([menuType, buttons]) => (
            <TabsContent key={menuType} value={menuType} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getMenuIcon(menuType as keyof MenuConfig)}
                  {getMenuTitle(menuType as keyof MenuConfig)}
                  <Badge variant="outline" className="ml-2">
                    {buttons.filter(btn => btn.enabled).length}/{buttons.length}
                  </Badge>
                </h3>
                <div className="flex items-center gap-2">
                  {/* 批量操作 */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Gear size={14} />
                        批量操作
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>批量操作 - {getMenuTitle(menuType as keyof MenuConfig)}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Button 
                          onClick={() => {
                            buttons.forEach(btn => 
                              updateButton(menuType as keyof MenuConfig, btn.id, { enabled: true })
                            )
                            toast.success('已启用所有按钮')
                          }}
                          className="w-full gap-2"
                        >
                          <Check size={16} />
                          启用所有按钮
                        </Button>
                        <Button 
                          onClick={() => {
                            buttons.forEach(btn => 
                              updateButton(menuType as keyof MenuConfig, btn.id, { enabled: false })
                            )
                            toast.success('已禁用所有按钮')
                          }}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <X size={16} />
                          禁用所有按钮
                        </Button>
                        <Button 
                          onClick={() => {
                            const shuffled = [...buttons]
                            shuffled.forEach((btn, index) => {
                              updateButton(menuType as keyof MenuConfig, btn.id, { order: index + 1 })
                            })
                            toast.success('已重新排序按钮')
                          }}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <ArrowCounterClockwise size={16} />
                          重新排序
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isAddingButton} onOpenChange={setIsAddingButton}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setNewButtonMenu(menuType as keyof MenuConfig)}
                      >
                        <Plus size={14} />
                        添加按钮
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>添加新按钮</DialogTitle>
                        <DialogDescription>
                          为 {getMenuTitle(newButtonMenu)} 添加新的按钮
                        </DialogDescription>
                      </DialogHeader>
                      <ButtonEditor
                        onSave={(button) => addNewButton(newButtonMenu, button)}
                        onCancel={() => setIsAddingButton(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-3">
                {buttons
                  .sort((a, b) => a.order - b.order)
                  .map((button) => (
                    <Card key={button.id} className={`transition-all ${!button.enabled ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{button.emoji || '📱'}</div>
                            <div className="flex-1">
                              <div className="font-medium">{button.text}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>动作: <code className="bg-muted px-1 rounded text-xs">{button.action}</code></div>
                                <div className="flex items-center gap-3">
                                  <span>顺序: {button.order}</span>
                                  {button.color && (
                                    <div className="flex items-center gap-1">
                                      <span>颜色:</span>
                                      <div 
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: button.color }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={button.enabled ? "default" : "secondary"}>
                              {button.enabled ? '启用' : '禁用'}
                            </Badge>
                            
                            {/* 上移按钮 */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveButton(menuType as keyof MenuConfig, button.id, 'up')}
                              disabled={button.order === 1}
                            >
                              <ArrowUp size={12} />
                            </Button>
                            
                            {/* 下移按钮 */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveButton(menuType as keyof MenuConfig, button.id, 'down')}
                              disabled={button.order === buttons.length}
                            >
                              <ArrowDown size={12} />
                            </Button>
                            
                            {/* 复制按钮 */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => duplicateButton(menuType as keyof MenuConfig, button)}
                            >
                              <Copy size={12} />
                            </Button>
                            
                            {/* 启用/禁用切换 */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateButton(menuType as keyof MenuConfig, button.id, { enabled: !button.enabled })}
                            >
                              {button.enabled ? <X size={12} /> : <Check size={12} />}
                            </Button>
                            
                            {/* 编辑按钮 */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <PencilSimple size={12} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>编辑按钮</DialogTitle>
                                </DialogHeader>
                                <ButtonEditor
                                  initialButton={button}
                                  onSave={(updates) => {
                                    updateButton(menuType as keyof MenuConfig, button.id, updates)
                                    toast.success('按钮已更新')
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                            
                            {/* 删除按钮 */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteButton(menuType as keyof MenuConfig, button.id)}
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {buttons.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Robot size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      此菜单还没有按钮，点击"添加按钮"开始配置
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* 配置状态和实时统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info size={20} />
              配置统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(menuConfig || {}).map(([menuType, buttons]) => (
                <div key={menuType} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {buttons.filter(btn => btn.enabled).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getMenuTitle(menuType as keyof MenuConfig)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    共 {buttons.length} 个按钮
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              配置信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">布局模板:</span>
                <Badge variant="outline">{selectedTemplate?.name}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">布局规格:</span>
                <Badge variant="outline">{selectedTemplate?.layout}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">按钮样式:</span>
                <Badge variant="outline">{selectedTemplate?.buttonStyle}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">总按钮数:</span>
                <Badge>
                  {Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.length, 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">启用按钮:</span>
                <Badge variant="secondary">
                  {Object.values(menuConfig || {}).reduce((sum, buttons) => sum + buttons.filter(btn => btn.enabled).length, 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface ButtonEditorProps {
  initialButton?: ButtonConfig
  onSave: (button: Omit<ButtonConfig, 'id'>) => void
  onCancel?: () => void
}

function ButtonEditor({ initialButton, onSave, onCancel }: ButtonEditorProps) {
  const [text, setText] = useState(initialButton?.text?.replace(initialButton.emoji || '', '').trim() || '')
  const [emoji, setEmoji] = useState(initialButton?.emoji || '📱')
  const [action, setAction] = useState(initialButton?.action || '')
  const [order, setOrder] = useState(initialButton?.order || 1)
  const [enabled, setEnabled] = useState(initialButton?.enabled ?? true)
  const [color, setColor] = useState(initialButton?.color || '')
  const [tooltip, setTooltip] = useState(initialButton?.tooltip || '')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>('common')

  const commonActions = [
    'show_api_services',
    'show_dev_tools', 
    'show_support',
    'change_language',
    'user_center',
    'balance',
    'show_api_integration',
    'show_bot_development',
    'show_automation',
    'show_api_login',
    'consult_custom_api',
    'consult_integration',
    'consult_webhooks',
    'main_menu',
    'contact_support',
    'terms_compliance'
  ]

  const colorPresets = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
    '#06b6d4', '#eab308', '#ef4444', '#84cc16',
    '#f97316', '#ec4899', '#6366f1', '#14b8a6'
  ]

  const handleSave = () => {
    if (!text.trim() || !action.trim()) {
      toast.error('请填写完整信息')
      return
    }

    onSave({
      text: `${emoji} ${text}`.trim(),
      type: initialButton?.type || 'main_menu',
      action,
      emoji,
      order,
      enabled,
      color,
      tooltip,
      callback_data: action
    })
  }

  return (
    <div className="space-y-6">
      {/* 表情符号选择 */}
      <div className="space-y-3">
        <Label>表情符号</Label>
        <div className="flex items-center gap-3">
          <div className="text-3xl p-3 border rounded-lg bg-muted/50">
            {emoji}
          </div>
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full justify-start gap-2"
            >
              <Sparkle size={16} />
              选择表情符号
            </Button>
          </div>
        </div>
        
        {showEmojiPicker && (
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(emojiCategories).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category as keyof typeof emojiCategories)}
                    >
                      {category === 'common' && '常用'}
                      {category === 'social' && '社交'}
                      {category === 'shopping' && '购物'}
                      {category === 'tech' && '科技'}
                      {category === 'flags' && '国旗'}
                      {category === 'symbols' && '符号'}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {emojiCategories[selectedCategory].map((emojiOption) => (
                    <Button
                      key={emojiOption}
                      variant={emoji === emojiOption ? "default" : "outline"}
                      size="sm"
                      className="aspect-square p-0"
                      onClick={() => {
                        setEmoji(emojiOption)
                        setShowEmojiPicker(false)
                      }}
                    >
                      {emojiOption}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 按钮文本 */}
      <div className="space-y-2">
        <Label htmlFor="text">按钮文本</Label>
        <Input
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入按钮显示的文本"
        />
      </div>
      
      {/* 动作命令 */}
      <div className="space-y-2">
        <Label htmlFor="action">动作命令</Label>
        <div className="space-y-2">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="选择预设动作或输入自定义动作" />
            </SelectTrigger>
            <SelectContent>
              {commonActions.map((actionOption) => (
                <SelectItem key={actionOption} value={actionOption}>
                  {actionOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="或输入自定义动作命令"
          />
        </div>
      </div>

      {/* 颜色选择 */}
      <div className="space-y-3">
        <Label>按钮颜色 (可选)</Label>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {colorPresets.map((colorOption) => (
              <Button
                key={colorOption}
                variant={color === colorOption ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                style={{ backgroundColor: colorOption }}
                onClick={() => setColor(colorOption)}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setColor('')}
              className="text-xs px-2"
            >
              清除
            </Button>
          </div>
          <Input
            type="color"
            value={color || '#3b82f6'}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-8"
          />
        </div>
      </div>

      {/* 工具提示 */}
      <div className="space-y-2">
        <Label htmlFor="tooltip">工具提示 (可选)</Label>
        <Textarea
          id="tooltip"
          value={tooltip}
          onChange={(e) => setTooltip(e.target.value)}
          placeholder="当用户长按按钮时显示的提示信息"
          rows={2}
        />
      </div>

      {/* 设置项 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">显示顺序</Label>
          <Input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label>状态</Label>
          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="enabled">{enabled ? '启用' : '禁用'}</Label>
          </div>
        </div>
      </div>

      {/* 预览 */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-2">预览效果:</div>
          <div 
            className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg border cursor-pointer transition-colors"
            style={{ borderColor: color || '#e5e7eb' }}
          >
            <span className="mr-2">{emoji}</span>
            {text || '按钮文本'}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button onClick={handleSave} className="gap-2">
          <Check size={16} />
          保存按钮
        </Button>
      </div>
    </div>
  )
}