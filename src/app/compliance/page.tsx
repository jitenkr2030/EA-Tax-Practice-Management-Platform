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
  Download,
  Filter,
  Shield,
  Eye,
  Calendar,
  User,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle
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

interface ActivityLog {
  id: string
  action: string
  resourceType: string
  resourceId: string
  details?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'DOCUMENT', label: 'Document' },
  { return: 'TAX_RETURN' },
  { value: 'TASK', label: 'Task' },
  { value: 'NOTICE', label: 'IRS Notice' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'USER', label: 'User' },
  { value: 'COMMUNICATION', label: 'Communication' }
]

const ACTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'View' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' }
]

export default function CompliancePage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResourceType, setSelectedResourceType] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, selectedResourceType, selectedAction, selectedUser, startDate, endDate])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedResourceType !== 'all') params.set('resourceType', selectedResourceType)
      if (selectedAction !== 'all') params.set('action', selectedAction)
      if (selectedUser !== 'all') params.set('userId', selectedUser)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/compliance?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching compliance logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedResourceType !== 'all') {
      filtered = filtered.filter(log => log.resourceType === selectedResourceType)
    }

    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction)
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUser)
    }

    if (startDate && endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return logDate >= start && logDate <= end
      })
    }

    setFilteredLogs(filtered)
  }

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log)
    setDetailsDialogOpen(true)
  }

  const handleExportLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedResourceType !== 'all') params.set('resourceType', selectedResourceType)
      if (selectedAction !== 'all') params.set('action', selectedAction)
      if (selectedUser !== 'all') params.set('userId', selectedUser)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/compliance/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compliance-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-800',
      'READ': 'bg-blue-100 text-blue-800',
      'UPDATE': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800'
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getResourceTypeColor = (resourceType: string) => {
    const colors: Record<string, string> = {
      'CLIENT': 'bg-blue-100 text-blue-800',
      'DOCUMENT': 'bg-purple-100 text-purple-800',
      'TAX_RETURN': 'bg-green-100 text-green-800',
      'TASK': 'bg-orange-100 text-orange-800',
      'NOTICE': 'bg-red-100 text-red-800',
      'INVOICE': 'bg-indigo-100 text-indigo-800',
      'USER': 'bg-gray-100 text-gray-800',
      'COMMUNICATION': 'bg-pink-100 text-pink-800'
    }
    return colors[resourceType] || 'bg-gray-100 text-gray-800'
  }

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'CREATE': '➕️',
      'READ': '👁️',
      'UPDATE': '✏�️',
      'DELETE': '🗑️'
    }
    return icons[action] || '📝'
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'OWNER': 'bg-purple-100 text-purple-800',
      'REVIEWER': 'bg-blue-100 text-blue-800',
      'STAFF': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-orange-100 text-orange-800',
      'CLIENT': 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading compliance logs...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Compliance & Audit Safety</h1>
              <p className="text-muted-foreground">Monitor activity logs and ensure audit compliance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">All recorded activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => {
                  const logDate = new Date(log.createdAt)
                  const today = new Date()
                  return logDate.toDateString() === today.toDateString()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Today's logged actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Activities</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.action === 'DELETE').length}
              </div>
              <p className="text-xs text-muted-foreground">Deletions performed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Access</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => log.resourceType === 'USER').length}
              </div>
              <p className="text-xs text-muted-foreground">User management activities</p>
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
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Resource Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value={user?.id}>My Activities</SelectItem>
                    {/* TODO: Add other users dynamically */}
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
                </div>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Complete audit trail of all system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {log.user.name.split(' ').map(n => n[0]).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{log.user.name}</div>
                          <Badge className={getRoleColor(log.user.role)}>
                            {log.user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getResourceTypeColor(log.resourceType)}>
                        {log.resourceType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details.length > 50 ? `${log.details.substring(0, 50)}...` : log.details}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No details</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground font-mono">
                        {log.ipAddress || 'Unknown'}
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
                          <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Export Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activity logs found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Activity Log Details</DialogTitle>
              <DialogDescription>
                Detailed information about this activity
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Activity Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{new Date(selectedLog.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Action:</span>
                        <Badge className={getActionColor(selectedLog.action)}>
                          {selectedLog.action}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resource Type:</span>
                        <Badge className={getResourceType(selectedLog.resourceType)}>
                          {selectedLog.resourceType.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{selectedLog.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedLog.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge className={getRoleColor(selectedLog.user.role)}>
                          {selectedLog.user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technical Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-mono">{selectedLog.ipAddress || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Agent:</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedLog.userAgent ? 
                          selectedLog.userAgent.substring(0, 50) + '...' : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {selectedLog.details && (
                  <div>
                    <h4 className="font-semibold mb-2">Change Details</h4>
                    <div className="p-3 bg-muted/50 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log Entry
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Details
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