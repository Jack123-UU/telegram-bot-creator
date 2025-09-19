import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Robot, ChartBar, Users, CloudArrowUp, List } from '@phosphor-icons/react'
import { Dashboard } from '@/components/Dashboard'
import { BotManager } from '@/components/BotManager'
import { Analytics } from '@/components/Analytics'
import { AgentManager } from '@/components/AgentManager'
import { DeploymentCenter } from '@/components/DeploymentCenter'
import { cn } from '@/lib/utils'

export type NavigationItem = 'dashboard' | 'bots' | 'analytics' | 'agents' | 'deploy'

function App() {
  const [currentView, setCurrentView] = useKV<NavigationItem>('current-view', 'dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: ChartBar },
    { id: 'bots' as const, label: 'Bot Manager', icon: Robot },
    { id: 'analytics' as const, label: 'Analytics', icon: ChartBar },
    { id: 'agents' as const, label: 'Agents', icon: Users },
    { id: 'deploy' as const, label: 'Deploy', icon: CloudArrowUp },
  ]

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'bots':
        return <BotManager />
      case 'analytics':
        return <Analytics />
      case 'agents':
        return <AgentManager />
      case 'deploy':
        return <DeploymentCenter />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Robot size={24} weight="bold" className="text-primary" />
          <h1 className="text-xl font-bold text-foreground">Bot Manager</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <List size={20} />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <Robot size={28} weight="bold" className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Bot Manager</h1>
          </div>
          
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    currentView === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App