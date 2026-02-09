import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const sentById = searchParams.get('sentById')

    let whereClause: any = {}

    if (clientId) whereClause.clientId = clientId
    if (type && type !== 'all') whereClause.type = type
    if (status && status !== 'all') whereClause.status = status
    if (sentById) whereClause.sentById = sentById

    const communications = await db.communication.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        sentBy: {
          select: { id: true, name: true, email: true }
        },
        sentTo: {
          select: { id: true, name: true, email: true }
        },
        template: {
          select: { id: true, name: true, subject: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const communication = await db.communication.create({
      data: {
        clientId: body.clientId,
        type: body.type,
        direction: body.direction,
        subject: body.subject,
        content: body.content,
        templateId: body.templateId,
        sentById: body.sentById,
        sentToId: body.sentToId,
        sentAt: body.sentAt ? new Date(body.sentAt) : null,
        status: body.status || 'DRAFT',
        isSecure: body.isSecure ?? true,
        attachments: body.attachments ? JSON.stringify(body.attachments) : null
      },
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        sentBy: {
          select: { id: true, name: true, email: true }
        },
        sentTo: {
          select: { id: true, name: true, email: true }
        },
        template: {
          select: { id: true, name: true, subject: true }
        }
      }
    })

    return NextResponse.json(communication, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const communication = await db.communication.update({
      where: { id: params.id },
      data: {
        subject: body.subject,
        content: body.content,
        status: body.status,
        sentAt: body.sentAt ? new Date(body.sentAt) : null
      },
      include: {
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        sentBy: {
          select: { id: true, name: true, email: true }
        },
        sentTo: {
          select: { id: true, name: true, email: true }
        },
        template: {
          select: { id: true, name: true, subject: true }
        }
      }
    })

    return NextResponse.json(communication)
  } catch (error) {
      console.error('Error updating communication:', error)
      return NextResponse.json(
        { error: 'Failed to update communication' },
        { status: 500 }
      )
    }
  }