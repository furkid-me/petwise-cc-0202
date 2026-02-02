import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, checkSubscriptionLimit } from '@/lib/auth';

// GET /api/reminders - List reminders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const where: Record<string, unknown> = {
      userId: user.id,
      isActive: true,
    };

    if (petId) {
      where.petId = petId;
    }

    if (!includeCompleted) {
      where.isCompleted = false;
    }

    const reminders = await prisma.reminder.findMany({
      where,
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
      orderBy: { remindAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to get reminders' },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create a reminder
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check reminder limit
    const reminderCount = await prisma.reminder.count({
      where: {
        userId: user.id,
        isActive: true,
        isCompleted: false,
      },
    });

    const limitCheck = checkSubscriptionLimit(user, 'maxReminders', reminderCount);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `已達到提醒數量上限 (${limitCheck.limit} 個)，請升級方案以新增更多提醒`,
          code: 'LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      petId,
      title,
      description,
      category,
      remindAt,
      repeatType,
      repeatInterval,
      repeatEndAt,
    } = body;

    if (!title || !category || !remindAt) {
      return NextResponse.json(
        { error: 'Title, category, and remindAt are required' },
        { status: 400 }
      );
    }

    // If petId provided, verify ownership
    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId,
          userId: user.id,
          isActive: true,
        },
      });

      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        petId,
        title,
        description,
        category,
        remindAt: new Date(remindAt),
        repeatType: repeatType || 'NONE',
        repeatInterval,
        repeatEndAt: repeatEndAt ? new Date(repeatEndAt) : null,
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
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
