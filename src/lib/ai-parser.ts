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
  mentionedPetName?: string; // 訊息中提到的寵物名字
  extractedWeight?: number; // 如果提到體重，提取體重值（公斤）
}

const SYSTEM_PROMPT = `你是一個寵物日記助手，專門解析飼主對寵物的口語化描述。

你的任務是：
1. 將用戶的口語化輸入解析成結構化的日記記錄
2. 一個輸入可能包含多個記錄（例如飲食+運動）
3. 為每個記錄分類並提取詳細資訊
4. 從訊息中辨識寵物名字（如果有提到的話）

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
  "summary": "今天飲食正常，運動量充足",
  "mentionedPetName": "小白",
  "extractedWeight": 5.2
}

注意事項：
- mood/severity 使用 1-5 分制（1=很差, 5=很好）
- 如果提到需要提醒的事項（如下次疫苗），提供 reminderSuggestion
- 保持原文的重要細節，不要過度簡化
- 如果無法判斷分類，使用 OTHER
- mentionedPetName: 如果訊息中有提到寵物名字（如「小白今天...」、「咪咪吃了...」），請提取該名字；如果沒有提到則不要包含此欄位
- extractedWeight: 如果訊息中有提到體重數字（如「體重5.2公斤」、「量了體重是4.8kg」、「現在3公斤」），請提取體重數字（轉換為公斤）；如果沒有提到體重則不要包含此欄位`;

export async function parseDiaryInput(
  input: string,
  petName?: string,
  allPetNames?: string[]
): Promise<ParseResult> {
  // 如果沒有 OpenAI API key，直接使用 fallback
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key, using fallback parser');
    return createFallbackResult(input);
  }

  let userMessage = `飼主描述：${input}`;

  if (petName) {
    userMessage = `寵物名字：${petName}\n\n${userMessage}`;
  }

  if (allPetNames && allPetNames.length > 0) {
    userMessage = `用戶的寵物列表：${allPetNames.join('、')}\n\n${userMessage}`;
  }

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

    // 驗證結果：如果 AI 沒有回傳有效的 entries，使用 fallback
    if (!result.entries || result.entries.length === 0) {
      console.log('AI returned empty entries, using fallback');
      return createFallbackResult(input);
    }

    return result;
  } catch (error) {
    console.error('AI parsing error:', error);
    return createFallbackResult(input);
  }
}

// 簡單的關鍵字分類 fallback
function createFallbackResult(input: string): ParseResult {
  const lowerInput = input.toLowerCase();
  let category: ParsedDiaryEntry['category'] = 'OTHER';

  // 簡單關鍵字匹配
  if (/吃|喝|飼料|罐頭|零食|食|餐|飯|餵/.test(input)) {
    category = 'FOOD';
  } else if (/散步|走|跑|玩|運動|睡|遊|溜/.test(input)) {
    category = 'ACTIVITY';
  } else if (/醫|診|疫苗|藥|打針|驅蟲|看病/.test(input)) {
    category = 'MEDICAL';
  } else if (/洗澡|洗|剪|梳|毛|美容|修/.test(input)) {
    category = 'GROOMING';
  } else if (/便|尿|吐|拉|嘔|體重|精神|量|公斤|kg|磅/.test(input)) {
    category = 'HEALTH';
  } else if (/叫|咬|行為|情緒|脾氣/.test(input)) {
    category = 'BEHAVIOR';
  }

  // 嘗試提取體重
  let extractedWeight: number | undefined;
  // 匹配體重數字：支援「體重5.2公斤」、「5.2kg」、「5.2公斤」、「體重是5.2」、「量5公斤」等格式
  const weightMatch = input.match(/(?:體重|量)?[是為]?\s*(\d+(?:\.\d+)?)\s*(?:公斤|kg|KG|千克)/i) ||
                      input.match(/體重[是為]?\s*(\d+(?:\.\d+)?)/) ||
                      input.match(/量[了]?\s*(\d+(?:\.\d+)?)\s*(?:公斤|kg)?/i);
  if (weightMatch) {
    extractedWeight = parseFloat(weightMatch[1]);
    // 合理性檢查：體重應該在 0.1-200 公斤之間
    if (extractedWeight < 0.1 || extractedWeight > 200) {
      extractedWeight = undefined;
    }
  }

  // 生成更好的內容描述
  let content = input;
  if (extractedWeight && category === 'HEALTH') {
    content = `體重測量：${extractedWeight} 公斤`;
  }

  const result: ParseResult = {
    entries: [
      {
        category,
        content,
        details: extractedWeight ? { weight: extractedWeight } : {},
      },
    ],
    summary: input,
  };

  if (extractedWeight !== undefined) {
    result.extractedWeight = extractedWeight;
  }

  return result;
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
