'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Edit,
  Download,
  Eye,
  FileText,
  User,
  AlertTriangle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const communications = [
  {
    id: '1',
    type: 'EMAIL',
    direction: 'OUTBOUND',
    subject: 'Tax Return Documents Request',
    recipient: 'john.smith@email.com',
    status: 'SENT',
    priority: 'HIGH',
    createdAt: '2024-01-15T10:30:00Z',
    sentAt: '2024-01-15T10:30:00Z',
    content: 'Dear John, We need the following documents for your tax return...',
    sentBy: { name: 'Sarah Johnson', email: 'sarah@taxpro.com' },
    sentTo: { name: 'John Smith', email: 'john.smith@email.com' },
    attachments: '["W2_2023.pdf", "1099_INT.pdf"]'
  },
  {
    id: '2',
    type: 'EMAIL',
    direction: 'INBOUND',
    subject: 'Re: Tax Return Documents Request',
    recipient: 'sarah@taxpro.com',
    status: 'RECEIVED',
    priority: 'NORMAL',
    createdAt: '2024-01-15T11:45:00Z',
    content: 'Hi Sarah, Please find attached the requested documents...',
    sentBy: { name: 'John Smith', email: 'john.smith@email.com' },
    sentTo: { name: 'Sarah Johnson', email: 'sarah@taxpro.com' },
    attachments: '["W2_2023.pdf", "1099_INT.pdf"]'
  },
  {
    id: '3',
    type: 'SMS',
    direction: 'OUTBOUND',
    subject: 'Appointment Reminder',
    recipient: '+1234567890',
    status: 'DELIVERED',
    priority: 'NORMAL',
    createdAt: '2024-01-15T14:20:00Z',
    sentAt: '2024-01-15T14:20:00Z',
    content: 'Reminder: Your tax appointment is scheduled for tomorrow at 2 PM.',
    sentBy: { name: 'Mike Davis', email: 'mike@taxpro.com' },
    sentTo: { name: 'John Smith', phone: '+1234567890' },
    attachments: null
  },
  {
    id: '4',
    type: 'EMAIL',
    direction: 'OUTBOUND',
    subject: 'IRS Notice - Action Required',
    recipient: 'jane.doe@email.com',
    status: 'DRAFT',
    priority: 'HIGH',
    createdAt: '2024-01-15T16:00:00Z',
    content: 'Dear Jane, We received an IRS notice regarding your 2022 tax return...',
    sentBy: { name: 'Sarah Johnson', email: 'sarah@taxpro.com' },
    sentTo: { name: 'Jane Doe', email: 'jane.doe@email.com' },
    attachments: '["IRS_Notice_CP2000.pdf"]'
  },
  {
    id: '5',
    type: 'PHONE',
    direction: 'INBOUND',
    subject: 'Tax Question',
    recipient: 'Office',
    status: 'MISSED',
    priority: 'NORMAL',
    createdAt: '2024-01-15T17:30:00Z',
    content: 'Client called with questions about estimated tax payments.',
    sentBy: { name: 'Unknown Caller', phone: '+1234567890' },
    sentTo: { name: 'TaxPro Office' },
    attachments: null
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SENT':
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'RECEIVED':
      return 'bg-blue-100 text-blue-800'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'FAILED':
    case 'MISSED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800'
    case 'NORMAL':
      return 'bg-blue-100 text-blue-800'
    case 'LOW':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'EMAIL':
      return <Mail className="h-4 w-4" />
    case 'SMS':
      return <MessageSquare className="h-4 w-4" />
    case 'PHONE':
      return <Phone className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

export default function CommunicationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedCommunication, setSelectedCommunication] = useState<any>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'ALL' || comm.type === selectedType
    const matchesStatus = selectedStatus === 'ALL' || comm.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsComposeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communications.length}</div>
              <p className="text-xs text-muted-foreground">All communications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communications.filter(c => c.direction === 'INBOUND').length}
              </div>
              <p className="text-xs text-muted-foreground">From clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communications.filter(c => c.direction === 'OUTBOUND').length}
              </div>
              <p className="text-xs text-muted-foreground">Sent by staff</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Drafts</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communications.filter(c => c.status === 'DRAFT').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList>
              <TabsTrigger value="ALL">All Types</TabsTrigger>
              <TabsTrigger value="EMAIL">Email</TabsTrigger>
              <TabsTrigger value="SMS">SMS</TabsTrigger>
              <TabsTrigger value="PHONE">Phone</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="ALL">All Status</TabsTrigger>
              <TabsTrigger value="SENT">Sent</TabsTrigger>
              <TabsTrigger value="RECEIVED">Received</TabsTrigger>
              <TabsTrigger value="DRAFT">Draft</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Communications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(comm.type)}
                        <span className="text-sm">{comm.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate font-medium">
                        {comm.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{comm.recipient}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(comm.status)}>
                        {comm.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(comm.priority)}>
                        {comm.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCommunication(comm)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedCommunication?.subject}</DialogTitle>
                            <DialogDescription>
                              Communication Details
                            </DialogDescription>
                          </DialogHeader>
                          {selectedCommunication && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getTypeIcon(selectedCommunication.type)}
                                    <span>{selectedCommunication.type}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">
                                    <Badge className={getStatusColor(selectedCommunication.status)}>
                                      {selectedCommunication.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Priority</label>
                                  <div className="mt-1">
                                    <Badge className={getPriorityColor(selectedCommunication.priority)}>
                                      {selectedCommunication.priority}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Date</label>
                                  <div className="mt-1 text-sm">
                                    {new Date(selectedCommunication.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Content</label>
                                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                  {selectedCommunication.content}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">From</label>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary-foreground">
                                        {selectedCommunication.sentBy?.name?.charAt(0) || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {selectedCommunication.sentBy?.name || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {selectedCommunication.sentBy?.email || selectedCommunication.sentBy?.phone || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">To</label>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        {selectedCommunication.sentTo?.name?.charAt(0) || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {selectedCommunication.sentTo?.name || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {selectedCommunication.sentTo?.email || selectedCommunication.sentTo?.phone || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedCommunication.attachments && (
                                <div>
                                  <h4 className="font-semibold mb-2">Attachments</h4>
                                  <div className="space-y-2">
                                    {JSON.parse(selectedCommunication.attachments).map((attachment: string, index: number) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">{attachment}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                <Button>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download All
                                </Button>
                                <Button variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Full Details
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
