// src/app/api/ai/parse/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { text, petId } = await request.json();

    if (!text || !petId) {
      return NextResponse.json({ error: 'Missing text or petId' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `你是一個寵物健康記錄助手。請從用戶的自然語言輸入中解析出寵物相關記錄，並以 JSON 格式回傳。

今天的日期是 ${today}。

請解析以下 8 種類型的記錄：
1. dietRecords（飲食記錄）
2. weightRecords（體重記錄）
3. reminders（提醒事項）
4. dailyTasks（日常任務）
5. medicalRecords（醫療記錄）
6. medicationRecords（用藥記錄）
7. examinationRecords（檢驗記錄）
8. expenseRecords（花費記錄）⭐

重要：當用戶提到「花了OO元」、「買了OO花了XX」、「費用XX」、「多少錢」等和金錢相關的描述時，請自動分類到 expenseRecords，絕對不要放進 dietRecords。

【飲食 vs 花費 判斷規則】
- 如果只提到「吃、吃了、攝取、喝了」等 → dietRecords（飲食記錄）
- 如果提到「花了、買了、花費、費用、多少錢、多少钱」等 → expenseRecords（花費記錄）
- 「狗罐頭花了300」→ 花費，不是飲食！

花費類別判斷規則：
- 如果提到「罐頭、乾糧、飼料、零食、食物、吃、喝、鮮食」等 + 有金錢描述 → FOOD
- 如果提到「醫院、診所、獸醫、看醫生、檢查、手術、驅蟲、疫苗、打針、吃药」等 + 有金錢描述 → MEDICAL
- 如果提到「美容、洗澡、剪毛、洗牙」等 + 有金錢描述 → GROOMING
- 如果提到「貓砂、狗尿布、玩具、窩、籠子、牽繩、項圈、餐具、寵物床、用品」等 + 有金錢描述 → SUPPLIES
- 如果提到「保險」→ INSURANCE
- 其他無法判斷的 → OTHER

請以以下 JSON 格式回傳（若某種類型沒有資料，請回傳空陣列）：
{
  "dietRecords": [
    {
      "mealTime": "早餐",
      "foodType": "乾糧",
      "brandName": "品牌名稱（可選）",
      "quantity": 100,
      "unit": "g",
      "notes": "備註（可選）"
    }
  ],
  "weightRecords": [
    {
      "weight": 5.5,
      "unit": "kg",
      "measuredAt": "YYYY-MM-DD",
      "notes": "備註（可選）"
    }
  ],
  "reminders": [
    {
      "title": "提醒標題",
      "type": "vaccine|deworming|vet_visit|grooming|life|other",
      "scheduledDate": "YYYY-MM-DD",
      "scheduledTime": "HH:MM（可選）",
      "frequency": "once|daily|weekly|monthly|yearly",
      "notes": "備註（可選）"
    }
  ],
  "dailyTasks": [
    {
      "taskName": "任務名稱",
      "frequency": "daily|weekly",
      "startDate": "YYYY-MM-DD",
      "notes": "備註（可選）"
    }
  ],
  "medicalRecords": [
    {
      "recordDate": "YYYY-MM-DD",
      "type": "vet_visit|checkup|symptom|ongoing_issue",
      "title": "標題（可選）",
      "clinicName": "診所名稱（可選）",
      "veterinarian": "獸醫姓名（可選）",
      "diagnosis": "診斷結果（可選）",
      "treatmentPlan": "治療計劃（可選）",
      "costTwd": 500,
      "notes": "備註（可選）",
      "isOngoingIssue": false
    }
  ],
  "medicationRecords": [
    {
      "medicationName": "藥品名稱",
      "dosageValue": 1.0,
      "dosageUnit": "顆|ml|mg",
      "frequency": "每天一次|每天兩次|每週一次",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD（可選）",
      "purpose": "用途（可選）",
      "notes": "備註（可選）"
    }
  ],
  "examinationRecords": [
    {
      "examinationDate": "YYYY-MM-DD",
      "examinationType": "血液檢查|尿液檢查|X光|超音波|其他",
      "clinicName": "診所名稱（可選）",
      "notes": "備註（可選）",
      "results": {}
    }
  ],
  "expenseRecords": [
    {
      "recordDate": "YYYY-MM-DD",
      "category": "FOOD|MEDICAL|GROOMING|SUPPLIES|INSURANCE|OTHER",
      "description": "花費描述，直接取產品/服務名稱（如：狗罐頭、貓砂、獸醫費用）",
      "amount": 300,
      "notes": "備註（可選）"
    }
  ]
}

重要：當用戶說「狗罐頭花了300」或「買了XXX花了OO元」時：
1. description = "狗罐頭"（只取產品名稱，不要包含「花了」或「花了OOO元」）
2. amount = 300（只取數字）
3. category = "FOOD"（因為是寵物食品）

只回傳 JSON，不要有其他文字。`;

    // 測試用：跳過 OpenAI，直接返回模擬資料
    // 這個格式符合 Prisma schema
    const mockData = {
      dietRecords: [{
        recordedAt: new Date().toISOString(),
        foodName: '罐頭',
        foodType: 'OTHER',  // Prisma enum 值
        quantity: 20,        // number 不是 string
        unit: 'g',
        notes: '測試'
      }],
      weightRecords: [],
      reminders: [],
      dailyTasks: [],
      medicalRecords: [],
      medicationRecords: [],
      examinationRecords: [],
      expenseRecords: [],
    };

    let parsedData = mockData;
    
    /*
    // 正式版：使用 OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
      });

      const responseText = completion.choices[0].message.content || '{}';
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        parsedData = {
          dietRecords: [],
          weightRecords: [],
          reminders: [],
          dailyTasks: [],
          medicalRecords: [],
          medicationRecords: [],
          examinationRecords: [],
          expenseRecords: [],
        };
      }
    } catch (openaiErr) {
      console.error('OpenAI error:', openaiErr);
    }
    */

    const {
      dietRecords = [],
      weightRecords = [],
      reminders = [],
      dailyTasks = [],
      medicalRecords = [],
      medicationRecords = [],
      examinationRecords = [],
      expenseRecords = [],
    } = parsedData;

    let createdRecords = 0;

    // 儲存飲食記錄 - 使用最簡單的測試資料
    if (dietRecords.length > 0) {
      try {
        // 直接建立一筆記錄測試
        const testRecord = {
          userId: decodedToken.userId,
          petId,
          recordedAt: new Date(),
          foodName: '測試罐頭',
          foodType: 'OTHER',
          amountValue: 20,
          amountUnit: 'g',
          mainIngredients: [],
          notes: '測試',
        };
        console.log('Creating test diet record:', JSON.stringify(testRecord));
        await prisma.dietRecord.create({ data: testRecord });
        createdRecords = 1;
        console.log('Test diet record created!');
      } catch (dietErr: any) {
        console.error('Diet save error:', dietErr.message, dietErr.code, dietErr.meta);
      }
    }

    // 儲存體重記錄
    if (weightRecords.length > 0) {
      try {
        await prisma.weightRecord.createMany({
          data: weightRecords.map((r: any) => ({
            userId: decodedToken.userId,
            petId,
            recordDate: new Date(r.measuredAt || new Date()),
            weightKg: parseFloat(r.weight) || 0,
            notes: r.notes || null,
          })),
        });
        createdRecords += weightRecords.length;
      } catch (e) {
        console.error('Weight save error:', e);
      }
    }

    // 儲存提醒 - 跳過（複雜的 enum 類型）
    // if (reminders.length > 0) { ... }

    // 儲存日常任務 - 跳過
    // 儲存醫療記錄 - 跳過
    // 儲存用藥記錄 - 跳過
    // 儲存檢驗記錄 - 跳過
    // 儲存花費記錄 - 跳過

    try {
      return NextResponse.json({
        success: true,
        message: `成功解析並儲存 ${createdRecords} 筆記錄`,
        parsedData: {
          dietRecords,
          weightRecords,
          reminders,
          dailyTasks,
          medicalRecords,
          medicationRecords,
          examinationRecords,
          expenseRecords,
        },
        createdRecords,
      });
    } catch (jsonErr) {
      console.error('JSON response error:', jsonErr);
      return NextResponse.json({ error: 'Response generation failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('AI parse API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
