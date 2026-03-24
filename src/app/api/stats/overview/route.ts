import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    // FREE: 最多 7 天統計, STANDARD: 最多 90 天, PREMIUM: 最多 365 天
    let allowedDays = days;
    if (user.subscriptionPlan === 'FREE') {
      allowedDays = Math.min(days, 7);
    } else if (user.subscriptionPlan === 'STANDARD') {
      allowedDays = Math.min(days, 90);
    } else {
      // PREMIUM: 365 days limit
      allowedDays = Math.min(days, 365);
    }

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
    let dailyStats: Array<{ date: Date; count: bigint }> = [];
    try {
      if (petId) {
        dailyStats = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
          SELECT DATE(occurred_at) as date, COUNT(*) as count
          FROM diaries
          WHERE user_id = ${user.id}
            AND pet_id = ${petId}
            AND occurred_at >= ${startDate}
          GROUP BY DATE(occurred_at)
          ORDER BY date DESC
        `;
      } else {
        dailyStats = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
          SELECT DATE(occurred_at) as date, COUNT(*) as count
          FROM diaries
          WHERE user_id = ${user.id}
            AND occurred_at >= ${startDate}
          GROUP BY DATE(occurred_at)
          ORDER BY date DESC
        `;
      }
    } catch (queryError) {
      console.error('Daily stats query error:', queryError);
      // Continue without daily stats if query fails
    }

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
    let weightHistory: Array<{ date: string; weight: number }> = [];
    let healthAlerts: Array<{ type: string; count: number; lastOccurred: Date | null }> = [];

    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId,
          userId: user.id,
          isActive: true,
        },
        include: {
          weightRecords: {
            orderBy: { recordDate: 'desc' },
            take: 30, // 最近 30 筆體重記錄
          },
        },
      });

      if (pet) {
        const weightRecords = pet.weightRecords;
        let weightTrend: 'up' | 'down' | 'stable' = 'stable';

        if (weightRecords.length >= 2) {
          const current = weightRecords[0].weightKg.toNumber();
          const previous = weightRecords[1].weightKg.toNumber();
          if (current > previous * 1.02) weightTrend = 'up';
          else if (current < previous * 0.98) weightTrend = 'down';
        }

        // 體重歷史（用於趨勢圖）
        weightHistory = weightRecords.map((r: { recordDate: Date; weightKg: { toNumber: () => number } }) => ({
          date: r.recordDate.toISOString(),
          weight: r.weightKg.toNumber(),
        })).reverse(); // 按時間正序

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
          currentWeight: weightRecords[0]?.weightKg.toNumber() || null,
          weightTrend,
          lastVetVisit: lastMedicalDiary?.occurredAt || null,
        };

        // 健康異常統計（嘔吐、腹瀉等）
        const healthKeywords = [
          { type: 'vomit', keywords: ['吐', '嘔'], label: '嘔吐' },
          { type: 'diarrhea', keywords: ['拉', '腹瀉', '軟便'], label: '腹瀉' },
          { type: 'noAppetite', keywords: ['不吃', '沒食慾', '食慾差'], label: '食慾不振' },
          { type: 'lethargy', keywords: ['沒精神', '精神差', '無力'], label: '精神不佳' },
        ];

        for (const health of healthKeywords) {
          const diaries = await prisma.diary.findMany({
            where: {
              petId,
              userId: user.id,
              occurredAt: { gte: startDate },
              OR: health.keywords.map((kw) => ({
                content: { contains: kw },
              })),
            },
            orderBy: { occurredAt: 'desc' },
          });

          if (diaries.length > 0) {
            healthAlerts.push({
              type: health.label,
              count: diaries.length,
              lastOccurred: diaries[0].occurredAt,
            });
          }
        }
      }
    }

    // 日曆數據：哪些天有記錄
    const calendarData = dailyStats.map((stat) => ({
      date: stat.date,
      count: Number(stat.count),
    }));

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
        calendarData,
        weightHistory,
        healthAlerts,
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
