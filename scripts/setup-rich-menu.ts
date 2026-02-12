/**
 * Rich Menu 設定腳本
 *
 * 使用方式：
 * 1. 確保 .env 中有設定 LINE_CHANNEL_ACCESS_TOKEN
 * 2. 執行：npx ts-node scripts/setup-rich-menu.ts
 *
 * 或使用 LINE Official Account Manager 手動設定：
 * https://manager.line.biz/
 */

const LINE_API_BASE = 'https://api.line.me/v2/bot';

interface RichMenuSize {
  width: number;
  height: number;
}

interface RichMenuBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RichMenuArea {
  bounds: RichMenuBounds;
  action: {
    type: string;
    uri?: string;
    data?: string;
    text?: string;
    label?: string;
  };
}

interface RichMenuObject {
  size: RichMenuSize;
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
}

// LIFF ID from environment
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || 'YOUR_LIFF_ID';
const LIFF_URL = `https://liff.line.me/${LIFF_ID}`;

// Rich Menu 設定
const richMenuConfig: RichMenuObject = {
  size: {
    width: 2500,
    height: 843,
  },
  selected: true,
  name: 'PetWise 主選單',
  chatBarText: '開啟選單',
  areas: [
    // 第一列：首頁、日記、統計
    {
      bounds: { x: 0, y: 0, width: 833, height: 421 },
      action: {
        type: 'uri',
        uri: LIFF_URL,
        label: '首頁',
      },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 421 },
      action: {
        type: 'uri',
        uri: `${LIFF_URL}/diary/history`,
        label: '日記紀錄',
      },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 421 },
      action: {
        type: 'uri',
        uri: `${LIFF_URL}/stats`,
        label: '統計分析',
      },
    },
    // 第二列：我的寵物、提醒、今日摘要
    {
      bounds: { x: 0, y: 421, width: 833, height: 422 },
      action: {
        type: 'uri',
        uri: `${LIFF_URL}/pets`,
        label: '我的寵物',
      },
    },
    {
      bounds: { x: 833, y: 421, width: 834, height: 422 },
      action: {
        type: 'uri',
        uri: `${LIFF_URL}/reminders`,
        label: '提醒設定',
      },
    },
    {
      bounds: { x: 1667, y: 421, width: 833, height: 422 },
      action: {
        type: 'message',
        text: '今天紀錄',
        label: '今日摘要',
      },
    },
  ],
};

async function createRichMenu(): Promise<string | null> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    return null;
  }

  try {
    // 1. 建立 Rich Menu
    console.log('Creating Rich Menu...');
    const createResponse = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(richMenuConfig),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Failed to create Rich Menu:', error);
      return null;
    }

    const { richMenuId } = await createResponse.json();
    console.log('Rich Menu created:', richMenuId);

    return richMenuId;
  } catch (error) {
    console.error('Error creating Rich Menu:', error);
    return null;
  }
}

async function setDefaultRichMenu(richMenuId: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  try {
    console.log('Setting as default Rich Menu...');
    const response = await fetch(
      `${LINE_API_BASE}/user/all/richmenu/${richMenuId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to set default Rich Menu:', error);
      return false;
    }

    console.log('Default Rich Menu set successfully!');
    return true;
  } catch (error) {
    console.error('Error setting default Rich Menu:', error);
    return false;
  }
}

async function main() {
  console.log('=== PetWise Rich Menu Setup ===\n');
  console.log('LIFF URL:', LIFF_URL);
  console.log('');

  // 建立 Rich Menu
  const richMenuId = await createRichMenu();
  if (!richMenuId) {
    console.error('\nFailed to create Rich Menu');
    console.log('\n建議使用 LINE Official Account Manager 手動設定：');
    console.log('https://manager.line.biz/\n');
    console.log('選單配置：');
    console.log('- 6 格選單 (2x3)');
    console.log('- 第一列：首頁、日記紀錄、統計分析');
    console.log('- 第二列：我的寵物、提醒設定、今日摘要');
    console.log('\n連結設定：');
    console.log(`- 首頁: ${LIFF_URL}`);
    console.log(`- 日記紀錄: ${LIFF_URL}/diary/history`);
    console.log(`- 統計分析: ${LIFF_URL}/stats`);
    console.log(`- 我的寵物: ${LIFF_URL}/pets`);
    console.log(`- 提醒設定: ${LIFF_URL}/reminders`);
    console.log('- 今日摘要: 傳送訊息 "今天紀錄"');
    return;
  }

  // 設定為預設 Rich Menu
  const setDefault = await setDefaultRichMenu(richMenuId);
  if (!setDefault) {
    console.log('\n需要手動設定為預設選單');
    console.log('Rich Menu ID:', richMenuId);
    return;
  }

  console.log('\n=== Setup Complete ===');
  console.log('Rich Menu ID:', richMenuId);
  console.log('\n注意：需要上傳選單圖片才會顯示');
  console.log('圖片尺寸：2500 x 843 像素');
  console.log(
    '可使用 LINE Official Account Manager 上傳圖片：https://manager.line.biz/'
  );
}

main();
