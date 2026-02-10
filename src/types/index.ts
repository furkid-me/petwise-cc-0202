// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  email: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  timezone: string;
  language: string;
  notifyEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionPlan = 'FREE' | 'STANDARD' | 'PREMIUM';

// Pet Types
export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  gender: PetGender | null;
  birthday: Date | null;
  adoptionDate: Date | null;
  color: string | null;
  weight: number | null;
  photoUrl: string | null;
  isNeutered: boolean;
  microchipId: string | null;
  medicalNotes: string | null;
  allergies: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PetSpecies = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'HAMSTER' | 'FISH' | 'REPTILE' | 'OTHER';
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface CreatePetInput {
  name: string;
  species: PetSpecies;
  breed?: string;
  gender?: PetGender;
  birthday?: string;
  adoptionDate?: string;
  color?: string;
  weight?: number;
  photoUrl?: string;
  isNeutered?: boolean;
  microchipId?: string;
  medicalNotes?: string;
  allergies?: string[];
}

export interface UpdatePetInput extends Partial<CreatePetInput> {
  isDefault?: boolean;
}

// Diary Types
export interface Diary {
  id: string;
  userId: string;
  petId: string;
  rawInput: string | null;
  category: DiaryCategory;
  subCategory: string | null;
  content: string;
  details: Record<string, unknown> | null;
  mood: number | null;
  severity: number | null;
  photos: string[];
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isImportant: boolean;
  pet?: Pet;
  tags?: Tag[];
}

export type DiaryCategory = 'FOOD' | 'HEALTH' | 'ACTIVITY' | 'MEDICAL' | 'GROOMING' | 'BEHAVIOR' | 'OTHER';

export interface CreateDiaryInput {
  petId: string;
  rawInput?: string;
  category?: DiaryCategory;
  subCategory?: string;
  content?: string;
  details?: Record<string, unknown>;
  mood?: number;
  severity?: number;
  photos?: string[];
  occurredAt?: string;
  useAiParsing?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

// Reminder Types
export interface Reminder {
  id: string;
  userId: string;
  petId: string | null;
  title: string;
  description: string | null;
  category: ReminderCategory;
  remindAt: Date;
  repeatType: RepeatType;
  repeatInterval: number | null;
  repeatEndAt: Date | null;
  isActive: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  pet?: Pet;
}

export type ReminderCategory = 'VACCINE' | 'DEWORMING' | 'GROOMING' | 'CHECKUP' | 'MEDICATION' | 'FOOD' | 'OTHER';
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface CreateReminderInput {
  petId?: string;
  title: string;
  description?: string;
  category: ReminderCategory;
  remindAt: string;
  repeatType?: RepeatType;
  repeatInterval?: number;
  repeatEndAt?: string;
}

// Stats Types
export interface DiaryStats {
  totalCount: number;
  categoryBreakdown: {
    category: DiaryCategory;
    count: number;
    percentage: number;
  }[];
  dailyAverage: number;
  mostActiveDay: string;
}

export interface PetHealthSummary {
  petId: string;
  petName: string;
  weightTrend: 'up' | 'down' | 'stable';
  activityLevel: 'low' | 'normal' | 'high';
  lastVetVisit: Date | null;
  upcomingReminders: Reminder[];
}

// Subscription Types
export interface SubscriptionLimits {
  maxPets: number;
  maxDailyEntries: number;
  maxPhotosPerEntry: number;
  maxReminders: number;
  retentionDays: number;
  hasAiAnalysis: boolean;
  hasExport: boolean;
  hasFamilyShare: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  FREE: {
    maxPets: 1,
    maxDailyEntries: 5,
    maxPhotosPerEntry: 1,
    maxReminders: 3,
    retentionDays: 30,
    hasAiAnalysis: false,
    hasExport: false,
    hasFamilyShare: false,
  },
  STANDARD: {
    maxPets: 3,
    maxDailyEntries: -1, // unlimited
    maxPhotosPerEntry: 5,
    maxReminders: -1,
    retentionDays: 90,
    hasAiAnalysis: false,
    hasExport: true,
    hasFamilyShare: false,
  },
  PREMIUM: {
    maxPets: -1,
    maxDailyEntries: -1,
    maxPhotosPerEntry: 10,
    maxReminders: -1,
    retentionDays: 365,
    hasAiAnalysis: true,
    hasExport: true,
    hasFamilyShare: true,
  },
};

// Image Upload Types
export interface UploadedImage {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size?: number;
}
