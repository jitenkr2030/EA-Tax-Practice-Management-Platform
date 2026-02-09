import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await db.clientProfile.findUnique({
      where: { id: params.id },
      include: {
        dependents: true,
        engagements: {
          include: {
            taxReturn: true,
            tasks: true,
            documents: true
          },
          orderBy: { taxYear: 'desc' }
        },
        taxReturns: {
          include: {
            tasks: true,
            forms: true
          },
          orderBy: { taxYear: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        notices: {
          orderBy: { receivedDate: 'desc' }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        billingAgreements: {
          where: { isActive: true }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
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
    
    const client = await db.clientProfile.update({
      where: { id: params.id },
      data: {
        type: body.type,
        firstName: body.firstName,
        lastName: body.lastName,
        businessName: body.businessName,
        email: body.email,
        phone: body.phone,
        ssn: body.ssn, // In production, this should be encrypted
        itin: body.itin, // In production, this should be encrypted
        filingStatus: body.filingStatus,
        entityType: body.entityType,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        country: body.country,
        notes: body.notes,
        internalComments: body.internalComments,
        isActive: body.isActive
      },
      include: {
        engagements: true,
        taxReturns: true
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.clientProfile.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}