import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedDiaryEntry {
  category: 'FOOD' | 'HEALTH' | 'ACTIVITY' | 'MEDICAL' | 'GROOMING' | 'BEHAVIOR' | 'OTHER';
  subCategory?: string;
  content: string;
  details: Record<string, unknown>;
  mood?: number;
  severity?: number;
  tags?: string[];
  reminderSuggestion?: {
    title: string;
    remindAt: string;
    category: string;
  };
}

export interface ParseResult {
  entries: ParsedDiaryEntry[];
  summary: string;
  healthWarning?: string;
}

const SYSTEM_PROMPT = `你是一個寵物日記助手，專門解析飼主對寵物的口語化描述。

你的任務是：
1. 將用戶的口語化輸入解析成結構化的日記記錄
2. 一個輸入可能包含多個記錄（例如飲食+運動）
3. 為每個記錄分類並提取詳細資訊

分類說明：
- FOOD: 飲食相關（吃東西、喝水、零食、保健品）
- HEALTH: 健康狀況（排泄、嘔吐、症狀、體重、精神狀態）
- ACTIVITY: 活動（散步、運動、玩耍、睡眠）
- MEDICAL: 醫療（疫苗、驅蟲、看診、用藥）
- GROOMING: 美容（洗澡、梳毛、剪指甲）
- BEHAVIOR: 行為（情緒、異常行為、社交）
- OTHER: 其他

輸出格式（JSON）：
{
  "entries": [
    {
      "category": "FOOD",
      "subCategory": "主食",
      "content": "早上吃了一碗飼料",
      "details": {
        "mealType": "早餐",
        "foodType": "飼料",
        "amount": "一碗",
        "appetite": "正常"
      },
      "mood": 4,
      "tags": ["正常飲食"]
    }
  ],
  "summary": "今天飲食正常，運動量充足"
}

注意事項：
- mood/severity 使用 1-5 分制（1=很差, 5=很好）
- 如果提到需要提醒的事項（如下次疫苗），提供 reminderSuggestion
- 保持原文的重要細節，不要過度簡化
- 如果無法判斷分類，使用 OTHER`;

export async function parseDiaryInput(input: string, petName?: string): Promise<ParseResult> {
  const userMessage = petName
    ? `寵物名字：${petName}\n\n飼主描述：${input}`
    : `飼主描述：${input}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content) as ParseResult;
    return result;
  } catch (error) {
    console.error('AI parsing error:', error);

    // Fallback: 建立一個基本的 OTHER 分類記錄
    return {
      entries: [
        {
          category: 'OTHER',
          content: input,
          details: {},
        },
      ],
      summary: input,
    };
  }
}

// 健康分析（付費功能）
export async function analyzeHealth(
  petId: string,
  diaries: Array<{
    category: string;
    content: string;
    details: unknown;
    occurredAt: Date;
  }>,
  petInfo: {
    name: string;
    species: string;
    breed?: string;
    age: string;
  }
): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
  alerts: string[];
}> {
  const diaryText = diaries
    .map((d) => `[${d.occurredAt.toLocaleDateString()}] ${d.category}: ${d.content}`)
    .join('\n');

  const prompt = `分析以下寵物的健康記錄，提供健康洞察和建議：

寵物資訊：
- 名字：${petInfo.name}
- 種類：${petInfo.species}
- 品種：${petInfo.breed || '未知'}
- 年齡：${petInfo.age}

最近的記錄：
${diaryText}

請提供：
1. 健康狀況總結
2. 重要洞察（趨勢、模式）
3. 建議事項
4. 需要注意的警示（如有）

輸出格式（JSON）：
{
  "summary": "整體健康狀況描述",
  "insights": ["洞察1", "洞察2"],
  "recommendations": ["建議1", "建議2"],
  "alerts": ["警示1"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Health analysis error:', error);
    throw error;
  }
}
