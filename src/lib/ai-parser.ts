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
  mentionedPetName?: string;
  extractedWeight?: number;
}

// 健康警示關鍵字（需要特別注意的症狀）
const HEALTH_WARNINGS: Record<string, { keywords: RegExp; warning: string; severity: number }> = {
  vomiting: {
    keywords: /吐|嘔|反胃/,
    warning: '嘔吐可能是消化問題或其他疾病的徵兆，若持續發生請就醫',
    severity: 3,
  },
  diarrhea: {
    keywords: /拉肚子|腹瀉|軟便|水便|稀便/,
    warning: '腹瀉可能導致脫水，請注意補充水分，若持續超過24小時請就醫',
    severity: 3,
  },
  bloodInStool: {
    keywords: /便血|血便|大便有血/,
    warning: '便血是嚴重警訊，請盡快就醫檢查',
    severity: 5,
  },
  noAppetite: {
    keywords: /不吃|沒食慾|食慾不振|不想吃|吃不下/,
    warning: '食慾下降可能是身體不適的訊號，請觀察其他症狀',
    severity: 2,
  },
  lethargy: {
    keywords: /沒精神|精神不好|懶懶的|不愛動|無精打采|虛弱/,
    warning: '精神不振可能代表身體不舒服，請持續觀察',
    severity: 2,
  },
  coughing: {
    keywords: /咳嗽|咳|乾咳/,
    warning: '持續咳嗽可能是呼吸道問題，建議就醫檢查',
    severity: 3,
  },
  breathing: {
    keywords: /喘|呼吸急促|呼吸困難|喘氣/,
    warning: '呼吸異常需要立即關注，若情況嚴重請立即就醫',
    severity: 4,
  },
  limping: {
    keywords: /跛|一拐一拐|腳痛|不敢踩|走路怪怪/,
    warning: '行動異常可能是受傷或關節問題，建議檢查',
    severity: 3,
  },
  scratching: {
    keywords: /一直抓|狂抓|皮膚|紅腫|掉毛嚴重/,
    warning: '持續抓癢可能是皮膚問題或過敏，建議就醫',
    severity: 2,
  },
  eyeIssue: {
    keywords: /眼睛紅|眼屎多|流眼淚|眼睛腫/,
    warning: '眼睛異常需要注意，若持續請就醫',
    severity: 2,
  },
  urineIssue: {
    keywords: /尿血|血尿|頻尿|尿不出來|尿很少/,
    warning: '泌尿問題可能很緊急，特別是尿不出來，請盡快就醫',
    severity: 4,
  },
  weightLoss: {
    keywords: /變瘦|消瘦|體重下降|越來越瘦/,
    warning: '體重明顯下降可能是健康問題的徵兆，建議就醫檢查',
    severity: 3,
  },
};

const SYSTEM_PROMPT = `你是專業的寵物日記助手，專門解析台灣飼主對寵物的口語化描述。

## 任務
將用戶的口語化輸入解析成結構化的日記記錄，一個輸入可能包含多個記錄。

## 分類規則（嚴格依照以下定義）

**FOOD 飲食**：吃東西、喝水、零食、飼料、罐頭、鮮食、保健品、食慾
- 範例：「吃了飼料」「喝很多水」「給零食」「食慾很好」

**HEALTH 健康**：排泄（大便、尿尿）、體重、精神狀態、身體狀況、症狀
- 範例：「大便正常」「尿尿顏色正常」「體重5公斤」「精神很好」「有點懶懶的」

**ACTIVITY 活動**：散步、運動、玩耍、睡眠、外出
- 範例：「散步30分鐘」「在家玩球」「睡很久」「去公園跑步」

**MEDICAL 醫療**：疫苗、驅蟲、看診、吃藥、打針、健檢、手術
- 範例：「打疫苗」「吃驅蟲藥」「看醫生」「回診」

**GROOMING 美容**：洗澡、梳毛、剪指甲、剃毛、清耳朵、刷牙
- 範例：「洗澡了」「梳毛15分鐘」「剪指甲」「清耳朵」

**BEHAVIOR 行為**：情緒、特殊行為、與人互動、叫聲、異常舉動
- 範例：「今天很黏人」「一直叫」「學會握手」「對陌生人吠叫」

**OTHER 其他**：無法歸類的內容

## 體重提取規則
當訊息中提到體重時，提取數字並轉換為公斤：
- 「5公斤」「5kg」「5KG」→ 5
- 「5.2公斤」→ 5.2
- 「4800克」「4800g」→ 4.8
- 「10磅」→ 4.54（1磅=0.454公斤）

## 健康警示偵測
偵測以下症狀並在 healthWarning 中標記：
- 嘔吐、腹瀉、便血、食慾不振
- 精神不振、咳嗽、呼吸異常
- 跛行、皮膚問題、眼睛異常
- 泌尿問題（血尿、頻尿、尿不出來）
- 明顯體重下降

## 輸出格式（JSON）
{
  "entries": [
    {
      "category": "FOOD",
      "subCategory": "主食",
      "content": "早上吃了一碗飼料，食慾很好",
      "details": {
        "mealType": "早餐",
        "foodType": "飼料",
        "amount": "一碗",
        "appetite": "好"
      },
      "mood": 4,
      "severity": null,
      "tags": ["正常飲食"]
    }
  ],
  "summary": "簡短摘要",
  "mentionedPetName": "小白",
  "extractedWeight": 5.2,
  "healthWarning": "偵測到嘔吐症狀，若持續請就醫"
}

## 注意事項
- mood: 1-5分（1=很差, 5=很好），僅用於正面記錄
- severity: 1-5分（1=輕微, 5=嚴重），僅用於負面症狀
- 保持原文重要細節
- mentionedPetName: 僅當訊息中明確提到寵物名字時才填寫
- healthWarning: 僅當偵測到需要注意的症狀時才填寫`;

export async function parseDiaryInput(
  input: string,
  petName?: string,
  allPetNames?: string[]
): Promise<ParseResult> {
  // 先進行本地健康警示檢測
  const localHealthWarning = detectHealthWarnings(input);

  // 如果沒有 OpenAI API key，使用強化的 fallback
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key, using fallback parser');
    const result = createFallbackResult(input, allPetNames);
    if (localHealthWarning && !result.healthWarning) {
      result.healthWarning = localHealthWarning;
    }
    return result;
  }

  let userMessage = `飼主描述：${input}`;

  if (petName) {
    userMessage = `目前選擇的寵物：${petName}\n\n${userMessage}`;
  }

  if (allPetNames && allPetNames.length > 0) {
    userMessage = `用戶的所有寵物：${allPetNames.join('、')}\n\n${userMessage}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // 降低溫度提高一致性
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content) as ParseResult;

    // 驗證結果
    if (!result.entries || result.entries.length === 0) {
      console.log('AI returned empty entries, using fallback');
      const fallback = createFallbackResult(input, allPetNames);
      if (localHealthWarning && !fallback.healthWarning) {
        fallback.healthWarning = localHealthWarning;
      }
      return fallback;
    }

    // 補充本地健康警示檢測（如果 AI 沒有偵測到）
    if (localHealthWarning && !result.healthWarning) {
      result.healthWarning = localHealthWarning;
    }

    return result;
  } catch (error) {
    console.error('AI parsing error:', error);
    const fallback = createFallbackResult(input, allPetNames);
    if (localHealthWarning && !fallback.healthWarning) {
      fallback.healthWarning = localHealthWarning;
    }
    return fallback;
  }
}

// 本地健康警示偵測
function detectHealthWarnings(input: string): string | undefined {
  const warnings: Array<{ warning: string; severity: number }> = [];

  for (const [, config] of Object.entries(HEALTH_WARNINGS)) {
    if (config.keywords.test(input)) {
      warnings.push({ warning: config.warning, severity: config.severity });
    }
  }

  if (warnings.length === 0) {
    return undefined;
  }

  // 按嚴重度排序，回傳最嚴重的警示
  warnings.sort((a, b) => b.severity - a.severity);
  return warnings[0].warning;
}

// 強化的 fallback 解析器
function createFallbackResult(input: string, allPetNames?: string[]): ParseResult {
  const entries: ParsedDiaryEntry[] = [];
  let mentionedPetName: string | undefined;

  // 嘗試辨識寵物名字
  if (allPetNames && allPetNames.length > 0) {
    for (const name of allPetNames) {
      if (input.includes(name)) {
        mentionedPetName = name;
        break;
      }
    }
  }

  // 分析輸入可能包含的多個主題
  const topics = analyzeTopics(input);

  if (topics.length === 0) {
    // 無法辨識，歸類為 OTHER
    entries.push({
      category: 'OTHER',
      content: input,
      details: {},
    });
  } else {
    for (const topic of topics) {
      entries.push({
        category: topic.category,
        content: topic.content,
        details: topic.details,
        severity: topic.severity,
      });
    }
  }

  // 提取體重
  const extractedWeight = extractWeight(input);

  // 健康警示
  const healthWarning = detectHealthWarnings(input);

  const result: ParseResult = {
    entries,
    summary: input,
  };

  if (mentionedPetName) {
    result.mentionedPetName = mentionedPetName;
  }

  if (extractedWeight !== undefined) {
    result.extractedWeight = extractedWeight;
  }

  if (healthWarning) {
    result.healthWarning = healthWarning;
  }

  return result;
}

interface Topic {
  category: ParsedDiaryEntry['category'];
  content: string;
  details: Record<string, unknown>;
  severity?: number;
}

// 主題分析
function analyzeTopics(input: string): Topic[] {
  const topics: Topic[] = [];

  // 飲食相關
  if (/吃|喝|飼料|罐頭|零食|食|餐|飯|餵|鮮食|飲食|食慾/.test(input)) {
    const appetite = /食慾很好|吃很多|吃光/.test(input) ? '好' :
                     /食慾不好|不吃|吃不下|沒食慾/.test(input) ? '差' : '正常';
    topics.push({
      category: 'FOOD',
      content: extractRelevantContent(input, /吃|喝|飼料|罐頭|零食|食|餐|飯|餵|鮮食|食慾/),
      details: { appetite },
      severity: appetite === '差' ? 2 : undefined,
    });
  }

  // 活動相關
  if (/散步|走|跑|玩|運動|睡|遊|溜|公園|外出/.test(input)) {
    const durationMatch = input.match(/(\d+)\s*(?:分鐘|分|小時|hr)/);
    topics.push({
      category: 'ACTIVITY',
      content: extractRelevantContent(input, /散步|走|跑|玩|運動|睡|遊|溜|公園|外出/),
      details: durationMatch ? { duration: durationMatch[0] } : {},
    });
  }

  // 醫療相關
  if (/醫|診|疫苗|藥|打針|驅蟲|看病|健檢|手術|回診/.test(input)) {
    topics.push({
      category: 'MEDICAL',
      content: extractRelevantContent(input, /醫|診|疫苗|藥|打針|驅蟲|看病|健檢|手術|回診/),
      details: {},
    });
  }

  // 美容相關
  if (/洗澡|洗|剪|梳|毛|美容|修|清耳|刷牙|指甲/.test(input)) {
    topics.push({
      category: 'GROOMING',
      content: extractRelevantContent(input, /洗澡|洗|剪|梳|毛|美容|修|清耳|刷牙|指甲/),
      details: {},
    });
  }

  // 健康相關（排泄、體重、精神）
  if (/便|尿|吐|拉|嘔|體重|精神|量|公斤|kg|磅|克|大便|小便|排泄/.test(input)) {
    const weight = extractWeight(input);
    const severity = /吐|嘔|拉肚子|血/.test(input) ? 3 : undefined;
    topics.push({
      category: 'HEALTH',
      content: weight ? `體重 ${weight} 公斤` : extractRelevantContent(input, /便|尿|吐|拉|嘔|體重|精神|大便|小便/),
      details: weight ? { weight } : {},
      severity,
    });
  }

  // 行為相關
  if (/叫|咬|行為|情緒|脾氣|黏人|興奮|害怕|緊張|攻擊/.test(input)) {
    topics.push({
      category: 'BEHAVIOR',
      content: extractRelevantContent(input, /叫|咬|行為|情緒|脾氣|黏人|興奮|害怕|緊張|攻擊/),
      details: {},
    });
  }

  return topics;
}

// 提取相關內容
function extractRelevantContent(input: string, pattern: RegExp): string {
  // 簡單處理：回傳原始輸入
  // 更複雜的實作可以只提取相關句子
  return input;
}

// 體重提取
function extractWeight(input: string): number | undefined {
  // 公斤
  let match = input.match(/(\d+(?:\.\d+)?)\s*(?:公斤|kg|KG|千克)/i);
  if (match) {
    const weight = parseFloat(match[1]);
    if (weight >= 0.1 && weight <= 200) return weight;
  }

  // 克
  match = input.match(/(\d+(?:\.\d+)?)\s*(?:克|g|G)(?!斤)/i);
  if (match) {
    const weight = parseFloat(match[1]) / 1000;
    if (weight >= 0.1 && weight <= 200) return Math.round(weight * 100) / 100;
  }

  // 磅
  match = input.match(/(\d+(?:\.\d+)?)\s*(?:磅|lb|lbs)/i);
  if (match) {
    const weight = parseFloat(match[1]) * 0.454;
    if (weight >= 0.1 && weight <= 200) return Math.round(weight * 100) / 100;
  }

  // 體重 + 數字（無單位，預設公斤）
  match = input.match(/體重[是為]?\s*(\d+(?:\.\d+)?)/);
  if (match) {
    const weight = parseFloat(match[1]);
    if (weight >= 0.1 && weight <= 200) return weight;
  }

  // 量 + 數字
  match = input.match(/量[了]?\s*(\d+(?:\.\d+)?)\s*(?:公斤|kg)?/i);
  if (match) {
    const weight = parseFloat(match[1]);
    if (weight >= 0.1 && weight <= 200) return weight;
  }

  return undefined;
}

// 圖片分析提示詞（支援多種圖片類型）
const IMAGE_ANALYSIS_PROMPT = `你是專業的寵物照片與文件分析助手。請分析這張圖片，判斷類型並提取相關資訊。

## 第一步：判斷圖片類型
1. **pet_photo** - 寵物照片（有寵物出現）
2. **medical_document** - 醫療文件（健檢報告、診斷證明、病歷、處方籤、疫苗證明）
3. **food_package** - 飼料/零食包裝（寵物食品、罐頭、零食袋）
4. **receipt** - 收據/發票（獸醫院、寵物店消費）
5. **other** - 其他無法辨識

## 根據類型分析

### pet_photo 寵物照片
- 辨識寵物類型、品種
- 描述活動狀態
- 觀察健康狀況（眼睛、皮膚、體態）

### medical_document 醫療文件
- **必須使用 OCR 讀取所有文字**
- 提取：醫院名稱、就診日期、診斷內容、檢驗數值、醫囑建議
- 識別異常指標（標記紅字、超標數值）
- 疫苗/驅蟲記錄：品牌、批號、下次施打日期

### food_package 飼料/零食包裝
- **必須使用 OCR 讀取包裝文字**
- 提取：品牌名稱、產品名稱、口味、重量規格
- 識別：適用寵物類型、主要成分（如有標示）

### receipt 收據/發票
- **必須使用 OCR 讀取**
- 提取：商店名稱、日期、消費項目、金額

## 輸出格式（JSON）
{
  "imageType": "pet_photo|medical_document|food_package|receipt|other",
  "petType": "狗/貓/其他（如可辨識）",
  "breed": "品種或null",
  "activity": "活動描述（寵物照片用）",

  "ocrText": "完整 OCR 文字內容",

  "medicalRecord": {
    "hospitalName": "醫院名稱",
    "visitDate": "就診日期 YYYY-MM-DD",
    "diagnosis": "診斷內容",
    "testResults": [
      {"item": "檢驗項目", "value": "數值", "unit": "單位", "isAbnormal": true/false, "reference": "參考範圍"}
    ],
    "medications": ["處方藥物"],
    "doctorNotes": "醫囑建議",
    "vaccineInfo": {"name": "疫苗名稱", "brand": "品牌", "nextDate": "下次日期"},
    "cost": "費用金額"
  },

  "foodInfo": {
    "brand": "品牌名稱",
    "productName": "產品名稱",
    "flavor": "口味",
    "weight": "重量規格",
    "petType": "適用寵物",
    "mainIngredients": ["主要成分"]
  },

  "entries": [
    {
      "category": "MEDICAL|FOOD|HEALTH|ACTIVITY|OTHER",
      "content": "記錄內容摘要",
      "details": {},
      "severity": null
    }
  ],
  "healthObservations": ["健康相關觀察"],
  "summary": "簡短總結",
  "healthWarning": "需要注意的健康警示（如有異常指標）"
}

## 分類規則
- 醫療文件 → MEDICAL
- 飼料/零食 → FOOD
- 寵物活動照 → ACTIVITY
- 健康觀察 → HEALTH

## 注意事項
- OCR 時請仔細辨識所有可見文字，包括小字
- 醫療數值異常（超出參考範圍）要標記 isAbnormal: true
- 如果完全無法辨識，回傳 {"imageType": "other", "error": "unrecognized"}
- 圖片模糊無法分析，回傳 {"imageType": "other", "error": "unclear_image"}`;

export interface MedicalRecord {
  hospitalName?: string;
  visitDate?: string;
  diagnosis?: string;
  testResults?: Array<{
    item: string;
    value: string;
    unit?: string;
    isAbnormal?: boolean;
    reference?: string;
  }>;
  medications?: string[];
  doctorNotes?: string;
  vaccineInfo?: {
    name?: string;
    brand?: string;
    nextDate?: string;
  };
  cost?: string;
}

export interface FoodInfo {
  brand?: string;
  productName?: string;
  flavor?: string;
  weight?: string;
  petType?: string;
  mainIngredients?: string[];
}

export interface ImageAnalysisResult {
  imageType?: 'pet_photo' | 'medical_document' | 'food_package' | 'receipt' | 'other';
  petType?: string;
  breed?: string;
  activity?: string;
  ocrText?: string;
  medicalRecord?: MedicalRecord;
  foodInfo?: FoodInfo;
  entries: ParsedDiaryEntry[];
  healthObservations?: string[];
  summary: string;
  healthWarning?: string;
  error?: string;
}

/**
 * 使用 AI 視覺分析圖片（支援寵物照片、醫療文件、飼料包裝）
 */
export async function analyzeImageWithAI(
  imageBase64: string,
  contentType: string = 'image/jpeg'
): Promise<ImageAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key, returning fallback for image');
    return {
      imageType: 'other',
      entries: [{
        category: 'OTHER',
        content: '收到一張照片',
        details: { source: 'image' },
      }],
      summary: '收到一張照片（AI 分析功能未啟用）',
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 Vision
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${contentType};base64,${imageBase64}`,
                detail: 'high', // 使用高解析度以支援 OCR
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000, // 增加 token 以容納更多 OCR 文字
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content) as ImageAnalysisResult;

    // 處理錯誤情況
    if (result.error) {
      return result;
    }

    // 根據圖片類型生成適當的 entries
    if (!result.entries || result.entries.length === 0) {
      result.entries = generateEntriesFromAnalysis(result);
    }

    // 從醫療報告中提取健康警告
    if (result.imageType === 'medical_document' && result.medicalRecord?.testResults) {
      const abnormalResults = result.medicalRecord.testResults.filter(t => t.isAbnormal);
      if (abnormalResults.length > 0 && !result.healthWarning) {
        result.healthWarning = `檢驗報告有 ${abnormalResults.length} 項異常指標：${abnormalResults.map(t => t.item).join('、')}`;
      }
    }

    return result;
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      imageType: 'other',
      entries: [{
        category: 'OTHER',
        content: '收到一張照片',
        details: { source: 'image' },
      }],
      summary: '圖片分析失敗',
      error: 'analysis_failed',
    };
  }
}

/**
 * 根據分析結果生成日記 entries
 */
function generateEntriesFromAnalysis(result: ImageAnalysisResult): ParsedDiaryEntry[] {
  const entries: ParsedDiaryEntry[] = [];

  switch (result.imageType) {
    case 'medical_document': {
      const record = result.medicalRecord;
      let content = '';
      const details: Record<string, unknown> = { source: 'image', documentType: 'medical' };

      if (record?.diagnosis) {
        content = record.diagnosis;
      } else if (record?.vaccineInfo?.name) {
        content = `施打疫苗：${record.vaccineInfo.name}`;
        if (record.vaccineInfo.brand) {
          content += `（${record.vaccineInfo.brand}）`;
        }
      } else {
        content = result.summary || '健檢記錄';
      }

      if (record?.hospitalName) details.hospital = record.hospitalName;
      if (record?.visitDate) details.visitDate = record.visitDate;
      if (record?.testResults) details.testResults = record.testResults;
      if (record?.medications) details.medications = record.medications;
      if (record?.doctorNotes) details.doctorNotes = record.doctorNotes;
      if (record?.vaccineInfo) details.vaccineInfo = record.vaccineInfo;
      if (record?.cost) details.cost = record.cost;
      if (result.ocrText) details.ocrText = result.ocrText;

      entries.push({
        category: 'MEDICAL',
        content,
        details,
        severity: result.medicalRecord?.testResults?.some(t => t.isAbnormal) ? 3 : undefined,
      });
      break;
    }

    case 'food_package': {
      const food = result.foodInfo;
      let content = '';
      const details: Record<string, unknown> = { source: 'image', documentType: 'food_package' };

      if (food?.brand && food?.productName) {
        content = `${food.brand} ${food.productName}`;
      } else if (food?.brand) {
        content = food.brand;
      } else if (food?.productName) {
        content = food.productName;
      } else {
        content = result.summary || '寵物食品';
      }

      if (food?.flavor) {
        content += `（${food.flavor}）`;
        details.flavor = food.flavor;
      }

      if (food?.brand) details.brand = food.brand;
      if (food?.productName) details.productName = food.productName;
      if (food?.weight) details.weight = food.weight;
      if (food?.petType) details.petType = food.petType;
      if (food?.mainIngredients) details.mainIngredients = food.mainIngredients;

      entries.push({
        category: 'FOOD',
        subCategory: '飼料/零食',
        content,
        details,
      });
      break;
    }

    case 'receipt': {
      entries.push({
        category: 'OTHER',
        subCategory: '消費記錄',
        content: result.summary || '消費記錄',
        details: {
          source: 'image',
          documentType: 'receipt',
          ocrText: result.ocrText,
        },
      });
      break;
    }

    case 'pet_photo':
    default: {
      entries.push({
        category: result.activity ? 'ACTIVITY' : 'OTHER',
        content: result.activity || result.summary || '收到一張照片',
        details: {
          source: 'image',
          petType: result.petType,
          breed: result.breed,
        },
      });
      break;
    }
  }

  return entries;
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
