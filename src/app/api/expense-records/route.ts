import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// GET - 獲取花費記錄
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    const whereClause: any = {
      userId: decodedToken.userId,
    };

    if (petId) {
      whereClause.petId = petId;
    }

    if (startDate) {
      whereClause.recordDate = {
        ...whereClause.recordDate,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      whereClause.recordDate = {
        ...whereClause.recordDate,
        lte: new Date(endDate),
      };
    }

    if (category) {
      whereClause.category = category;
    }

    const expenseRecords = await prisma.expenseRecord.findMany({
      where: whereClause,
      orderBy: { recordDate: 'desc' },
    });

    return NextResponse.json(expenseRecords);
  } catch (error) {
    console.error('Get expense records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 新增花費記錄
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

    const body = await request.json();
    const { petId, recordDate, category, description, amount, notes } = body;

    if (!petId || !category || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: petId, category, description, amount' },
        { status: 400 }
      );
    }

    const newExpenseRecord = await prisma.expenseRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        recordDate: new Date(recordDate || new Date()),
        category,
        description,
        amount: parseFloat(amount),
        notes: notes || null,
      },
    });

    return NextResponse.json(newExpenseRecord, { status: 201 });
  } catch (error) {
    console.error('Create expense record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
