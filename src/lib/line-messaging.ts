/**
 * LINE Messaging API 服務
 * 用於發送推播通知和訊息
 */

interface QuickReplyItem {
  type: 'action';
  action: {
    type: 'postback' | 'message' | 'uri';
    label: string;
    data?: string;
    displayText?: string;
    text?: string;
    uri?: string;
  };
}

interface QuickReply {
  items: QuickReplyItem[];
}

interface TextMessage {
  type: 'text';
  text: string;
  quickReply?: QuickReply;
}

interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: FlexContainer;
  quickReply?: QuickReply;
}

interface FlexContainer {
  type: 'bubble' | 'carousel';
  body?: FlexBox;
  footer?: FlexBox;
  header?: FlexBox;
  hero?: FlexComponent;
  styles?: Record<string, unknown>;
  [key: string]: unknown;
}

interface FlexBox {
  type: 'box';
  layout: 'vertical' | 'horizontal' | 'baseline';
  contents: FlexComponent[];
  [key: string]: unknown;
}

interface FlexComponent {
  type: string;
  [key: string]: unknown;
}

type LineMessage = TextMessage | FlexMessage;

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_DATA_API = 'https://api-data.line.me/v2/bot/message';

/**
 * 從 LINE 下載圖片內容
 * @param messageId LINE 圖片訊息 ID
 * @returns Base64 編碼的圖片資料
 */
export async function getLineImageContent(messageId: string): Promise<{ base64: string; contentType: string } | null> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    return null;
  }

  try {
    const response = await fetch(`${LINE_DATA_API}/${messageId}/content`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get LINE image:', response.status);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return { base64, contentType };
  } catch (error) {
    console.error('Error downloading LINE image:', error);
    return null;
  }
}

// 取得 LIFF URL
function getLiffUrl(path: string = ''): string {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
  return `https://liff.line.me/${liffId}${path}`;
}

// 分類 emoji 對照表
const categoryEmojis: Record<string, string> = {
  FOOD: '🍽️',
  HEALTH: '❤️',
  ACTIVITY: '🏃',
  MEDICAL: '🏥',
  GROOMING: '✨',
  BEHAVIOR: '🐾',
  OTHER: '📝',
  VACCINE: '💉',
  DEWORMING: '🐛',
  CHECKUP: '🏥',
  MEDICATION: '💊',
};

// 分類名稱對照表
const categoryNames: Record<string, string> = {
  FOOD: '飲食',
  HEALTH: '健康',
  ACTIVITY: '活動',
  MEDICAL: '醫療',
  GROOMING: '美容',
  BEHAVIOR: '行為',
  OTHER: '其他',
};

/**
 * 建立歡迎訊息 Flex Message
 */
export function buildWelcomeMessage(): FlexMessage {
  return {
    type: 'flex',
    altText: '歡迎使用 PetWise 寵物日記！',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🐾 PetWise',
            weight: 'bold',
            size: 'xl',
            color: '#6366f1',
          },
          {
            type: 'text',
            text: '寵物日記',
            size: 'sm',
            color: '#888888',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: '歡迎使用 PetWise！直接傳訊息給我，我會幫你記錄毛小孩的生活點滴。',
            wrap: true,
            margin: 'lg',
            size: 'sm',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '📝 範例：',
                weight: 'bold',
                size: 'sm',
              },
              {
                type: 'text',
                text: '• 今天麻糬吃了飼料',
                size: 'sm',
                color: '#666666',
              },
              {
                type: 'text',
                text: '• 下午去公園跑步 30 分鐘',
                size: 'sm',
                color: '#666666',
              },
              {
                type: 'text',
                text: '• 體重 5.2 公斤',
                size: 'sm',
                color: '#666666',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#6366f1',
            action: {
              type: 'uri',
              label: '開始使用',
              uri: getLiffUrl(),
            },
          },
          {
            type: 'button',
            style: 'secondary',
            action: {
              type: 'uri',
              label: '新增寵物',
              uri: getLiffUrl('/pets/new'),
            },
          },
        ],
      },
    },
  };
}

/**
 * 建立日記記錄確認 Flex Message
 */
export function buildDiaryConfirmMessage(
  petName: string,
  entries: Array<{ category: string; content: string }>,
  options?: {
    weightUpdated?: boolean;
    newWeight?: number;
    healthWarning?: string;
    isFromImage?: boolean;
  }
): FlexMessage {
  const entryContents: FlexComponent[] = entries.map((entry) => ({
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: categoryEmojis[entry.category] || '📝',
        size: 'sm',
        flex: 0,
      },
      {
        type: 'text',
        text: `${categoryNames[entry.category] || '其他'}：${entry.content}`,
        size: 'sm',
        color: '#555555',
        flex: 1,
        wrap: true,
        margin: 'sm',
      },
    ],
  }));

  const sourceLabel = options?.isFromImage ? '照片記錄' : '已記錄';

  const bodyContents: FlexComponent[] = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: options?.isFromImage ? '📷' : '✅',
          size: 'xl',
          flex: 0,
        },
        {
          type: 'box',
          layout: 'vertical',
          flex: 1,
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: sourceLabel,
              size: 'xs',
              color: '#10b981',
            },
            {
              type: 'text',
              text: petName,
              weight: 'bold',
              size: 'lg',
            },
          ],
        },
      ],
    },
    {
      type: 'separator',
      margin: 'lg',
    },
    {
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: entryContents,
    },
  ];

  // 體重更新
  if (options?.weightUpdated && options.newWeight) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      margin: 'lg',
      contents: [
        {
          type: 'text',
          text: '📊',
          size: 'sm',
          flex: 0,
        },
        {
          type: 'text',
          text: `已更新體重：${options.newWeight} kg`,
          size: 'sm',
          color: '#6366f1',
          margin: 'sm',
          weight: 'bold',
        },
      ],
    });
  }

  // 健康警告
  if (options?.healthWarning) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      backgroundColor: '#fef3c7',
      cornerRadius: 'md',
      paddingAll: 'md',
      contents: [
        {
          type: 'text',
          text: '⚠️ 健康提醒',
          size: 'sm',
          weight: 'bold',
          color: '#d97706',
        },
        {
          type: 'text',
          text: options.healthWarning,
          size: 'sm',
          color: '#92400e',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  const altTextPrefix = options?.isFromImage ? '📷 照片記錄' : '已記錄';

  return {
    type: 'flex',
    altText: `${altTextPrefix}【${petName}】${entries.length} 則日記`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '查看日記',
              uri: getLiffUrl('/diary/history'),
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '查看統計',
              uri: getLiffUrl('/stats'),
            },
          },
        ],
      },
    },
  };
}

/**
 * 建立今日摘要 Flex Message
 */
export function buildTodaySummaryMessage(
  petName: string,
  summary: {
    totalEntries: number;
    categories: Record<string, number>;
    latestWeight?: number;
  }
): FlexMessage {
  const categoryList: FlexComponent[] = Object.entries(summary.categories).map(
    ([category, count]) => ({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: `${categoryEmojis[category] || '📝'} ${categoryNames[category] || category}`,
          size: 'sm',
          color: '#555555',
          flex: 1,
        },
        {
          type: 'text',
          text: `${count} 則`,
          size: 'sm',
          color: '#111111',
          align: 'end',
        },
      ],
    })
  );

  const bodyContents: FlexComponent[] = [
    {
      type: 'text',
      text: `📊 ${petName} 今日紀錄`,
      weight: 'bold',
      size: 'lg',
      color: '#6366f1',
    },
    {
      type: 'text',
      text: new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      size: 'xs',
      color: '#888888',
    },
    {
      type: 'separator',
      margin: 'lg',
    },
    {
      type: 'box',
      layout: 'vertical',
      margin: 'lg',
      spacing: 'sm',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '總記錄數',
              size: 'md',
              color: '#555555',
            },
            {
              type: 'text',
              text: `${summary.totalEntries} 則`,
              size: 'md',
              weight: 'bold',
              align: 'end',
            },
          ],
        },
        ...categoryList,
      ],
    },
  ];

  if (summary.latestWeight) {
    bodyContents.push({
      type: 'box',
      layout: 'horizontal',
      margin: 'lg',
      backgroundColor: '#f0fdf4',
      cornerRadius: 'md',
      paddingAll: 'md',
      contents: [
        {
          type: 'text',
          text: '⚖️ 目前體重',
          size: 'sm',
          color: '#166534',
        },
        {
          type: 'text',
          text: `${summary.latestWeight} kg`,
          size: 'sm',
          weight: 'bold',
          color: '#166534',
          align: 'end',
        },
      ],
    });
  }

  return {
    type: 'flex',
    altText: `${petName} 今日紀錄：${summary.totalEntries} 則`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: bodyContents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#6366f1',
            action: {
              type: 'uri',
              label: '查看完整統計',
              uri: getLiffUrl('/stats'),
            },
          },
        ],
      },
    },
  };
}

/**
 * 建立無寵物提示 Flex Message
 */
export function buildNoPetMessage(): FlexMessage {
  return {
    type: 'flex',
    altText: '請先新增寵物',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🐾 還沒有寵物',
            weight: 'bold',
            size: 'lg',
          },
          {
            type: 'text',
            text: '請先新增你的毛小孩，才能開始記錄日記喔！',
            wrap: true,
            margin: 'lg',
            size: 'sm',
            color: '#666666',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#6366f1',
            action: {
              type: 'uri',
              label: '新增寵物',
              uri: getLiffUrl('/pets/new'),
            },
          },
        ],
      },
    },
  };
}

/**
 * 發送訊息給用戶
 */
export async function sendLineMessage(
  userId: string,
  message: LineMessage | LineMessage[]
): Promise<boolean> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    return false;
  }

  const messages = Array.isArray(message) ? message : [message];

  try {
    const response = await fetch(`${LINE_MESSAGING_API}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LINE API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send LINE message:', error);
    return false;
  }
}

/**
 * 發送提醒通知
 */
export async function sendReminderNotification(
  userId: string,
  reminder: {
    id: string;
    title: string;
    description?: string | null;
    petName?: string;
    category: string;
  }
): Promise<boolean> {
  const categoryEmojis: Record<string, string> = {
    VACCINE: '💉',
    DEWORMING: '🐛',
    GROOMING: '✨',
    CHECKUP: '🏥',
    MEDICATION: '💊',
    FOOD: '🍽️',
    OTHER: '📝',
  };

  const emoji = categoryEmojis[reminder.category] || '🔔';

  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `提醒：${reminder.title}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${emoji} 提醒`,
            weight: 'bold',
            size: 'sm',
            color: '#1DB446',
          },
          {
            type: 'text',
            text: reminder.title,
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          ...(reminder.petName
            ? [
                {
                  type: 'text',
                  text: `🐾 ${reminder.petName}`,
                  size: 'sm',
                  color: '#888888',
                  margin: 'md',
                },
              ]
            : []),
          ...(reminder.description
            ? [
                {
                  type: 'text',
                  text: reminder.description,
                  size: 'sm',
                  color: '#666666',
                  margin: 'md',
                  wrap: true,
                },
              ]
            : []),
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'postback',
              label: '完成',
              data: `action=complete_reminder&id=${reminder.id}`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            action: {
              type: 'postback',
              label: '延後 30 分鐘',
              data: `action=snooze_reminder&id=${reminder.id}&minutes=30`,
            },
          },
        ],
      },
    },
  };

  return sendLineMessage(userId, flexMessage);
}

/**
 * 發送每日摘要
 */
export async function sendDailySummary(
  userId: string,
  summary: {
    petName: string;
    date: string;
    entriesCount: number;
    highlights: string[];
  }
): Promise<boolean> {
  let text = `📊 ${summary.petName} 的每日摘要\n`;
  text += `📅 ${summary.date}\n\n`;
  text += `今天記錄了 ${summary.entriesCount} 則日記\n\n`;

  if (summary.highlights.length > 0) {
    text += '重點：\n';
    summary.highlights.forEach((h) => {
      text += `• ${h}\n`;
    });
  }

  return sendLineMessage(userId, { type: 'text', text });
}

/**
 * 發送健康警告
 */
export async function sendHealthAlert(
  userId: string,
  alert: {
    petName: string;
    issue: string;
    suggestion: string;
  }
): Promise<boolean> {
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `健康提醒：${alert.petName}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚠️ 健康提醒',
            weight: 'bold',
            size: 'sm',
            color: '#FF6B6B',
          },
          {
            type: 'text',
            text: alert.petName,
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          {
            type: 'text',
            text: alert.issue,
            size: 'md',
            color: '#333333',
            margin: 'lg',
            wrap: true,
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: '💡 建議',
            weight: 'bold',
            size: 'sm',
            margin: 'lg',
          },
          {
            type: 'text',
            text: alert.suggestion,
            size: 'sm',
            color: '#666666',
            margin: 'sm',
            wrap: true,
          },
        ],
      },
    },
  };

  return sendLineMessage(userId, flexMessage);
}
