import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/diaries/[id] - Get a specific diary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const diary = await prisma.diary.findFirst({
      where: {
        id: params.id,
        userId: user.id,
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!diary) {
      return NextResponse.json({ error: 'Diary not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...diary,
        tags: diary.tags.map(dt => dt.tag),
      },
    });
  } catch (error) {
    console.error('Get diary error:', error);
    return NextResponse.json(
      { error: 'Failed to get diary' },
      { status: 500 }
    );
  }
}

// PUT /api/diaries/[id] - Update a diary
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check diary ownership
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingDiary) {
      return NextResponse.json({ error: 'Diary not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      category,
      subCategory,
      content,
      details,
      mood,
      severity,
      photos,
      occurredAt,
      isPinned,
      isImportant,
    } = body;

    const diary = await prisma.diary.update({
      where: { id: params.id },
      data: {
        ...(category !== undefined && { category }),
        ...(subCategory !== undefined && { subCategory }),
        ...(content !== undefined && { content }),
        ...(details !== undefined && { details }),
        ...(mood !== undefined && { mood }),
        ...(severity !== undefined && { severity }),
        ...(photos !== undefined && { photos }),
        ...(occurredAt !== undefined && { occurredAt: new Date(occurredAt) }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isImportant !== undefined && { isImportant }),
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
      data: diary,
    });
  } catch (error) {
    console.error('Update diary error:', error);
    return NextResponse.json(
      { error: 'Failed to update diary' },
      { status: 500 }
    );
  }
}

// DELETE /api/diaries/[id] - Delete a diary
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check diary ownership
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingDiary) {
      return NextResponse.json({ error: 'Diary not found' }, { status: 404 });
    }

    await prisma.diary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Diary deleted successfully',
    });
  } catch (error) {
    console.error('Delete diary error:', error);
    return NextResponse.json(
      { error: 'Failed to delete diary' },
      { status: 500 }
    );
  }
}
