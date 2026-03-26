import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint clears all expense records
export async function DELETE(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all expense records
    const result = await prisma.expenseRecord.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${result.count} expense records` 
    });
  } catch (error) {
    console.error('Clear expense records error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
