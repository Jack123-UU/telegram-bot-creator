import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Lightning, 
  Plus, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Gear,
  Copy,
  Trash,
  PlayCircle,
  StopCircle,
  Shield
} from '@phosphor-icons/react'

interface ApiEndpoint {
  id: string
  name: string
  url_pattern: string
  category: 'api_login' | 'session' | 'auth'
  status: 'active' | 'inactive' | 'testing'
  price: number
  stock: number
  description: string
  example_url: string
  auth_required: boolean
  rate_limit: number
  created_at: string
  last_used: string
}

interface BulkImportTask {
  id: string
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_items: number
  processed_items: number
  success_count: number
  error_count: number
  errors: string[]
  created_at: string
}

export function BackendIntegration() {
  const [endpoints, setEndpoints] = useKV<ApiEndpoint[]>('api-endpoints', [])
  const [importTasks, setImportTasks] = useKV<BulkImportTask[]>('import-tasks', [])
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  // Simulated API endpoints data
  useEffect(() => {
    if ((endpoints || []).length === 0) {
      const mockEndpoints: ApiEndpoint[] = [
        {
          id: '1',
          name: 'Telegram API Login',
          url_pattern: '/tgapi/{token}/{uuid}/{action}',
          category: 'api_login',
          status: 'active',
          price: 5.99,
          stock: 150,
          description: 'Direct API access for Telegram authentication',
          example_url: 'https://miha.uk/tgapi/uWCSVDgG6XMaMT5C/fa7e47cc-d2d2-4ead-bfc1-039a7135f057/GetHTML',
          auth_required: true,
          rate_limit: 100,
          created_at: '2024-01-15T10:00:00Z',
          last_used: '2024-01-20T14:30:00Z'
        },
        {
          id: '2', 
          name: 'Session Verification API',
          url_pattern: '/api/verify/{session_id}',
          category: 'session',
          status: 'active',
          price: 2.50,
          stock: 200,
          description: 'Verify session validity and status',
          example_url: 'https://api.example.com/verify/sess_abc123',
          auth_required: true,
          rate_limit: 50,
          created_at: '2024-01-10T09:00:00Z',
          last_used: '2024-01-20T16:45:00Z'
        },
        {
          id: '3',
          name: 'Authentication Code API',
          url_pattern: '/auth/code/{phone}',
          category: 'auth',
          status: 'testing',
          price: 1.99,
          stock: 75,
          description: 'Get authentication codes for phone numbers',
          example_url: 'https://auth.example.com/code/+1234567890',
          auth_required: true,
          rate_limit: 25,
          created_at: '2024-01-18T11:00:00Z',
          last_used: '2024-01-19T12:00:00Z'
        }
      ]
      setEndpoints(mockEndpoints)
    }
  }, [endpoints, setEndpoints])

  const handleCreateEndpoint = async (data: Partial<ApiEndpoint>) => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      name: data.name || '',
      url_pattern: data.url_pattern || '',
      category: data.category || 'api_login',
      status: 'testing',
      price: data.price || 0,
      stock: data.stock || 0,
      description: data.description || '',
      example_url: data.example_url || '',
      auth_required: true,
      rate_limit: data.rate_limit || 100,
      created_at: new Date().toISOString(),
      last_used: ''
    }

    setEndpoints(current => current ? [...current, newEndpoint] : [newEndpoint])
    toast.success('API endpoint created successfully')
    setIsCreating(false)
  }

  const handleBulkImport = async (file: File) => {
    setIsImporting(true)
    setImportProgress(0)

    const taskId = Date.now().toString()
    const task: BulkImportTask = {
      id: taskId,
      filename: file.name,
      status: 'processing',
      total_items: 100, // Mock total
      processed_items: 0,
      success_count: 0,
      error_count: 0,
      errors: [],
      created_at: new Date().toISOString()
    }

    setImportTasks(current => current ? [...current, task] : [task])

    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setImportProgress(i)
      
      setImportTasks(current => 
        current ? current.map(t => 
          t.id === taskId 
            ? { ...t, processed_items: i, success_count: Math.floor(i * 0.9), error_count: Math.floor(i * 0.1) }
            : t
        ) : []
      )
    }

    // Complete import
    setImportTasks(current => 
      current ? current.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed', processed_items: 100, success_count: 90, error_count: 10 }
          : t
      ) : []
    )

    setIsImporting(false)
    setImportProgress(0)
    toast.success('Bulk import completed')
  }

  const toggleEndpointStatus = (id: string) => {
    setEndpoints(current => 
      current ? current.map(endpoint => 
        endpoint.id === id 
          ? { ...endpoint, status: endpoint.status === 'active' ? 'inactive' : 'active' }
          : endpoint
      ) : []
    )
  }

  const copyEndpointUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const deleteEndpoint = (id: string) => {
    setEndpoints(current => current ? current.filter(endpoint => endpoint.id !== id) : [])
    toast.success('Endpoint deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Backend Integration</h1>
          <p className="text-muted-foreground mt-2">
            Manage API endpoints, payment processing, and automated inventory systems
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create API Endpoint</DialogTitle>
                <DialogDescription>
                  Add a new API endpoint for mobile login or authentication services
                </DialogDescription>
              </DialogHeader>
              <EndpointForm onSubmit={handleCreateEndpoint} onCancel={() => setIsCreating(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="payment">Payment Rules</TabsTrigger>
          <TabsTrigger value="inventory">Auto Inventory</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4">
            {(endpoints || []).map((endpoint) => (
              <Card key={endpoint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lightning size={20} className="text-accent" />
                        {endpoint.name}
                        <Badge variant={endpoint.status === 'active' ? 'default' : endpoint.status === 'testing' ? 'secondary' : 'outline'}>
                          {endpoint.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {endpoint.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">${endpoint.price}</Badge>
                      <Badge variant="outline">{endpoint.stock} in stock</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">URL Pattern</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                          {endpoint.url_pattern}
                        </code>
                        <Button size="sm" variant="outline" onClick={() => copyEndpointUrl(endpoint.url_pattern)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Example URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1 break-all">
                          {endpoint.example_url}
                        </code>
                        <Button size="sm" variant="outline" onClick={() => copyEndpointUrl(endpoint.example_url)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Rate limit: {endpoint.rate_limit}/min</span>
                        <span>Auth: {endpoint.auth_required ? 'Required' : 'None'}</span>
                        <span>Category: {endpoint.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleEndpointStatus(endpoint.id)}
                        >
                          {endpoint.status === 'active' ? (
                            <>
                              <StopCircle size={14} className="mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <PlayCircle size={14} className="mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          <Eye size={14} className="mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteEndpoint(endpoint.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentRulesManager />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <AutoInventoryManager />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <BulkImportManager 
            onImport={handleBulkImport}
            tasks={importTasks || []}
            isImporting={isImporting}
            progress={importProgress}
          />
        </TabsContent>
      </Tabs>

      {selectedEndpoint && (
        <Dialog open={!!selectedEndpoint} onOpenChange={() => setSelectedEndpoint(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Endpoint Details: {selectedEndpoint.name}</DialogTitle>
            </DialogHeader>
            <EndpointDetails endpoint={selectedEndpoint} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function EndpointForm({ onSubmit, onCancel }: { onSubmit: (data: Partial<ApiEndpoint>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url_pattern: '',
    category: 'api_login' as const,
    price: 0,
    stock: 0,
    description: '',
    example_url: '',
    rate_limit: 100
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Endpoint Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Telegram API Login"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api_login">API Login</SelectItem>
              <SelectItem value="session">Session</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="url_pattern">URL Pattern</Label>
        <Input
          id="url_pattern"
          value={formData.url_pattern}
          onChange={(e) => setFormData({...formData, url_pattern: e.target.value})}
          placeholder="/tgapi/{token}/{uuid}/{action}"
          required
        />
      </div>

      <div>
        <Label htmlFor="example_url">Example URL</Label>
        <Input
          id="example_url"
          value={formData.example_url}
          onChange={(e) => setFormData({...formData, example_url: e.target.value})}
          placeholder="https://miha.uk/tgapi/token/uuid/GetHTML"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Direct API access for Telegram authentication"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
            required
          />
        </div>
        <div>
          <Label htmlFor="rate_limit">Rate Limit (/min)</Label>
          <Input
            id="rate_limit"
            type="number"
            value={formData.rate_limit}
            onChange={(e) => setFormData({...formData, rate_limit: parseInt(e.target.value) || 100})}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Endpoint
        </Button>
      </div>
    </form>
  )
}

function EndpointDetails({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'} className="mt-1">
            {endpoint.status}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <p className="text-sm mt-1">{endpoint.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium">Price</Label>
          <p className="text-sm mt-1">${endpoint.price}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Stock</Label>
          <p className="text-sm mt-1">{endpoint.stock}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Rate Limit</Label>
          <p className="text-sm mt-1">{endpoint.rate_limit}/min</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">URL Pattern</Label>
        <code className="block bg-muted p-2 rounded text-sm mt-1">
          {endpoint.url_pattern}
        </code>
      </div>

      <div>
        <Label className="text-sm font-medium">Example URL</Label>
        <code className="block bg-muted p-2 rounded text-sm mt-1 break-all">
          {endpoint.example_url}
        </code>
      </div>

      <div>
        <Label className="text-sm font-medium">Description</Label>
        <p className="text-sm mt-1">{endpoint.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm mt-1">{new Date(endpoint.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Last Used</Label>
          <p className="text-sm mt-1">
            {endpoint.last_used ? new Date(endpoint.last_used).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  )
}

interface PaymentRules {
  min_amount: number
  max_amount: number
  decimal_precision: number
  payment_window_minutes: number
  auto_refund_enabled: boolean
  confirmation_blocks: number
}

interface InventorySettings {
  enabled: boolean
  auto_restock_threshold: number
  auto_disable_threshold: number
  validation_enabled: boolean
  retry_failed_validation: boolean
}

function PaymentRulesManager() {
  const [rules, setRules] = useKV<PaymentRules>('payment-rules', {
    min_amount: 0.01,
    max_amount: 1000,
    decimal_precision: 6,
    payment_window_minutes: 15,
    auto_refund_enabled: true,
    confirmation_blocks: 1
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} className="text-accent" />
          Payment Verification Rules
        </CardTitle>
        <CardDescription>
          Configure TRON payment processing and verification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_amount">Minimum Amount ($)</Label>
            <Input
              id="min_amount"
              type="number"
              step="0.01"
              value={rules?.min_amount || 0.01}
              onChange={(e) => setRules({...(rules || {} as PaymentRules), min_amount: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="max_amount">Maximum Amount ($)</Label>
            <Input
              id="max_amount"
              type="number"
              step="0.01"
              value={rules?.max_amount || 1000}
              onChange={(e) => setRules({...(rules || {} as PaymentRules), max_amount: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="decimal_precision">Decimal Precision</Label>
            <Input
              id="decimal_precision"
              type="number"
              min="2"
              max="8"
              value={rules?.decimal_precision || 6}
              onChange={(e) => setRules({...(rules || {} as PaymentRules), decimal_precision: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="payment_window">Payment Window (minutes)</Label>
            <Input
              id="payment_window"
              type="number"
              value={rules?.payment_window_minutes || 15}
              onChange={(e) => setRules({...(rules || {} as PaymentRules), payment_window_minutes: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Payment amounts will be generated with {rules?.decimal_precision || 6} decimal places for unique identification.
            Orders expire after {rules?.payment_window_minutes || 15} minutes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function AutoInventoryManager() {
  const [settings, setSettings] = useKV<InventorySettings>('auto-inventory', {
    enabled: true,
    auto_restock_threshold: 10,
    auto_disable_threshold: 5,
    validation_enabled: true,
    retry_failed_validation: true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gear size={20} className="text-accent" />
          Automatic Inventory Management
        </CardTitle>
        <CardDescription>
          Configure automated stock management and validation for API codes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restock_threshold">Auto Restock Threshold</Label>
            <Input
              id="restock_threshold"
              type="number"
              value={settings?.auto_restock_threshold || 10}
              onChange={(e) => setSettings({...(settings || {} as InventorySettings), auto_restock_threshold: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="disable_threshold">Auto Disable Threshold</Label>
            <Input
              id="disable_threshold"
              type="number"
              value={settings?.auto_disable_threshold || 5}
              onChange={(e) => setSettings({...(settings || {} as InventorySettings), auto_disable_threshold: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Products will be automatically restocked when inventory falls below {settings?.auto_restock_threshold || 10} units.
            Products will be disabled when stock reaches {settings?.auto_disable_threshold || 5} units.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function BulkImportManager({ onImport, tasks, isImporting, progress }: {
  onImport: (file: File) => void
  tasks: BulkImportTask[]
  isImporting: boolean
  progress: number
}) {
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImport(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      onImport(file)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} className="text-accent" />
            Bulk Import API Endpoints
          </CardTitle>
          <CardDescription>
            Upload CSV files or ZIP archives containing API endpoint configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {isImporting ? (
              <div className="space-y-4">
                <div className="text-lg font-medium">Importing...</div>
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-muted-foreground">{progress}% complete</div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium">Upload Import File</div>
                  <div className="text-sm text-muted-foreground">
                    Drag and drop or click to select CSV/ZIP files
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : task.status === 'failed' ? (
                      <XCircle size={20} className="text-red-500" />
                    ) : (
                      <Clock size={20} className="text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{task.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.processed_items}/{task.total_items} processed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-green-600">{task.success_count} success</span>
                      {task.error_count > 0 && (
                        <span className="text-red-600 ml-2">{task.error_count} errors</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}