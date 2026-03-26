# PetWise - LINE LIFF 寵物日記系統

用口語化的方式記錄毛小孩的每一天，AI 自動解析分類，讓寵物生活記錄更輕鬆。

## 功能特色

- **口語化記錄** - 自然語言輸入，AI 自動解析分類
- **多寵物管理** - 支援多隻寵物的獨立記錄
- **智能分析** - 健康趨勢追蹤與提醒（專業版）
- **LINE 原生體驗** - 無需下載 APP，直接在 LINE 中使用
- **照片上傳** - 支援拍照或從相簿選擇照片

## 技術棧

- **前端**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **後端**: Next.js API Routes, Prisma ORM
- **資料庫**: PostgreSQL
- **AI**: OpenAI GPT-4
- **LINE SDK**: @line/liff

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入必要的設定：

```bash
cp .env.example .env
```

必要的環境變數：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/petwise"

# LINE LIFF
NEXT_PUBLIC_LIFF_ID="your-liff-id"
LINE_CHANNEL_ID="your-channel-id"
LINE_CHANNEL_SECRET="your-channel-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 初始化資料庫

```bash
npx prisma generate
npx prisma db push
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000 查看應用程式。

## LINE LIFF 設定

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立一個新的 Provider 和 Messaging API Channel
3. 在 LIFF 設定中新增一個 LIFF 應用
4. 將 LIFF ID 填入環境變數 `NEXT_PUBLIC_LIFF_ID`

## 訂閱方案

| 功能 | 免費版 | 標準版 (NT$79/月) | 專業版 (NT$149/月) |
|------|--------|-------------------|---------------------|
| 寵物數量 | 1 隻 | 3 隻 | 無限制 |
| 每日記錄 | 5 則 | 無限制 | 無限制 |
| 記錄保存 | 30 天 | 1 年 | 永久 |
| 照片/則 | 1 張 | 5 張 | 10 張 |
| AI 健康分析 | - | - | ✓ |
| 家庭共享 | - | - | ✓ |

## 專案結構

```
petwise/
├── docs/                   # 文檔
├── prisma/                 # 資料庫 Schema
├── src/
│   ├── app/
│   │   ├── (liff)/        # LIFF 前端頁面
│   │   ├── admin/         # 管理後台
│   │   └── api/           # API 路由
│   ├── components/
│   │   ├── ui/            # UI 組件
│   │   ├── liff/          # LIFF 專用組件
│   │   └── diary/         # 日記相關組件
│   ├── hooks/             # React Hooks
│   ├── lib/               # 工具函數
│   ├── stores/            # Zustand Stores
│   └── types/             # TypeScript 類型定義
└── public/                # 靜態資源
```

## API 端點

### 認證
- `POST /api/auth/line` - LINE 登入驗證

### 用戶
- `GET /api/users/me` - 取得當前用戶
- `PUT /api/users/me` - 更新用戶資訊

### 寵物
- `GET /api/pets` - 取得寵物列表
- `POST /api/pets` - 新增寵物
- `PUT /api/pets/:id` - 更新寵物
- `DELETE /api/pets/:id` - 刪除寵物

### 日記
- `GET /api/diaries` - 取得日記列表
- `POST /api/diaries` - 新增日記（支援 AI 解析）
- `PUT /api/diaries/:id` - 更新日記
- `DELETE /api/diaries/:id` - 刪除日記

### AI
- `POST /api/ai/parse` - 解析口語化輸入
- `POST /api/ai/analyze` - 健康分析（專業版）

### 提醒
- `GET /api/reminders` - 取得提醒列表
- `POST /api/reminders` - 新增提醒
- `POST /api/reminders/:id/complete` - 完成提醒

### 統計
- `GET /api/stats/overview` - 取得統計總覽

## 部署

建議使用 Vercel 部署：

1. 將專案推送到 GitHub
2. 在 Vercel 建立新專案並連結 GitHub repo
3. 設定環境變數
4. 部署完成後更新 LINE LIFF 的 Endpoint URL

## License

MIT
