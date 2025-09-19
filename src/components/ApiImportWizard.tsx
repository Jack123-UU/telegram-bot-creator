import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  Globe,
  DeviceMobile,
  ArrowRight,
  Warning
} from '@phosphor-icons/react'

interface ApiEndpoint {
  id: string
  url: string
  format: string
  country: string
  type: 'mobile-api' | 'login-api' | 'sms-api'
  status: 'pending' | 'validated' | 'invalid' | 'expired'
  lastChecked?: string
  responseTime?: number
  price: number
  stock: number
}

interface ImportWizardProps {
  isOpen: boolean
  onClose: () => void
  onImport: (endpoints: ApiEndpoint[]) => void
}

export function ApiImportWizard({ isOpen, onClose, onImport }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [importData, setImportData] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedType, setSelectedType] = useState<'mobile-api' | 'login-api' | 'sms-api'>('mobile-api')
  const [price, setPrice] = useState('39.99')
  const [parsedEndpoints, setParsedEndpoints] = useState<ApiEndpoint[]>([])
  const [validationProgress, setValidationProgress] = useState(0)
  const [isValidating, setIsValidating] = useState(false)

  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia']

  const exampleFormats = {
    'mobile-api': 'https://miha.uk/tgapi/uWCSVDgG6XMaMT5C/fa7e47cc-d2d2-4ead-bfc1-039a7135f057/GetHTML',
    'login-api': 'https://api.example.com/login/{token}/{session}/authenticate',
    'sms-api': 'https://sms.provider.com/api/v1/{key}/{number}/verify'
  }

  const parseApiEndpoints = (text: string): ApiEndpoint[] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map((line, index) => {
      const url = line.trim()
      return {
        id: `api-${Date.now()}-${index}`,
        url,
        format: detectApiFormat(url),
        country: selectedCountry,
        type: selectedType,
        status: 'pending' as const,
        price: parseFloat(price),
        stock: 1
      }
    })
  }

  const detectApiFormat = (url: string): string => {
    if (url.includes('/tgapi/')) return 'Telegram API'
    if (url.includes('/login/')) return 'Login API'
    if (url.includes('/sms/')) return 'SMS API'
    if (url.includes('/auth/')) return 'Auth API'
    return 'Generic API'
  }

  const validateEndpoints = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    
    const updatedEndpoints = [...parsedEndpoints]
    
    for (let i = 0; i < updatedEndpoints.length; i++) {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock validation logic
      const isValid = Math.random() > 0.2 // 80% success rate
      const responseTime = Math.floor(Math.random() * 1000) + 100
      
      updatedEndpoints[i] = {
        ...updatedEndpoints[i],
        status: isValid ? 'validated' : 'invalid',
        lastChecked: new Date().toISOString(),
        responseTime: isValid ? responseTime : undefined
      }
      
      setValidationProgress(((i + 1) / updatedEndpoints.length) * 100)
      setParsedEndpoints([...updatedEndpoints])
    }
    
    setIsValidating(false)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const endpoints = parseApiEndpoints(importData)
      setParsedEndpoints(endpoints)
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
      validateEndpoints()
    } else if (currentStep === 3) {
      const validEndpoints = parsedEndpoints.filter(ep => ep.status === 'validated')
      onImport(validEndpoints)
      handleClose()
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setImportData('')
    setParsedEndpoints([])
    setValidationProgress(0)
    setIsValidating(false)
    onClose()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated': return <Badge className="bg-success/10 text-success"><CheckCircle size={12} className="mr-1" />Valid</Badge>
      case 'invalid': return <Badge className="bg-destructive/10 text-destructive"><XCircle size={12} className="mr-1" />Invalid</Badge>
      case 'pending': return <Badge className="bg-warning/10 text-warning">Pending</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const validCount = parsedEndpoints.filter(ep => ep.status === 'validated').length
  const invalidCount = parsedEndpoints.filter(ep => ep.status === 'invalid').length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DeviceMobile size={20} />
            API Login Endpoints Batch Import
          </DialogTitle>
          <DialogDescription>
            Import and validate mobile API login endpoints in bulk
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 rounded ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            3
          </div>
        </div>

        {/* Step 1: Data Input */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Import Configuration</CardTitle>
                <CardDescription>
                  Configure import settings and paste API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Type</Label>
                    <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile-api">Mobile API</SelectItem>
                        <SelectItem value="login-api">Login API</SelectItem>
                        <SelectItem value="sms-api">SMS API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price per API (USDT)</Label>
                  <Input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="39.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Endpoints</Label>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Example Format:</span>
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {exampleFormats[selectedType]}
                      </code>
                    </div>
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste API endpoints here, one per line..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {importData.split('\n').filter(line => line.trim()).length} endpoints detected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Preview Import</CardTitle>
                <CardDescription>
                  Review parsed endpoints before validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{parsedEndpoints.length} endpoints ready for import</p>
                      <p className="text-sm text-muted-foreground">
                        Country: {selectedCountry} • Type: {selectedType} • Price: ${price} each
                      </p>
                    </div>
                    <Badge variant="outline">{parsedEndpoints.length} items</Badge>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedEndpoints.slice(0, 10).map((endpoint) => (
                          <TableRow key={endpoint.id}>
                            <TableCell className="font-mono text-xs max-w-[300px] truncate">
                              {endpoint.url}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{endpoint.format}</Badge>
                            </TableCell>
                            <TableCell>${endpoint.price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {parsedEndpoints.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {parsedEndpoints.length - 10} more endpoints
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Validation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Endpoint Validation</CardTitle>
                <CardDescription>
                  Validating API endpoints for connectivity and response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isValidating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Validating endpoints...</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(validationProgress)}%
                      </span>
                    </div>
                    <Progress value={validationProgress} />
                  </div>
                )}

                {!isValidating && validationProgress > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">{validCount}</div>
                      <p className="text-sm text-muted-foreground">Valid</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-destructive">{invalidCount}</div>
                      <p className="text-sm text-muted-foreground">Invalid</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {validCount > 0 ? Math.round((validCount / parsedEndpoints.length) * 100) : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                )}

                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Last Checked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedEndpoints.map((endpoint) => (
                        <TableRow key={endpoint.id}>
                          <TableCell className="font-mono text-xs max-w-[250px] truncate">
                            {endpoint.url}
                          </TableCell>
                          <TableCell>{getStatusBadge(endpoint.status)}</TableCell>
                          <TableCell>
                            {endpoint.responseTime ? `${endpoint.responseTime}ms` : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {endpoint.lastChecked ? new Date(endpoint.lastChecked).toLocaleTimeString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <Warning size={16} className="text-warning" />
                    <p className="text-sm">
                      {invalidCount} endpoints failed validation and will be excluded from import
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!importData.trim() || !selectedCountry)) ||
                (currentStep === 3 && isValidating)
              }
            >
              {currentStep === 1 && 'Parse Endpoints'}
              {currentStep === 2 && 'Validate Endpoints'}
              {currentStep === 3 && (isValidating ? 'Validating...' : `Import ${validCount} Valid Endpoints`)}
              {currentStep < 3 && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}