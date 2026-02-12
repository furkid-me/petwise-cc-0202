import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, checkSubscriptionLimit } from '@/lib/auth';
import { parseDiaryInput } from '@/lib/ai-parser';

// GET /api/diaries - List diaries
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (petId) {
      where.petId = petId;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.occurredAt = {};
      if (startDate) {
        // 將本地日期轉換為當天開始時間 (台灣時區 UTC+8)
        const start = new Date(startDate + 'T00:00:00+08:00');
        (where.occurredAt as Record<string, Date>).gte = start;
      }
      if (endDate) {
        // 將本地日期轉換為當天結束時間 (台灣時區 UTC+8)
        const end = new Date(endDate + 'T23:59:59.999+08:00');
        (where.occurredAt as Record<string, Date>).lte = end;
      }
    }

    const [diaries, total] = await Promise.all([
      prisma.diary.findMany({
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
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.diary.count({ where }),
    ]);

    // Transform tags
    const transformedDiaries = diaries.map((diary: { tags: { tag: { id: string; name: string; color: string | null } }[]; [key: string]: unknown }) => ({
      ...diary,
      tags: diary.tags.map((dt: { tag: { id: string; name: string; color: string | null } }) => dt.tag),
    }));

    return NextResponse.json({
      success: true,
      data: transformedDiaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get diaries error:', error);
    return NextResponse.json(
      { error: 'Failed to get diaries' },
      { status: 500 }
    );
  }
}

// POST /api/diaries - Create diary (with optional AI parsing)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      petId,
      rawInput,
      category,
      subCategory,
      content,
      details,
      mood,
      severity,
      photos,
      occurredAt,
      useAiParsing,
    } = body;

    if (!petId) {
      return NextResponse.json(
        { error: 'Pet ID is required' },
        { status: 400 }
      );
    }

    // Verify pet ownership
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

    // Check daily entry limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await prisma.diary.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const limitCheck = checkSubscriptionLimit(user, 'maxDailyEntries', todayCount);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `已達到每日記錄上限 (${limitCheck.limit} 則)，請升級方案以記錄更多`,
          code: 'LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    // If using AI parsing
    if (useAiParsing && rawInput) {
      const parseResult = await parseDiaryInput(rawInput, pet.name);

      // Log AI parsing for improvement
      await prisma.aiParseLog.create({
        data: {
          rawInput,
          parsedOutput: JSON.parse(JSON.stringify(parseResult)),
        },
      });

      // Create multiple diary entries if parsed
      const createdDiaries = await Promise.all(
        parseResult.entries.map(async (entry) => {
          return prisma.diary.create({
            data: {
              userId: user.id,
              petId,
              rawInput,
              category: entry.category,
              subCategory: entry.subCategory,
              content: entry.content,
              details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
              mood: entry.mood,
              severity: entry.severity,
              photos: photos || [],
              occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
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
        })
      );

      // Auto-update pet weight if extracted from diary
      let weightUpdated = false;
      if (parseResult.extractedWeight !== undefined) {
        await prisma.pet.update({
          where: { id: petId },
          data: { weight: parseResult.extractedWeight },
        });
        weightUpdated = true;
      }

      return NextResponse.json({
        success: true,
        data: createdDiaries,
        aiSummary: parseResult.summary,
        weightUpdated,
        newWeight: parseResult.extractedWeight,
      });
    }

    // Manual entry (no AI parsing)
    if (!category || !content) {
      return NextResponse.json(
        { error: 'Category and content are required for manual entry' },
        { status: 400 }
      );
    }

    const diary = await prisma.diary.create({
      data: {
        userId: user.id,
        petId,
        rawInput,
        category,
        subCategory,
        content,
        details: details || {},
        mood,
        severity,
        photos: photos || [],
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
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
    console.error('Create diary error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create diary: ${errorMessage}` },
      { status: 500 }
    );
  }
}
