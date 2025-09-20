import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Robot, Plus, Play, Pause, Gear, Trash } from '@phosphor-icons/react'

interface Bot {
  id: string
  name: string
  type: 'support' | 'sales' | 'analytics' | 'notification'
  status: 'online' | 'offline' | 'error'
  users: number
  messages: number
  uptime: string
  lastActive: string
}

export function BotManager() {
  const [bots, setBots] = useKV<Bot[]>('bots', [
    {
      id: '1',
      name: 'Support Bot',
      type: 'support',
      status: 'online',
      users: 234,
      messages: 1247,
      uptime: '99.8%',
      lastActive: '2 min ago'
    },
    {
      id: '2',
      name: 'Sales Bot',
      type: 'sales',
      status: 'online',
      users: 156,
      messages: 892,
      uptime: '99.5%',
      lastActive: '5 min ago'
    },
    {
      id: '3',
      name: 'Analytics Bot',
      type: 'analytics',
      status: 'offline',
      users: 89,
      messages: 445,
      uptime: '98.2%',
      lastActive: '2 hours ago'
    }
  ])

  const [newBotOpen, setNewBotOpen] = useState(false)
  const [newBot, setNewBot] = useState({
    name: '',
    type: 'support' as Bot['type'],
    description: ''
  })

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'online': return 'bg-success'
      case 'offline': return 'bg-muted-foreground'
      case 'error': return 'bg-destructive'
    }
  }

  const getTypeColor = (type: Bot['type']) => {
    switch (type) {
      case 'support': return 'bg-primary/10 text-primary'
      case 'sales': return 'bg-success/10 text-success'
      case 'analytics': return 'bg-accent/10 text-accent'
      case 'notification': return 'bg-warning/10 text-warning'
    }
  }

  const toggleBotStatus = (botId: string) => {
    setBots(currentBots => {
      if (!currentBots) return []
      return currentBots.map(bot => 
        bot.id === botId 
          ? { ...bot, status: bot.status === 'online' ? 'offline' : 'online' }
          : bot
      )
    })
  }

  const createBot = () => {
    if (!newBot.name) return

    const bot: Bot = {
      id: Date.now().toString(),
      name: newBot.name,
      type: newBot.type,
      status: 'offline',
      users: 0,
      messages: 0,
      uptime: '100%',
      lastActive: 'Never'
    }

    setBots(currentBots => currentBots ? [...currentBots, bot] : [bot])
    setNewBot({ name: '', type: 'support', description: '' })
    setNewBotOpen(false)
  }

  const deleteBot = (botId: string) => {
    setBots(currentBots => currentBots ? currentBots.filter(bot => bot.id !== botId) : [])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bot Manager</h1>
          <p className="text-muted-foreground mt-1">Configure and manage your bots</p>
        </div>
        <Dialog open={newBotOpen} onOpenChange={setNewBotOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Create Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bot</DialogTitle>
              <DialogDescription>
                Set up a new bot instance with custom configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Bot Name</Label>
                <Input
                  id="bot-name"
                  placeholder="Enter bot name"
                  value={newBot.name}
                  onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-type">Bot Type</Label>
                <Select value={newBot.type} onValueChange={(value: Bot['type']) => setNewBot(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="bot-description">Description</Label>
                <Textarea
                  id="bot-description"
                  placeholder="Describe the bot's purpose and functionality"
                  value={newBot.description}
                  onChange={(e) => setNewBot(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewBotOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createBot}>
                Create Bot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bots?.map((bot) => (
          <Card key={bot.id} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Robot size={20} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <Badge className={`text-xs mt-1 ${getTypeColor(bot.type)}`}>
                      {bot.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`} />
                  <span className="text-xs text-muted-foreground capitalize">{bot.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Users</div>
                  <div className="font-semibold">{bot.users}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Messages</div>
                  <div className="font-semibold">{bot.messages}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Uptime</div>
                  <div className="font-semibold">{bot.uptime}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last Active</div>
                  <div className="font-semibold">{bot.lastActive}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant={bot.status === 'online' ? 'destructive' : 'default'}
                  className="flex-1 gap-2"
                  onClick={() => toggleBotStatus(bot.id)}
                >
                  {bot.status === 'online' ? (
                    <>
                      <Pause size={14} />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Start
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <Gear size={14} />
                  Config
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => deleteBot(bot.id)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bots?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Robot size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bots created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first bot to start automating conversations
            </p>
            <Button onClick={() => setNewBotOpen(true)} className="gap-2">
              <Plus size={16} />
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}