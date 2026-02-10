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
