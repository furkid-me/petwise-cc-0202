# PetWise 完整部署教學

> 本文件將引導你從零開始完成所有手動設定，讓 PetWise 上線運作。

---

## 目錄

1. [LINE Developers 設定](#1-line-developers-設定)
2. [OpenAI API 設定](#2-openai-api-設定)
3. [資料庫設定 (Supabase)](#3-資料庫設定-supabase)
4. [Vercel 部署](#4-vercel-部署)
5. [回頭補齊 LINE 設定](#5-回頭補齊-line-設定)
6. [環境變數總表](#6-環境變數總表)
7. [上線驗證清單](#7-上線驗證清單)

---

## 1. LINE Developers 設定

### 1-1. 建立 Provider

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 用你的 LINE 帳號登入
3. 點擊 **Create a new provider**
4. 輸入 Provider 名稱：`PetWise`
5. 點擊 **Create**

### 1-2. 建立 Messaging API Channel

這是讓 PetWise 可以發送推播通知、接收用戶訊息的 Channel。

1. 在剛建立的 Provider 頁面，點擊 **Create a Messaging API channel**
2. 填寫以下資訊：

| 欄位 | 填入值 |
|------|--------|
| Channel type | Messaging API |
| Provider | PetWise（剛建立的） |
| Channel name | PetWise 寵物日記 |
| Channel description | 用口語化方式記錄寵物生活 |
| Category | 寵物 |
| Subcategory | 寵物（綜合） |
| Email address | 你的 Email |

3. 勾選同意條款，點擊 **Create**

### 1-3. 取得 Channel 金鑰

建立完成後，進入 Channel 設定頁面：

**Basic settings 分頁：**
- 記下 **Channel ID** → 對應 `LINE_CHANNEL_ID`
- 記下 **Channel secret** → 對應 `LINE_CHANNEL_SECRET`

**Messaging API 分頁：**
- 往下滾到 **Channel access token (long-lived)**
- 點擊 **Issue** 產生一組 token
- 記下這組 token → 對應 `LINE_CHANNEL_ACCESS_TOKEN`

### 1-4. 設定 Webhook

> 注意：這一步需要先完成 Vercel 部署（步驟 4），取得你的網址後再回來設定。

在 **Messaging API** 分頁：

1. **Webhook URL** 填入：
   ```
   https://你的網域.vercel.app/api/webhook/line
   ```
2. 點擊 **Verify** 確認連線成功（應該要出現 Success）
3. 打開 **Use webhook** 開關
4. 關閉 **Auto-reply messages**（到 LINE Official Account Manager 裡關閉）
5. 關閉 **Greeting messages**（同上）

### 1-5. 建立 LIFF 應用

1. 在同一個 Channel 頁面，點擊左側 **LIFF** 分頁
2. 點擊 **Add**
3. 填寫以下資訊：

| 欄位 | 填入值 |
|------|--------|
| LIFF app name | PetWise |
| Size | Full |
| Endpoint URL | `https://你的網域.vercel.app` |
| Scope | 勾選 `profile`、`openid` |
| Bot link feature | Aggressive |
| Scan QR | 開啟 |

4. 點擊 **Add** 建立
5. 記下 **LIFF ID**（格式類似 `1234567890-abcdefgh`）→ 對應 `NEXT_PUBLIC_LIFF_ID`

### 1-6. 設定 LINE Login（選用）

如果你想讓用戶可以用 LINE 登入 LIFF 應用以外的頁面（例如管理後台）：

1. 回到 Provider 頁面
2. 點擊 **Create a LINE Login channel**
3. 填寫資訊後建立
4. 在 **LINE Login** 分頁設定 **Callback URL**：
   ```
   https://你的網域.vercel.app/api/auth/callback
   ```

### 1-7. 加入官方帳號好友

1. 在 **Messaging API** 分頁找到 **Bot information** 區塊
2. 掃描 QR Code 加入好友
3. 這就是用戶會加入的官方帳號

---

## 2. OpenAI API 設定

### 2-1. 建立帳號

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊或登入帳號

### 2-2. 設定付費方式

1. 點擊左側 **Settings** → **Billing**
2. 點擊 **Add payment method**
3. 輸入信用卡資訊
4. 建議設定 **Usage limits**：
   - 月度上限建議設 $10 ~ $20 美金（初期使用量）

### 2-3. 建立 API Key

1. 點擊左側 **API keys**
2. 點擊 **Create new secret key**
3. 名稱填：`PetWise Production`
4. 點擊 **Create secret key**
5. **立即複製並保存！** 這個 key 只會顯示一次
6. 記下 API Key → 對應 `OPENAI_API_KEY`

### 2-4. 費用預估

PetWise 使用 GPT-4o-mini 進行口語化文字解析：

| 使用情境 | 預估 Token 數 | 每次費用 |
|---------|-------------|---------|
| 口語化解析 | ~500 tokens | ~NT$ 0.03 |
| 健康分析 | ~2000 tokens | ~NT$ 0.15 |

以 1000 名活躍用戶、每人每天 3 則記錄估算：
- 每月約 90,000 次解析
- 每月費用約 NT$ 2,700

---

## 3. 資料庫設定 (Supabase)

### 3-1. 建立帳號與專案

1. 前往 [Supabase](https://supabase.com/)
2. 點擊 **Start your project**，用 GitHub 帳號登入
3. 點擊 **New project**
4. 填寫以下資訊：

| 欄位 | 填入值 |
|------|--------|
| Organization | 選擇你的組織（或建立新的） |
| Name | petwise |
| Database Password | 設一個強密碼（**請記下來！**）|
| Region | Northeast Asia (Tokyo) |
| Pricing Plan | Free tier |

5. 點擊 **Create new project**
6. 等待約 2 分鐘讓專案建立完成

### 3-2. 取得連線字串

1. 進入專案後，點擊左側 **Settings**（齒輪圖示）
2. 點擊 **Database**
3. 往下找到 **Connection string** 區塊
4. 選擇 **URI** 分頁
5. 複製連線字串，格式如下：
   ```
   postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
6. 將 `[YOUR-PASSWORD]` 替換成你剛才設定的密碼
7. 在最後加上 `?pgbouncer=true`（連線池模式，Vercel 必需）

最終格式：
```
postgresql://postgres.[PROJECT-ID]:密碼@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

這就是 `DATABASE_URL`。

### 3-3. 初始化資料庫

在你的本機專案目錄執行：

```bash
# 1. 安裝依賴（如果尚未安裝）
npm install

# 2. 建立 .env 檔案
cp .env.example .env

# 3. 編輯 .env，填入 DATABASE_URL
#    將剛才取得的連線字串貼上

# 4. 生成 Prisma Client
npx prisma generate

# 5. 推送 Schema 到資料庫
npx prisma db push

# 6. 確認資料庫已建立（可選）
npx prisma studio
```

執行 `prisma db push` 後，Supabase 會自動建立所有資料表。

### 3-4. 在 Supabase 確認

1. 回到 Supabase Dashboard
2. 點擊左側 **Table Editor**
3. 你應該會看到所有資料表已建立：
   - users
   - pets
   - diaries
   - reminders
   - payments
   - 等等...

### 3-5. 免費額度注意事項

Supabase Free Tier 提供：
- **500MB** 資料庫空間
- **1GB** 檔案儲存
- **50,000** 月活躍用戶
- **500,000** Edge Function 調用

初期完全夠用，如需擴展可升級到 Pro ($25/月)。

---

## 4. Vercel 部署

### 4-1. 準備 GitHub Repo

1. 先將專案推送到你自己的 GitHub Repository：

```bash
# 如果尚未設定遠端
git remote add github https://github.com/你的帳號/petwise.git
git push github main
```

### 4-2. 建立 Vercel 專案

1. 前往 [Vercel](https://vercel.com/)
2. 用 GitHub 帳號登入
3. 點擊 **Add New** → **Project**
4. 找到並選擇你的 `petwise` Repository
5. 點擊 **Import**

### 4-3. 設定環境變數

在 **Configure Project** 頁面，展開 **Environment Variables**，逐一新增：

| Name | Value | 說明 |
|------|-------|------|
| `DATABASE_URL` | postgresql://... | Supabase 連線字串 |
| `NEXT_PUBLIC_LIFF_ID` | 1234567890-xxx | LINE LIFF ID |
| `LINE_CHANNEL_ID` | 123456789 | LINE Channel ID |
| `LINE_CHANNEL_SECRET` | abc123... | LINE Channel Secret |
| `LINE_CHANNEL_ACCESS_TOKEN` | eyJ... | LINE Channel Access Token |
| `OPENAI_API_KEY` | sk-... | OpenAI API Key |
| `NEXT_PUBLIC_APP_URL` | https://petwise.vercel.app | 你的 Vercel 網址 |
| `JWT_SECRET` | 隨機字串 | 用於 Token 簽名 |
| `CRON_SECRET` | 隨機字串 | 保護 Cron 端點 |

**產生隨機字串方法：**
```bash
openssl rand -hex 32
```

### 4-4. 部署

1. 確認所有環境變數已填入
2. **Framework Preset** 選擇 **Next.js**
3. 點擊 **Deploy**
4. 等待部署完成（約 2-3 分鐘）
5. 部署成功後，記下你的網址（例如 `https://petwise.vercel.app`）

### 4-5. 設定自訂網域（選用）

1. 在 Vercel 專案 **Settings** → **Domains**
2. 點擊 **Add**
3. 輸入你的網域（例如 `petwise.yourdomain.com`）
4. 依照指示在 DNS 設定 CNAME 記錄

---

## 5. 回頭補齊 LINE 設定

部署完成後，你已經有了實際的網址，現在回頭完成 LINE 設定：

### 5-1. 設定 Webhook URL

1. 回到 [LINE Developers Console](https://developers.line.biz/console/)
2. 進入你的 Messaging API Channel
3. **Messaging API** 分頁 → **Webhook settings**
4. **Webhook URL** 填入：
   ```
   https://你的網域.vercel.app/api/webhook/line
   ```
5. 點擊 **Verify** → 應顯示 **Success**
6. 確認 **Use webhook** 已開啟

### 5-2. 更新 LIFF Endpoint URL

1. 進入 **LIFF** 分頁
2. 點擊你建立的 LIFF App
3. 將 **Endpoint URL** 更新為：
   ```
   https://你的網域.vercel.app
   ```

### 5-3. 設定 Rich Menu（選用但建議）

Rich Menu 是 LINE 聊天室底部的選單按鈕，讓用戶更方便操作。

1. 前往 [LINE Official Account Manager](https://manager.line.biz/)
2. 選擇你的帳號
3. 點擊 **聊天室相關** → **圖文選單**
4. 點擊 **建立**
5. 建議配置以下按鈕：

| 按鈕 | 動作類型 | 連結 |
|------|---------|------|
| 新增記錄 | 連結 | `https://liff.line.me/你的LIFF_ID/diary/new` |
| 我的寵物 | 連結 | `https://liff.line.me/你的LIFF_ID/pets` |
| 統計報告 | 連結 | `https://liff.line.me/你的LIFF_ID/stats` |
| 提醒 | 連結 | `https://liff.line.me/你的LIFF_ID/reminders` |
| 設定 | 連結 | `https://liff.line.me/你的LIFF_ID/settings` |

6. 上傳一張 2500x1686 或 2500x843 的圖片作為選單背景
7. 設定各區域對應的按鈕動作
8. 儲存並發佈

---

## 6. 環境變數總表

完整的 `.env` 檔案範例：

```env
# ===== 資料庫 =====
DATABASE_URL="postgresql://postgres.xxxxx:你的密碼@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ===== LINE =====
NEXT_PUBLIC_LIFF_ID="1234567890-abcdefgh"
LINE_CHANNEL_ID="1234567890"
LINE_CHANNEL_SECRET="abcdef1234567890abcdef1234567890"
LINE_CHANNEL_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# ===== OpenAI =====
OPENAI_API_KEY="sk-proj-abc123..."

# ===== 應用程式 =====
NEXT_PUBLIC_APP_URL="https://petwise.vercel.app"
JWT_SECRET="用 openssl rand -hex 32 產生"
CRON_SECRET="用 openssl rand -hex 32 產生"

# ===== 圖片儲存（選用，預設用 Supabase Storage）=====
# STORAGE_ACCESS_KEY_ID=""
# STORAGE_SECRET_ACCESS_KEY=""
# STORAGE_BUCKET_NAME=""
# STORAGE_ENDPOINT=""
```

---

## 7. 上線驗證清單

部署完成後，逐項檢查：

### 基本功能
- [ ] 開啟 `https://你的網域.vercel.app` 能看到首頁
- [ ] 在 LINE 中開啟 LIFF 連結能正常載入
- [ ] LINE 登入功能正常
- [ ] 可以新增寵物
- [ ] 可以輸入口語化日記，AI 能正確解析

### LINE 整合
- [ ] Webhook 驗證成功
- [ ] 在 LINE 聊天室傳送訊息，機器人能回應
- [ ] Rich Menu 按鈕正常運作
- [ ] 推播通知能收到

### 資料庫
- [ ] Supabase Dashboard 能看到新建立的資料
- [ ] 日記記錄正確寫入
- [ ] 寵物資料正確儲存

### 提醒功能
- [ ] 可以建立提醒
- [ ] Vercel Cron Job 正常執行（查看 Vercel Logs）
- [ ] 提醒到時會收到 LINE 推播

---

## 常見問題排除

### Q: LIFF 開啟後顯示空白
- 確認 `NEXT_PUBLIC_LIFF_ID` 正確
- 確認 LIFF Endpoint URL 設定正確
- 在瀏覽器開發者工具查看 Console 錯誤

### Q: Webhook 驗證失敗
- 確認 Vercel 已部署成功
- 確認 URL 格式為 `https://xxx/api/webhook/line`
- 查看 Vercel Function Logs 是否有錯誤

### Q: AI 解析沒有反應
- 確認 `OPENAI_API_KEY` 正確
- 確認 OpenAI 帳號有餘額
- 查看 Vercel Function Logs

### Q: 資料庫連線失敗
- 確認 `DATABASE_URL` 包含正確密碼
- 確認有加上 `?pgbouncer=true`
- 嘗試在本機執行 `npx prisma db push` 測試連線

### Q: Vercel 部署失敗
- 查看 Build Logs 找出具體錯誤
- 確認所有環境變數都已設定
- 確認 `package.json` 中的依賴都能正常安裝
