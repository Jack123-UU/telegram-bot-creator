import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { CloudArrowUp, Plus, Play, Stop, Copy, Trash, Globe, Database } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Deployment {
  id: string
  name: string
  botType: string
  region: string
  status: 'deploying' | 'running' | 'stopped' | 'failed' | 'pending'
  progress: number
  url?: string
  resources: {
    cpu: string
    memory: string
    storage: string
  }
  createdAt: string
  lastUpdated: string
  logs: string[]
}

export function DeploymentCenter() {
  const [deployments, setDeployments] = useKV<Deployment[]>('deployments', [
    {
      id: '1',
      name: 'Support Bot Instance',
      botType: 'support',
      region: 'US East',
      status: 'running',
      progress: 100,
      url: 'https://bot-1.example.com',
      resources: { cpu: '1 vCPU', memory: '512MB', storage: '10GB' },
      createdAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:35:00Z',
      logs: ['Container started successfully', 'Bot initialized', 'Listening on port 3000']
    },
    {
      id: '2',
      name: 'Sales Bot Instance',
      botType: 'sales',
      region: 'EU West',
      status: 'deploying',
      progress: 75,
      resources: { cpu: '1 vCPU', memory: '512MB', storage: '10GB' },
      createdAt: '2024-03-15T11:00:00Z',
      lastUpdated: '2024-03-15T11:05:00Z',
      logs: ['Building container...', 'Pulling dependencies...', 'Starting deployment...']
    }
  ])

  const [newDeploymentOpen, setNewDeploymentOpen] = useState(false)
  const [selectedBot, setSelectedBot] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [deploymentName, setDeploymentName] = useState('')

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'running': return 'bg-success/10 text-success'
      case 'deploying': return 'bg-warning/10 text-warning'
      case 'stopped': return 'bg-muted-foreground/10 text-muted-foreground'
      case 'failed': return 'bg-destructive/10 text-destructive'
      case 'pending': return 'bg-accent/10 text-accent'
    }
  }

  const createDeployment = async () => {
    if (!deploymentName || !selectedBot || !selectedRegion) {
      toast.error('Please fill in all required fields')
      return
    }

    const newDeployment: Deployment = {
      id: Date.now().toString(),
      name: deploymentName,
      botType: selectedBot,
      region: selectedRegion,
      status: 'deploying',
      progress: 0,
      resources: { cpu: '1 vCPU', memory: '512MB', storage: '10GB' },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      logs: ['Initializing deployment...']
    }

      setDeployments(current => {
        if (!current) return [newDeployment]
        return [...current, newDeployment]
      })
    setNewDeploymentOpen(false)
    setDeploymentName('')
    setSelectedBot('')
    setSelectedRegion('')

    toast.success('Deployment started successfully')

    // Simulate deployment progress
    simulateDeployment(newDeployment.id)
  }

  const simulateDeployment = async (deploymentId: string) => {
    const steps = [
      { progress: 20, log: 'Building container image...' },
      { progress: 40, log: 'Pushing to registry...' },
      { progress: 60, log: 'Allocating resources...' },
      { progress: 80, log: 'Starting container...' },
      { progress: 100, log: 'Deployment completed successfully', status: 'running' as const, url: `https://bot-${deploymentId}.example.com` }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setDeployments(current => {
        if (!current) return []
        return current.map(deployment => {
          if (deployment.id === deploymentId) {
            return {
              ...deployment,
              progress: step.progress,
              status: step.status || deployment.status,
              url: step.url || deployment.url,
              logs: [...deployment.logs, step.log],
              lastUpdated: new Date().toISOString()
            }
          }
          return deployment
        })
      })
    }
  }

  const stopDeployment = (deploymentId: string) => {
    setDeployments(current => {
      if (!current) return []
      return current.map(deployment =>
        deployment.id === deploymentId
          ? { ...deployment, status: 'stopped', lastUpdated: new Date().toISOString() }
          : deployment
      )
    })
    toast.success('Deployment stopped')
  }

  const deleteDeployment = (deploymentId: string) => {
    setDeployments(current => current ? current.filter(d => d.id !== deploymentId) : [])
    toast.success('Deployment deleted')
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const runningDeployments = deployments?.filter(d => d.status === 'running').length || 0
  const deployingCount = deployments?.filter(d => d.status === 'deploying').length || 0
  const totalDeployments = deployments?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deployment Center</h1>
          <p className="text-muted-foreground mt-1">Deploy and manage bot instances across regions</p>
        </div>
        <Dialog open={newDeploymentOpen} onOpenChange={setNewDeploymentOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              New Deployment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deploy New Instance</DialogTitle>
              <DialogDescription>
                Create a new bot deployment in your preferred region
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deployment-name">Deployment Name</Label>
                <Input
                  id="deployment-name"
                  placeholder="My Bot Instance"
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-type">Bot Type</Label>
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bot type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Support Bot</SelectItem>
                    <SelectItem value="sales">Sales Bot</SelectItem>
                    <SelectItem value="analytics">Analytics Bot</SelectItem>
                    <SelectItem value="notification">Notification Bot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Deployment Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US East">US East (N. Virginia)</SelectItem>
                    <SelectItem value="US West">US West (Oregon)</SelectItem>
                    <SelectItem value="EU West">EU West (Ireland)</SelectItem>
                    <SelectItem value="EU Central">EU Central (Frankfurt)</SelectItem>
                    <SelectItem value="Asia Pacific">Asia Pacific (Singapore)</SelectItem>
                    <SelectItem value="Asia Northeast">Asia Northeast (Tokyo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Resource Allocation</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>CPU: 1 vCPU</div>
                  <div>Memory: 512MB RAM</div>
                  <div>Storage: 10GB SSD</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewDeploymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createDeployment}>
                Deploy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running Instances
            </CardTitle>
            <Database size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningDeployments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDeployments} total deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deploying
            </CardTitle>
            <CloudArrowUp size={16} className="text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployingCount}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regions
            </CardTitle>
            <Globe size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Available regions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deployments */}
      <div className="space-y-4">
        {deployments?.map((deployment) => (
          <Card key={deployment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{deployment.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{deployment.botType}</Badge>
                    <span>•</span>
                    <span>{deployment.region}</span>
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(deployment.status)}>
                  {deployment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deployment.status === 'deploying' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Deployment Progress</span>
                    <span>{deployment.progress}%</span>
                  </div>
                  <Progress value={deployment.progress} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">CPU</div>
                  <div className="font-medium">{deployment.resources.cpu}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Memory</div>
                  <div className="font-medium">{deployment.resources.memory}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Storage</div>
                  <div className="font-medium">{deployment.resources.storage}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {new Date(deployment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {deployment.url && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe size={16} className="text-muted-foreground" />
                  <code className="flex-1 text-sm">{deployment.url}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(deployment.url!)}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Recent Logs</div>
                <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                  {deployment.logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {deployment.status === 'running' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopDeployment(deployment.id)}
                  >
                    <Stop size={14} className="mr-2" />
                    Stop
                  </Button>
                )}
                
                {deployment.status === 'stopped' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Restart logic would go here
                      toast.success('Restart initiated')
                    }}
                  >
                    <Play size={14} className="mr-2" />
                    Start
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteDeployment(deployment.id)}
                >
                  <Trash size={14} className="mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {deployments?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CloudArrowUp size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
              <p className="text-muted-foreground mb-4">
                Deploy your first bot instance to start serving users
              </p>
              <Button onClick={() => setNewDeploymentOpen(true)} className="gap-2">
                <Plus size={16} />
                Create Your First Deployment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}