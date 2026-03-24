import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyLineToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// POST /api/redeem - 兌換碼使用
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '缺少認證標頭' }, { status: 401 });
    }

    const accessToken = authHeader.slice(7);
    const profile = await verifyLineToken(accessToken);
    if (!profile) {
      return NextResponse.json({ error: 'LINE 認證失敗，請重新登入' }, { status: 401 });
    }

    // 查找用戶
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { lineUserId: profile.userId },
      });
    } catch (dbError) {
      console.error('Database error finding user:', dbError);
      return NextResponse.json({ error: '資料庫連線失敗' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: '用戶不存在，請先使用 LINE 登入' }, { status: 401 });
    }

    const body = await request.json();
    const { code, realName, email, phone, gender, city, district } = body;

    if (!code) {
      return NextResponse.json(
        { error: '請輸入兌換碼' },
        { status: 400 }
      );
    }

    // 驗證必填 CRM 欄位
    if (!realName || !email || !phone || !gender || !city || !district) {
      return NextResponse.json(
        { error: '請填寫完整的個人資料' },
        { status: 400 }
      );
    }

    // 查找兌換碼
    let redemptionCode;
    try {
      redemptionCode = await prisma.redemptionCode.findUnique({
        where: { code: code.toUpperCase().trim() },
      });
    } catch (dbError) {
      console.error('Database error finding redemption code:', dbError);
      return NextResponse.json({ error: '查詢兌換碼失敗，請稍後再試' }, { status: 500 });
    }

    if (!redemptionCode) {
      return NextResponse.json(
        { error: '無效的兌換碼' },
        { status: 400 }
      );
    }

    // 檢查兌換碼狀態
    if (!redemptionCode.isActive) {
      return NextResponse.json(
        { error: '此兌換碼已停用' },
        { status: 400 }
      );
    }

    // 檢查使用次數
    if (redemptionCode.currentUses >= redemptionCode.maxUses) {
      return NextResponse.json(
        { error: '此兌換碼已達使用上限' },
        { status: 400 }
      );
    }

    // 檢查有效期
    const now = new Date();
    if (redemptionCode.validFrom > now) {
      return NextResponse.json(
        { error: '此兌換碼尚未生效' },
        { status: 400 }
      );
    }

    if (redemptionCode.validUntil && redemptionCode.validUntil < now) {
      return NextResponse.json(
        { error: '此兌換碼已過期' },
        { status: 400 }
      );
    }

    // 檢查用戶是否已經使用過此兌換碼
    let existingLog;
    try {
      existingLog = await prisma.redemptionLog.findFirst({
        where: {
          userId: user.id,
          codeId: redemptionCode.id,
        },
      });
    } catch (dbError) {
      console.error('Database error checking existing log:', dbError);
      return NextResponse.json({ error: '檢查兌換記錄失敗，請稍後再試' }, { status: 500 });
    }

    if (existingLog) {
      return NextResponse.json(
        { error: '您已經使用過此兌換碼' },
        { status: 400 }
      );
    }

    // 計算訂閱期間
    const periodStart = new Date();
    // 如果用戶現有訂閱未過期，從現有訂閱結束時間開始
    if (user.subscriptionEnd && user.subscriptionEnd > now) {
      periodStart.setTime(user.subscriptionEnd.getTime());
    }

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + redemptionCode.durationDays);

    // 執行兌換（使用 transaction）
    let result;
    try {
      result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 更新兌換碼使用次數
        await tx.redemptionCode.update({
          where: { id: redemptionCode.id },
          data: { currentUses: { increment: 1 } },
        });

        // 創建兌換記錄
        await tx.redemptionLog.create({
          data: {
            userId: user.id,
            codeId: redemptionCode.id,
            plan: redemptionCode.plan,
            durationDays: redemptionCode.durationDays,
            periodStart,
            periodEnd,
          },
        });

        // 更新用戶訂閱和 CRM 資料
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: redemptionCode.plan,
            subscriptionStart: periodStart,
            subscriptionEnd: periodEnd,
            realName,
            email,
            phone,
            gender,
            city,
            district,
          },
        });

        return updatedUser;
      });
    } catch (txError) {
      console.error('Transaction error during redemption:', txError);
      const errorMessage = txError instanceof Error ? txError.message : 'Unknown error';
      return NextResponse.json(
        { error: `兌換交易失敗: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: redemptionCode.plan,
        durationDays: redemptionCode.durationDays,
        periodStart,
        periodEnd,
        user: result,
      },
      message: `成功升級至 ${redemptionCode.plan} 方案，有效期至 ${periodEnd.toLocaleDateString('zh-TW')}`,
    });
  } catch (error) {
    console.error('Redeem code error:', error);
    return NextResponse.json(
      { error: '兌換失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
