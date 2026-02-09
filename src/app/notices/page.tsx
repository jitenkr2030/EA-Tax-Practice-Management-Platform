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
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Brain,
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
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'

interface IRSNotice {
  id: string
  noticeType: string
  noticeNumber?: string
  receivedDate: string
  responseDue: string
  status: string
  summary?: string
  explanation?: string
  actionItems?: string
  client: {
    id: string
    clientId: string
    firstName?: string
    lastName?: string
    businessName?: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  _count: {
    tasks: number
  }
}

const NOTICE_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DRAFTED', label: 'Response Drafted' },
  { value: 'SENT', label: 'Response Sent' },
  { value: 'CLOSED', label: 'Closed' }
]

const NOTICE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'CP2000', label: 'CP2000 - Underreported Income' },
  { value: 'CP14', label: 'CP14 - Tax Due' },
  { value: 'CP05', label: 'CP05 - Information Request' },
  { value: 'CP11', label: 'CP11 - Math Error' },
  { value: 'CP12', label: 'CP12 - Refund Offset' },
  { value: 'CP23', label: 'CP23 - Identity Verification' }
]

export default function NoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<IRSNotice[]>([])
  const [filteredNotices, setFilteredNotices] = useState<IRSNotice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedNotice, setSelectedNotice] = useState<IRSNotice | null>(null)
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
  const [analyzingNotice, setAnalyzingNotice] = useState<string | null>(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  useEffect(() => {
    filterNotices()
  }, [notices, searchTerm, selectedStatus, selectedType])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices')
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
      }
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotices = () => {
    let filtered = notices

    if (searchTerm) {
      filtered = filtered.filter(notice =>
        notice.noticeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.noticeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${notice.client.firstName} ${notice.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(notice => notice.status === selectedStatus)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(notice => notice.noticeType === selectedType)
    }

    setFilteredNotices(filtered)
  }

  const handleAnalyzeNotice = async (noticeId: string) => {
    setAnalyzingNotice(noticeId)
    try {
      const response = await fetch(`/api/notices/${noticeId}/analyze`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Update the notice in the list
        setNotices(prev => prev.map(n => 
          n.id === noticeId ? data.notice : n
        ))
        setSelectedNotice(data.notice)
        setAnalysisDialogOpen(true)
      }
    } catch (error) {
      console.error('Error analyzing notice:', error)
    } finally {
      setAnalyzingNotice(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'RECEIVED': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'DRAFTED': 'bg-purple-100 text-purple-800',
      'SENT': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
      'ESCALATED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CP2000': 'bg-red-100 text-red-800',
      'CP14': 'bg-orange-100 text-orange-800',
      'CP05': 'bg-blue-100 text-blue-800',
      'CP11': 'bg-yellow-100 text-yellow-800',
      'CP12': 'bg-green-100 text-green-800',
      'CP23': 'bg-purple-100 text-purple-800'
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

  const getClientName = (notice: IRSNotice) => {
    return notice.client.businessName || `${notice.client.firstName} ${notice.client.lastName}` || 'Unknown'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading IRS notices...</p>
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
              <h1 className="text-3xl font-bold text-foreground">IRS Notice Management</h1>
              <p className="text-muted-foreground mt-2">AI-powered analysis and response management for IRS notices</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notices.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notices.filter(n => ['RECEIVED', 'IN_PROGRESS', 'DRAFTED'].includes(n.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">Require action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notices.filter(n => getDaysUntilDue(n.responseDue) < 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Analyzed</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notices.filter(n => n.summary && n.explanation).length}
              </div>
              <p className="text-xs text-muted-foreground">With AI insights</p>
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
                  placeholder="Search notices..."
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
                    {NOTICE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Notice Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notices Table */}
        <Card>
          <CardHeader>
            <CardTitle>IRS Notices</CardTitle>
            <CardDescription>Manage and respond to IRS notices with AI assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Response Due</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((notice) => {
                  const daysUntilDue = getDaysUntilDue(notice.responseDue)
                  return (
                    <TableRow key={notice.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(notice.noticeType)}>
                              {notice.noticeType}
                            </Badge>
                            {notice.noticeNumber && (
                              <span className="text-sm text-muted-foreground">
                                #{notice.noticeNumber}
                              </span>
                            )}
                          </div>
                          {notice.summary && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {notice.summary}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getClientName(notice)}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {notice.client.clientId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(notice.status)}>
                          {notice.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(notice.receivedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${getUrgencyColor(daysUntilDue)}`}>
                          {new Date(notice.responseDue).toLocaleDateString()}
                          <div className="text-xs">
                            {daysUntilDue < 0 
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : `${daysUntilDue} days remaining`
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {notice.assignedTo?.name || 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {notice._count.tasks}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAnalyzeNotice(notice.id)} disabled={analyzingNotice === notice.id}>
                              <Brain className="h-4 w-4 mr-2" />
                              {analyzingNotice === notice.id ? 'Analyzing...' : 'AI Analyze'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Notice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
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
            {filteredNotices.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No IRS notices found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Dialog */}
        <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis - {selectedNotice?.noticeType}
              </DialogTitle>
              <DialogDescription>
                AI-powered insights and recommended actions
              </DialogDescription>
            </DialogHeader>
            {selectedNotice && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotice.summary || 'No summary available'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Explanation</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotice.explanation || 'No explanation available'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommended Actions</h4>
                  <div className="space-y-2">
                    {selectedNotice.actionItems?.split('\n').map((action, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button>
                    Create Response Draft
                  </Button>
                  <Button variant="outline">
                    Schedule Follow-up
                  </Button>
                  <Button variant="outline">
                    Export Analysis
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