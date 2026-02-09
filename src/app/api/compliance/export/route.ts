import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {}

    if (userId) whereClause.userId = userId
    if (resourceType && resourceType !== 'all') whereClause.resourceType = resourceType
    if (resourceId) whereClause.resourceId = resourceId
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const logs = await db.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000 // Increase limit for export
    })

    // Convert to CSV format
    const csvHeaders = [
      'Date',
      'Time',
      'User Name',
      'User Email',
      'User Role',
      'Action',
      'Resource Type',
      'Resource ID',
      'Details',
      'IP Address',
      'User Agent'
    ]

    const csvRows = logs.map(log => [
      new Date(log.createdAt).toLocaleDateString(),
      new Date(log.createdAt).toLocaleTimeString(),
      log.user.name,
      log.user.email,
      log.user.role,
      log.action,
      log.resourceType,
      log.resourceId,
      log.details || '',
      log.ipAddress || '',
      log.userAgent || ''
    ])

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="compliance-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting compliance logs:', error)
    return NextResponse.json(
      { error: 'Failed to export compliance logs' },
      { status: 500 }
    )
  }
}