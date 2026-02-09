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
      take: 100 // Limit to prevent large responses
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching compliance logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const log = await db.activityLog.create({
      data: {
        userId: body.userId,
        action: body.action,
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        details: body.details ? JSON.stringify(body.details) : null,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating compliance log:', error)
    return NextResponse.json(
      { error: 'Failed to create compliance log' },
      { status: 500 }
    )
  }
}