import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Robot, Users, CloudArrowUp, Activity, TrendUp, Lightning } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface BotStats {
  totalBots: number
  activeBots: number
  totalUsers: number
  totalMessages: number
  deploymentsToday: number
  revenue: number
}

export function Dashboard() {
  const [stats, setStats] = useKV<BotStats>('dashboard-stats', {
    totalBots: 12,
    activeBots: 8,
    totalUsers: 1247,
    totalMessages: 24589,
    deploymentsToday: 5,
    revenue: 2850
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const currentStats = stats || {
    totalBots: 0,
    activeBots: 0,
    totalUsers: 0,
    totalMessages: 0,
    deploymentsToday: 0,
    revenue: 0
  }

  const statsCards = [
    {
      title: 'Active Bots',
      value: currentStats.activeBots,
      total: currentStats.totalBots,
      icon: Robot,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Users',
      value: currentStats.totalUsers,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
      format: 'number'
    },
    {
      title: 'Messages Today',
      value: currentStats.totalMessages,
      icon: Activity,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      format: 'number'
    },
    {
      title: 'Deployments',
      value: currentStats.deploymentsToday,
      icon: CloudArrowUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your bot ecosystem</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <div className="h-7 bg-muted rounded animate-pulse" />
                  ) : (
                    <>
                      {stat.format === 'number' ? formatNumber(stat.value) : stat.value}
                      {stat.total && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {stat.total}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center mt-2 text-xs text-success">
                  <TrendUp size={12} className="mr-1" />
                  +12% from last week
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightning size={20} className="text-warning" />
              Recent Bot Activity
            </CardTitle>
            <CardDescription>Latest bot interactions and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { bot: 'Support Bot', action: 'Handled 15 customer queries', time: '2 min ago', status: 'active' },
              { bot: 'Sales Bot', action: 'Generated 3 new leads', time: '5 min ago', status: 'active' },
              { bot: 'Analytics Bot', action: 'Generated daily report', time: '1 hour ago', status: 'completed' },
              { bot: 'Notification Bot', action: 'Sent 247 notifications', time: '2 hours ago', status: 'completed' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{activity.bot}</div>
                  <div className="text-xs text-muted-foreground">{activity.action}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                  <Badge 
                    variant={activity.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudArrowUp size={20} className="text-primary" />
              Deployment Status
            </CardTitle>
            <CardDescription>Current deployment pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Bot Instance #12', status: 'deploying', progress: 75, region: 'US East' },
              { name: 'Bot Instance #11', status: 'completed', progress: 100, region: 'EU West' },
              { name: 'Bot Instance #10', status: 'completed', progress: 100, region: 'Asia Pacific' },
              { name: 'Bot Instance #9', status: 'failed', progress: 0, region: 'US West' }
            ].map((deployment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-foreground">{deployment.name}</div>
                  <Badge 
                    variant={
                      deployment.status === 'completed' ? 'default' :
                      deployment.status === 'deploying' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {deployment.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{deployment.region}</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      deployment.status === 'completed' ? 'bg-success' :
                      deployment.status === 'deploying' ? 'bg-primary' : 'bg-destructive'
                    }`}
                    style={{ width: `${deployment.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Robot size={24} />
              Create New Bot
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CloudArrowUp size={24} />
              Deploy Instance
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users size={24} />
              Add Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}