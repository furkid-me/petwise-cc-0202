import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint clears all test data for a user but keeps their profile
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminPassword = body.password || request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete all records but keep user and pet profiles
    await prisma.dietRecord.deleteMany({ where: { userId } });
    await prisma.weightRecord.deleteMany({ where: { userId } });
    await prisma.reminder.deleteMany({ where: { userId } });
    await prisma.dailyTask.deleteMany({ where: { userId } });
    await prisma.medicalRecord.deleteMany({ where: { userId } });
    await prisma.medicationRecord.deleteMany({ where: { userId } });
    await prisma.examinationRecord.deleteMany({ where: { userId } });
    await prisma.expenseRecord.deleteMany({ where: { userId } });

    return NextResponse.json({ 
      success: true, 
      message: 'All test records cleared (user profile kept)' 
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
