import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Robot, 
  Gear, 
  CheckCircle, 
  XCircle, 
  Warning,
  Plus,
  PencilSimple,
  Trash,
  Clock,
  Package,
  TrendUp,
  TrendDown,
  ArrowClockwise,
  Database
} from '@phosphor-icons/react'

interface AutomationRule {
  id: string
  name: string
  apiType: 'mobile-api' | 'login-api' | 'sms-api'
  country: string
  minStockLevel: number
  maxStockLevel: number
  autoReorder: boolean
  reorderQuantity: number
  priceAdjustment: 'fixed' | 'dynamic' | 'market'
  isActive: boolean
  lastTriggered?: string
  createdAt: string
}

interface InventoryItem {
  id: string
  url: string
  apiType: 'mobile-api' | 'login-api' | 'sms-api'
  country: string
  status: 'active' | 'pending' | 'expired' | 'invalid'
  lastChecked?: string
  responseTime?: number
  price: number
  autoManaged: boolean
  assignedRule?: string
}

interface AutoInventoryProps {
  isOpen: boolean
  onClose: () => void
}

export function AutoInventoryManagement({ isOpen, onClose }: AutoInventoryProps) {
  const [automationRules, setAutomationRules] = useKV<AutomationRule[]>('auto-inventory-rules', [
    {
      id: 'auto-001',
      name: 'US Mobile API Auto-Restock',
      apiType: 'mobile-api',
      country: 'United States',
      minStockLevel: 50,
      maxStockLevel: 200,
      autoReorder: true,
      reorderQuantity: 100,
      priceAdjustment: 'dynamic',
      isActive: true,
      lastTriggered: '2024-01-17T08:30:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'auto-002',
      name: 'UK Login API Premium Management',
      apiType: 'login-api',
      country: 'United Kingdom',
      minStockLevel: 25,
      maxStockLevel: 100,
      autoReorder: true,
      reorderQuantity: 50,
      priceAdjustment: 'fixed',
      isActive: true,
      lastTriggered: '2024-01-16T14:15:00Z',
      createdAt: '2024-01-14T11:00:00Z'
    }
  ])

  const [inventoryItems, setInventoryItems] = useKV<InventoryItem[]>('auto-inventory-items', [
    {
      id: 'inv-001',
      url: 'https://api.company.com/v1/automation/status/endpoint',
      apiType: 'mobile-api',
      country: 'United States',
      status: 'active',
      lastChecked: '2024-01-17T10:30:00Z',
      responseTime: 245,
      price: 39.99,
      autoManaged: true,
      assignedRule: 'auto-001'
    },
    {
      id: 'inv-002', 
      url: 'https://api.telelogin.com/v2/sessions/abc123/validate',
      apiType: 'login-api',
      country: 'United Kingdom',
      status: 'active',
      lastChecked: '2024-01-17T10:25:00Z',
      responseTime: 156,
      price: 49.99,
      autoManaged: true,
      assignedRule: 'auto-002'
    },
    {
      id: 'inv-003',
      url: 'https://sms.provider.com/api/v1/xyz789/receive',
      apiType: 'sms-api',
      country: 'Germany',
      status: 'pending',
      price: 19.99,
      autoManaged: false
    }
  ])

  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [selectedTab, setSelectedTab] = useState('rules')
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)

  const currentRules = automationRules || []
  const currentItems = inventoryItems || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success/10 text-success"><CheckCircle size={12} className="mr-1" />Active</Badge>
      case 'pending': return <Badge className="bg-warning/10 text-warning"><Clock size={12} className="mr-1" />Pending</Badge>
      case 'expired': return <Badge variant="secondary"><XCircle size={12} className="mr-1" />Expired</Badge>
      case 'invalid': return <Badge className="bg-destructive/10 text-destructive"><XCircle size={12} className="mr-1" />Invalid</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getApiTypeBadge = (type: string) => {
    switch (type) {
      case 'mobile-api': return <Badge variant="default">Mobile API</Badge>
      case 'login-api': return <Badge variant="secondary">Login API</Badge>
      case 'sms-api': return <Badge variant="outline">SMS API</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const getPriceAdjustmentBadge = (type: string) => {
    switch (type) {
      case 'fixed': return <Badge variant="outline">Fixed</Badge>
      case 'dynamic': return <Badge className="bg-accent/10 text-accent">Dynamic</Badge>
      case 'market': return <Badge className="bg-primary/10 text-primary">Market</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const handleBulkValidation = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    
    const updatedItems = [...currentItems]
    
    for (let i = 0; i < updatedItems.length; i++) {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock validation logic
      const isValid = Math.random() > 0.15 // 85% success rate
      const responseTime = Math.floor(Math.random() * 1000) + 100
      
      updatedItems[i] = {
        ...updatedItems[i],
        status: isValid ? 'active' : (Math.random() > 0.5 ? 'expired' : 'invalid'),
        lastChecked: new Date().toISOString(),
        responseTime: isValid ? responseTime : undefined
      }
      
      setValidationProgress(((i + 1) / updatedItems.length) * 100)
      setInventoryItems([...updatedItems])
    }
    
    setIsValidating(false)
  }

  const handleAutoRestock = async (ruleId: string) => {
    const rule = currentRules.find(r => r.id === ruleId)
    if (!rule) return

    // Simulate auto-restock process
    const newItems: InventoryItem[] = []
    
    for (let i = 0; i < rule.reorderQuantity; i++) {
      newItems.push({
        id: `inv-${Date.now()}-${i}`,
        url: `https://api.auto-generated.com/${rule.apiType}/${Date.now()}-${i}/endpoint`,
        apiType: rule.apiType,
        country: rule.country,
        status: 'pending',
        price: 39.99,
        autoManaged: true,
        assignedRule: ruleId
      })
    }
    
    setInventoryItems([...currentItems, ...newItems])
    
    // Update rule last triggered
    const updatedRules = currentRules.map(r => 
      r.id === ruleId ? { ...r, lastTriggered: new Date().toISOString() } : r
    )
    setAutomationRules(updatedRules)
  }

  const stats = {
    totalRules: currentRules.length,
    activeRules: currentRules.filter(r => r.isActive).length,
    totalItems: currentItems.length,
    autoManagedItems: currentItems.filter(i => i.autoManaged).length,
    activeItems: currentItems.filter(i => i.status === 'active').length,
    lowStockAlerts: currentRules.filter(rule => {
      const itemsForRule = currentItems.filter(i => i.assignedRule === rule.id && i.status === 'active')
      return itemsForRule.length < rule.minStockLevel
    }).length
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot size={20} />
            Automated Inventory Management
          </DialogTitle>
          <DialogDescription>
            Configure automated inventory management rules for API tokens and endpoints
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  <Gear className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRules}</div>
                  <p className="text-xs text-muted-foreground">Automation rules</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.activeRules}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auto-Managed</CardTitle>
                  <Robot className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.autoManagedItems}</div>
                  <p className="text-xs text-muted-foreground">Items under automation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <Warning className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.lowStockAlerts}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Rules Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Automation Rules</CardTitle>
                    <CardDescription>
                      Configure automatic inventory management and restocking rules
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingRule(null)
                      setIsRuleDialogOpen(true)
                    }}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>API Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Stock Levels</TableHead>
                      <TableHead>Reorder Qty</TableHead>
                      <TableHead>Price Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRules.map((rule) => {
                      const ruleItems = currentItems.filter(i => i.assignedRule === rule.id && i.status === 'active')
                      const needsRestock = ruleItems.length < rule.minStockLevel
                      
                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{getApiTypeBadge(rule.apiType)}</TableCell>
                          <TableCell>{rule.country}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${needsRestock ? 'text-warning' : 'text-foreground'}`}>
                                {ruleItems.length}/{rule.minStockLevel}-{rule.maxStockLevel}
                              </span>
                              {needsRestock && <Warning size={14} className="text-warning" />}
                            </div>
                          </TableCell>
                          <TableCell>{rule.reorderQuantity}</TableCell>
                          <TableCell>{getPriceAdjustmentBadge(rule.priceAdjustment)}</TableCell>
                          <TableCell>
                            {rule.isActive ? (
                              <Badge className="bg-success/10 text-success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {needsRestock && rule.autoReorder && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAutoRestock(rule.id)}
                                  className="text-warning border-warning"
                                >
                                  <ArrowClockwise size={14} />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingRule(rule)
                                  setIsRuleDialogOpen(true)
                                }}
                              >
                                <PencilSimple size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => {
                                  setAutomationRules(currentRules.filter(r => r.id !== rule.id))
                                }}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Items</CardTitle>
                    <CardDescription>
                      API endpoints and tokens under automated management
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleBulkValidation}
                      disabled={isValidating}
                      className="gap-2"
                    >
                      <ArrowClockwise size={16} className={isValidating ? 'animate-spin' : ''} />
                      {isValidating ? 'Validating...' : 'Validate All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isValidating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Validating inventory items...</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(validationProgress)}%
                      </span>
                    </div>
                    <Progress value={validationProgress} />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.totalItems}</div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">{stats.activeItems}</div>
                    <p className="text-sm text-muted-foreground">Active Items</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-accent">{stats.autoManagedItems}</div>
                    <p className="text-sm text-muted-foreground">Auto-Managed</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>API Endpoint</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Auto-Managed</TableHead>
                      <TableHead>Last Checked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs max-w-[300px] truncate">
                          {item.url}
                        </TableCell>
                        <TableCell>{getApiTypeBadge(item.apiType)}</TableCell>
                        <TableCell>{item.country}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.responseTime ? (
                            <span className={`text-sm ${item.responseTime < 300 ? 'text-success' : item.responseTime < 1000 ? 'text-warning' : 'text-destructive'}`}>
                              {item.responseTime}ms
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>
                          {item.autoManaged ? (
                            <Badge className="bg-accent/10 text-accent">Auto</Badge>
                          ) : (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {item.lastChecked ? new Date(item.lastChecked).toLocaleString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database size={20} />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Real-time automation system monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Automation Engine</p>
                        <p className="text-xs text-muted-foreground">Processing rules</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Inventory Validator</p>
                        <p className="text-xs text-muted-foreground">Checking endpoints</p>
                      </div>
                    </div>
                    <Badge className="bg-warning/10 text-warning">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Auto-Restocking</p>
                        <p className="text-xs text-muted-foreground">Ready for triggers</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success">Standby</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warning size={20} />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>
                    Latest automation activities and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-success bg-success/5">
                    <p className="text-sm font-medium">Auto-restock completed</p>
                    <p className="text-xs text-muted-foreground">US Mobile API: Added 100 new endpoints</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-warning bg-warning/5">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">UK Login API: Only 15 items remaining</p>
                    <p className="text-xs text-muted-foreground">30 minutes ago</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-destructive bg-destructive/5">
                    <p className="text-sm font-medium">Validation failed</p>
                    <p className="text-xs text-muted-foreground">23 SMS API endpoints marked invalid</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and insights for automated inventory management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendUp size={20} className="text-success" />
                      <div className="text-2xl font-bold text-success">94.2%</div>
                    </div>
                    <p className="text-sm text-muted-foreground">Automation Success Rate</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={20} className="text-primary" />
                      <div className="text-2xl font-bold">2.1s</div>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={20} className="text-accent" />
                      <div className="text-2xl font-bold">1,247</div>
                    </div>
                    <p className="text-sm text-muted-foreground">Items Auto-Restocked</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendDown size={20} className="text-warning" />
                      <div className="text-2xl font-bold">5.8%</div>
                    </div>
                    <p className="text-sm text-muted-foreground">Failure Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rule Creation/Edit Dialog */}
        <AutoRuleDialog
          isOpen={isRuleDialogOpen}
          onClose={() => {
            setIsRuleDialogOpen(false)
            setEditingRule(null)
          }}
          rule={editingRule}
          onSave={(rule) => {
            const updatedRules = editingRule 
              ? currentRules.map(r => r.id === editingRule.id ? rule : r)
              : [...currentRules, rule]
            setAutomationRules(updatedRules)
            setIsRuleDialogOpen(false)
            setEditingRule(null)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// Auto Rule Dialog Component
interface AutoRuleDialogProps {
  isOpen: boolean
  onClose: () => void
  rule: AutomationRule | null
  onSave: (rule: AutomationRule) => void
}

function AutoRuleDialog({ isOpen, onClose, rule, onSave }: AutoRuleDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    apiType: 'mobile-api' as 'mobile-api' | 'login-api' | 'sms-api',
    country: '',
    minStockLevel: 50,
    maxStockLevel: 200,
    autoReorder: true,
    reorderQuantity: 100,
    priceAdjustment: 'dynamic' as 'fixed' | 'dynamic' | 'market',
    isActive: true
  })

  // Initialize form with rule data when editing
  useState(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        apiType: rule.apiType,
        country: rule.country,
        minStockLevel: rule.minStockLevel,
        maxStockLevel: rule.maxStockLevel,
        autoReorder: rule.autoReorder,
        reorderQuantity: rule.reorderQuantity,
        priceAdjustment: rule.priceAdjustment,
        isActive: rule.isActive
      })
    }
  })

  const handleSave = () => {
    const ruleData: AutomationRule = {
      ...formData,
      id: rule?.id || `auto-${Date.now()}`,
      createdAt: rule?.createdAt || new Date().toISOString(),
      lastTriggered: rule?.lastTriggered
    }
    onSave(ruleData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </DialogTitle>
          <DialogDescription>
            Configure automated inventory management and restocking parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="US Mobile API Auto-Restock"
              />
            </div>
            <div className="space-y-2">
              <Label>API Type</Label>
              <Select
                value={formData.apiType}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, apiType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile-api">Mobile API</SelectItem>
                  <SelectItem value="login-api">Login API</SelectItem>
                  <SelectItem value="sms-api">SMS API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Adjustment</Label>
              <Select
                value={formData.priceAdjustment}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priceAdjustment: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                  <SelectItem value="market">Market-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Min Stock Level</Label>
              <Input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Stock Level</Label>
              <Input
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reorder Quantity</Label>
              <Input
                type="number"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderQuantity: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Auto Reorder</p>
              <p className="text-xs text-muted-foreground">
                Automatically reorder when stock falls below minimum level
              </p>
            </div>
            <Switch
              checked={formData.autoReorder}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, autoReorder: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Active Rule</p>
              <p className="text-xs text-muted-foreground">
                Enable this automation rule
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isActive: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}