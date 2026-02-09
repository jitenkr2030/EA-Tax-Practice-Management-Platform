import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    let whereClause: any = {}

    if (clientId) whereClause.clientId = clientId
    if (status && status !== 'all') whereClause.status = status
    if (assignedTo) whereClause.assignedToId = assignedTo

    const notices = await db.iRSNotice.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { receivedDate: 'desc' }
    })

    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      noticeType,
      noticeNumber,
      receivedDate,
      responseDue,
      assignedToId,
      documentUrl,
      createdById
    } = body

    // Validate required fields
    if (!clientId || !noticeType || !receivedDate || !responseDue || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notice = await db.iRSNotice.create({
      data: {
        clientId,
        noticeType,
        noticeNumber,
        receivedDate: new Date(receivedDate),
        responseDue: new Date(responseDue),
        assignedToId,
        documentUrl,
        createdById
      },
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    )
  }
}
