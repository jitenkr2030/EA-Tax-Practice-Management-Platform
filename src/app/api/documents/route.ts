import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const engagementId = formData.get('engagementId') as string
    const taxYear = formData.get('taxYear') as string
    const documentType = formData.get('type') as string
    const uploadedById = formData.get('uploadedById') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save document record to database
    const document = await db.document.create({
      data: {
        name: file.name,
        originalName: file.name,
        type: documentType || 'OTHER',
        category: categorizeDocument(documentType || 'OTHER'),
        taxYear: taxYear ? parseInt(taxYear) : null,
        uploadedById,
        clientId: clientId || null,
        engagementId: engagementId || null,
        fileUrl: `/uploads/${uniqueFileName}`,
        fileSize: file.size,
        mimeType: file.type,
        isVerified: false,
        version: 1,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        }
      }
    })

    // TODO: Perform AI classification and OCR extraction
    // This would integrate with z-ai-web-dev-sdk for document processing

    return NextResponse.json(document, { status: 201 })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const engagementId = searchParams.get('engagementId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const taxYear = searchParams.get('taxYear')

    let whereClause: any = {}

    if (clientId) whereClause.clientId = clientId
    if (engagementId) whereClause.engagementId = engagementId
    if (type && type !== 'all') whereClause.type = type
    if (category && category !== 'all') whereClause.category = category
    if (taxYear) whereClause.taxYear = parseInt(taxYear)

    const documents = await db.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        engagement: {
          select: { id: true, taxYear: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

function categorizeDocument(type: string): string {
  const incomeDocuments = ['W2', 'W2G', 'FORM_1099_INT', 'FORM_1099_DIV', 'FORM_1099_B', 'FORM_1099_MISC', 'FORM_1099_NE', 'FORM_1099_R', 'FORM_1099_K1']
  const deductionDocuments = ['FORM_1098', 'FORM_1098_T', 'FORM_1098_E']
  const identityDocuments = ['ID_DOCUMENT']
  const legalDocuments = ['CONTRACT']
  const financialDocuments = ['BANK_STATEMENT', 'INVOICE', 'RECEIPT']

  if (incomeDocuments.includes(type)) return 'INCOME'
  if (deductionDocuments.includes(type)) return 'DEDUCTION'
  if (identityDocuments.includes(type)) return 'IDENTITY'
  if (legalDocuments.includes(type)) return 'LEGAL'
  if (financialDocuments.includes(type)) return 'FINANCIAL'
  
  return 'OTHER'
}