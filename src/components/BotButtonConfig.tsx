import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  User
} from '@phosphor-icons/react'

interface ButtonConfig {
  id: string
  text: string
  type: 'main_menu' | 'product_category' | 'service_action' | 'support'
  action: string
  emoji?: string
  order: number
  enabled: boolean
}

interface MenuConfig {
  main_menu: ButtonConfig[]
  product_menu: ButtonConfig[]
  service_menu: ButtonConfig[]
  support_menu: ButtonConfig[]
}

export function BotButtonConfig() {
  const [menuConfig, setMenuConfig] = useKV<MenuConfig>('bot-menu-config', {
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

  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null)
  const [isAddingButton, setIsAddingButton] = useState(false)
  const [newButtonMenu, setNewButtonMenu] = useState<keyof MenuConfig>('main_menu')
  const [previewMode, setPreviewMode] = useState(false)

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
    const configJson = JSON.stringify(menuConfig, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bot-menu-config.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('配置已导出')
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        setMenuConfig(config)
        toast.success('配置已导入')
      } catch {
        toast.error('配置文件格式错误')
      }
    }
    reader.readAsText(file)
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

  const generatePreview = (buttons: ButtonConfig[]) => {
    return buttons
      .filter(btn => btn.enabled)
      .sort((a, b) => a.order - b.order)
      .map(btn => btn.text)
      .join(' | ')
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
                  <Plus size={16} />
                  导出当前配置
                </Button>
                <div>
                  <Label htmlFor="import-config" className="cursor-pointer">
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <span>
                        <Plus size={16} />
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

      {previewMode ? (
        /* 预览模式 */
        <div className="space-y-6">
          {Object.entries(menuConfig).map(([menuType, buttons]) => (
            <Card key={menuType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getMenuIcon(menuType as keyof MenuConfig)}
                  {getMenuTitle(menuType as keyof MenuConfig)} - 预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">机器人界面预览：</h4>
                  <div className="space-y-2">
                    {buttons
                      .filter(btn => btn.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map(btn => (
                        <div
                          key={btn.id}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-2 px-3 rounded border cursor-pointer transition-colors"
                        >
                          {btn.text}
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                </h3>
                <Dialog open={isAddingButton} onOpenChange={setIsAddingButton}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setNewButtonMenu(menuType as keyof MenuConfig)}
                    >
                      <Plus size={16} />
                      添加按钮
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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

              <div className="grid gap-3">
                {buttons
                  .sort((a, b) => a.order - b.order)
                  .map((button) => (
                    <Card key={button.id} className={`transition-all ${!button.enabled ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{button.emoji || '📱'}</div>
                            <div>
                              <div className="font-medium">{button.text}</div>
                              <div className="text-sm text-muted-foreground">
                                动作: {button.action} • 顺序: {button.order}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={button.enabled ? "default" : "secondary"}>
                              {button.enabled ? '启用' : '禁用'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateButton(menuType as keyof MenuConfig, button.id, { enabled: !button.enabled })}
                            >
                              {button.enabled ? <X size={14} /> : <Check size={14} />}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <PencilSimple size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteButton(menuType as keyof MenuConfig, button.id)}
                            >
                              <Trash size={14} />
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

      {/* 配置状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            配置统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(menuConfig).map(([menuType, buttons]) => (
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
    </div>
  )
}

interface ButtonEditorProps {
  initialButton?: ButtonConfig
  onSave: (button: Omit<ButtonConfig, 'id'>) => void
  onCancel?: () => void
}

function ButtonEditor({ initialButton, onSave, onCancel }: ButtonEditorProps) {
  const [text, setText] = useState(initialButton?.text || '')
  const [emoji, setEmoji] = useState(initialButton?.emoji || '📱')
  const [action, setAction] = useState(initialButton?.action || '')
  const [order, setOrder] = useState(initialButton?.order || 1)
  const [enabled, setEnabled] = useState(initialButton?.enabled ?? true)

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
      enabled
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emoji">表情符号</Label>
          <Input
            id="emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="📱"
            maxLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="text">按钮文本</Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="按钮名称"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="action">动作命令</Label>
        <Input
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="例如: show_api_services"
        />
      </div>

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
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="enabled">启用此按钮</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  )
}