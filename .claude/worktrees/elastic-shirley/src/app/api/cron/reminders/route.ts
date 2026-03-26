import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReminderNotification } from '@/lib/line-messaging';

// This endpoint should be called by a cron job every minute
// Vercel Cron: Add to vercel.json
// Self-hosted: Use system cron or node-cron

// POST /api/cron/reminders - Process pending reminders
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Find reminders that are due
    const dueReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        isCompleted: false,
        notifySent: false,
        remindAt: {
          gte: fiveMinutesAgo,
          lte: now,
        },
      },
      include: {
        user: true,
        pet: true,
      },
    });

    console.log(`Processing ${dueReminders.length} due reminders`);

    const results = [];

    for (const reminder of dueReminders) {
      // Skip if user has disabled notifications
      if (!reminder.user.notifyEnabled) {
        continue;
      }

      // Send LINE notification
      const sent = await sendReminderNotification(reminder.user.lineUserId, {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        petName: reminder.pet?.name,
        category: reminder.category,
      });

      if (sent) {
        // Mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            notifySent: true,
            notifySentAt: now,
          },
        });

        // Handle repeating reminders
        if (reminder.repeatType !== 'NONE') {
          const nextRemindAt = getNextRemindAt(
            reminder.remindAt,
            reminder.repeatType,
            reminder.repeatInterval
          );

          // Check if within repeat end date
          if (!reminder.repeatEndAt || nextRemindAt <= reminder.repeatEndAt) {
            // Create next occurrence
            await prisma.reminder.create({
              data: {
                userId: reminder.userId,
                petId: reminder.petId,
                title: reminder.title,
                description: reminder.description,
                category: reminder.category,
                remindAt: nextRemindAt,
                repeatType: reminder.repeatType,
                repeatInterval: reminder.repeatInterval,
                repeatEndAt: reminder.repeatEndAt,
              },
            });
          }
        }

        results.push({
          id: reminder.id,
          status: 'sent',
        });
      } else {
        results.push({
          id: reminder.id,
          status: 'failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

function getNextRemindAt(
  currentDate: Date,
  repeatType: string,
  interval?: number | null
): Date {
  const next = new Date(currentDate);
  const step = interval || 1;

  switch (repeatType) {
    case 'DAILY':
      next.setDate(next.getDate() + step);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + step * 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + step);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + step);
      break;
    case 'CUSTOM':
      next.setDate(next.getDate() + step);
      break;
  }

  return next;
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  return POST(request);
}
