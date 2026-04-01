import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

function verifyToken(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// GET - 取得單筆花費記錄
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const record = await prisma.expenseRecord.findUnique({
      where: { id: params.id },
    });

    if (!record || record.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Get expense record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - 更新花費記錄
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
    const { recordDate, category, description, amount, notes } = body;

    const updated = await prisma.expenseRecord.update({
      where: { id: params.id },
      data: {
        ...(recordDate && { recordDate: new Date(recordDate) }),
        ...(category && { category }),
        ...(description && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        notes: notes !== undefined ? notes || null : existing.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update expense record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - 刪除花費記錄
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
    console.error('Delete expense record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
