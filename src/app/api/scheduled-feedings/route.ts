// src/app/api/scheduled-feedings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/scheduled-feedings - 新增排程餵食
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
      scheduledTime,
      notes,
    } = await request.json();

    if (!petId || !foodName || !foodType || !amountValue || !amountUnit || !scheduledTime) {
      return NextResponse.json(
        { error: 'petId, foodName, foodType, amountValue, amountUnit, scheduledTime are required' },
        { status: 400 }
      );
    }

    const newScheduledFeeding = await prisma.scheduledFeeding.create({
      data: {
        userId: decodedToken.userId,
        petId,
        foodProductId: foodProductId || null,
        foodName,
        foodType,
        amountValue: parseFloat(amountValue),
        amountUnit,
        scheduledTime,
        notes: notes || null,
      },
    });

    return NextResponse.json({ scheduledFeeding: newScheduledFeeding }, { status: 201 });
  } catch (error) {
    console.error('Create scheduled feeding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/scheduled-feedings - 獲取排程餵食列表
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

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }

    const scheduledFeedings = await prisma.scheduledFeeding.findMany({
      where: { userId: decodedToken.userId, petId },
      orderBy: { scheduledTime: 'asc' },
      include: {
        foodProduct: {
          select: { name: true, brand: true, caloriesPer100g: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json(scheduledFeedings, { status: 200 });
  } catch (error) {
    console.error('Get scheduled feedings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
