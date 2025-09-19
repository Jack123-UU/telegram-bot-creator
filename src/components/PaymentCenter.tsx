import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MobileApiVerification } from '@/components/MobileApiVerification'
import { 
  Wallet, 
  QrCode, 
  Clock, 
  CheckCircle, 
  XCircle,
  CopySimple,
  Eye,
  Warning,
  TrendUp,
  Shield,
  DeviceMobile
} from '@phosphor-icons/react'

interface Payment {
  id: string
  orderId: string
  amount: number
  uniqueAmount: number
  address: string
  txHash?: string
  status: 'pending' | 'confirmed' | 'failed' | 'expired'
  createdAt: string
  confirmedAt?: string
  timeout: string
}

interface PaymentSettings {
  tronAddress: string
  qrCodeUrl: string
  timeoutMinutes: number
  minAmount: number
  maxAmount: number
}

export function PaymentCenter() {
  const [payments, setPayments] = useKV<Payment[]>('payments', [
    {
      id: 'pay-001',
      orderId: 'ORD-1248',
      amount: 29.99,
      uniqueAmount: 29.991234,
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      txHash: '0x1234...abcd',
      status: 'confirmed',
      createdAt: '2024-01-16T10:30:00Z',
      confirmedAt: '2024-01-16T10:35:00Z',
      timeout: '2024-01-16T10:45:00Z'
    },
    {
      id: 'pay-002',
      orderId: 'ORD-1249',
      amount: 19.99,
      uniqueAmount: 19.995678,
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      status: 'pending',
      createdAt: '2024-01-16T11:00:00Z',
      timeout: '2024-01-16T11:15:00Z'
    },
    {
      id: 'pay-003',
      orderId: 'ORD-1247',
      amount: 49.99,
      uniqueAmount: 49.992345,
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      status: 'expired',
      createdAt: '2024-01-16T09:00:00Z',
      timeout: '2024-01-16T09:15:00Z'
    }
  ])

  const [settings, setSettings] = useKV<PaymentSettings>('payment-settings', {
    tronAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    timeoutMinutes: 15,
    minAmount: 1.0,
    maxAmount: 10000.0
  })

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)

  const currentPayments = payments || []
  const currentSettings = settings || {
    tronAddress: '',
    qrCodeUrl: '',
    timeoutMinutes: 15,
    minAmount: 1.0,
    maxAmount: 10000.0
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-success/10 text-success"><CheckCircle size={12} className="mr-1" />Confirmed</Badge>
      case 'pending': return <Badge className="bg-warning/10 text-warning"><Clock size={12} className="mr-1" />Pending</Badge>
      case 'failed': return <Badge className="bg-destructive/10 text-destructive"><XCircle size={12} className="mr-1" />Failed</Badge>
      case 'expired': return <Badge variant="secondary"><Clock size={12} className="mr-1" />Expired</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const stats = {
    totalPayments: currentPayments.length,
    confirmedPayments: currentPayments.filter(p => p.status === 'confirmed').length,
    pendingPayments: currentPayments.filter(p => p.status === 'pending').length,
    totalAmount: currentPayments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Center</h1>
          <p className="text-muted-foreground">Monitor TRON blockchain payments and mobile API verification</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsVerificationOpen(true)}
            className="gap-2"
          >
            <Shield size={16} />
            API Verification Rules
          </Button>
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet size={16} />
                Payment Settings
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Configuration</DialogTitle>
              <DialogDescription>
                Configure TRON address and payment parameters (requires approval)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">TRON Address (Fixed)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={currentSettings.tronAddress} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(currentSettings.tronAddress)}
                  >
                    <CopySimple size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Address changes require admin approval and 2FA verification
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Payment Timeout (minutes)</Label>
                  <Input 
                    type="number" 
                    value={currentSettings.timeoutMinutes}
                    min="5"
                    max="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min">Min Amount (USDT)</Label>
                  <Input 
                    type="number" 
                    value={currentSettings.minAmount}
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>QR Code Preview</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img 
                    src={currentSettings.qrCodeUrl} 
                    alt="Payment QR Code"
                    className="w-32 h-32 border rounded"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Address</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {currentSettings.tronAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customers scan this QR code to send payments
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsSettingsDialogOpen(false)}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile API Verification */}
      <MobileApiVerification
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.confirmedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalAmount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed payments only
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                All payment transactions with unique amount identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Unique Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Timeout</TableHead>
                    <TableHead>TX Hash</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell className="font-mono text-sm">
                        ${payment.uniqueAmount.toFixed(6)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.timeout).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payment.txHash ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs">{payment.txHash.slice(0, 10)}...</code>
                            <Button size="sm" variant="ghost">
                              <Eye size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode size={20} />
                  Payment QR Code
                </CardTitle>
                <CardDescription>
                  Fixed address for all transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <img 
                  src={currentSettings.qrCodeUrl} 
                  alt="Payment QR Code"
                  className="mx-auto w-48 h-48 border rounded-lg"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">TRON Address</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {currentSettings.tronAddress}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(currentSettings.tronAddress)}
                    >
                      <CopySimple size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warning size={20} />
                  System Status
                </CardTitle>
                <CardDescription>
                  Real-time blockchain monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">TRON Network</p>
                      <p className="text-xs text-muted-foreground">Mainnet connected</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">Payment Listener</p>
                      <p className="text-xs text-muted-foreground">Monitoring transactions</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">Pending Payments</p>
                      <p className="text-xs text-muted-foreground">{stats.pendingPayments} awaiting</p>
                    </div>
                  </div>
                  <Badge className="bg-warning/10 text-warning">Monitoring</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>
                Payment performance and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-success">98.5%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">2.3 min</div>
                  <p className="text-sm text-muted-foreground">Avg. Confirmation</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">0.1%</div>
                  <p className="text-sm text-muted-foreground">Timeout Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}