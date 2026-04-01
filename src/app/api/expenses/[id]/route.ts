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

// GET /api/expenses/:id - 取得單筆費用
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expense = await prisma.expenseRecord.findUnique({
      where: { id: params.id },
      include: { pet: { select: { id: true, name: true, species: true } } },
    });

    if (!expense || expense.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('GET /api/expenses/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/expenses/:id - 更新費用
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.expenseRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { petId, recordDate, category, description, amount, notes } = body;

    const updated = await prisma.expenseRecord.update({
      where: { id: params.id },
      data: {
        ...(petId !== undefined && { petId: petId || null }),
        ...(recordDate && { recordDate: new Date(recordDate) }),
        ...(category && { category }),
        ...(description && { description: description.trim() }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        notes: notes !== undefined ? notes?.trim() || null : existing.notes,
      },
      include: { pet: { select: { id: true, name: true, species: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/expenses/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses/:id - 刪除費用
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.expenseRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.expenseRecord.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses/:id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
