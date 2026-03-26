# 資料庫設定指南

## 快速開始

### 方法 1：使用 Docker（本機開發）

```bash
# 啟動 PostgreSQL
docker-compose up -d db

# 初始化資料庫
npm run db:push

# 查看資料庫（GUI）
npm run db:studio
```

連線資訊：
- Host: `localhost`
- Port: `5432`
- User: `petwise`
- Password: `petwise123`
- Database: `petwise`

---

### 方法 2：Supabase（推薦生產環境）

1. 前往 [Supabase](https://supabase.com) 建立帳號
2. 建立新專案
3. 到 Settings > Database > Connection string
4. 複製 URI 並貼到 `.env`：

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

5. 執行資料庫遷移：
```bash
npm run db:push
```

**優點**：
- 免費 500MB 儲存空間
- 內建 Dashboard 管理介面
- 自動備份
- 即時訂閱功能

---

### 方法 3：Neon（Serverless）

1. 前往 [Neon](https://neon.tech) 建立帳號
2. 建立新專案
3. 複製連線字串到 `.env`：

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require"
```

**優點**：
- Serverless，閒置時自動暫停
- 免費 512MB
- 支援分支（Branch）功能

---

## 資料庫管理

### 常用指令

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 Schema 變更到資料庫
npm run db:push

# 建立遷移檔案（生產環境用）
npm run db:migrate

# 開啟 Prisma Studio（資料庫 GUI）
npm run db:studio

# 重置資料庫（刪除所有資料）
npx prisma migrate reset
```

### Prisma Studio

執行 `npm run db:studio` 後開啟 http://localhost:5555

可以：
- 瀏覽所有資料表
- 新增/編輯/刪除資料
- 查看關聯資料

---

## Schema 結構

```
users              # 用戶
  ├── pets         # 寵物（一對多）
  ├── diaries      # 日記（一對多）
  ├── reminders    # 提醒（一對多）
  └── payments     # 付款記錄

pets
  ├── diaries      # 日記（一對多）
  ├── reminders    # 提醒（一對多）
  └── weight_records # 體重記錄

diaries
  └── diary_tags   # 標籤關聯（多對多）

tags
  └── diary_tags   # 標籤關聯（多對多）
```

---

## 備份與還原

### Docker 備份

```bash
# 備份
docker exec petwise-db pg_dump -U petwise petwise > backup.sql

# 還原
docker exec -i petwise-db psql -U petwise petwise < backup.sql
```

### Supabase 備份

在 Dashboard > Database > Backups 設定自動備份

---

## 常見問題

### Q: 連線失敗？

1. 確認 PostgreSQL 服務已啟動
2. 檢查 DATABASE_URL 格式是否正確
3. 確認防火牆允許 5432 port

### Q: Schema 變更後如何同步？

```bash
# 開發環境
npm run db:push

# 生產環境（建立遷移記錄）
npm run db:migrate
```

### Q: 如何重置資料庫？

```bash
npx prisma migrate reset
```
⚠️ 這會刪除所有資料！
