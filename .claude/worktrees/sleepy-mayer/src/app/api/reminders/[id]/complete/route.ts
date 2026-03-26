import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/reminders/[id]/complete - Mark reminder as completed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check reminder ownership
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Mark as completed
    const reminder = await prisma.reminder.update({
      where: { id: params.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            photoUrl: true,
          },
        },
      },
    });

    // If this is a repeating reminder, create the next occurrence
    if (existingReminder.repeatType !== 'NONE') {
      const nextRemindAt = calculateNextRemindAt(
        existingReminder.remindAt,
        existingReminder.repeatType,
        existingReminder.repeatInterval
      );

      // Only create if before repeat end date
      if (!existingReminder.repeatEndAt || nextRemindAt <= existingReminder.repeatEndAt) {
        await prisma.reminder.create({
          data: {
            userId: user.id,
            petId: existingReminder.petId,
            title: existingReminder.title,
            description: existingReminder.description,
            category: existingReminder.category,
            remindAt: nextRemindAt,
            repeatType: existingReminder.repeatType,
            repeatInterval: existingReminder.repeatInterval,
            repeatEndAt: existingReminder.repeatEndAt,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to complete reminder' },
      { status: 500 }
    );
  }
}

function calculateNextRemindAt(
  currentRemindAt: Date,
  repeatType: string,
  repeatInterval: number | null
): Date {
  const next = new Date(currentRemindAt);

  switch (repeatType) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'CUSTOM':
      if (repeatInterval) {
        next.setDate(next.getDate() + repeatInterval);
      }
      break;
  }

  return next;
}
