import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendLineMessage } from '@/lib/line-messaging';
import { parseDiaryInput } from '@/lib/ai-parser';

interface LineEvent {
  type: string;
  replyToken?: string;
  source: {
    type: string;
    userId: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  postback?: {
    data: string;
  };
}

interface LineWebhookBody {
  events: LineEvent[];
}

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) return false;

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  return hash === signature;
}

// POST /api/webhook/line - LINE Messaging API Webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!signature || !verifySignature(body, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data: LineWebhookBody = JSON.parse(body);

    // Process each event
    for (const event of data.events) {
      await handleEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleEvent(event: LineEvent) {
  const { type, source } = event;
  const userId = source.userId;

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { lineUserId: userId },
    include: { pets: { where: { isActive: true, isDefault: true } } },
  });

  switch (type) {
    case 'follow':
      // User added the bot
      await handleFollow(userId);
      break;

    case 'unfollow':
      // User blocked the bot
      await handleUnfollow(userId);
      break;

    case 'message':
      if (event.message?.type === 'text' && event.message.text) {
        await handleTextMessage(userId, event.message.text, event.replyToken, user);
      }
      break;

    case 'postback':
      if (event.postback?.data) {
        await handlePostback(userId, event.postback.data, event.replyToken);
      }
      break;
  }
}

async function handleFollow(lineUserId: string) {
  // Create user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { lineUserId },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: { lineUserId },
    });
  }

  // Send welcome message
  await sendLineMessage(lineUserId, {
    type: 'text',
    text: '歡迎使用 PetWise 寵物日記！🐾\n\n直接傳訊息給我，我會幫你記錄毛小孩的生活點滴。\n\n例如：「今天麻糬吃了飼料，下午去公園跑步」\n\n或點擊下方選單開始使用完整功能！',
  });
}

async function handleUnfollow(lineUserId: string) {
  // Update user notify preference
  await prisma.user.updateMany({
    where: { lineUserId },
    data: { notifyEnabled: false },
  });
}

async function handleTextMessage(
  lineUserId: string,
  text: string,
  replyToken?: string,
  user?: unknown
) {
  const typedUser = user as { id: string; pets: { id: string; name: string }[] } | null;

  // Check if user has pets
  if (!typedUser || !typedUser.pets || typedUser.pets.length === 0) {
    await sendLineMessage(lineUserId, {
      type: 'text',
      text: '你還沒有新增寵物喔！\n\n請先點擊下方選單的「我的寵物」來新增你的毛小孩 🐕🐱',
    });
    return;
  }

  const defaultPet = typedUser.pets[0];

  // Parse the input with AI
  try {
    const parsed = await parseDiaryInput(text);

    if (parsed.entries.length === 0) {
      await sendLineMessage(lineUserId, {
        type: 'text',
        text: '我不太確定這是什麼記錄，可以再說清楚一點嗎？\n\n例如：\n• 今天吃了飼料\n• 下午去散步 30 分鐘\n• 今天有點拉肚子',
      });
      return;
    }

    // Create diary entries
    const createdDiaries = [];
    for (const entry of parsed.entries) {
      const diary = await prisma.diary.create({
        data: {
          userId: typedUser.id,
          petId: defaultPet.id,
          rawInput: text,
          category: entry.category,
          subCategory: entry.subCategory,
          content: entry.content,
          details: entry.details,
          severity: entry.severity,
        },
      });
      createdDiaries.push(diary);
    }

    // Build response message
    const categoryEmojis: Record<string, string> = {
      FOOD: '🍽️',
      HEALTH: '❤️',
      ACTIVITY: '🏃',
      MEDICAL: '🏥',
      GROOMING: '✨',
      BEHAVIOR: '🐾',
      OTHER: '📝',
    };

    const categoryNames: Record<string, string> = {
      FOOD: '飲食',
      HEALTH: '健康',
      ACTIVITY: '活動',
      MEDICAL: '醫療',
      GROOMING: '美容',
      BEHAVIOR: '行為',
      OTHER: '其他',
    };

    let responseText = `已幫 ${defaultPet.name} 記錄：\n\n`;
    for (const entry of parsed.entries) {
      const emoji = categoryEmojis[entry.category] || '📝';
      const name = categoryNames[entry.category] || '其他';
      responseText += `${emoji} ${name}：${entry.content}\n`;
    }

    // Add health warning if needed
    if (parsed.healthWarning) {
      responseText += `\n⚠️ ${parsed.healthWarning}`;
    }

    await sendLineMessage(lineUserId, {
      type: 'text',
      text: responseText,
    });
  } catch (error) {
    console.error('Failed to parse diary input:', error);
    await sendLineMessage(lineUserId, {
      type: 'text',
      text: '記錄失敗了，請稍後再試 😅',
    });
  }
}

async function handlePostback(
  lineUserId: string,
  data: string,
  replyToken?: string
) {
  const params = new URLSearchParams(data);
  const action = params.get('action');

  switch (action) {
    case 'complete_reminder':
      const reminderId = params.get('id');
      if (reminderId) {
        await prisma.reminder.update({
          where: { id: reminderId },
          data: {
            isCompleted: true,
            completedAt: new Date(),
          },
        });
        await sendLineMessage(lineUserId, {
          type: 'text',
          text: '已完成提醒！✅',
        });
      }
      break;

    case 'snooze_reminder':
      const snoozeId = params.get('id');
      const minutes = parseInt(params.get('minutes') || '30');
      if (snoozeId) {
        const reminder = await prisma.reminder.findUnique({
          where: { id: snoozeId },
        });
        if (reminder) {
          await prisma.reminder.update({
            where: { id: snoozeId },
            data: {
              remindAt: new Date(Date.now() + minutes * 60 * 1000),
              notifySent: false,
            },
          });
          await sendLineMessage(lineUserId, {
            type: 'text',
            text: `已延後 ${minutes} 分鐘提醒 ⏰`,
          });
        }
      }
      break;
  }
}

// GET endpoint for LINE webhook verification
export async function GET() {
  return NextResponse.json({ status: 'OK' });
}
