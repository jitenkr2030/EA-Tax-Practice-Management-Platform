import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { businessName: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (type && type !== 'all') {
      whereClause.type = type
    }

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active'
    }

    const clients = await db.clientProfile.findMany({
      where: whereClause,
      include: {
        engagements: {
          orderBy: { taxYear: 'desc' },
          take: 1
        },
        _count: {
          select: {
            engagements: true,
            taxReturns: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate client ID
    const year = new Date().getFullYear()
    const clientCount = await db.clientProfile.count()
    const clientId = `CL-${year}-${String(clientCount + 1).padStart(4, '0')}`

    const client = await db.clientProfile.create({
      data: {
        clientId,
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
        country: body.country || 'US',
        notes: body.notes,
        internalComments: body.internalComments,
        createdById: body.createdById // This should come from authentication
      },
      include: {
        engagements: true,
        taxReturns: true
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}