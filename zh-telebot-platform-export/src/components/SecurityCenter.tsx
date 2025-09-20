import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Vault,
  UserCheck,
  Lightning
} from '@phosphor-icons/react'

interface SecretEntry {
  id: string
  name: string
  type: 'bot_token' | 'wallet_key' | 'api_key' | 'payment_address'
  path: string
  lastRotated: string
  status: 'active' | 'pending_rotation' | 'deprecated'
  accessLevel: string
}

interface AuditLog {
  id: string
  action: string
  user: string
  resource: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  details: string
}

interface SecurityScan {
  id: string
  type: string
  status: 'passed' | 'failed' | 'warning'
  lastRun: string
  issues: number
}

export function SecurityCenter() {
  const [secrets, setSecrets] = useKV<SecretEntry[]>('security-secrets', [
    {
      id: 'sec-001',
      name: 'Main Bot Token',
      type: 'bot_token',
      path: '/vault/bots/main-token',
      lastRotated: '2024-01-15',
      status: 'active',
      accessLevel: 'bot-service'
    },
    {
      id: 'sec-002',
      name: 'Payment Wallet Private Key',
      type: 'wallet_key',
      path: '/vault/payments/wallet-key',
      lastRotated: '2024-01-10',
      status: 'active',
      accessLevel: 'payment-service'
    },
    {
      id: 'sec-003',
      name: 'TRON Payment Address',
      type: 'payment_address',
      path: '/vault/payments/tron-address',
      lastRotated: '2023-12-01',
      status: 'active',
      accessLevel: 'readonly'
    }
  ])

  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('security-audit', [
    {
      id: 'audit-001',
      action: 'Secret Access',
      user: 'bot-service',
      resource: '/vault/bots/main-token',
      timestamp: '2024-01-16T10:30:00Z',
      status: 'success',
      details: 'Bot token retrieved for startup'
    },
    {
      id: 'audit-002',
      action: 'Payment Address Change Request',
      user: 'admin@platform.com',
      resource: '/vault/payments/tron-address',
      timestamp: '2024-01-16T09:15:00Z',
      status: 'pending',
      details: 'Awaiting 2FA approval'
    },
    {
      id: 'audit-003',
      action: 'Failed Access Attempt',
      user: 'unknown',
      resource: '/vault/payments/wallet-key',
      timestamp: '2024-01-16T08:45:00Z',
      status: 'failed',
      details: 'Invalid credentials'
    }
  ])

  const [securityScans] = useKV<SecurityScan[]>('security-scans', [
    {
      id: 'scan-001',
      type: 'Secrets Audit',
      status: 'passed',
      lastRun: '2024-01-16T06:00:00Z',
      issues: 0
    },
    {
      id: 'scan-002',
      type: 'Access Control',
      status: 'warning',
      lastRun: '2024-01-16T06:00:00Z',
      issues: 2
    },
    {
      id: 'scan-003',
      type: 'File Encryption',
      status: 'passed',
      lastRun: '2024-01-16T06:00:00Z',
      issues: 0
    },
    {
      id: 'scan-004',
      type: 'Network Security',
      status: 'passed',
      lastRun: '2024-01-16T06:00:00Z',
      issues: 0
    }
  ])

  const [isRotationDialogOpen, setIsRotationDialogOpen] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<SecretEntry | null>(null)

  const currentSecrets = secrets || []
  const currentAuditLogs = auditLogs || []
  const currentScans = securityScans || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success/10 text-success">Active</Badge>
      case 'pending_rotation': return <Badge className="bg-warning/10 text-warning">Rotating</Badge>
      case 'deprecated': return <Badge variant="secondary">Deprecated</Badge>
      case 'success': return <Badge className="bg-success/10 text-success">Success</Badge>
      case 'failed': return <Badge className="bg-destructive/10 text-destructive">Failed</Badge>
      case 'pending': return <Badge className="bg-warning/10 text-warning">Pending</Badge>
      case 'passed': return <Badge className="bg-success/10 text-success">Passed</Badge>
      case 'warning': return <Badge className="bg-warning/10 text-warning">Warning</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScanIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />
      case 'warning': return <Warning className="h-4 w-4 text-warning" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const stats = {
    totalSecrets: currentSecrets.length,
    activeSecrets: currentSecrets.filter(s => s.status === 'active').length,
    pendingRotations: currentSecrets.filter(s => s.status === 'pending_rotation').length,
    recentAudits: currentAuditLogs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Center</h1>
          <p className="text-muted-foreground">Manage secrets, audit logs, and security policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Lightning size={16} />
            Run Security Scan
          </Button>
          <Button className="gap-2">
            <Vault size={16} />
            Vault Status
          </Button>
        </div>
      </div>

      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          All sensitive credentials are encrypted and stored in HashiCorp Vault with fine-grained RBAC. 
          Payment address changes require 2FA approval.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Secrets</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSecrets}</div>
            <p className="text-xs text-muted-foreground">
              Managed in vault
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeSecrets}</div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rotations</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingRotations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Lightning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAudits}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="secrets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="secrets">Secrets Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="scans">Security Scans</TabsTrigger>
          <TabsTrigger value="policies">Access Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vault size={20} />
                Vault Secrets
              </CardTitle>
              <CardDescription>
                Encrypted credentials and sensitive configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secret Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vault Path</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Last Rotated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSecrets.map((secret) => (
                    <TableRow key={secret.id}>
                      <TableCell className="font-medium">{secret.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{secret.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{secret.path}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{secret.accessLevel}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(secret.lastRotated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(secret.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedSecret(secret)
                              setIsRotationDialogOpen(true)
                            }}
                          >
                            <Key size={16} />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={20} />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Complete history of security-related actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} />
                          {log.user}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.resource}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Security Scans
                </CardTitle>
                <CardDescription>
                  Automated security assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getScanIcon(scan.status)}
                      <div>
                        <p className="text-sm font-medium">{scan.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Last run: {new Date(scan.lastRun).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(scan.status)}
                      {scan.issues > 0 && (
                        <p className="text-xs text-warning mt-1">{scan.issues} issues</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  Encryption Status
                </CardTitle>
                <CardDescription>
                  File and data encryption monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">Product Files</p>
                      <p className="text-xs text-muted-foreground">AES-256 encrypted</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Encrypted</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">Database</p>
                      <p className="text-xs text-muted-foreground">At-rest encryption</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Encrypted</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">Communication</p>
                      <p className="text-xs text-muted-foreground">TLS 1.3</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Secure</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} />
                Access Control Policies
              </CardTitle>
              <CardDescription>
                Fine-grained permission management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Bot Service Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Read-only access to bot tokens and configuration
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">read:bots/*</Badge>
                    <Badge variant="outline">read:config/*</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Payment Service Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Access to payment credentials and monitoring
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">read:payments/*</Badge>
                    <Badge variant="outline">write:payments/status</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Admin Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Full access with 2FA requirements for sensitive operations
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">admin:*</Badge>
                    <Badge className="bg-warning/10 text-warning">2FA Required</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Secret Rotation Dialog */}
      <Dialog open={isRotationDialogOpen} onOpenChange={setIsRotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Secret</DialogTitle>
            <DialogDescription>
              Initiate secret rotation with approval workflow
            </DialogDescription>
          </DialogHeader>
          {selectedSecret && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Secret Name</Label>
                <Input value={selectedSecret.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Vault Path</Label>
                <Input value={selectedSecret.path} readOnly className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Rotation Reason</Label>
                <Input placeholder="Scheduled rotation / Security incident / etc." />
              </div>
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  Secret rotation requires 2FA verification and admin approval. Services will be briefly interrupted during rotation.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRotationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsRotationDialogOpen(false)}>
                  Request Rotation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}