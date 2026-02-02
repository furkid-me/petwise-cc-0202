import { NextRequest, NextResponse } from 'next/server';
import { verifyLineToken, getOrCreateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Verify LINE token and get profile
    const profile = await verifyLineToken(accessToken);
    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(profile);

    return NextResponse.json({
      success: true,
      data: {
        user: {
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
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
