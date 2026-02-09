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
      actionItems: [],
      riskLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
      estimatedTimeToResolve: 0,
      suggestedDocuments: []
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
            'Arrange payment plan if unable to pay in full',
            'Consider penalty abatement if eligible'
          ],
          riskLevel: 'HIGH',
          estimatedTimeToResolve: 60,
          suggestedDocuments: ['PAYMENT_RECORDS', 'TAX_RETURN', 'BANK_STATEMENT']
        }
        break
        
      case 'CP05':
        aiAnalysis = {
          summary: 'Information request - IRS needs additional information',
          explanation: 'The IRS is requesting additional information to process your tax return or verify your identity.',
          actionItems: [
            'Gather requested documentation',
            'Respond before the deadline',
            'Keep copies of all correspondence',
            'Follow up if no response received'
          ],
          riskLevel: 'LOW',
          estimatedTimeToResolve: 30,
          suggestedDocuments: ['ID_DOCUMENT', 'SOCIAL_SECURITY_CARD', 'PROOF_OF_INCOME']
        }
        break
        
      default:
        aiAnalysis = {
          summary: 'IRS notice received - Review required',
          explanation: 'This IRS notice requires your attention. Please review the details and take appropriate action.',
          actionItems: [
            'Read the notice carefully',
            'Determine the required action',
            'Gather supporting documentation',
            'Respond by the deadline'
          ],
          riskLevel: 'MEDIUM',
          estimatedTimeToResolve: 90,
          suggestedDocuments: ['TAX_RETURN', 'SUPPORTING_DOCUMENTS']
        }
    }

    // Update the notice with AI analysis
    const updatedNotice = await db.iRSNotice.update({
      where: { id: params.id },
      data: {
        summary: aiAnalysis.summary,
        explanation: aiAnalysis.explanation,
        actionItems: aiAnalysis.actionItems.join('\n'),
      },
      include: {
        client: true,
        assignedTo: true,
        createdBy: true
      }
    })

    // Create automated tasks based on action items
    for (const actionItem of aiAnalysis.actionItems) {
      await db.task.create({
        data: {
          clientId: notice.clientId,
          title: actionItem,
          description: `Automated task for IRS notice ${notice.noticeNumber}`,
          type: 'NOTICE_RESPONSE',
          status: 'PENDING',
          priority: aiAnalysis.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
          dueDate: new Date(Date.now() + (aiAnalysis.estimatedTimeToResolve * 60 * 1000)), // Convert minutes to ms
          createdBy: notice.createdById,
          assignedToId: notice.assignedToId
        }
      })
    }

    return NextResponse.json({
      notice: updatedNotice,
      analysis: aiAnalysis
    })

  } catch (error) {
    console.error('Error analyzing notice:', error)
    return NextResponse.json(
      { error: 'Failed to analyze notice' },
      { status: 500 }
    )
  }
}