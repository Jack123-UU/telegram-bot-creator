import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  Robot, 
  Terminal, 
  Play,
  Database,
  Shield,
  Network,
  Gear,
  Warning
} from '@phosphor-icons/react'

interface ServiceStatus {
  name: string
  status: 'running' | 'stopped' | 'error'
  port?: number
  description: string
}

export function BotSetup() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'PostgreSQL', status: 'running', port: 5432, description: 'Database service' },
    { name: 'Redis', status: 'running', port: 6379, description: 'Cache & queue service' },
    { name: 'Vault', status: 'running', port: 8200, description: 'Secrets management' },
    { name: 'Backend API', status: 'running', port: 8000, description: 'FastAPI backend' },
    { name: 'TeleBot', status: 'stopped', description: 'Telegram bot service' },
    { name: 'Payment Monitor', status: 'stopped', description: 'TRON payment monitoring' }
  ])

  const botToken = '8370071788:AAGrc3JKDs-lb_ITqZMAe8ufmQsB_3Qp5cA'
  const [isStarting, setIsStarting] = useState(false)

  const startBot = async () => {
    setIsStarting(true)
    
    // Simulate bot startup
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.name === 'TeleBot' 
          ? { ...service, status: 'running' as const }
          : service
      ))
      setIsStarting(false)
    }, 3000)
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle size={16} className="text-green-600" />
      case 'stopped':
        return <XCircle size={16} className="text-gray-400" />
      case 'error':
        return <XCircle size={16} className="text-red-600" />
    }
  }

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Running</Badge>
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Robot size={24} className="text-primary" />
            Bot Configuration & Startup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="startup">Startup</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Bot token has been configured for testing. This is a test token and safe to use for development.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Robot size={18} />
                    Telegram Bot Token
                  </h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                    {botToken}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    This token is configured in your .env file and ready for testing.
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database size={18} />
                    Environment Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Environment:</strong> Development
                    </div>
                    <div>
                      <strong>Backend URL:</strong> http://backend:8000
                    </div>
                    <div>
                      <strong>Redis URL:</strong> redis://redis:6379/0
                    </div>
                    <div>
                      <strong>Database:</strong> PostgreSQL
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Network size={18} />
                    TRON Configuration (Test Network)
                  </h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Network:</strong> Shasta Testnet</div>
                    <div><strong>Node URL:</strong> https://api.shasta.trongrid.io</div>
                    <div><strong>Payment Address:</strong> TTestPaymentAddress123456789012345678</div>
                    <div className="text-orange-600 mt-2">
                      <Warning size={14} className="inline mr-1" />
                      Using test values for development
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {service.port && (
                        <span className="text-sm text-gray-500">:{service.port}</span>
                      )}
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="startup" className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  Start the bot services to begin testing with your Telegram token.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Quick Start Commands</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      # Start all services with Docker Compose<br/>
                      docker-compose -f docker-compose.dev.yml up --build
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      # Or run the test script<br/>
                      ./run_test_bot.sh
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={startBot} 
                    disabled={isStarting}
                    className="flex items-center gap-2"
                  >
                    <Play size={16} />
                    {isStarting ? 'Starting Bot...' : 'Start TeleBot'}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Terminal size={16} />
                    View Logs
                  </Button>
                </div>

                {isStarting && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      🤖 Starting TeleBot services...
                      <div className="mt-1">This may take a few minutes on first run.</div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Gear size={20} />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Start the services</div>
                <div className="text-sm text-gray-600">Run the Docker Compose setup to start all backend services</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Test the bot in Telegram</div>
                <div className="text-sm text-gray-600">Search for your bot in Telegram and send /start command</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Monitor functionality</div>
                <div className="text-sm text-gray-600">Use the demo tab to simulate user interactions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}