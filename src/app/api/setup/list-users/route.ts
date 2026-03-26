import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Debug endpoint to list all users (only for testing)
export async function GET(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ 
      error: 'Failed to list users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
