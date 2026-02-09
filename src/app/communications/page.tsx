'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Send,
  Eye,
  Edit,
  Reply,
  Forward,
  Download,
  Mail,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'

interface Communication {
  id: string
  type: string
  direction: string
  subject: string
  content: string
  status: string
  sentAt?: string
  isSecure: boolean
  attachments?: string
  createdAt: string
  client: {
    id: string
    clientId: string
    firstName?: string
    lastName?: string
    businessName?: string
  }
  sentBy?: {
    id: string
    name: string
    email: string
  }
  sentTo?: {
    id: string
    name: string
    email: string
  }
  template?: {
    id: string
    name: string
    subject: string
    type: string
  }
}

const COMMUNICATION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PORTAL_MESSAGE', label: 'Portal Message' },
  { value: 'SMS', label: 'SMS' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'INTERNAL_NOTE', label: 'Internal Note' }
]

const COMMUNICATION_DIRECTIONS = [
  { value: 'all', label: 'All Directions' },
  { value: 'INBOUND', label: 'Inbound' },
  { value: 'OUTBOUND', label: 'Outbound' },
  { value: 'INTERNAL', label: 'Internal' }
]

const COMMUNICATION_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'READ', label: 'Read' }
]

export default function CommunicationsPage() {
  const { user } = useAuth()
  const [communications, setCommunications] = useState<Communication[]>([])
  const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDirection, setSelectedDirection] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  [composeDialogOpen, setComposeDialogOpen] = useState(false)
  [viewDialogOpen, setViewDialogOpen] = useState(false)
  [composeForm, setComposeForm] = useState({
    clientId: '',
    type: 'EMAIL',
    direction: 'OUTBOUND',
    subject: '',
    content: '',
    templateId: '',
    sentToId: '',
    status: 'DRAFT'
  })

  useEffect(() => {
    fetchCommunications()
  }, [])

  useEffect(() => {
    filterCommunications()
  }, [communications, searchTerm, selectedType, selectedDirection, selectedStatus])

  const fetchCommunications = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.set('type', selectedType)
      if (selectedDirection !== 'all') params.set('direction', selectedDirection)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)

      const response = await fetch(`/api/communications?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCommunications(data)
      }
    } catch (error) {
      console.error('Error fetching communications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCommunications = () => {
    let filtered = communications

    if (searchTerm) {
      filtered = filtered.filter(comm =>
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${comm.client.firstName} ${comm.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(comm => comm.type === selectedType)
    }

    if (selectedDirection !== 'all') {
      filtered = filtered.filter(comm => comm.direction === selectedDirection)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(comm => comm.status === selectedStatus)
    }

    setFilteredCommunications(filtered)
  }

  const handleCompose = () => {
    setComposeForm({
      clientId: '',
      type: 'EMAIL',
      direction: 'OUTBOUND',
      subject: '',
      content: '',
      templateId: '',
      sentToId: '',
      status: 'DRAFT'
    })
    setComposeDialogOpen(true)
  }

  const handleSendCommunication = async () => {
    if (!composeForm.clientId || !composeForm.subject || !composeForm.content) {
      return
    }

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...composeForm,
          sentById: user?.id
        })
      })

      if (response.ok) {
        const newCommunication = await response.json()
        setCommunications(prev => [newCommunication, ...prev])
        setComposeDialogOpen(false)
        setComposeForm({
          clientId: '',
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: '',
          content: '',
          templateId: '',
          sentToId: '',
          status: 'DRAFT'
        })
      }
    } catch (error) {
      console.error('Error sending communication:', error)
    }
  }

  const handleViewCommunication = (comm: Communication) => {
    setSelectedCommunication(comm)
    setViewDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SENT': 'bg-blue-100 text-blue-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'READ': 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'EMAIL': 'bg-blue-100 text-blue-800',
      'PORTAL_MESSAGE': 'bg-green-100 text-green-800',
      'SMS': 'bg-orange-100 text-orange-800',
      'LETTER': 'bg-purple-100 text-purple-800',
      'INTERNAL_NOTE': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getDirectionColor = (direction: string) => {
    const colors: Record<string, string> = {
      'INBOUND': 'bg-blue-100 text-blue-800',
      'OUTBOUND': 'bg-green-100 text-green-800',
      'INTERNAL': 'bg-gray-100 text-gray-800'
    }
    return colors[direction] || 'bg-gray-100 text-gray-800'
  }

  const getClientName = (comm: Communication) => {
    return comm.client.businessName || `${comm.client.firstName} ${comm.client.lastName}` || 'Unknown'
  }

  const handleStatusChange = async (commId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/communications/${commId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updatedComm = await response.json()
        setCommunications(prev => prev.map(c => c.id === commId ? updatedComm : c))
      }
    } catch (error) {
      console.error('Error updating communication status:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading communications...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Communications</h1>
              <p className="text-muted-foreground">Manage client communications and automated messaging</p>
            </div>
            <Button onClick={handleCompose}>
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communications.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Messages</CardTitle>
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
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
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

          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {communications.filter(c => c.status === 'FAILED').length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDirection} onValueChange={setSelectedDirection}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_DIRECTIONS.map((direction) => (
                      <SelectItem key={direction.value} value={direction.value}>
                        {direction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Staff</SelectItem>
                    <SelectItem value={user?.id}>My Tasks</SelectItem>
                    {/* TODO: Add other staff members dynamically */}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-36"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-36"
                  />
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>Track all client communications and messaging history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(comm.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(comm.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getClientName(comm)}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {comm.client.clientId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(comm.type)}>
                        {comm.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDirectionColor(comm.direction)}>
                        {comm.direction.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(comm.status)}>
                        {comm.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {comm.assignedTo?.name || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewCommunication(comm)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCommunication(comm)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCommunications.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No communications found matching your criteria.</p>
                <Button 
                  className="mt-4"
                  onClick={handleCompose}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Communication Details</DialogTitle>
              <DialogDescription>
                Complete communication information and conversation history
              </DialogDescription>
            </DialogHeader>
            {selectedCommunication && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Message Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(selectedCommunication.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{new Date(selectedCommunication.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedCommunication.status)}>
                          {selectedCommunication.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="sender/receiver-section">
                      <h4 className="font-semibold mb-2">Participants</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-center">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {selectedCommunication.sentBy?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedCommunication.sentBy?.email || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {selectedCommunication.sentTo?.name?.charAt(0) || 'U'}
                              </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedCommunication.sentTo?.email || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>

                {selectedCommunication.attachments && (
                  <div>
                    <h4 className="font-semibold mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {JSON.parse(selectedCommunication.attachments).map((attachment: string, index) => (
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
            </DialogContent>
          </Dialog>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}