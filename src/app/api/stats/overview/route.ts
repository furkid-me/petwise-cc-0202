import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/stats/overview - Get overview statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const days = parseInt(searchParams.get('days') || '7');

    // Determine date range based on subscription
    let allowedDays = days;
    if (user.subscriptionPlan === 'FREE') {
      allowedDays = Math.min(days, 7);
    } else if (user.subscriptionPlan === 'STANDARD') {
      allowedDays = Math.min(days, 90);
    }
    // PREMIUM has no limit

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - allowedDays);
    startDate.setHours(0, 0, 0, 0);

    const where: Record<string, unknown> = {
      userId: user.id,
      occurredAt: {
        gte: startDate,
      },
    };

    if (petId) {
      where.petId = petId;
    }

    // Get diary count by category
    const categoryStats = await prisma.diary.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true,
      },
    });

    // Get total count
    const totalCount = categoryStats.reduce((sum: number, stat: { _count: { id: number } }) => sum + stat._count.id, 0);

    // Get daily counts for trend
    const dailyStats = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(occurred_at) as date, COUNT(*) as count
      FROM diaries
      WHERE user_id = ${user.id}
        ${petId ? prisma.$queryRaw`AND pet_id = ${petId}` : prisma.$queryRaw``}
        AND occurred_at >= ${startDate}
      GROUP BY DATE(occurred_at)
      ORDER BY date DESC
    `;

    // Get upcoming reminders
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
        ...(petId && { petId }),
        isActive: true,
        isCompleted: false,
        remindAt: {
          gte: new Date(),
        },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
      orderBy: { remindAt: 'asc' },
      take: 5,
    });

    // Get pet summary if petId provided
    let petSummary = null;
    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId,
          userId: user.id,
          isActive: true,
        },
        include: {
          weightRecords: {
            orderBy: { recordedAt: 'desc' },
            take: 2,
          },
        },
      });

      if (pet) {
        const weightRecords = pet.weightRecords;
        let weightTrend: 'up' | 'down' | 'stable' = 'stable';

        if (weightRecords.length >= 2) {
          const current = weightRecords[0].weight.toNumber();
          const previous = weightRecords[1].weight.toNumber();
          if (current > previous * 1.02) weightTrend = 'up';
          else if (current < previous * 0.98) weightTrend = 'down';
        }

        // Get last medical visit
        const lastMedicalDiary = await prisma.diary.findFirst({
          where: {
            petId,
            userId: user.id,
            category: 'MEDICAL',
          },
          orderBy: { occurredAt: 'desc' },
        });

        petSummary = {
          petId: pet.id,
          petName: pet.name,
          currentWeight: weightRecords[0]?.weight.toNumber() || null,
          weightTrend,
          lastVetVisit: lastMedicalDiary?.occurredAt || null,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          days: allowedDays,
          startDate,
          endDate: new Date(),
        },
        totalEntries: totalCount,
        categoryBreakdown: categoryStats.map((stat: { category: string; _count: { id: number } }) => ({
          category: stat.category,
          count: stat._count.id,
          percentage: totalCount > 0 ? Math.round((stat._count.id / totalCount) * 100) : 0,
        })),
        dailyTrend: dailyStats.map((stat: { date: Date; count: bigint }) => ({
          date: stat.date,
          count: Number(stat.count),
        })),
        upcomingReminders,
        petSummary,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
