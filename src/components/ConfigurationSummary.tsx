import { CheckCircle, Robot, Database, Shield, Network } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ConfigurationSummary() {
  const botToken = '8370071788:AAGrc3JKDs-lb_ITqZMAe8ufmQsB_3Qp5cA'
  
  return (
    <div className="space-y-4">
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Bot Token Successfully Configured!</strong> Your TeleBot is ready for testing with the provided token.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Robot size={20} className="text-blue-600" />
              Bot Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Token</div>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                {botToken}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Test Token
              </Badge>
              <Badge variant="outline">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database size={20} className="text-purple-600" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">PostgreSQL</span>
              <Badge variant="outline" className="text-xs">:5432</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Redis Cache</span>
              <Badge variant="outline" className="text-xs">:6379</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backend API</span>
              <Badge variant="outline" className="text-xs">:8000</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} className="text-orange-600" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Vault Secrets</span>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Dev Mode</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Encryption</span>
              <Badge className="bg-blue-100 text-blue-800 text-xs">AES-256</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Environment</span>
              <Badge variant="secondary" className="text-xs">Development</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={20} className="text-green-600" />
              Blockchain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">TRON Network</span>
              <Badge className="bg-green-100 text-green-800 text-xs">Shasta Test</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Payment Monitoring</span>
              <Badge variant="outline" className="text-xs">Configured</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Test Payments</span>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Start All Services:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                docker-compose -f docker-compose.dev.yml up --build
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Test Bot Token:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                python3 test_bot_token.py
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">View Bot Logs:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                docker-compose logs -f bot
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}