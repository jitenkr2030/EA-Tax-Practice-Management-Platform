'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Phone, Mail, MapPin, FileText, Users, Bell, DollarSign } from 'lucide-react'

interface Client {
  id: string
  clientId: string
  type: string
  firstName?: string
  lastName?: string
  businessName?: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  filingStatus?: string
  entityType?: string
  notes?: string
  internalComments?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  engagements?: any[]
  taxReturns?: any[]
  documents?: any[]
  communications?: any[]
  notices?: any[]
  invoices?: any[]
}

interface ClientDetailModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (client: Client) => void
}

export function ClientDetailModal({ client, isOpen, onClose, onUpdate }: ClientDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Client>>({})

  if (!client) return null

  const handleEdit = () => {
    setFormData(client)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedClient = await response.json()
        onUpdate(updatedClient)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating client:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{client.businessName || `${client.firstName} ${client.lastName}`}</span>
            <div className="flex gap-2">
              <Badge className={client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {client.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge className={client.type === 'BUSINESS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                {client.type}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Client ID: {client.clientId} • Created {new Date(client.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagements">Engagements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName || ''}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input
                        id="zip"
                        value={formData.zip || ''}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {client.address}, {client.city}, {client.state} {client.zip}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tax Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filing Status:</span>
                      <span>{client.filingStatus || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entity Type:</span>
                      <span>{client.entityType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Type:</span>
                      <Badge className={client.type === 'BUSINESS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {client.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {client.notes && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{client.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="engagements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement History</CardTitle>
                <CardDescription>Tax years and services provided</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Engagement history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Uploaded tax documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document list will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
                <CardDescription>Email history and client messages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Communication history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>IRS Notices</CardTitle>
                <CardDescription>IRS correspondence and notices</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">IRS notices will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Invoices and payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Billing history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleEdit}>
                Edit Client
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}