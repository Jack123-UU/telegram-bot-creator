import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  Plus, 
  Upload, 
  PencilSimple, 
  Trash, 
  Eye,
  FunnelSimple,
  Download
} from '@phosphor-icons/react'

interface Product {
  id: string
  name: string
  country: string
  type: string
  price: number
  cost: number
  stock: number
  status: 'active' | 'inactive' | 'validating'
  uploadedAt: string
  lastSold?: string
}

export function ProductManager() {
  const [products, setProducts] = useKV<Product[]>('products', [
    {
      id: 'prod-001',
      name: 'US Phone Numbers (+1)',
      country: 'United States',
      type: 'phone',
      price: 29.99,
      cost: 15.00,
      stock: 247,
      status: 'active',
      uploadedAt: '2024-01-15',
      lastSold: '2 hours ago'
    },
    {
      id: 'prod-002', 
      name: 'UK Email Accounts',
      country: 'United Kingdom',
      type: 'email',
      price: 19.99,
      cost: 10.00,
      stock: 89,
      status: 'active',
      uploadedAt: '2024-01-14',
      lastSold: '1 hour ago'
    },
    {
      id: 'prod-003',
      name: 'Germany Social Accounts',
      country: 'Germany', 
      type: 'social',
      price: 49.99,
      cost: 25.00,
      stock: 156,
      status: 'validating',
      uploadedAt: '2024-01-16'
    },
    {
      id: 'prod-004',
      name: 'Mobile API Login Codes',
      country: 'United States',
      type: 'api-login',
      price: 39.99,
      cost: 20.00,
      stock: 324,
      status: 'active',
      uploadedAt: '2024-01-17',
      lastSold: '30 minutes ago'
    }
  ])

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')

  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia']
  const types = ['phone', 'email', 'social', 'messaging', 'gaming', 'api-login']

  const currentProducts = products || []

  const filteredProducts = currentProducts.filter(product => {
    if (selectedCountry && product.country !== selectedCountry) return false
    if (selectedType && product.type !== selectedType) return false
    return true
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'api-login': return 'API Login'
      case 'phone': return 'Phone'
      case 'email': return 'Email'
      case 'social': return 'Social'
      case 'messaging': return 'Messaging'
      case 'gaming': return 'Gaming'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success/10 text-success">Active</Badge>
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>
      case 'validating': return <Badge className="bg-warning/10 text-warning">Validating</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalValue = currentProducts.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const totalStock = currentProducts.reduce((sum, product) => sum + product.stock, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Manager</h1>
          <p className="text-muted-foreground">Manage your digital product inventory</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Products
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Products</DialogTitle>
              <DialogDescription>
                Upload tdata/session files, API login endpoints, or CSV with product information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
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
                  <Label htmlFor="type">Product Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDT)</Label>
                  <Input type="number" placeholder="29.99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price (USDT)</Label>
                  <Input type="number" placeholder="15.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="files">Upload Files</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop ZIP files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports: .zip, .csv, .xlsx, .txt (API endpoints) (Max 100MB)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    API Login format: https://domain.com/api/token/uuid/action
                  </p>
                  <Button variant="outline" className="mt-2">
                    Browse Files
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>
                  Upload & Validate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(currentProducts.map(p => p.country)).size} countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalStock || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Items available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalValue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total retail value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentProducts.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for sale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelSimple size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSelectedCountry('')
              setSelectedType('')
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your digital product catalog and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sold</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(product.type)}</Badge>
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <span className={product.stock < 10 ? 'text-warning' : 'text-foreground'}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.lastSold || 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye size={16} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <PencilSimple size={16} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}