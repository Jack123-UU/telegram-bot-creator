import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, UserCheck, UserMinus, Crown, User } from '@phosphor-icons/react'

interface Agent {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'agent'
  status: 'active' | 'inactive' | 'pending'
  botsManaged: number
  revenue: number
  joinDate: string
  lastActive: string
  region: string
}

export function AgentManager() {
  const [agents, setAgents] = useKV<Agent[]>('agents', [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      botsManaged: 8,
      revenue: 12450,
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      region: 'North America'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      role: 'manager',
      status: 'active',
      botsManaged: 5,
      revenue: 8720,
      joinDate: '2024-02-20',
      lastActive: '1 day ago',
      region: 'Asia Pacific'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'agent',
      status: 'pending',
      botsManaged: 0,
      revenue: 0,
      joinDate: '2024-03-10',
      lastActive: 'Never',
      region: 'Europe'
    }
  ])

  const [newAgentOpen, setNewAgentOpen] = useState(false)
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    role: 'agent' as Agent['role'],
    region: ''
  })

  const getRoleColor = (role: Agent['role']) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive'
      case 'manager': return 'bg-warning/10 text-warning'
      case 'agent': return 'bg-primary/10 text-primary'
    }
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success'
      case 'inactive': return 'bg-muted-foreground/10 text-muted-foreground'
      case 'pending': return 'bg-warning/10 text-warning'
    }
  }

  const getRoleIcon = (role: Agent['role']) => {
    switch (role) {
      case 'admin': return Crown
      case 'manager': return UserCheck
      case 'agent': return User
    }
  }

  const createAgent = () => {
    if (!newAgent.name || !newAgent.email) return

    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      email: newAgent.email,
      role: newAgent.role,
      status: 'pending',
      botsManaged: 0,
      revenue: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
      region: newAgent.region
    }

    setAgents(currentAgents => currentAgents ? [...currentAgents, agent] : [agent])
    setNewAgent({ name: '', email: '', role: 'agent', region: '' })
    setNewAgentOpen(false)
  }

  const updateAgentStatus = (agentId: string, newStatus: Agent['status']) => {
    setAgents(currentAgents => {
      if (!currentAgents) return []
      return currentAgents.map(agent =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      )
    })
  }

  const deleteAgent = (agentId: string) => {
    setAgents(currentAgents => currentAgents ? currentAgents.filter(agent => agent.id !== agentId) : [])
  }

  const totalRevenue = agents?.reduce((sum, agent) => sum + agent.revenue, 0) || 0
  const activeAgents = agents?.filter(agent => agent.status === 'active').length || 0
  const totalBots = agents?.reduce((sum, agent) => sum + agent.botsManaged, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Manager</h1>
          <p className="text-muted-foreground mt-1">Manage your reseller network and partners</p>
        </div>
        <Dialog open={newAgentOpen} onOpenChange={setNewAgentOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Create a new agent account with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Full Name</Label>
                <Input
                  id="agent-name"
                  placeholder="Enter agent name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-email">Email Address</Label>
                <Input
                  id="agent-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-role">Role</Label>
                <Select value={newAgent.role} onValueChange={(value: Agent['role']) => setNewAgent(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-region">Region</Label>
                <Select value={newAgent.region} onValueChange={(value) => setNewAgent(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                    <SelectItem value="Latin America">Latin America</SelectItem>
                    <SelectItem value="Middle East & Africa">Middle East & Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewAgentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAgent}>
                Add Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
            <Users size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {agents?.length || 0} total agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <UserCheck size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From agent network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bots Managed
            </CardTitle>
            <Crown size={16} className="text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBots}</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Directory</CardTitle>
          <CardDescription>Manage agent permissions and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bots</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents?.map((agent) => {
                const RoleIcon = getRoleIcon(agent.role)
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <RoleIcon size={16} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(agent.role)}>
                        {agent.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.botsManaged}</TableCell>
                    <TableCell>${(agent.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell>{agent.region}</TableCell>
                    <TableCell>{agent.lastActive}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {agent.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateAgentStatus(agent.id, 'active')}
                          >
                            Approve
                          </Button>
                        )}
                        {agent.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAgentStatus(agent.id, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        )}
                        {agent.status === 'inactive' && (
                          <Button
                            size="sm"
                            onClick={() => updateAgentStatus(agent.id, 'active')}
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAgent(agent.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {agents?.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents added yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your reseller network by adding your first agent
              </p>
              <Button onClick={() => setNewAgentOpen(true)} className="gap-2">
                <Plus size={16} />
                Add Your First Agent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}