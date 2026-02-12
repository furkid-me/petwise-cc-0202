import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendLineMessage } from '@/lib/line-messaging';
import { parseDiaryInput, ParseResult } from '@/lib/ai-parser';

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

interface Pet {
  id: string;
  name: string;
}

interface UserWithPets {
  id: string;
  pets: Pet[];
}

// 暫存用戶的待處理訊息（用於 Quick Reply 選擇寵物後繼續處理）
const pendingMessages = new Map<string, { text: string; parsedEntries: unknown[]; extractedWeight?: number }>();

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

    console.log('[LINE Webhook] Received request');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!signature || !verifySignature(body, signature)) {
        console.error('[LINE Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data: LineWebhookBody = JSON.parse(body);
    console.log('[LINE Webhook] Events:', JSON.stringify(data.events.map(e => ({ type: e.type, userId: e.source?.userId }))));

    // Process each event
    for (const event of data.events) {
      try {
        await handleEvent(event);
      } catch (eventError) {
        console.error('[LINE Webhook] Event handler error:', eventError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleEvent(event: LineEvent) {
  const { type, source } = event;
  const userId = source.userId;

  // Get or create user with ALL pets
  const user = await prisma.user.findUnique({
    where: { lineUserId: userId },
    include: { pets: { where: { isActive: true }, orderBy: { isDefault: 'desc' } } },
  });

  switch (type) {
    case 'follow':
      await handleFollow(userId);
      break;

    case 'unfollow':
      await handleUnfollow(userId);
      break;

    case 'message':
      if (event.message?.type === 'text' && event.message.text) {
        await handleTextMessage(userId, event.message.text, user as UserWithPets | null);
      }
      break;

    case 'postback':
      if (event.postback?.data) {
        await handlePostback(userId, event.postback.data, user as UserWithPets | null);
      }
      break;
  }
}

async function handleFollow(lineUserId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { lineUserId },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: { lineUserId },
    });
  }

  await sendLineMessage(lineUserId, {
    type: 'text',
    text: '歡迎使用 PetWise 寵物日記！🐾\n\n直接傳訊息給我，我會幫你記錄毛小孩的生活點滴。\n\n例如：「今天麻糬吃了飼料，下午去公園跑步」\n\n或點擊下方選單開始使用完整功能！',
  });
}

async function handleUnfollow(lineUserId: string) {
  await prisma.user.updateMany({
    where: { lineUserId },
    data: { notifyEnabled: false },
  });
}

async function handleTextMessage(
  lineUserId: string,
  text: string,
  user: UserWithPets | null
) {
  console.log(`[LINE] handleTextMessage: userId=${lineUserId}, text=${text.substring(0, 50)}`);

  // 檢查用戶是否有寵物
  if (!user || !user.pets || user.pets.length === 0) {
    console.log('[LINE] User has no pets');
    await sendLineMessage(lineUserId, {
      type: 'text',
      text: '你還沒有新增寵物喔！\n\n請先點擊下方選單的「我的寵物」來新增你的毛小孩 🐕🐱',
    });
    return;
  }

  console.log(`[LINE] User has ${user.pets.length} pets: ${user.pets.map(p => p.name).join(', ')}`);

  try {
    // 取得所有寵物名字
    const petNames = user.pets.map(p => p.name);

    // 使用 AI 解析訊息，並傳入寵物名字列表
    console.log('[LINE] Parsing diary input...');
    const parsed = await parseDiaryInput(text, undefined, petNames);
    console.log(`[LINE] Parsed ${parsed.entries.length} entries`);

    if (parsed.entries.length === 0) {
      await sendLineMessage(lineUserId, {
        type: 'text',
        text: '我不太確定這是什麼記錄，可以再說清楚一點嗎？\n\n例如：\n• 今天吃了飼料\n• 下午去散步 30 分鐘\n• 今天有點拉肚子',
      });
      return;
    }

    // 嘗試找出訊息中提到的寵物
    let targetPet: Pet | null = null;

    if (parsed.mentionedPetName) {
      // AI 辨識到寵物名字，嘗試匹配
      const mentionedName = parsed.mentionedPetName.toLowerCase();
      targetPet = user.pets.find(p =>
        p.name.toLowerCase() === mentionedName ||
        p.name.toLowerCase().includes(mentionedName) ||
        mentionedName.includes(p.name.toLowerCase())
      ) || null;
    }

    if (!targetPet) {
      // 沒有從訊息中識別到寵物
      if (user.pets.length === 1) {
        // 只有一隻寵物，直接使用
        targetPet = user.pets[0];
      } else {
        // 多隻寵物，發送 Quick Reply 讓用戶選擇
        pendingMessages.set(lineUserId, {
          text,
          parsedEntries: parsed.entries,
          extractedWeight: parsed.extractedWeight,
        });

        await sendLineMessage(lineUserId, {
          type: 'text',
          text: '要記錄給哪隻寵物？',
          quickReply: {
            items: [
              ...user.pets.slice(0, 10).map(pet => ({
                type: 'action' as const,
                action: {
                  type: 'postback' as const,
                  label: pet.name.slice(0, 20),
                  data: `action=select_pet&petId=${pet.id}`,
                  displayText: pet.name,
                },
              })),
              {
                type: 'action' as const,
                action: {
                  type: 'postback' as const,
                  label: '取消',
                  data: 'action=cancel_diary',
                  displayText: '取消',
                },
              },
            ],
          },
        });
        return;
      }
    }

    // 有確定的寵物，建立日記
    await createDiaryAndReply(lineUserId, user.id, targetPet, text, parsed.entries, parsed.healthWarning, parsed.extractedWeight);

  } catch (error) {
    console.error('[LINE] Failed to parse diary input:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    await sendLineMessage(lineUserId, {
      type: 'text',
      text: `記錄失敗了：${errorMsg.substring(0, 100)}`,
    });
  }
}

async function createDiaryAndReply(
  lineUserId: string,
  userId: string,
  pet: Pet,
  rawInput: string,
  entries: unknown[],
  healthWarning?: string,
  extractedWeight?: number
) {
  console.log(`[LINE] createDiaryAndReply: pet=${pet.name}, entries=${entries.length}`);

  const typedEntries = entries as Array<{
    category: string;
    subCategory?: string;
    content: string;
    details?: Record<string, unknown>;
    severity?: number;
  }>;

  // 如果有提取到體重，自動更新寵物資料
  let weightUpdated = false;
  if (extractedWeight !== undefined && extractedWeight > 0) {
    try {
      await prisma.pet.update({
        where: { id: pet.id },
        data: { weight: extractedWeight },
      });
      weightUpdated = true;
      console.log(`[LINE] Updated pet weight: ${extractedWeight}`);
    } catch (e) {
      console.error('[LINE] Failed to update pet weight:', e);
    }
  }

  // 建立日記記錄
  console.log('[LINE] Creating diary entries...');
  for (const entry of typedEntries) {
    try {
      await prisma.diary.create({
        data: {
          userId,
          petId: pet.id,
          rawInput,
          category: entry.category as 'FOOD' | 'HEALTH' | 'ACTIVITY' | 'MEDICAL' | 'GROOMING' | 'BEHAVIOR' | 'OTHER',
          subCategory: entry.subCategory,
          content: entry.content,
          details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
          severity: entry.severity,
        },
      });
      console.log(`[LINE] Created diary entry: ${entry.category}`);
    } catch (dbError) {
      console.error('[LINE] Failed to create diary entry:', dbError);
      throw dbError;
    }
  }

  // 組裝回覆訊息
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

  let responseText = `✅ 已為【${pet.name}】記錄：\n\n`;
  for (const entry of typedEntries) {
    const emoji = categoryEmojis[entry.category] || '📝';
    const name = categoryNames[entry.category] || '其他';
    responseText += `${emoji} ${name}：${entry.content}\n`;
  }

  if (weightUpdated && extractedWeight) {
    responseText += `\n📊 已更新體重：${extractedWeight} kg`;
  }

  if (healthWarning) {
    responseText += `\n⚠️ ${healthWarning}`;
  }

  // 發送確認訊息，附帶修改和刪除按鈕
  console.log(`[LINE] Sending reply: ${responseText.substring(0, 50)}...`);
  const sent = await sendLineMessage(lineUserId, {
    type: 'text',
    text: responseText,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '📝 修改寵物',
            data: `action=change_pet&rawInput=${encodeURIComponent(rawInput)}&entries=${encodeURIComponent(JSON.stringify(typedEntries))}`,
            displayText: '修改寵物',
          },
        },
      ],
    },
  });
  console.log(`[LINE] Message sent: ${sent}`);
}

async function handlePostback(
  lineUserId: string,
  data: string,
  user: UserWithPets | null
) {
  const params = new URLSearchParams(data);
  const action = params.get('action');

  switch (action) {
    case 'select_pet': {
      // 用戶選擇了寵物
      const petId = params.get('petId');
      const pending = pendingMessages.get(lineUserId);

      if (!petId || !pending || !user) {
        await sendLineMessage(lineUserId, {
          type: 'text',
          text: '操作已過期，請重新輸入 😅',
        });
        pendingMessages.delete(lineUserId);
        return;
      }

      const pet = user.pets.find(p => p.id === petId);
      if (!pet) {
        await sendLineMessage(lineUserId, {
          type: 'text',
          text: '找不到這隻寵物，請重新輸入 😅',
        });
        pendingMessages.delete(lineUserId);
        return;
      }

      // 建立日記
      await createDiaryAndReply(
        lineUserId,
        user.id,
        pet,
        pending.text,
        pending.parsedEntries,
        undefined,
        pending.extractedWeight
      );

      pendingMessages.delete(lineUserId);
      break;
    }

    case 'cancel_diary': {
      pendingMessages.delete(lineUserId);
      await sendLineMessage(lineUserId, {
        type: 'text',
        text: '已取消 👌',
      });
      break;
    }

    case 'change_pet': {
      // 用戶想要修改寵物
      if (!user || user.pets.length === 0) {
        await sendLineMessage(lineUserId, {
          type: 'text',
          text: '你沒有其他寵物可以選擇 😅',
        });
        return;
      }

      const rawInput = params.get('rawInput') || '';
      const entriesStr = params.get('entries') || '[]';

      pendingMessages.set(lineUserId, {
        text: decodeURIComponent(rawInput),
        parsedEntries: JSON.parse(decodeURIComponent(entriesStr)),
      });

      await sendLineMessage(lineUserId, {
        type: 'text',
        text: '要改記錄給哪隻寵物？',
        quickReply: {
          items: [
            ...user.pets.slice(0, 10).map(pet => ({
              type: 'action' as const,
              action: {
                type: 'postback' as const,
                label: pet.name.slice(0, 20),
                data: `action=select_pet&petId=${pet.id}`,
                displayText: pet.name,
              },
            })),
            {
              type: 'action' as const,
              action: {
                type: 'postback' as const,
                label: '取消',
                data: 'action=cancel_diary',
                displayText: '取消',
              },
            },
          ],
        },
      });
      break;
    }

    case 'complete_reminder': {
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
    }

    case 'snooze_reminder': {
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
}

// GET endpoint for LINE webhook verification
export async function GET() {
  return NextResponse.json({ status: 'OK' });
}
