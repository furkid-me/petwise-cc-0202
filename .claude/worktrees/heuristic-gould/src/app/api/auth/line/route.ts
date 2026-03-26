import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export async function POST(request: Request) {
  try {
    const { lineUserId, displayName, profilePictureUrl } = await request.json();
    if (!lineUserId) return NextResponse.json({ error: 'LINE User ID is required' }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { lineUserId } });

    if (!user) {
      user = await prisma.user.create({
        data: { lineUserId, displayName, profilePictureUrl, subscriptionPlan: 'FREE' },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { displayName, profilePictureUrl },
      });
    }

    const token = jwt.sign({ userId: user.id, lineUserId: user.lineUserId }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error) {
    console.error('LINE auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
