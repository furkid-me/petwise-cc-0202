import liff from '@line/liff';

let isInitialized = false;

export async function initLiff(): Promise<void> {
  if (isInitialized) return;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId) {
    console.error('LIFF ID is not set');
    return;
  }

  try {
    await liff.init({ liffId });
    isInitialized = true;
    console.log('LIFF initialized successfully');
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    throw error;
  }
}

export function isLoggedIn(): boolean {
  return liff.isLoggedIn();
}

export function login(): void {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
}

export function logout(): void {
  if (liff.isLoggedIn()) {
    liff.logout();
    window.location.reload();
  }
}

export async function getProfile() {
  if (!liff.isLoggedIn()) {
    throw new Error('User is not logged in');
  }
  return liff.getProfile();
}

export function getAccessToken(): string | null {
  return liff.getAccessToken();
}

export function isInClient(): boolean {
  return liff.isInClient();
}

export function getOS(): string {
  return liff.getOS() || 'unknown';
}

export function getLanguage(): string {
  return liff.getLanguage() || 'zh-TW';
}

export function closeWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}

// 分享訊息到 LINE
export async function shareMessage(message: string): Promise<void> {
  if (!liff.isInClient()) {
    console.warn('shareMessage is only available in LINE app');
    return;
  }

  await liff.shareTargetPicker([
    {
      type: 'text',
      text: message,
    },
  ]);
}

// 掃描 QR Code
export async function scanCode(): Promise<string | null> {
  if (!liff.isInClient()) {
    console.warn('scanCode is only available in LINE app');
    return null;
  }

  const result = await liff.scanCodeV2();
  return result.value || null;
}

// 開啟相機拍照或從相簿選擇
export async function selectImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 使用後置鏡頭

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      resolve(file);
    };

    input.click();
  });
}

// 選擇多張圖片
export async function selectMultipleImages(maxCount: number = 5): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      resolve(files.slice(0, maxCount));
    };

    input.click();
  });
}

export default liff;
