import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/daily-tasks/[id]/execute - Record a task execution
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const task = await prisma.dailyTask.findFirst({
      where: { id, userId: user.id, isActive: true },
    });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { executionDate, isCompleted = true, notes } = body;

    const execution = await prisma.taskExecution.create({
      data: {
        taskId: id,
        executionDate: executionDate ? new Date(executionDate) : new Date(),
        isCompleted,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ success: true, data: execution });
  } catch (error) {
    console.error('Create task execution error:', error);
    return NextResponse.json({ error: 'Failed to record task execution' }, { status: 500 });
  }
}
