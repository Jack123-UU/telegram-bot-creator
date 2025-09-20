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
import { 
  Shield, 
  DeviceMobile, 
  CheckCircle, 
  XCircle, 
  Warning,
  Plus,
  PencilSimple,
  Trash,
  Clock,
  CurrencyDollar
} from '@phosphor-icons/react'

interface PaymentRule {
  id: string
  name: string
  apiType: 'mobile-api' | 'login-api' | 'sms-api'
  country: string
  minAmount: number
  maxAmount: number
  timeoutMinutes: number
  requiresVerification: boolean
  allowedPaymentMethods: string[]
  riskLevel: 'low' | 'medium' | 'high'
  isActive: boolean
  createdAt: string
  lastModified: string
}

interface MobileApiVerificationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileApiVerification({ isOpen, onClose }: MobileApiVerificationProps) {
  const [paymentRules, setPaymentRules] = useKV<PaymentRule[]>('mobile-api-payment-rules', [
    {
      id: 'rule-001',
      name: 'US Mobile API Standard',
      apiType: 'mobile-api',
      country: 'United States',
      minAmount: 10.0,
      maxAmount: 200.0,
      timeoutMinutes: 15,
      requiresVerification: true,
      allowedPaymentMethods: ['USDT-TRC20', 'USDT-ERC20'],
      riskLevel: 'medium',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      lastModified: '2024-01-17T14:30:00Z'
    },
    {
      id: 'rule-002',
      name: 'UK Login API Premium',
      apiType: 'login-api',
      country: 'United Kingdom',
      minAmount: 25.0,
      maxAmount: 500.0,
      timeoutMinutes: 20,
      requiresVerification: true,
      allowedPaymentMethods: ['USDT-TRC20'],
      riskLevel: 'high',
      isActive: true,
      createdAt: '2024-01-16T09:00:00Z',
      lastModified: '2024-01-17T11:15:00Z'
    },
    {
      id: 'rule-003',
      name: 'SMS API Basic',
      apiType: 'sms-api',
      country: 'Germany',
      minAmount: 5.0,
      maxAmount: 100.0,
      timeoutMinutes: 10,
      requiresVerification: false,
      allowedPaymentMethods: ['USDT-TRC20', 'USDT-ERC20', 'USDC'],
      riskLevel: 'low',
      isActive: true,
      createdAt: '2024-01-14T16:00:00Z',
      lastModified: '2024-01-16T13:45:00Z'
    }
  ])

  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PaymentRule | null>(null)
  const [selectedTab, setSelectedTab] = useState('rules')

  const currentRules = paymentRules || []

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low': return <Badge className="bg-success/10 text-success">Low Risk</Badge>
      case 'medium': return <Badge className="bg-warning/10 text-warning">Medium Risk</Badge>
      case 'high': return <Badge className="bg-destructive/10 text-destructive">High Risk</Badge>
      default: return <Badge variant="outline">{level}</Badge>
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

  const handleSaveRule = (rule: PaymentRule) => {
    const updatedRules = editingRule 
      ? currentRules.map(r => r.id === editingRule.id ? rule : r)
      : [...currentRules, { ...rule, id: `rule-${Date.now()}`, createdAt: new Date().toISOString() }]
    
    setPaymentRules(updatedRules)
    setIsRuleDialogOpen(false)
    setEditingRule(null)
  }

  const handleDeleteRule = (ruleId: string) => {
    setPaymentRules(currentRules.filter(r => r.id !== ruleId))
  }

  const handleEditRule = (rule: PaymentRule) => {
    setEditingRule(rule)
    setIsRuleDialogOpen(true)
  }

  const stats = {
    totalRules: currentRules.length,
    activeRules: currentRules.filter(r => r.isActive).length,
    highRiskRules: currentRules.filter(r => r.riskLevel === 'high').length,
    averageTimeout: currentRules.reduce((sum, r) => sum + r.timeoutMinutes, 0) / currentRules.length || 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} />
            Mobile API Payment Verification Rules
          </DialogTitle>
          <DialogDescription>
            Configure payment verification rules for mobile API endpoints
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Payment Rules</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRules}</div>
                  <p className="text-xs text-muted-foreground">Configured rules</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.activeRules}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <Warning className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.highRiskRules}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Timeout</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(stats.averageTimeout)}</div>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </CardContent>
              </Card>
            </div>

            {/* Rules Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Verification Rules</CardTitle>
                    <CardDescription>
                      Configure payment rules for different API types and countries
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
                      <TableHead>Amount Range</TableHead>
                      <TableHead>Timeout</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{getApiTypeBadge(rule.apiType)}</TableCell>
                        <TableCell>{rule.country}</TableCell>
                        <TableCell className="font-mono text-sm">
                          ${rule.minAmount} - ${rule.maxAmount}
                        </TableCell>
                        <TableCell>{rule.timeoutMinutes}m</TableCell>
                        <TableCell>{getRiskBadge(rule.riskLevel)}</TableCell>
                        <TableCell>
                          {rule.isActive ? (
                            <Badge className="bg-success/10 text-success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditRule(rule)}
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
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
                    <DeviceMobile size={20} />
                    Live Payment Verification
                  </CardTitle>
                  <CardDescription>
                    Real-time verification status for mobile API payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Payment Processor</p>
                        <p className="text-xs text-muted-foreground">Processing verifications</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Rule Engine</p>
                        <p className="text-xs text-muted-foreground">7 rules active</p>
                      </div>
                    </div>
                    <Badge className="bg-warning/10 text-warning">Processing</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Risk Assessment</p>
                        <p className="text-xs text-muted-foreground">Auto-scoring enabled</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warning size={20} />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>
                    Payment verification alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-warning bg-warning/5">
                    <p className="text-sm font-medium">High-value transaction detected</p>
                    <p className="text-xs text-muted-foreground">$850 payment for UK Login API</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-destructive bg-destructive/5">
                    <p className="text-sm font-medium">Payment verification failed</p>
                    <p className="text-xs text-muted-foreground">Invalid amount for US Mobile API</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-success bg-success/5">
                    <p className="text-sm font-medium">Rule updated successfully</p>
                    <p className="text-xs text-muted-foreground">SMS API Basic timeout extended</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Verification Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and insights for payment rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">96.8%</div>
                    <p className="text-sm text-muted-foreground">Verification Success Rate</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">1.2s</div>
                    <p className="text-sm text-muted-foreground">Avg. Verification Time</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-warning">2.4%</div>
                    <p className="text-sm text-muted-foreground">High-risk Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rule Creation/Edit Dialog */}
        <RuleDialog
          isOpen={isRuleDialogOpen}
          onClose={() => {
            setIsRuleDialogOpen(false)
            setEditingRule(null)
          }}
          rule={editingRule}
          onSave={handleSaveRule}
        />
      </DialogContent>
    </Dialog>
  )
}

// Rule Creation/Edit Dialog Component
interface RuleDialogProps {
  isOpen: boolean
  onClose: () => void
  rule: PaymentRule | null
  onSave: (rule: PaymentRule) => void
}

function RuleDialog({ isOpen, onClose, rule, onSave }: RuleDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    apiType: 'mobile-api' as 'mobile-api' | 'login-api' | 'sms-api',
    country: '',
    minAmount: 10,
    maxAmount: 200,
    timeoutMinutes: 15,
    requiresVerification: true,
    allowedPaymentMethods: ['USDT-TRC20'],
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    isActive: true
  })

  // Initialize form with rule data when editing
  useState(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        apiType: rule.apiType,
        country: rule.country,
        minAmount: rule.minAmount,
        maxAmount: rule.maxAmount,
        timeoutMinutes: rule.timeoutMinutes,
        requiresVerification: rule.requiresVerification,
        allowedPaymentMethods: rule.allowedPaymentMethods,
        riskLevel: rule.riskLevel,
        isActive: rule.isActive
      })
    }
  })

  const handleSave = () => {
    const ruleData: PaymentRule = {
      ...formData,
      id: rule?.id || `rule-${Date.now()}`,
      createdAt: rule?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    onSave(ruleData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit Payment Rule' : 'Create Payment Rule'}
          </DialogTitle>
          <DialogDescription>
            Configure payment verification parameters for API endpoints
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="US Mobile API Standard"
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
              <Label>Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Min Amount (USDT)</Label>
              <Input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minAmount: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount (USDT)</Label>
              <Input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Timeout (minutes)</Label>
              <Input
                type="number"
                value={formData.timeoutMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, timeoutMinutes: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Requires Verification</p>
              <p className="text-xs text-muted-foreground">
                Enable additional verification for payments
              </p>
            </div>
            <Switch
              checked={formData.requiresVerification}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, requiresVerification: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Active Rule</p>
              <p className="text-xs text-muted-foreground">
                Enable this rule for payment processing
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