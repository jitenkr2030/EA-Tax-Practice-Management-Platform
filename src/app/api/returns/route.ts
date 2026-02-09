import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const taxYear = searchParams.get('taxYear')

    let whereClause: any = {}

    if (clientId) whereClause.clientId = clientId
    if (status && status !== 'all') whereClause.status = status
    if (assignedTo) whereClause.assignedToId = assignedTo
    if (taxYear) whereClause.taxYear = parseInt(taxYear)

    const returns = await db.taxReturn.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        engagement: {
          select: { id: true, taxYear: true, type: true, dueDate: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        forms: true,
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('Error fetching returns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const taxReturn = await db.taxReturn.create({
      data: {
        clientId: body.clientId,
        engagementId: body.engagementId,
        taxYear: body.taxYear,
        type: body.type,
        status: body.status || 'NEW',
        assignedToId: body.assignedToId,
        reviewerId: body.reviewerId,
        priority: body.priority || 'MEDIUM',
        federalResult: body.federalResult,
        stateResult: body.stateResult,
        notes: body.notes
      },
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        engagement: {
          select: { id: true, taxYear: true, type: true, dueDate: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create initial tasks based on return status
    if (taxReturn.status === 'NEW') {
      await db.task.create({
        data: {
          taxReturnId: taxReturn.id,
          clientId: taxReturn.clientId,
          engagementId: taxReturn.engagementId,
          title: 'Request client documents for tax return',
          description: `Gather all necessary documents for ${taxReturn.taxYear} ${taxReturn.type} return`,
          type: 'DOCUMENT_REQUEST',
          status: 'PENDING',
          priority: taxReturn.priority,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdBy: body.assignedToId || taxReturn.assignedToId,
          assignedToId: taxReturn.assignedToId
        }
      })
    }

    return NextResponse.json(taxReturn, { status: 201 })
  } catch (error) {
    console.error('Error creating return:', error)
    return NextResponse.json(
      { error: 'Failed to create return' },
      { status: 500 }
    )
  }
}