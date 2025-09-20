import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Shield, 
  Key, 
  Warning, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lock,
  LockOpen,
  HardDrive,
  Database,
  ArrowClockwise,
  Download,
  Gear,
  Activity,
  Bell
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SecurityCheck {
  id: string
  name: string
  description: string
  status: 'passed' | 'warning' | 'failed' | 'pending'
  lastChecked: string
  details?: string
}

interface EnvironmentVariable {
  name: string
  description: string
  required: boolean
  configured: boolean
  sensitive: boolean
  lastUpdated?: string
}

interface VaultStatus {
  connected: boolean
  sealed: boolean
  version: string
  policies: number
  secrets: number
  lastSync: string
}

export function ProductionSecurity() {
  const [securityChecks, setSecurityChecks] = useKV<SecurityCheck[]>('security-checks', [])
  const [environmentVars, setEnvironmentVars] = useKV<EnvironmentVariable[]>('env-vars', [])
  const [vaultStatus, setVaultStatus] = useKV<VaultStatus>('vault-status', {
    connected: false,
    sealed: false,
    version: 'Unknown',
    policies: 0,
    secrets: 0,
    lastSync: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Initialize security checks
  useEffect(() => {
    if (!securityChecks || securityChecks.length === 0) {
      const initialChecks: SecurityCheck[] = [
        {
          id: 'vault-connection',
          name: 'Vault Connection',
          description: 'HashiCorp Vault is accessible and operational',
          status: 'pending',
          lastChecked: new Date().toISOString()
        },
        {
          id: 'ssl-certificates',
          name: 'SSL Certificates',
          description: 'Valid SSL certificates for all endpoints',
          status: 'pending',
          lastChecked: new Date().toISOString()
        },
        {
          id: 'secret-rotation',
          name: 'Secret Rotation',
          description: 'All secrets rotated within policy timeframe',
          status: 'pending',
          lastChecked: new Date().toISOString()
        },
        {
          id: 'network-policies',
          name: 'Network Policies',
          description: 'Kubernetes network policies properly configured',
          status: 'pending',
          lastChecked: new Date().toISOString()
        },
        {
          id: 'rbac-config',
          name: 'RBAC Configuration',
          description: 'Role-based access control properly implemented',
          status: 'pending',
          lastChecked: new Date().toISOString()
        },
        {
          id: 'backup-integrity',
          name: 'Backup Integrity',
          description: 'Backups are functioning and data is recoverable',
          status: 'pending',
          lastChecked: new Date().toISOString()
        }
      ]
      setSecurityChecks(initialChecks)
    }
  }, [securityChecks, setSecurityChecks])

  // Initialize environment variables
  useEffect(() => {
    if (!environmentVars || environmentVars.length === 0) {
      const initialVars: EnvironmentVariable[] = [
        {
          name: 'BOT_TOKEN',
          description: 'Telegram bot authentication token',
          required: true,
          configured: false,
          sensitive: true
        },
        {
          name: 'DATABASE_URL',
          description: 'PostgreSQL database connection string',
          required: true,
          configured: false,
          sensitive: true
        },
        {
          name: 'REDIS_URL',
          description: 'Redis cache connection string',
          required: true,
          configured: false,
          sensitive: true
        },
        {
          name: 'VAULT_ADDR',
          description: 'HashiCorp Vault server address',
          required: true,
          configured: false,
          sensitive: false
        },
        {
          name: 'TRON_PRIVATE_KEY',
          description: 'TRON wallet private key for payments',
          required: false,
          configured: false,
          sensitive: true
        },
        {
          name: 'JWT_SECRET_KEY',
          description: 'JWT token signing secret',
          required: true,
          configured: false,
          sensitive: true
        },
        {
          name: 'AES_KEY',
          description: 'AES encryption key for file storage',
          required: true,
          configured: false,
          sensitive: true
        },
        {
          name: 'SENTRY_DSN',
          description: 'Sentry error tracking DSN',
          required: false,
          configured: false,
          sensitive: true
        }
      ]
      setEnvironmentVars(initialVars)
    }
  }, [environmentVars, setEnvironmentVars])

  const runSecurityCheck = async (checkId: string) => {
    setIsLoading(true)
    
    try {
      // Simulate security check
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSecurityChecks((currentChecks) => 
        currentChecks?.map(check => 
          check.id === checkId 
            ? { 
                ...check, 
                status: Math.random() > 0.3 ? 'passed' : 'warning' as const,
                lastChecked: new Date().toISOString(),
                details: Math.random() > 0.3 
                  ? 'Check completed successfully' 
                  : 'Minor configuration issue detected'
              }
            : check
        ) || []
      )
      
      toast.success(`Security check "${checkId}" completed`)
    } catch (error) {
      toast.error(`Security check failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runAllSecurityChecks = async () => {
    setIsLoading(true)
    
    try {
      if (securityChecks) {
        for (const check of securityChecks) {
          await runSecurityCheck(check.id)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      toast.success('All security checks completed')
    } catch (error) {
      toast.error(`Security check suite failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const validateEnvironmentVars = async () => {
    setIsLoading(true)
    
    try {
      // Simulate environment validation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEnvironmentVars((currentVars) => 
        currentVars?.map(envVar => ({
          ...envVar,
          configured: Math.random() > 0.2,
          lastUpdated: new Date().toISOString()
        })) || []
      )
      
      toast.success('Environment variables validated')
    } catch (error) {
      toast.error(`Environment validation failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const syncVaultStatus = async () => {
    setIsLoading(true)
    
    try {
      // Simulate Vault status check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVaultStatus({
        connected: true,
        sealed: false,
        version: '1.15.2',
        policies: 12,
        secrets: 28,
        lastSync: new Date().toISOString()
      })
      
      toast.success('Vault status synchronized')
    } catch (error) {
      toast.error(`Vault sync failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle size={16} className="mr-1" />Passed</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Warning size={16} className="mr-1" />Warning</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle size={16} className="mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="outline"><Clock size={16} className="mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getOverallSecurityScore = () => {
    if (!securityChecks || securityChecks.length === 0) return 0
    
    const totalChecks = securityChecks.length
    const passedChecks = securityChecks.filter(check => check.status === 'passed').length
    const warningChecks = securityChecks.filter(check => check.status === 'warning').length
    
    return Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)
  }

  const downloadSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      securityScore: getOverallSecurityScore(),
      checks: securityChecks,
      environmentVars: environmentVars?.map(env => ({
        ...env,
        configured: env.configured ? 'Yes' : 'No'
      })),
      vaultStatus
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Security report downloaded')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Security</h1>
          <p className="text-muted-foreground">Monitor and manage security configuration for production deployment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadSecurityReport}>
            <Download size={20} className="mr-2" />
            Export Report
          </Button>
          <Button onClick={runAllSecurityChecks} disabled={isLoading}>
            <ArrowClockwise size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run All Checks
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={24} className="text-primary" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security posture based on configuration checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold text-primary">
              {getOverallSecurityScore()}%
            </div>
            <div className="text-sm text-muted-foreground">
              {securityChecks?.filter(c => c.status === 'passed').length || 0} of {securityChecks?.length || 0} checks passed
            </div>
          </div>
          <Progress value={getOverallSecurityScore()} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checks">Security Checks</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vault Status</p>
                    <p className="text-2xl font-bold text-primary">
                      {vaultStatus?.connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  {vaultStatus?.connected ? (
                    <CheckCircle size={24} className="text-green-500" />
                  ) : (
                    <XCircle size={24} className="text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Secrets</p>
                    <p className="text-2xl font-bold text-primary">{vaultStatus?.secrets || 0}</p>
                  </div>
                  <Key size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Environment Vars</p>
                    <p className="text-2xl font-bold text-primary">
                      {environmentVars?.filter(v => v.configured).length || 0}/{environmentVars?.length || 0}
                    </p>
                  </div>
                  <Gear size={24} className="text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Check</p>
                    <p className="text-sm font-bold text-primary">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Activity size={24} className="text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common security management tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" onClick={validateEnvironmentVars} disabled={isLoading}>
                <CheckCircle size={20} className="mr-2" />
                Validate Environment
              </Button>
              <Button variant="outline" onClick={syncVaultStatus} disabled={isLoading}>
                <ArrowClockwise size={20} className="mr-2" />
                Sync Vault Status
              </Button>
              <Button variant="outline" onClick={downloadSecurityReport}>
                <Download size={20} className="mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Checks Tab */}
        <TabsContent value="checks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Checks</CardTitle>
                  <CardDescription>
                    Automated security configuration validation
                  </CardDescription>
                </div>
                <Button onClick={runAllSecurityChecks} disabled={isLoading}>
                  <ArrowClockwise size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Run All Checks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityChecks?.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{check.name}</h4>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{check.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {new Date(check.lastChecked).toLocaleString()}
                      </p>
                      {check.details && (
                        <p className="text-xs text-blue-600 mt-1">{check.details}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => runSecurityCheck(check.id)}
                      disabled={isLoading}
                    >
                      <ArrowClockwise size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                      Check
                    </Button>
                  </div>
                )) || <p className="text-muted-foreground">No security checks configured</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Production environment configuration status
                  </CardDescription>
                </div>
                <Button onClick={validateEnvironmentVars} disabled={isLoading}>
                  <CheckCircle size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Validate All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {environmentVars?.map((envVar) => (
                  <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {envVar.name}
                        </code>
                        {envVar.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                        {envVar.sensitive && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock size={12} className="mr-1" />
                            Sensitive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{envVar.description}</p>
                      {envVar.lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last updated: {new Date(envVar.lastUpdated).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {envVar.configured ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle size={12} className="mr-1" />
                          Missing
                        </Badge>
                      )}
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No environment variables configured</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vault Tab */}
        <TabsContent value="vault" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  Vault Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection</span>
                  <Badge variant={vaultStatus?.connected ? "default" : "destructive"}>
                    {vaultStatus?.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seal Status</span>
                  <Badge variant={vaultStatus?.sealed ? "destructive" : "default"}>
                    {vaultStatus?.sealed ? (
                      <>
                        <Lock size={12} className="mr-1" />
                        Sealed
                      </>
                    ) : (
                      <>
                        <LockOpen size={12} className="mr-1" />
                        Unsealed
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version</span>
                  <span className="text-sm text-muted-foreground">{vaultStatus?.version || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Policies</span>
                  <span className="text-sm text-muted-foreground">{vaultStatus?.policies || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Secrets</span>
                  <span className="text-sm text-muted-foreground">{vaultStatus?.secrets || 0}</span>
                </div>
                <Separator />
                <Button onClick={syncVaultStatus} disabled={isLoading} className="w-full">
                  <ArrowClockwise size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key size={20} />
                  Secret Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Secrets are automatically managed through External Secrets Operator.
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Secret Paths:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• secret/telebot/bot</li>
                    <li>• secret/telebot/api</li>
                    <li>• secret/telebot/database</li>
                    <li>• secret/telebot/payment</li>
                    <li>• secret/telebot/storage</li>
                  </ul>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Last sync: {vaultStatus?.lastSync ? new Date(vaultStatus.lastSync).toLocaleString() : 'Never'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Security Monitoring
              </CardTitle>
              <CardDescription>
                Real-time security events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Security monitoring dashboard</p>
                <p className="text-sm">Connect to your monitoring system to view real-time security events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}