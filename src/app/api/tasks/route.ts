import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignedTo = searchParams.get('assignedTo')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const type = searchParams.get('type')

    let whereClause: any = {}

    if (assignedTo) whereClause.assignedToId = assignedTo
    if (status && status !== 'all') whereClause.status = status
    if (priority && priority !== 'all') whereClause.priority = priority
    if (type && type !== 'all') whereClause.type = type

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        taxReturn: {
          select: { id: true, taxYear: true, type: true, status: returnStatus }
        },
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        engagement: {
          select: { id: true, taxYear: true, type: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const task = await db.task.create({
      data: {
        taxReturnId: body.taxReturnId,
        clientId: body.clientId,
        engagementId: body.engagementId,
        title: body.title,
        description: body.description,
        type: body.type,
        status: body.status || 'PENDING',
        priority: body.priority || 'MEDIUM',
        assignedToId: body.assignedToId,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        createdBy: body.createdBy
      },
      include: {
        taxReturn: {
          select: { id: true, taxYear: true, type: true, status: returnStatus }
        },
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}