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
  FileText,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Play,
  Pause,
  Square
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
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'

interface TaxReturn {
  id: string
  taxYear: number
  type: string
  status: string
  priority: string
  federalResult?: string
  stateResult?: string
  filedDate?: string
  acceptedDate?: string
  completionDate?: string
  client: {
    id: string
    clientId: string
    firstName?: string
    lastName?: string
    businessName?: string
  }
  engagement: {
    id: string
    taxYear: number
    type: string
    dueDate: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  reviewer?: {
    id: string
    name: string
    email: string
  }
  _count: {
    tasks: number
  }
}

const RETURN_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'NEW', label: 'New' },
  { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
  { value: 'PREPARATION', label: 'In Preparation' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'READY_TO_FILE', label: 'Ready to File' },
  { value: 'FILED', label: 'Filed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'COMPLETED', label: 'Completed' }
]

const RETURN_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'FEDERAL_RETURN', label: 'Federal Return' },
  { value: 'STATE_RETURN', label: 'State Return' },
  { value: 'EXTENSION', label: 'Extension' },
  { value: 'AMENDMENT', label: 'Amendment' },
  { value: 'ESTIMATE', label: 'Estimate' }
]

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
]

export default function ReturnsPage() {
  const { user } = useAuth()
  const [returns, setReturns] = useState<TaxReturn[]>([])
  const [filteredReturns, setFilteredReturns] = useState<TaxReturn[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedReturn, setSelectedReturn] = useState<TaxReturn | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    fetchReturns()
  }, [])

  useEffect(() => {
    filterReturns()
  }, [returns, searchTerm, selectedStatus, selectedType, selectedPriority, selectedYear])

  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/returns')
      if (response.ok) {
        const data = await response.json()
        setReturns(data)
      }
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReturns = () => {
    let filtered = returns

    if (searchTerm) {
      filtered = filtered.filter(returnItem =>
        returnItem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${returnItem.client.firstName} ${returnItem.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.status === selectedStatus)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.type === selectedType)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.priority === selectedPriority)
    }

    if (selectedYear) {
      filtered = filtered.filter(returnItem => returnItem.taxYear === parseInt(selectedYear))
    }

    setFilteredReturns(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'NEW': 'bg-gray-100 text-gray-800',
      'DOCUMENTS_PENDING': 'bg-orange-100 text-orange-800',
      'PREPARATION': 'bg-blue-100 text-blue-800',
      'REVIEW': 'bg-purple-100 text-purple-800',
      'READY_TO_FILE': 'bg-green-100 text-green-800',
      'FILED': 'bg-green-100 text-green-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'ON_HOLD': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'FEDERAL_RETURN': 'bg-blue-100 text-blue-800',
      'STATE_RETURN': 'bg-green-100 text-green-800',
      'EXTENSION': 'bg-yellow-100 text-yellow-800',
      'AMENDMENT': 'bg-purple-100 text-purple-800',
      'ESTIMATE': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-600 font-semibold'
    if (days <= 7) return 'text-orange-600 font-semibold'
    if (days <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getClientName = (returnItem: TaxReturn) => {
    return returnItem.client.businessName || `${returnItem.client.firstName} ${returnItem.client.lastName}` || 'Unknown'
  }

  const handleViewDetails = (returnItem: TaxReturn) => {
    setSelectedReturn(returnItem)
    setDetailsDialogOpen(true)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading tax returns...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Tax Returns</h1>
              <p className="text-muted-foreground mt-2">Manage tax return preparation, review, and filing workflow</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returns.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {returns.filter(r => ['NEW', 'DOCUMENTS_PENDING', 'PREPARATION', 'REVIEW'].includes(r.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">Active work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to File</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {returns.filter(r => r.status === 'READY_TO_FILE').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting filing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {returns.filter(r => {
                  if (r.engagement?.dueDate) {
                    return getDaysUntilDue(r.engagement.dueDate) < 0
                  }
                  return false
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Past deadline</p>
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
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Tax Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-24"
                />

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Returns</CardTitle>
            <CardDescription>Track and manage tax return preparation and filing workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem) => {
                  const daysUntilDue = returnItem.engagement?.dueDate 
                    ? getDaysUntilDue(returnItem.engagement.dueDate)
                    : null
                  
                  return (
                    <TableRow key={returnItem.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {returnItem.taxYear} {returnItem.type.replace('_', ' ')}
                          </div>
                          {returnItem.federalResult && (
                            <div className="text-sm text-muted-foreground">
                              Federal: {returnItem.federalResult}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getClientName(returnItem)}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {returnItem.client.clientId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(returnItem.status)}>
                          {returnItem.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(returnItem.type)}>
                          {returnItem.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(returnItem.priority)}>
                          {returnItem.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {returnItem.engagement?.dueDate ? (
                          <div className={`text-sm ${getUrgencyColor(daysUntilDue || 0)}`}>
                            {new Date(returnItem.engagement.dueDate).toLocaleDateString()}
                            <div className="text-xs">
                              {daysUntilDue !== null && (
                                daysUntilDue < 0 
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : `${daysUntilDue} days remaining`
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {returnItem.assignedTo?.name || 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {returnItem._count.tasks}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(returnItem)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Return
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              Start Preparation
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="h-4 w-4 mr-2" />
                              Put on Hold
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Square className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredReturns.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tax returns found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Return Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about this tax return
              </DialogDescription>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Return Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Year:</span>
                        <span>{selectedReturn.taxYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedReturn.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedReturn.status)}>
                          {selectedReturn.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge className={getPriorityColor(selectedReturn.priority)}>
                          {selectedReturn.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Client Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span>{getClientName(selectedReturn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client ID:</span>
                        <span>{selectedReturn.client.clientId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{selectedReturn.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                    {selectedReturn.reviewer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviewer:</span>
                        <span>{selectedReturn.reviewer.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Important Dates</h4>
                  <div className="space-y-2 text-sm">
                    {selectedReturn.engagement?.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{new Date(selectedReturn.engagement.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedReturn.filedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filed Date:</span>
                        <span>{new Date(selectedReturn.filedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedReturn.acceptedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accepted Date:</span>
                        <span>{new Date(selectedReturn.acceptedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedReturn.completionDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span>{new Date(selectedReturn.completionDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedReturn.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedReturn.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button>
                    View Tasks
                  </Button>
                  <Button variant="outline">
                    View Documents
                  </Button>
                  <Button variant="outline">
                    Export Return
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}