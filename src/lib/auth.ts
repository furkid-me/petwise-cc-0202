import { NextRequest } from 'next/server';
import prisma from './prisma';
import type { User } from '@/types';

const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// Verify LINE access token and get profile
export async function verifyLineToken(accessToken: string): Promise<LineProfile | null> {
  try {
    // Verify token
    const verifyResponse = await fetch(`${LINE_VERIFY_URL}?access_token=${accessToken}`);
    if (!verifyResponse.ok) {
      console.error('LINE token verification failed');
      return null;
    }

    const verifyData = await verifyResponse.json();

    // Check if token belongs to our channel
    const channelId = process.env.LINE_CHANNEL_ID;
    if (channelId && verifyData.client_id !== channelId) {
      console.error('Token does not belong to our channel');
      return null;
    }

    // Get user profile
    const profileResponse = await fetch(LINE_PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Failed to get LINE profile');
      return null;
    }

    const profile = await profileResponse.json();
    return profile as LineProfile;
  } catch (error) {
    console.error('LINE token verification error:', error);
    return null;
  }
}

// Get or create user from LINE profile
export async function getOrCreateUser(profile: LineProfile): Promise<User> {
  let user = await prisma.user.findUnique({
    where: { lineUserId: profile.userId },
  });

  if (user) {
    // Update user info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        lastLoginAt: new Date(),
      },
    });
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        lastLoginAt: new Date(),
      },
    });
  }

  return user;
}

// Get current user from request (using LINE access token)
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.slice(7);

  // Verify LINE token
  const profile = await verifyLineToken(accessToken);
  if (!profile) {
    return null;
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { lineUserId: profile.userId },
  });

  return user;
}

// Check subscription limits
export function checkSubscriptionLimit(
  user: User,
  limitType: 'maxPets' | 'maxDailyEntries' | 'maxReminders',
  currentCount: number
): { allowed: boolean; limit: number } {
  const limits = {
    FREE: {
      maxPets: 1,
      maxDailyEntries: 5,
      maxReminders: 3,
    },
    STANDARD: {
      maxPets: 3,
      maxDailyEntries: -1,
      maxReminders: -1,
    },
    PREMIUM: {
      maxPets: -1,
      maxDailyEntries: -1,
      maxReminders: -1,
    },
  };

  const planLimits = limits[user.subscriptionPlan];
  const limit = planLimits[limitType];

  if (limit === -1) {
    return { allowed: true, limit: -1 };
  }

  return {
    allowed: currentCount < limit,
    limit,
  };
}
