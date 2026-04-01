import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

function verifyToken(request: Request): { userId: string } | null {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// GET /api/expenses - 取得費用列表（支援篩選：petId, category, startDate, endDate）
export async function GET(request: Request) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: decoded.userId };

    if (petId) where.petId = petId;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.recordDate = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const expenses = await prisma.expenseRecord.findMany({
      where,
      include: { pet: { select: { id: true, name: true, species: true } } },
      orderBy: { recordDate: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/expenses - 新增費用
export async function POST(request: Request) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { petId, recordDate, category, description, amount, notes } = body;

    if (!category || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: category, description, amount' },
        { status: 400 }
      );
    }

    const expense = await prisma.expenseRecord.create({
      data: {
        userId: decoded.userId,
        petId: petId || null,
        recordDate: new Date(recordDate || new Date()),
        category,
        description: description.trim(),
        amount: parseFloat(amount),
        notes: notes?.trim() || null,
      },
      include: { pet: { select: { id: true, name: true, species: true } } },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
