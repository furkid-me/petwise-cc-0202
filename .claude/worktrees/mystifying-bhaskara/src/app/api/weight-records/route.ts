import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/weight-records - 新增體重記錄
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decodedToken: any;
    try { decodedToken = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const { petId, recordDate, weightKg, notes } = await request.json();

    if (!petId || !recordDate || weightKg === undefined || weightKg === null) {
      return NextResponse.json({ error: 'Missing required weight record fields' }, { status: 400 });
    }

    const newWeightRecord = await prisma.weightRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        recordDate: new Date(recordDate),
        weightKg: parseFloat(weightKg),
        notes,
      },
    });

    return NextResponse.json(newWeightRecord, { status: 201 });
  } catch (error) {
    console.error('Create weight record API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/weight-records - 獲取體重記錄列表（可帶查詢參數）
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decodedToken: any;
    try { decodedToken = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) return NextResponse.json({ error: 'petId is required' }, { status: 400 });

    const weightRecords = await prisma.weightRecord.findMany({
      where: { userId: decodedToken.userId, petId },
      orderBy: { recordDate: 'desc' },
      take: 30,
    });

    return NextResponse.json({ weightRecords }, { status: 200 });
  } catch (error) {
    console.error('Get weight records API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
