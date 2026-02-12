import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// 簡單的管理員密碼驗證（生產環境應使用更安全的方式）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'petwise-admin-2024';

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const password = authHeader.replace('Bearer ', '');
  return password === ADMIN_PASSWORD;
}

// GET /api/admin/codes - 獲取所有兌換碼
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const codes = await prisma.redemptionCode.findMany({
      include: {
        redemptionLogs: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                realName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    console.error('Get codes error:', error);
    return NextResponse.json(
      { error: 'Failed to get codes' },
      { status: 500 }
    );
  }
}

// POST /api/admin/codes - 建立新兌換碼
export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      plan,
      durationDays,
      maxUses = 1,
      validUntil,
      description,
      prefix = 'PETWISE',
    } = body;

    if (!plan || !durationDays) {
      return NextResponse.json(
        { error: 'Plan and durationDays are required' },
        { status: 400 }
      );
    }

    // 生成兌換碼：PREFIX-PLAN-RANDOM
    const randomPart = nanoid(8).toUpperCase();
    const code = `${prefix}-${plan}-${randomPart}`;

    const redemptionCode = await prisma.redemptionCode.create({
      data: {
        code,
        plan,
        durationDays,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : null,
        description,
        createdBy: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      data: redemptionCode,
    });
  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json(
      { error: 'Failed to create code' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/codes - 停用兌換碼
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('id');

    if (!codeId) {
      return NextResponse.json(
        { error: 'Code ID is required' },
        { status: 400 }
      );
    }

    await prisma.redemptionCode.update({
      where: { id: codeId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Code deactivated',
    });
  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate code' },
      { status: 500 }
    );
  }
}
