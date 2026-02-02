import { z } from 'zod';

// ==================== Pet Schemas ====================

export const petSpeciesSchema = z.enum([
  'DOG',
  'CAT',
  'BIRD',
  'RABBIT',
  'HAMSTER',
  'FISH',
  'REPTILE',
  'OTHER',
]);

export const petGenderSchema = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);

export const createPetSchema = z.object({
  name: z
    .string()
    .min(1, '請輸入寵物名字')
    .max(50, '名字不能超過 50 個字'),
  species: petSpeciesSchema,
  breed: z.string().max(50, '品種不能超過 50 個字').optional(),
  gender: petGenderSchema.optional(),
  birthday: z.string().datetime().optional().or(z.literal('')),
  adoptionDate: z.string().datetime().optional().or(z.literal('')),
  color: z.string().max(30, '毛色不能超過 30 個字').optional(),
  weight: z
    .number()
    .positive('體重必須大於 0')
    .max(500, '體重不能超過 500 kg')
    .optional(),
  photoUrl: z.string().url('請輸入有效的圖片網址').optional().or(z.literal('')),
  isNeutered: z.boolean().optional(),
  microchipId: z.string().max(20, '晶片號碼不能超過 20 個字').optional(),
  medicalNotes: z.string().max(1000, '醫療備註不能超過 1000 個字').optional(),
  allergies: z.array(z.string().max(50)).max(20, '最多 20 個過敏原').optional(),
});

export const updatePetSchema = createPetSchema.partial().extend({
  isDefault: z.boolean().optional(),
});

// ==================== Diary Schemas ====================

export const diaryCategorySchema = z.enum([
  'FOOD',
  'HEALTH',
  'ACTIVITY',
  'MEDICAL',
  'GROOMING',
  'BEHAVIOR',
  'OTHER',
]);

export const createDiarySchema = z.object({
  petId: z.string().cuid('無效的寵物 ID'),
  rawInput: z.string().max(2000, '內容不能超過 2000 個字').optional(),
  category: diaryCategorySchema.optional(),
  subCategory: z.string().max(50).optional(),
  content: z.string().max(2000, '內容不能超過 2000 個字').optional(),
  details: z.record(z.unknown()).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  severity: z.number().int().min(1).max(5).optional(),
  photos: z.array(z.string().url()).max(10, '最多 10 張照片').optional(),
  occurredAt: z.string().datetime().optional(),
  useAiParsing: z.boolean().optional(),
});

export const updateDiarySchema = createDiarySchema.partial().extend({
  isPinned: z.boolean().optional(),
  isImportant: z.boolean().optional(),
});

export const diaryQuerySchema = z.object({
  petId: z.string().cuid().optional(),
  category: diaryCategorySchema.optional(),
  search: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== Reminder Schemas ====================

export const reminderCategorySchema = z.enum([
  'VACCINE',
  'DEWORMING',
  'GROOMING',
  'CHECKUP',
  'MEDICATION',
  'FOOD',
  'OTHER',
]);

export const repeatTypeSchema = z.enum([
  'NONE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
]);

export const createReminderSchema = z.object({
  petId: z.string().cuid('無效的寵物 ID').optional(),
  title: z
    .string()
    .min(1, '請輸入提醒標題')
    .max(100, '標題不能超過 100 個字'),
  description: z.string().max(500, '說明不能超過 500 個字').optional(),
  category: reminderCategorySchema,
  remindAt: z.string().datetime('請選擇有效的提醒時間'),
  repeatType: repeatTypeSchema.default('NONE'),
  repeatInterval: z.number().int().positive().optional(),
  repeatEndAt: z.string().datetime().optional(),
});

export const updateReminderSchema = createReminderSchema.partial().extend({
  isActive: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

// ==================== User Schemas ====================

export const updateUserSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件').optional().or(z.literal('')),
  timezone: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  notifyEnabled: z.boolean().optional(),
});

// ==================== AI Schemas ====================

export const aiParseSchema = z.object({
  text: z
    .string()
    .min(1, '請輸入要解析的文字')
    .max(2000, '文字不能超過 2000 個字'),
  petId: z.string().cuid().optional(),
});

export const aiAnalyzeSchema = z.object({
  petId: z.string().cuid('請選擇寵物'),
  days: z.number().int().positive().max(365).default(30),
});

// ==================== Auth Schemas ====================

export const lineAuthSchema = z.object({
  accessToken: z.string().min(1, '缺少 access token'),
  idToken: z.string().optional(),
});

// ==================== Helper Functions ====================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || '資料驗證失敗',
      };
    }
    return { success: false, error: '資料驗證失敗' };
  }
}

export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: Partial<T> } | { success: false; error: string } {
  try {
    // Make all fields optional for partial validation
    const partialSchema = schema.partial ? (schema as z.ZodObject<z.ZodRawShape>).partial() : schema;
    const result = partialSchema.parse(data);
    return { success: true, data: result as Partial<T> };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || '資料驗證失敗',
      };
    }
    return { success: false, error: '資料驗證失敗' };
  }
}

// Type exports
export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type CreateDiaryInput = z.infer<typeof createDiarySchema>;
export type UpdateDiaryInput = z.infer<typeof updateDiarySchema>;
export type DiaryQuery = z.infer<typeof diaryQuerySchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AiParseInput = z.infer<typeof aiParseSchema>;
export type AiAnalyzeInput = z.infer<typeof aiAnalyzeSchema>;
