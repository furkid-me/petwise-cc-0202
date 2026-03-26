import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint deletes a user account and all associated data by LINE ID
export async function DELETE(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const lineUserId = body.lineUserId;

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    // Find user by LINE ID
    const user = await prisma.user.findFirst({
      where: { lineUserId: lineUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascades to all related records due to foreign key constraints)
    await prisma.user.delete({
      where: { id: user.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Account for LINE user ${lineUserId} has been completely deleted` 
    });
  } catch (error) {
    console.error('Reset account error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
