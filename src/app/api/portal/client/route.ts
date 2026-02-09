import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Find the client profile associated with this email
    const client = await db.clientProfile.findUnique({
      where: { email },
      include: {
        engagements: {
          include: {
            taxReturn: true,
            tasks: {
              where: {
                type: 'DOCUMENT_REQUEST'
              },
              orderBy: { dueDate: 'asc' }
            }
          },
          orderBy: { taxYear: 'desc' }
        },
        taxReturns: {
          orderBy: { taxYear: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        communications: {
          where: {
            direction: 'OUTBOUND'
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Transform the data for the client portal
    const portalData = {
      client: {
        id: client.id,
        clientId: client.clientId,
        firstName: client.firstName,
        lastName: client.lastName,
        businessName: client.businessName,
        email: client.email,
        phone: client.phone,
        type: client.type
      },
      engagements: client.engagements.map(engagement => ({
        id: engagement.id,
        taxYear: engagement.taxYear,
        status: engagement.status,
        taxReturn: engagement.taxReturn ? {
          id: engagement.taxReturn.id,
          type: engagement.taxReturn.type,
          status: engagement.taxReturn.status,
          filedDate: engagement.taxReturn.filedDate
        } : null,
        pendingTasks: engagement.tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority
        }))
      })),
      recentReturns: client.taxReturns.slice(0, 5).map(taxReturn => ({
        id: taxReturn.id,
        taxYear: taxReturn.taxYear,
        type: taxReturn.type,
        status: taxReturn.status,
        filedDate: taxReturn.filedDate
      })),
      recentDocuments: client.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadedAt: doc.createdAt
      })),
      recentCommunications: client.communications.map(comm => ({
        id: comm.id,
        subject: comm.subject,
        sentAt: comm.sentAt,
        type: comm.type
      }))
    }

    return NextResponse.json(portalData)
  } catch (error) {
    console.error('Error fetching client portal data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portal data' },
      { status: 500 }
    )
  }
}
