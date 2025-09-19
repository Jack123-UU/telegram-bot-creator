import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendUp, 
  Users, 
  Package, 
  Wallet, 
  Shield, 
  Robot,
  Warning,
  CheckCircle,
  Clock
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activeBots: number
  totalAgents: number
  pendingOrders: number
  successfulPayments: number
}

export function Dashboard() {
  const [stats] = useKV<DashboardStats>('dashboard-stats', {
    totalOrders: 1247,
    totalRevenue: 45680.50,
    activeBots: 3,
    totalAgents: 12,
    pendingOrders: 8,
    successfulPayments: 1239
  })

  const currentStats = stats || {
    totalOrders: 0,
    totalRevenue: 0,
    activeBots: 0,
    totalAgents: 0,
    pendingOrders: 0,
    successfulPayments: 0
  }

  const recentActivities = [
    { id: 1, type: 'payment', message: 'Payment received: $29.99 USDT', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'order', message: 'New order #ORD-1248', time: '5 minutes ago', status: 'pending' },
    { id: 3, type: 'agent', message: 'Agent deployment completed', time: '12 minutes ago', status: 'success' },
    { id: 4, type: 'security', message: 'Security scan completed', time: '1 hour ago', status: 'success' },
    { id: 5, type: 'bot', message: 'Bot @testbot_001 status check', time: '2 hours ago', status: 'warning' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <Wallet size={16} className="text-success" />
      case 'order': return <Package size={16} className="text-primary" />
      case 'agent': return <Users size={16} className="text-accent" />
      case 'security': return <Shield size={16} className="text-success" />
      case 'bot': return <Robot size={16} className="text-warning" />
      default: return <Activity size={16} />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-success" />
      case 'warning': return <Warning size={16} className="text-warning" />
      case 'pending': return <Clock size={16} className="text-muted-foreground" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Telegram bot sales platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Robot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.activeBots}</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> new this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Upload New Products
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Robot className="mr-2 h-4 w-4" />
              Deploy New Bot
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add New Agent
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Security Audit
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {getStatusIcon(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Real-time platform health monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">Payment System</p>
                  <p className="text-sm text-muted-foreground">TRON network</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">Online</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">Security Vault</p>
                  <p className="text-sm text-muted-foreground">Secrets management</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">Secure</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-muted-foreground">Backend health</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}