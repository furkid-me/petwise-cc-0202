// src/app/api/diet-records/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/diet-records - 新增飲食記錄
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const {
      petId,
      foodProductId,
      foodName,
      foodType,
      amountValue,
      amountUnit,
      recordedAt,
      totalKcal,
      mainIngredients,
      drankWaterMl,
      specialReaction,
      photoUrl,
    } = await request.json();

    if (!petId || !foodName || !foodType || !amountValue || !amountUnit || !recordedAt) {
      return NextResponse.json(
        { error: 'petId, foodName, foodType, amountValue, amountUnit, recordedAt are required' },
        { status: 400 }
      );
    }

    const newDietRecord = await prisma.dietRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        foodProductId: foodProductId || null,
        foodName,
        foodType,
        amountValue: parseFloat(amountValue),
        amountUnit,
        recordedAt: new Date(recordedAt),
        totalKcal: totalKcal ? parseFloat(totalKcal) : null,
        mainIngredients: mainIngredients || [],
        drankWaterMl: drankWaterMl ? parseFloat(drankWaterMl) : null,
        specialReaction: specialReaction || null,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ dietRecord: newDietRecord }, { status: 201 });
  } catch (error) {
    console.error('Create diet record API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/diet-records - 獲取飲食記錄列表（可帶查詢參數）
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const date = searchParams.get('date'); // YYYY-MM-DD

    const whereClause: any = { userId: decodedToken.userId };
    if (petId) whereClause.petId = petId;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      whereClause.recordedAt = { gte: startOfDay, lt: endOfDay };
    }

    const dietRecords = await prisma.dietRecord.findMany({
      where: whereClause,
      orderBy: { recordedAt: 'desc' },
      include: {
        foodProduct: {
          select: { name: true, brand: true, caloriesPer100g: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({ dietRecords }, { status: 200 });
  } catch (error) {
    console.error('Get diet records API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
