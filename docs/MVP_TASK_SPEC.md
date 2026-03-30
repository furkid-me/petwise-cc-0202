# PetWise MVP 任務發包文件

> 更新日期：2026-03-30
> 專案負責人：Wind
> 架構顧問：Claude
> 開發執行：XNEWSBOT

---

## 一、專案概述

### 1.1 產品定位
**PetWise** 是一款基於 LINE LIFF 的寵物健康管理應用，讓飼主透過 LINE 輕鬆記錄寵物的日常生活、健康狀況與花費。

### 1.2 目標用戶
| 用戶類型 | 需求特點 |
|---------|---------|
| 單貓/單狗家庭 | 簡單記錄、基本提醒 |
| 多貓/多狗家庭 | 多寵物切換、獨立記錄 |
| 寵物疾病照護 | 用藥管理、健檢追蹤、費用統計 |

### 1.3 核心價值
- 一張健檢報告拍照就能記錄數值
- 多次健檢可以追蹤比較
- 用藥時間提醒不漏吃
- 花費記錄與預算管理

---

## 二、技術架構

### 2.1 技術棧
```
前端：Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
後端：Next.js API Routes + Prisma ORM
資料庫：PostgreSQL (Supabase)
AI：OpenAI GPT-4 (文字解析 + 圖片 OCR)
平台：LINE LIFF
部署：Vercel
```

### 2.2 專案資訊
| 項目 | 連結 |
|------|------|
| GitHub | https://github.com/furkid-me/petwise-cc-0202 |
| Vercel | https://vercel.com/winds-projects-162154ae/petwise-cc-0202 |
| 網站 | https://petwise-cc-0202.vercel.app |
| Supabase | https://supabase.com/dashboard/project/nqadvdjrkollatfldctj |

### 2.3 開發分支
```
主分支：main
開發分支：claude/line-liff-pet-diary-dlgZz
```

### 2.4 現有功能（已完成）
- [x] LINE LIFF 認證登入
- [x] 寵物 CRUD 管理
- [x] 日記記錄（AI 解析）
- [x] 圖片 OCR（健檢報告、飼料包裝）
- [x] 提醒功能（LINE 推播）
- [x] 基本統計（體重趨勢）
- [x] 訂閱方案管理

---

## 三、MVP 功能清單（依優先序）

### Priority 1：修復現有問題 🔴
| 任務 | 說明 | 預估時間 |
|------|------|---------|
| P1-1 | 修復資料庫 enum 同步問題 | 1h |
| P1-2 | LINE Channel 從開發模式改為發布 | 0.5h |

### Priority 2：寵物食品資料庫 🍖
| 任務 | 說明 | 預估時間 |
|------|------|---------|
| P2-1 | 食品搜尋 API | 2h |
| P2-2 | 圖片辨識品牌→查詢資料庫 | 3h |
| P2-3 | 飲食記錄頁面（LIFF 手動輸入） | 3h |
| P2-4 | 份量追問流程（LINE Bot） | 2h |
| P2-5 | 每日熱量統計 | 2h |

### Priority 3：費用記錄模組 💰
| 任務 | 說明 | 預估時間 |
|------|------|---------|
| P3-1 | 費用 API (CRUD) | 2h |
| P3-2 | 費用記錄頁面 | 3h |
| P3-3 | 費用統計頁面 | 2h |
| P3-4 | 預算設定與提醒 | 2h |

### Priority 4：健檢報告追蹤 📋
| 任務 | 說明 | 預估時間 |
|------|------|---------|
| P4-1 | 健檢 API (ExaminationRecord) | 2h |
| P4-2 | 健檢報告列表頁面 | 2h |
| P4-3 | 健檢數值比較功能 | 3h |
| P4-4 | 異常數值警示 | 2h |

### Priority 5：用藥管理強化 💊
| 任務 | 說明 | 預估時間 |
|------|------|---------|
| P5-1 | 用藥 API (MedicationRecord) | 2h |
| P5-2 | 藥品清單管理頁面 | 2h |
| P5-3 | 用藥記錄與打勾功能 | 2h |
| P5-4 | 療程追蹤頁面 | 2h |

---

## 四、詳細規格

---

### 4.1 寵物食品資料庫 🍖

#### 4.1.1 Schema（已建立）
```
FoodBrand（品牌）
  └─ FoodProduct（產品）
       ├─ 基本資訊：name, type, petType, ageGroup, flavor
       ├─ MOA 資料：moaId, moaItem, moaSource（農業部整合）
       ├─ 營養標示：caloriesPer100g, proteinPer100g, fatPer100g...
       ├─ 礦物質：calcium, phosphorus, sodium...
       ├─ 維生素：vitaminA, vitaminD, vitaminE
       └─ 包裝：packageSizeG, servingSizeG

DietRecord（飲食記錄）
  ├─ foodProductId → 關聯產品
  ├─ amountValue + amountUnit（份量）
  ├─ totalKcal（系統計算熱量）
  └─ drankWaterMl（飲水量）

ScheduledFeeding（定時餵食）
  └─ 設定每日固定餵食時間與份量
```

#### 4.1.2 API 端點
```
# 食品搜尋
GET  /api/food/search?q=xxx&brand=xxx&type=xxx  - 搜尋食品
GET  /api/food/brands                           - 取得品牌列表
GET  /api/food/products/:id                     - 取得產品詳情
POST /api/food/recognize                        - 圖片辨識品牌/產品

# 飲食記錄
GET    /api/diet-records                        - 取得飲食記錄
POST   /api/diet-records                        - 新增飲食記錄
GET    /api/diet-records/daily-summary          - 每日熱量統計
PUT    /api/diet-records/:id                    - 更新記錄
DELETE /api/diet-records/:id                    - 刪除記錄

# 定時餵食
GET    /api/scheduled-feedings                  - 取得餵食設定
POST   /api/scheduled-feedings                  - 新增餵食設定
PUT    /api/scheduled-feedings/:id              - 更新設定
DELETE /api/scheduled-feedings/:id              - 刪除設定
```

#### 4.1.3 頁面設計
```
/food                     - 食品資料庫首頁
/food/search              - 食品搜尋
/food/products/:id        - 產品詳情（營養成分）
/diet                     - 飲食記錄列表
/diet/new                 - 新增飲食記錄
/diet/schedule            - 定時餵食設定
```

#### 4.1.4 核心流程

**流程 A：LINE 照片辨識記錄**
```
1. 飼主傳送飼料/零食照片
2. AI 辨識品牌 + 產品名稱
3. 系統查詢食品資料庫
   ├─ 找到 → 顯示產品資訊，詢問份量
   └─ 找不到 → 詢問是否手動輸入
4. 飼主輸入份量（例：50g、半碗）
5. 系統計算熱量並記錄
6. 回覆確認訊息 + 今日累計熱量
```

**流程 B：LIFF 手動記錄**
```
1. 進入飲食記錄頁面
2. 搜尋或選擇食品
3. 輸入份量
4. 選擇餵食時間
5. 儲存記錄
```

#### 4.1.5 UI 流程
```
【食品搜尋頁】
┌─────────────────────────────────┐
│  🍖 食品資料庫                   │
├─────────────────────────────────┤
│  🔍 搜尋食品或品牌               │
│  ┌─────────────────────────┐   │
│  │ 皇家                     │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  熱門品牌                        │
│  [皇家] [希爾思] [渴望] [巔峰]   │
├─────────────────────────────────┤
│  搜尋結果                        │
├─────────────────────────────────┤
│  🏷️ 皇家 Royal Canin            │
│  ├─ 室內成貓 (乾糧)    400kcal  │
│  ├─ 腸胃保健 (乾糧)    380kcal  │
│  └─ 幼貓專用 (乾糧)    420kcal  │
└─────────────────────────────────┘

【新增飲食記錄頁】
┌─────────────────────────────────┐
│  ← 新增飲食記錄                  │
├─────────────────────────────────┤
│  選擇寵物                        │
│  [🐕 麻糬] [🐱 小花]             │
├─────────────────────────────────┤
│  選擇食品                        │
│  ┌─────────────────────────┐   │
│  │ 🔍 皇家室內成貓          │   │
│  └─────────────────────────┘   │
│  已選：皇家室內成貓 (400kcal/100g)│
├─────────────────────────────────┤
│  份量                            │
│  ┌──────┐  ┌──────────────┐    │
│  │  50  │  │ 公克 ▼       │    │
│  └──────┘  └──────────────┘    │
│  預估熱量：200 kcal              │
├─────────────────────────────────┤
│  餵食時間                        │
│  ○ 早餐 (08:00)                 │
│  ● 午餐 (12:00)  ← 已選         │
│  ○ 晚餐 (18:00)                 │
│  ○ 點心                         │
├─────────────────────────────────┤
│  [        儲存記錄        ]     │
└─────────────────────────────────┘

【每日飲食統計】
┌─────────────────────────────────┐
│  📊 今日飲食 - 麻糬              │
├─────────────────────────────────┤
│  熱量攝取                        │
│  ████████░░░░░░░░  520/800 kcal │
│                     完成 65%     │
├─────────────────────────────────┤
│  飲水量                          │
│  ██████░░░░░░░░░░  150/300 ml   │
│                     完成 50%     │
├─────────────────────────────────┤
│  今日記錄                        │
├─────────────────────────────────┤
│  08:15  皇家室內成貓  50g  200kcal│
│  12:30  希爾思主食罐  80g  280kcal│
│  15:00  零食凍乾      10g   40kcal│
└─────────────────────────────────┘
```

#### 4.1.6 LINE Bot 對話範例
```
【用戶傳送飼料照片】

🤖 Bot：
我辨識到這是「皇家 室內成貓配方」
熱量：400 kcal/100g

請問餵了多少份量？
[30g] [50g] [80g] [自訂]

👤 用戶點選：50g

🤖 Bot：
✅ 已記錄麻糬的飲食！

📝 皇家室內成貓 50g
🔥 熱量：200 kcal
📊 今日累計：520 / 800 kcal (65%)

還需要約 280 kcal 達到每日目標 💪
```

#### 4.1.7 驗收標準
- [ ] 可搜尋食品資料庫（品牌、產品名稱）
- [ ] 圖片辨識可識別常見品牌
- [ ] 可記錄飲食並自動計算熱量
- [ ] 顯示每日熱量攝取統計
- [ ] 可設定寵物每日熱量目標
- [ ] LINE Bot 可完成照片→辨識→份量→記錄流程

---

### 4.2 費用記錄模組 💰

#### 4.1.1 資料庫 Schema
```prisma
// 新增到 prisma/schema.prisma

// 費用分類枚舉
enum ExpenseCategory {
  MEDICAL      // 醫療（看診、手術、健檢）
  MEDICATION   // 藥品
  FOOD         // 飲食（飼料、零食、保健品）
  GROOMING     // 美容（洗澡、剪毛）
  SUPPLIES     // 用品（玩具、籠子、碗）
  INSURANCE    // 保險
  OTHER        // 其他
}

// 費用記錄
model Expense {
  id            String          @id @default(cuid())
  userId        String          @map("user_id")
  petId         String?         @map("pet_id")  // 可選，可能是全家共用支出

  // 費用資訊
  category      ExpenseCategory
  amount        Decimal         @db.Decimal(10, 2)
  currency      String          @default("TWD")
  description   String

  // 關聯資訊
  vendorName    String?         @map("vendor_name")  // 店家/醫院名稱
  receiptUrl    String?         @map("receipt_url")  // 收據照片

  // 時間
  expenseDate   DateTime        @map("expense_date")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  // 關聯
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  pet           Pet?            @relation(fields: [petId], references: [id], onDelete: SetNull)

  @@index([userId, expenseDate])
  @@index([petId])
  @@map("expenses")
}

// 預算設定
model Budget {
  id            String          @id @default(cuid())
  userId        String          @map("user_id")

  // 預算資訊
  category      ExpenseCategory?  // null 表示總預算
  monthlyLimit  Decimal         @db.Decimal(10, 2) @map("monthly_limit")
  alertAt       Int             @default(80) @map("alert_at")  // 達到百分比時提醒

  // 時間
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  // 關聯
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category])
  @@map("budgets")
}
```

#### 4.1.2 API 端點
```
GET    /api/expenses              - 取得費用列表（支援篩選：petId, category, startDate, endDate）
POST   /api/expenses              - 新增費用
GET    /api/expenses/:id          - 取得單筆費用
PUT    /api/expenses/:id          - 更新費用
DELETE /api/expenses/:id          - 刪除費用
GET    /api/expenses/stats        - 費用統計（月度/年度/分類）
GET    /api/budgets               - 取得預算設定
POST   /api/budgets               - 新增/更新預算
```

#### 4.1.3 頁面設計
```
/expenses                 - 費用列表（按月份分組）
/expenses/new             - 新增費用
/expenses/stats           - 費用統計圖表
/expenses/budget          - 預算設定
```

#### 4.1.4 UI 流程
```
【費用列表頁】
┌─────────────────────────────────┐
│  💰 費用記錄          [+ 新增]  │
├─────────────────────────────────┤
│  2026年3月    總計 NT$ 3,500    │
├─────────────────────────────────┤
│  03/28  🏥 醫療  NT$ 1,200      │
│         台大動物醫院 - 健檢      │
│         🐕 麻糬                  │
├─────────────────────────────────┤
│  03/25  🍖 飲食  NT$ 800        │
│         寵物公園 - 飼料          │
│         🐕 麻糬 🐱 小花          │
├─────────────────────────────────┤
│  03/20  💊 藥品  NT$ 500        │
│         動物醫院 - 心絲蟲藥      │
│         🐕 麻糬                  │
└─────────────────────────────────┘

【新增費用頁】
┌─────────────────────────────────┐
│  ← 新增費用                     │
├─────────────────────────────────┤
│  金額 *                         │
│  ┌─────────────────────────┐   │
│  │ NT$ 1,200               │   │
│  └─────────────────────────┘   │
│                                 │
│  分類 *                         │
│  [🏥醫療] [💊藥品] [🍖飲食]     │
│  [✂️美容] [🧸用品] [📋其他]     │
│                                 │
│  寵物（可選）                   │
│  [麻糬 🐕] [小花 🐱] [全部]     │
│                                 │
│  說明 *                         │
│  ┌─────────────────────────┐   │
│  │ 年度健康檢查             │   │
│  └─────────────────────────┘   │
│                                 │
│  店家/醫院名稱                  │
│  ┌─────────────────────────┐   │
│  │ 台大動物醫院             │   │
│  └─────────────────────────┘   │
│                                 │
│  日期                           │
│  ┌─────────────────────────┐   │
│  │ 2026-03-28              │   │
│  └─────────────────────────┘   │
│                                 │
│  📷 上傳收據（可選）            │
│                                 │
│  [        儲存費用        ]     │
└─────────────────────────────────┘
```

#### 4.1.5 驗收標準
- [ ] 可新增費用並選擇分類
- [ ] 可篩選特定寵物或時間範圍
- [ ] 顯示月度總計
- [ ] 可上傳收據照片
- [ ] 可設定月預算並在達到閾值時提醒

---

### 4.2 健檢報告追蹤 📋

#### 4.2.1 資料庫 Schema
```prisma
// 健檢報告
model HealthReport {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  petId         String    @map("pet_id")

  // 報告資訊
  reportDate    DateTime  @map("report_date")
  hospitalName  String?   @map("hospital_name")
  doctorName    String?   @map("doctor_name")
  reportType    String?   @map("report_type")  // 年度健檢、血檢、尿檢等

  // 圖片
  imageUrls     String[]  @map("image_urls")

  // AI 解析結果
  parsedData    Json?     @map("parsed_data")  // OCR 解析的完整結構化資料

  // 備註
  notes         String?

  // 時間戳記
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 關聯
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pet           Pet       @relation(fields: [petId], references: [id], onDelete: Cascade)
  testResults   HealthTestResult[]

  @@index([userId, petId, reportDate])
  @@map("health_reports")
}

// 健檢項目結果（用於比較）
model HealthTestResult {
  id            String    @id @default(cuid())
  reportId      String    @map("report_id")

  // 檢測項目
  itemName      String    @map("item_name")      // 例：BUN、CREA、ALT
  itemNameCn    String?   @map("item_name_cn")   // 中文名：血尿素氮
  category      String?                          // 血液、生化、尿液等

  // 數值
  value         String                           // 檢測值（字串以支援各種格式）
  numericValue  Decimal?  @db.Decimal(10, 3) @map("numeric_value")  // 數值型（用於比較）
  unit          String?                          // 單位

  // 參考範圍
  refMin        Decimal?  @db.Decimal(10, 3) @map("ref_min")
  refMax        Decimal?  @db.Decimal(10, 3) @map("ref_max")
  refRange      String?   @map("ref_range")      // 原始參考範圍文字

  // 狀態
  isAbnormal    Boolean   @default(false) @map("is_abnormal")
  abnormalType  String?   @map("abnormal_type")  // HIGH, LOW, CRITICAL

  // 關聯
  report        HealthReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([itemName])
  @@map("health_test_results")
}
```

#### 4.2.2 API 端點
```
GET    /api/health-reports              - 取得健檢報告列表
POST   /api/health-reports              - 新增健檢報告（含 OCR 解析）
GET    /api/health-reports/:id          - 取得單份報告詳情
PUT    /api/health-reports/:id          - 更新報告
DELETE /api/health-reports/:id          - 刪除報告
GET    /api/health-reports/compare      - 比較多份報告（query: ids=xxx,yyy）
GET    /api/health-reports/trends/:petId - 取得特定寵物的健檢趨勢
```

#### 4.2.3 頁面設計
```
/health-reports                   - 健檢報告列表
/health-reports/new               - 新增報告（拍照上傳）
/health-reports/:id               - 報告詳情
/health-reports/compare           - 報告比較
/health-reports/trends/:petId     - 趨勢圖表
```

#### 4.2.4 UI 流程
```
【健檢報告列表】
┌─────────────────────────────────┐
│  📋 健檢報告          [+ 新增]  │
├─────────────────────────────────┤
│  🐕 麻糬                        │
├─────────────────────────────────┤
│  📄 2026/03/15 年度健檢         │
│     台大動物醫院                │
│     ⚠️ 2 項異常                 │
│     [查看] [比較]               │
├─────────────────────────────────┤
│  📄 2025/03/20 年度健檢         │
│     台大動物醫院                │
│     ✅ 全部正常                 │
│     [查看] [比較]               │
└─────────────────────────────────┘

【報告詳情頁】
┌─────────────────────────────────┐
│  ← 2026/03/15 健檢報告          │
├─────────────────────────────────┤
│  🐕 麻糬 ｜ 台大動物醫院        │
│  報告類型：年度健康檢查          │
├─────────────────────────────────┤
│  📊 血液生化                    │
├─────────────────────────────────┤
│  項目        數值    參考值     │
│  ─────────────────────────────  │
│  BUN         25     10-30  ✅   │
│  CREA        2.1    0.5-1.8 🔴  │
│  ALT         45     10-80  ✅   │
│  ─────────────────────────────  │
│                                 │
│  ⚠️ CREA 偏高                   │
│  建議：腎功能指數略高，建議追蹤  │
├─────────────────────────────────┤
│  [📷 查看原始報告] [📈 趨勢圖]  │
└─────────────────────────────────┘

【趨勢比較頁】
┌─────────────────────────────────┐
│  ← CREA 腎功能趨勢              │
├─────────────────────────────────┤
│                                 │
│  2.5 ┤         🔴               │
│  2.0 ┤    ●────●               │
│  1.5 ┤ ●──●                    │
│  1.0 ┤                          │
│      └──┬────┬────┬────┬──     │
│      2023  2024  2025  2026     │
│                                 │
│  參考範圍：0.5 - 1.8            │
│  狀態：連續上升，建議關注        │
└─────────────────────────────────┘
```

#### 4.2.5 驗收標準
- [ ] 可拍照上傳健檢報告
- [ ] AI 自動 OCR 解析數值
- [ ] 異常數值紅字標示
- [ ] 可選擇多份報告比較
- [ ] 顯示歷史趨勢圖

---

### 4.3 用藥管理強化 💊

#### 4.3.1 資料庫 Schema
```prisma
// 藥品資訊
model Medication {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  petId         String    @map("pet_id")

  // 藥品資訊
  name          String                          // 藥品名稱
  dosage        String?                         // 劑量（例：1顆、5ml）
  frequency     String?                         // 頻率（例：每日一次、每12小時）
  instructions  String?                         // 服用說明

  // 療程
  startDate     DateTime  @map("start_date")
  endDate       DateTime? @map("end_date")      // null 表示長期用藥
  isActive      Boolean   @default(true) @map("is_active")

  // 庫存
  stockQuantity Int?      @map("stock_quantity")
  stockUnit     String?   @map("stock_unit")    // 顆、ml、包
  lowStockAlert Int?      @map("low_stock_alert")  // 低於此數量提醒

  // 來源
  prescribedBy  String?   @map("prescribed_by")  // 開藥醫院/醫生

  // 時間戳記
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 關聯
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pet           Pet       @relation(fields: [petId], references: [id], onDelete: Cascade)
  logs          MedicationLog[]

  @@index([userId, petId])
  @@map("medications")
}

// 用藥記錄
model MedicationLog {
  id            String    @id @default(cuid())
  medicationId  String    @map("medication_id")

  // 記錄
  scheduledAt   DateTime  @map("scheduled_at")   // 預定服藥時間
  takenAt       DateTime? @map("taken_at")       // 實際服藥時間
  status        MedicationStatus @default(PENDING)

  // 備註
  notes         String?
  skippedReason String?   @map("skipped_reason")

  // 時間戳記
  createdAt     DateTime  @default(now()) @map("created_at")

  // 關聯
  medication    Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)

  @@index([medicationId, scheduledAt])
  @@map("medication_logs")
}

enum MedicationStatus {
  PENDING   // 待服用
  TAKEN     // 已服用
  SKIPPED   // 跳過
  MISSED    // 錯過
}
```

#### 4.3.2 API 端點
```
GET    /api/medications              - 取得藥品清單
POST   /api/medications              - 新增藥品
GET    /api/medications/:id          - 取得藥品詳情
PUT    /api/medications/:id          - 更新藥品
DELETE /api/medications/:id          - 刪除藥品
POST   /api/medications/:id/take     - 記錄服藥
POST   /api/medications/:id/skip     - 跳過服藥
GET    /api/medications/today        - 取得今日待服藥清單
GET    /api/medications/:id/logs     - 取得服藥記錄
```

#### 4.3.3 頁面設計
```
/medications                  - 藥品清單
/medications/new              - 新增藥品
/medications/:id              - 藥品詳情與療程
/medications/today            - 今日用藥（首頁快捷）
```

#### 4.3.4 UI 流程
```
【今日用藥頁】（可從首頁直接進入）
┌─────────────────────────────────┐
│  💊 今日用藥          3/28(六)  │
├─────────────────────────────────┤
│  🐕 麻糬                        │
├─────────────────────────────────┤
│  ⏰ 08:00                       │
│  ┌─────────────────────────┐   │
│  │ ✅ 心絲蟲預防藥          │   │
│  │    已於 08:15 服用       │   │
│  └─────────────────────────┘   │
│                                 │
│  ⏰ 12:00                       │
│  ┌─────────────────────────┐   │
│  │ ⬜ 關節保健品            │   │
│  │    1顆，隨餐服用         │   │
│  │    [服用] [跳過]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ⏰ 20:00                       │
│  ┌─────────────────────────┐   │
│  │ 🕐 抗生素               │   │
│  │    1顆，飯後30分鐘      │   │
│  │    尚未到時間            │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  🐱 小花                        │
├─────────────────────────────────┤
│  ⏰ 09:00                       │
│  ┌─────────────────────────┐   │
│  │ ❌ 眼藥水               │   │
│  │    錯過 (09:00)          │   │
│  │    [補服] [跳過]         │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘

【藥品管理頁】
┌─────────────────────────────────┐
│  💊 藥品管理          [+ 新增]  │
├─────────────────────────────────┤
│  進行中療程                     │
├─────────────────────────────────┤
│  🐕 麻糬 - 抗生素               │
│     每日2次 | 剩餘 5 天         │
│     庫存：8顆 ⚠️                │
├─────────────────────────────────┤
│  🐱 小花 - 眼藥水               │
│     每日3次 | 長期用藥          │
│     庫存：1瓶                   │
├─────────────────────────────────┤
│  長期保健                       │
├─────────────────────────────────┤
│  🐕 麻糬 - 心絲蟲預防           │
│     每月1次 | 下次：04/01       │
│     庫存：6顆                   │
└─────────────────────────────────┘
```

#### 4.3.5 驗收標準
- [ ] 可新增藥品並設定頻率
- [ ] 今日用藥頁面顯示待服藥清單
- [ ] 可一鍵記錄已服藥
- [ ] 可設定庫存並在低庫存時提醒
- [ ] 療程結束自動標記完成

---

## 五、共用元件

### 5.1 需要新增的 User/Pet 關聯
```prisma
// 在 User model 新增
model User {
  // ... 現有欄位
  expenses        Expense[]
  budgets         Budget[]
  healthReports   HealthReport[]
  medications     Medication[]
}

// 在 Pet model 新增
model Pet {
  // ... 現有欄位
  expenses        Expense[]
  healthReports   HealthReport[]
  medications     Medication[]
}
```

### 5.2 底部導航調整
```
現有：首頁 | 寵物 | 統計 | 提醒 | 設定
建議：首頁 | 寵物 | 健康 | 費用 | 更多
      └─ 更多：提醒、統計、設定
```

---

## 六、開發順序建議

```
Week 1: P1 修復 + P2 費用記錄
  - Day 1: 修復 enum 同步、發布 LINE Channel
  - Day 2-3: 費用 Schema + API
  - Day 4-5: 費用頁面 UI

Week 2: P3 健檢追蹤
  - Day 1-2: 健檢 Schema + API
  - Day 3-4: 健檢頁面 UI
  - Day 5: 趨勢比較功能

Week 3: P4 用藥管理
  - Day 1-2: 用藥 Schema + API
  - Day 3-4: 用藥頁面 UI
  - Day 5: 測試與修復
```

---

## 七、注意事項

### 7.1 程式碼規範
- TypeScript 嚴格模式
- 使用 Prisma 操作資料庫
- API 需驗證用戶身份
- 使用 shadcn/ui 元件
- 遵循現有程式碼風格

### 7.2 測試重點
- 多寵物切換是否正確
- 訂閱方案限制是否生效
- LINE 推播是否正常
- 圖片 OCR 是否準確

### 7.3 遇到問題時
1. 先查看現有程式碼的實作方式
2. 參考 `/docs` 資料夾的文件
3. 大問題回報給 Claude 處理

---

## 八、聯絡方式

有任何問題請透過 Telegram 聯繫 Wind

---

*文件版本：1.0*
*最後更新：2026-03-30*
