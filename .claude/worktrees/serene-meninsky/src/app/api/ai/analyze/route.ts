import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { analyzeHealth } from '@/lib/ai-parser';
import { getPetAge } from '@/lib/utils';

// POST /api/ai/analyze - Analyze pet health (Premium feature)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription
    if (user.subscriptionPlan !== 'PREMIUM') {
      return NextResponse.json(
        {
          error: 'AI 健康分析為專業版功能，請升級方案以使用此功能',
          code: 'PREMIUM_REQUIRED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { petId, days = 30 } = body;

    if (!petId) {
      return NextResponse.json(
        { error: 'Pet ID is required' },
        { status: 400 }
      );
    }

    // Get pet info
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

    // Get recent diaries
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const diaries = await prisma.diary.findMany({
      where: {
        petId,
        userId: user.id,
        occurredAt: {
          gte: startDate,
        },
      },
      orderBy: { occurredAt: 'desc' },
    });

    if (diaries.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: '目前沒有足夠的記錄進行分析，請持續記錄寵物日常以獲得健康分析報告。',
          insights: [],
          recommendations: ['建議每天記錄飲食、運動和健康狀況'],
          alerts: [],
        },
      });
    }

    // Analyze health
    const analysis = await analyzeHealth(
      petId,
      diaries.map((d: { category: string; content: string; details: unknown; occurredAt: Date }) => ({
        category: d.category,
        content: d.content,
        details: d.details as unknown,
        occurredAt: d.occurredAt,
      })),
      {
        name: pet.name,
        species: pet.species || '',
        breed: pet.breed || undefined,
        age: pet.birthday ? getPetAge(pet.birthday) : '未知',
      }
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze health' },
      { status: 500 }
    );
  }
}
