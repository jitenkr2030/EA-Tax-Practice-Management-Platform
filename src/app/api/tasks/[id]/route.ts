import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const task = await db.task.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assignedToId: body.assignedToId,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedAt: body.status === 'COMPLETED' ? new Date() : null
      },
      include: {
        taxReturn: {
          select: { id: true, taxYear: true, type: true, status: returnStatus }
        },
        client: {
          select: { id: true, clientId: true, firstName: true, lastName: true, businessName: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Update return status if all tasks are completed
    if (body.status === 'COMPLETED' && task.taxReturnId) {
      const remainingTasks = await db.task.count({
        where: {
          taxReturnId: task.taxReturnId,
          status: { not: 'COMPLETED' }
        }
      })

      if (remainingTasks === 0) {
        await db.taxReturn.update({
          where: { id: task.taxReturnId },
          data: { 
            status: 'COMPLETED',
            completionDate: new Date()
          }
        })
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}