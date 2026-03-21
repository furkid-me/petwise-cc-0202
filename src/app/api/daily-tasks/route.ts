import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/daily-tasks - List daily tasks
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: Record<string, unknown> = { userId: user.id };
    if (!includeInactive) where.isActive = true;
    if (petId) where.petId = petId;

    const tasks = await prisma.dailyTask.findMany({
      where,
      include: {
        pet: {
          select: { id: true, name: true, species: true, photoUrl: true },
        },
        executions: {
          orderBy: { executionDate: 'desc' },
          take: 7,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get daily tasks error:', error);
    return NextResponse.json({ error: 'Failed to get daily tasks' }, { status: 500 });
  }
}

// POST /api/daily-tasks - Create a daily task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { petId, taskName, frequency, startDate, endDate, notes } = body;

    if (!petId || !taskName || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'petId, taskName, frequency, and startDate are required' },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: user.id, isActive: true },
    });
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const task = await prisma.dailyTask.create({
      data: {
        userId: user.id,
        petId,
        taskName,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes ?? null,
      },
      include: {
        pet: {
          select: { id: true, name: true, species: true, photoUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Create daily task error:', error);
    return NextResponse.json({ error: 'Failed to create daily task' }, { status: 500 });
  }
}
