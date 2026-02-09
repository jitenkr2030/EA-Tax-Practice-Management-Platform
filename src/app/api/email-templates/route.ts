import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const template = await db.emailTemplate.create({
      data: {
        name: body.name,
        subject: body.subject,
        content: body.content,
        type: body.type,
        variables: body.variables ? JSON.stringify(body.variables) : null,
        isActive: body.isActive ?? true,
        createdBy: body.createdBy
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Failed to create email template' },
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
    
    const template = await db.emailTemplate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        subject: body.subject,
        content: body.content,
        type: body.type,
        variables: body.variables ? JSON.stringify(body.variables) : null,
        isActive: body.isActive
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.emailTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Email template deleted successfully' })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    )
  }
}