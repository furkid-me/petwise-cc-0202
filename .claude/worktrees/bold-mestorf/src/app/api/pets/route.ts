import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decodedToken: any;
    try { decodedToken = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const { name, type, breed, gender, isNeutered, dateOfBirth, chipNumber, initialWeightKg, dailyKcalTarget, dailyWaterMlTarget, healthNotes, personalityTraits, profilePictureUrl } = await request.json();

    if (!name || !type || initialWeightKg === undefined) return NextResponse.json({ error: 'Name, type, and initial weight are required' }, { status: 400 });

    const newPet = await prisma.pet.create({
      data: {
        userId: decodedToken.userId, name, type, breed, gender, isNeutered,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        chipNumber, initialWeightKg: parseFloat(initialWeightKg),
        dailyKcalTarget: dailyKcalTarget ? parseFloat(dailyKcalTarget) : null,
        dailyWaterMlTarget: dailyWaterMlTarget ? parseFloat(dailyWaterMlTarget) : null,
        healthNotes: healthNotes || [], personalityTraits, profilePictureUrl,
      },
    });
    return NextResponse.json(newPet, { status: 201 });
  } catch (error) {
    console.error('Create pet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decodedToken: any;
    try { decodedToken = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const pets = await prisma.pet.findMany({ where: { userId: decodedToken.userId }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ pets }, { status: 200 });
  } catch (error) {
    console.error('Get pets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
