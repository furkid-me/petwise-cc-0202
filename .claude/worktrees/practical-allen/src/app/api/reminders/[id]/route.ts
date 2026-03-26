import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT /api/reminders/[id] - Update a reminder
export async function PUT(
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

    const body = await request.json();
    const {
      title,
      description,
      category,
      remindAt,
      repeatType,
      repeatInterval,
      repeatEndAt,
      isActive,
    } = body;

    const reminder = await prisma.reminder.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(remindAt !== undefined && { remindAt: new Date(remindAt) }),
        ...(repeatType !== undefined && { repeatType }),
        ...(repeatInterval !== undefined && { repeatInterval }),
        ...(repeatEndAt !== undefined && { repeatEndAt: repeatEndAt ? new Date(repeatEndAt) : null }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id] - Delete a reminder
export async function DELETE(
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

    await prisma.reminder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
