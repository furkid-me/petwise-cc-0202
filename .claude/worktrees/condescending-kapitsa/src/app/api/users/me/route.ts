import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        timezone: user.timezone,
        language: user.language,
        notifyEnabled: user.notifyEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me - Update current user
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, timezone, language, notifyEnabled } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email !== undefined && { email }),
        ...(timezone !== undefined && { timezone }),
        ...(language !== undefined && { language }),
        ...(notifyEnabled !== undefined && { notifyEnabled }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        lineUserId: updatedUser.lineUserId,
        displayName: updatedUser.displayName,
        pictureUrl: updatedUser.pictureUrl,
        email: updatedUser.email,
        subscriptionPlan: updatedUser.subscriptionPlan,
        subscriptionStart: updatedUser.subscriptionStart,
        subscriptionEnd: updatedUser.subscriptionEnd,
        timezone: updatedUser.timezone,
        language: updatedUser.language,
        notifyEnabled: updatedUser.notifyEnabled,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
