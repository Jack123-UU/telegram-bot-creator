import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChartBar, Download, TrendUp, Users, Chat, Activity } from '@phosphor-icons/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'

const messageData = [
  { name: 'Mon', messages: 120, users: 45 },
  { name: 'Tue', messages: 198, users: 67 },
  { name: 'Wed', messages: 230, users: 78 },
  { name: 'Thu', messages: 189, users: 56 },
  { name: 'Fri', messages: 267, users: 89 },
  { name: 'Sat', messages: 134, users: 34 },
  { name: 'Sun', messages: 156, users: 45 }
]

const botUsageData = [
  { name: 'Support Bot', value: 45, color: '#3B82F6' },
  { name: 'Sales Bot', value: 30, color: '#10B981' },
  { name: 'Analytics Bot', value: 15, color: '#8B5CF6' },
  { name: 'Notification Bot', value: 10, color: '#F59E0B' }
]

const performanceData = [
  { name: '00:00', responseTime: 120, throughput: 45 },
  { name: '04:00', responseTime: 89, throughput: 67 },
  { name: '08:00', responseTime: 234, throughput: 123 },
  { name: '12:00', responseTime: 167, throughput: 89 },
  { name: '16:00', responseTime: 145, throughput: 156 },
  { name: '20:00', responseTime: 198, throughput: 134 }
]

interface AnalyticsMetrics {
  totalInteractions: number
  avgResponseTime: number
  satisfactionRate: number
  activeUsers: number
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [metrics] = useKV<AnalyticsMetrics>('analytics-metrics', {
    totalInteractions: 12547,
    avgResponseTime: 156,
    satisfactionRate: 94.2,
    activeUsers: 1247
  })

  const currentMetrics = metrics || {
    totalInteractions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    activeUsers: 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor bot performance and user engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interactions
            </CardTitle>
            <Chat size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.totalInteractions.toLocaleString()}</div>
            <div className="flex items-center mt-1 text-xs text-success">
              <TrendUp size={12} className="mr-1" />
              +18% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
            <Activity size={16} className="text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgResponseTime}ms</div>
            <div className="flex items-center mt-1 text-xs text-success">
              <TrendUp size={12} className="mr-1" />
              -12% faster
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfaction Rate
            </CardTitle>
            <ChartBar size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.satisfactionRate}%</div>
            <div className="flex items-center mt-1 text-xs text-success">
              <TrendUp size={12} className="mr-1" />
              +2.1% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users size={16} className="text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center mt-1 text-xs text-success">
              <TrendUp size={12} className="mr-1" />
              +24% growth
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Message Volume</CardTitle>
            <CardDescription>Daily message count and unique users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="2"
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bot Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Usage Distribution</CardTitle>
            <CardDescription>Interaction breakdown by bot type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={botUsageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {botUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Response time and throughput over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Throughput (req/min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Commands</CardTitle>
          <CardDescription>Most frequently used bot commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { command: '/help', usage: 2547, percentage: 34 },
              { command: '/status', usage: 1823, percentage: 24 },
              { command: '/pricing', usage: 1456, percentage: 19 },
              { command: '/support', usage: 987, percentage: 13 },
              { command: '/demo', usage: 745, percentage: 10 }
            ].map((item) => (
              <div key={item.command} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {item.command}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {item.usage} uses
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-[3rem] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}