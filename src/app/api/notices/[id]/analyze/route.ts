import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notice = await db.iRSNotice.findUnique({
      where: { id: params.id },
      include: {
        client: true
      }
    })

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      )
    }

    // TODO: Integrate with z-ai-web-dev-sdk for actual AI analysis
    // For now, we'll simulate AI analysis based on notice type
    
    let aiAnalysis = {
      summary: '',
      explanation: '',
      actionItems: [] as string[],
      riskLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
      estimatedTimeToResolve: 0,
      suggestedDocuments: [] as string[]
    }

    // Simulate AI analysis based on notice type
    switch (notice.noticeType) {
      case 'CP2000':
        aiAnalysis = {
          summary: 'Income discrepancy detected - IRS believes you underreported income',
          explanation: 'The IRS has received information from third parties (employers, banks, etc.) that shows more income than what you reported on your tax return. This is the most common type of IRS notice.',
          actionItems: [
            'Review all income sources for the tax year',
            'Compare with 1099s, W-2s, and other income documents',
            'Calculate the correct tax amount',
            'Prepare response with supporting documentation',
            'File amended return if necessary'
          ],
          riskLevel: 'MEDIUM',
          estimatedTimeToResolve: 120, // minutes
          suggestedDocuments: ['W-2', 'FORM_1099_INT', 'FORM_1099_DIV', 'FORM_1099_MISC', 'BANK_STATEMENT']
        }
        break
        
      case 'CP14':
        aiAnalysis = {
          summary: 'Tax due notice - You have an unpaid tax balance',
          explanation: 'This notice indicates that you have an unpaid tax balance. The IRS is requesting payment to avoid penalties and interest.',
          actionItems: [
            'Verify the tax amount calculation',
            'Check if payments were applied correctly',
            'Arrange payment or installment agreement',
            'Consider penalty abatement request if eligible'
          ],
          riskLevel: 'HIGH',
          estimatedTimeToResolve: 60,
          suggestedDocuments: ['PAYMENT_CONFIRMATION', 'BANK_STATEMENT', 'TAX_RETURN']
        }
        break
        
      case 'CP501':
        aiAnalysis = {
          summary: 'Reminder notice - You have an unpaid tax balance',
          explanation: 'This is a reminder that you still have an unpaid tax balance. The IRS has not received payment for previous notices.',
          actionItems: [
            'Review previous notices',
            'Check payment status',
            'Make immediate payment to avoid levy',
            'Consider collection alternatives'
          ],
          riskLevel: 'HIGH',
          estimatedTimeToResolve: 45,
          suggestedDocuments: ['PAYMENT_CONFIRMATION', 'PREVIOUS_NOTICES', 'BANK_STATEMENT']
        }
        break
        
      case 'CP504':
        aiAnalysis = {
          summary: 'Urgent notice - Intent to levy',
          explanation: 'This is an urgent notice indicating the IRS intends to levy your assets if payment is not made immediately.',
          actionItems: [
            'Contact IRS immediately to prevent levy',
            'Arrange payment or installment agreement',
            'File Collection Due Process appeal if appropriate',
            'Consider offer in compromise if unable to pay full amount'
          ],
          riskLevel: 'HIGH',
          estimatedTimeToResolve: 30,
          suggestedDocuments: ['FINANCIAL_STATEMENTS', 'PAYMENT_PROOF', 'INCOME_DOCUMENTS']
        }
        break
        
      default:
        aiAnalysis = {
          summary: 'IRS notice received - Review required',
          explanation: 'This IRS notice requires attention. Please review the notice details and follow the instructions provided.',
          actionItems: [
            'Read the notice carefully',
            'Gather relevant tax documents',
            'Determine appropriate response',
            'Meet any deadlines mentioned'
          ],
          riskLevel: 'MEDIUM',
          estimatedTimeToResolve: 90,
          suggestedDocuments: ['TAX_RETURN', 'INCOME_DOCUMENTS', 'DEDUCTION_RECEIPTS']
        }
    }

    // Update the notice with AI analysis
    const updatedNotice = await db.iRSNotice.update({
      where: { id: params.id },
      data: {
        summary: aiAnalysis.summary,
        explanation: aiAnalysis.explanation,
        actionItems: aiAnalysis.actionItems.join('\n'),
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      notice: updatedNotice,
      aiAnalysis
    })
  } catch (error) {
    console.error('Error analyzing notice:', error)
    return NextResponse.json(
      { error: 'Failed to analyze notice' },
      { status: 500 }
    )
  }
}
