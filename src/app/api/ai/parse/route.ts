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

重要：當用戶提到「花了OO元」、「買了OO花了XX」、「費用XX」等和金錢相關的描述時，請自動分類到 expenseRecords。

花費類別判斷規則：
- 如果提到「罐頭、乾糧、飼料、零食、食物、吃、喝、鮮食」等 → FOOD
- 如果提到「醫院、診所、獸醫、看醫生、檢查、手術、驅蟲、疫苗、打針、吃药」等 → MEDICAL
- 如果提到「美容、洗澡、剪毛、洗牙」等 → GROOMING
- 如果提到「貓砂、狗尿布、玩具、窩、籠子、牽繩、項圈、餐具、寵物床、用品」等 → SUPPLIES
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
      "description": "花費描述（如：狗罐頭180g）",
      "amount": 180,
      "notes": "備註（可選）"
    }
  ]
}

只回傳 JSON，不要有其他文字。`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    });

    const responseText = completion.choices[0].message.content || '{}';
    let parsedData: any;
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

    // 儲存飲食記錄
    if (dietRecords.length > 0) {
      await prisma.dietRecord.createMany({
        data: dietRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          mealTime: r.mealTime,
          foodType: r.foodType,
          brandName: r.brandName || null,
          quantity: r.quantity ? parseFloat(r.quantity) : null,
          unit: r.unit || null,
          notes: r.notes || null,
        })),
      });
      createdRecords += dietRecords.length;
    }

    // 儲存體重記錄
    if (weightRecords.length > 0) {
      await prisma.weightRecord.createMany({
        data: weightRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          weight: parseFloat(r.weight),
          unit: r.unit || 'kg',
          measuredAt: r.measuredAt ? new Date(r.measuredAt) : new Date(),
          notes: r.notes || null,
        })),
      });
      createdRecords += weightRecords.length;
    }

    // 儲存提醒
    if (reminders.length > 0) {
      await prisma.reminder.createMany({
        data: reminders.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          title: r.title,
          type: r.type || 'other',
          scheduledDate: new Date(r.scheduledDate),
          scheduledTime: r.scheduledTime || null,
          frequency: r.frequency || 'once',
          notes: r.notes || null,
          isActive: true,
        })),
      });
      createdRecords += reminders.length;
    }

    // 儲存日常任務
    if (dailyTasks.length > 0) {
      await prisma.dailyTask.createMany({
        data: dailyTasks.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          taskName: r.taskName,
          frequency: r.frequency || 'daily',
          startDate: new Date(r.startDate),
          isActive: true,
          notes: r.notes || null,
        })),
      });
      createdRecords += dailyTasks.length;
    }

    // 儲存醫療記錄
    if (medicalRecords.length > 0) {
      await prisma.medicalRecord.createMany({
        data: medicalRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          recordDate: new Date(r.recordDate),
          type: r.type || 'vet_visit',
          title: r.title || null,
          clinicName: r.clinicName || null,
          veterinarian: r.veterinarian || null,
          diagnosis: r.diagnosis || null,
          treatmentPlan: r.treatmentPlan || null,
          costTwd: r.costTwd ? parseFloat(r.costTwd) : null,
          notes: r.notes || null,
          attachmentUrls: [],
          isOngoingIssue: r.isOngoingIssue || false,
        })),
      });
      createdRecords += medicalRecords.length;
    }

    // 儲存用藥記錄
    if (medicationRecords.length > 0) {
      await prisma.medicationRecord.createMany({
        data: medicationRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          medicationName: r.medicationName,
          dosageValue: parseFloat(r.dosageValue),
          dosageUnit: r.dosageUnit,
          frequency: r.frequency,
          startDate: new Date(r.startDate),
          endDate: r.endDate ? new Date(r.endDate) : null,
          purpose: r.purpose || null,
          notes: r.notes || null,
        })),
      });
      createdRecords += medicationRecords.length;
    }

    // 儲存檢驗記錄
    if (examinationRecords.length > 0) {
      await prisma.examinationRecord.createMany({
        data: examinationRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          examinationDate: new Date(r.examinationDate),
          examinationType: r.examinationType,
          clinicName: r.clinicName || null,
          notes: r.notes || null,
          results: r.results || null,
        })),
      });
      createdRecords += examinationRecords.length;
    }

    // 儲存花費記錄
    if (expenseRecords.length > 0) {
      await prisma.expenseRecord.createMany({
        data: expenseRecords.map((r: any) => ({
          userId: decodedToken.userId,
          petId,
          recordDate: new Date(r.recordDate),
          category: r.category,
          description: r.description,
          amount: parseFloat(r.amount),
          notes: r.notes || null,
        })),
      });
      createdRecords += expenseRecords.length;
    }

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
  } catch (error) {
    console.error('AI parse API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
