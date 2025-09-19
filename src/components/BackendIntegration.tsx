import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { 
  Robot, 
  Wallet, 
  CheckCircle, 
  Warning, 
  Copy,
  Eye,
  EyeSlash,
  QrCode,
  Lightning
} from '@phosphor-icons/react'

interface BackendStatus {
  status: string
  timestamp: string
  services: {
    database: string
    redis: string
    vault: string
    tron: string
  }
}

interface PaymentConfig {
  paymentAddress: string
  minConfirmations: number
  paymentTimeout: number
  supportedTokens: string[]
}

export function BackendIntegration() {
  const [backendStatus, setBackendStatus] = useKV<BackendStatus>('backend-status', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected', 
      vault: 'connected',
      tron: 'connected'
    }
  })

  const [paymentConfig, setPaymentConfig] = useKV<PaymentConfig>('payment-config', {
    paymentAddress: 'TDevAddress123456789012345678901234',
    minConfirmations: 1,
    paymentTimeout: 15,
    supportedTokens: ['USDT-TRC20']
  })

  const [showAddress, setShowAddress] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useKV('last-backend-sync', new Date().toISOString())

  const checkBackendHealth = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to backend health endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newStatus: BackendStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          redis: 'connected',
          vault: 'connected',
          tron: 'connected'
        }
      }
      
      setBackendStatus(newStatus)
      setLastSync(new Date().toISOString())
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error':
      case 'disconnected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error':
      case 'disconnected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Backend Integration</h2>
        <p className="text-muted-foreground">Monitor and configure your Python backend services</p>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Real-time status of backend services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${backendStatus?.services.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL</p>
                </div>
              </div>
              <Badge className={getStatusBadge(backendStatus?.services.database || 'unknown')}>
                {backendStatus?.services.database || 'unknown'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${backendStatus?.services.redis === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">Cache</p>
                  <p className="text-sm text-muted-foreground">Redis</p>
                </div>
              </div>
              <Badge className={getStatusBadge(backendStatus?.services.redis || 'unknown')}>
                {backendStatus?.services.redis || 'unknown'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${backendStatus?.services.vault === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">Vault</p>
                  <p className="text-sm text-muted-foreground">Secrets</p>
                </div>
              </div>
              <Badge className={getStatusBadge(backendStatus?.services.vault || 'unknown')}>
                {backendStatus?.services.vault || 'unknown'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${backendStatus?.services.tron === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">TRON</p>
                  <p className="text-sm text-muted-foreground">Blockchain</p>
                </div>
              </div>
              <Badge className={getStatusBadge(backendStatus?.services.tron || 'unknown')}>
                {backendStatus?.services.tron || 'unknown'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(lastSync || new Date().toISOString()).toLocaleString()}
            </div>
            <Button 
              onClick={checkBackendHealth}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? 'Checking...' : 'Refresh Status'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Configuration
            </CardTitle>
            <CardDescription>TRON blockchain payment settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-address">Payment Address</Label>
              <div className="flex gap-2">
                <Input
                  id="payment-address"
                  type={showAddress ? "text" : "password"}
                  value={paymentConfig?.paymentAddress || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddress(!showAddress)}
                >
                  {showAddress ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentConfig?.paymentAddress || '')}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-confirmations">Min Confirmations</Label>
                <Input
                  id="min-confirmations"
                  type="number"
                  value={paymentConfig?.minConfirmations || 1}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-timeout">Payment Timeout (min)</Label>
                <Input
                  id="payment-timeout"
                  type="number"
                  value={paymentConfig?.paymentTimeout || 15}
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supported Tokens</Label>
              <div className="flex gap-2">
                {(paymentConfig?.supportedTokens || []).map((token) => (
                  <Badge key={token} variant="secondary">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Robot className="h-5 w-5" />
              Bot Integration
            </CardTitle>
            <CardDescription>Telegram bot connection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Robot className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">TeleBot Sales Main</p>
                  <p className="text-sm text-muted-foreground">@telebot_sales_main</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Commands/Hour</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Bot Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available backend API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GET /health</p>
                <p className="text-sm text-muted-foreground">System health check</p>
              </div>
              <Badge className="bg-green-100 text-green-800">200</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">POST /api/v1/users</p>
                <p className="text-sm text-muted-foreground">Create or get user</p>
              </div>
              <Badge className="bg-green-100 text-green-800">200</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GET /api/v1/products</p>
                <p className="text-sm text-muted-foreground">List products</p>
              </div>
              <Badge className="bg-green-100 text-green-800">200</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">POST /api/v1/orders</p>
                <p className="text-sm text-muted-foreground">Create order</p>
              </div>
              <Badge className="bg-green-100 text-green-800">200</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">POST /internal/payments/notify</p>
                <p className="text-sm text-muted-foreground">Payment notification</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Internal</Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Base URL: http://localhost:8000
              </div>
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}