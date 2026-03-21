import { create } from 'zustand';

interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  profilePictureUrl?: string;
  subscriptionPlan?: string;
}

interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed?: string | null;
  gender?: string | null;
  isNeutered?: boolean | null;
  dateOfBirth?: string | null;
  chipNumber?: string | null;
  initialWeightKg: number;
  dailyKcalTarget?: number | null;
  dailyWaterMlTarget?: number | null;
  healthNotes: string[];
  personalityTraits?: string | null;
  profilePictureUrl?: string | null;
}

export interface Reminder {
  id: string;
  petId: string;
  userId: string;
  title: string;
  type: string; // vaccine, deworming, vet_visit, grooming, life, other
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string | null;
  frequency: string; // once, daily, weekly, monthly, yearly
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  petId: string;
  userId: string;
  taskName: string;
  frequency: string; // daily, weekly
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  isActive: boolean;
  notes: string | null;
  createdAt: string; // 方便排序
}

export interface TaskExecution {
  id: string;
  taskId: string;
  executionDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  notes: string | null;
  createdAt: string; // 執行時間
}

// === 第二階段新增的醫療相關類型定義 ===
interface MedicalRecord {
  id: string;
  userId: string;
  petId: string;
  recordDate: string; // YYYY-MM-DD
  type: string; // vet_visit, checkup, symptom, ongoing_issue
  title?: string | null;
  clinicName?: string | null;
  veterinarian?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  costTwd?: number | null;
  notes?: string | null;
  attachmentUrls?: string[] | null;
  isOngoingIssue: boolean;
  createdAt: string;
}

interface MedicationRecord {
  id: string;
  userId: string;
  petId: string;
  medicalRecordId?: string | null;
  medicationName: string;
  dosageValue: number;
  dosageUnit: string;
  frequency: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  purpose?: string | null;
  sideEffectsObserved?: string | null;
  postMedicationObservations?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

interface ExaminationRecord {
  id: string;
  userId: string;
  petId: string;
  medicalRecordId?: string | null;
  examinationDate: string; // YYYY-MM-DD
  examinationType: string;
  clinicName?: string | null;
  reportUrl?: string | null;
  notes?: string | null;
  results?: Record<string, any> | null;
  createdAt: string;
}

interface UserState {
  user: User | null;
  pets: Pet[];
  activePetId: string | null;
  setUser: (user: User) => void;
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (petId: string, updatedFields: Partial<Pet>) => void;
  setActivePet: (petId: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  pets: [],
  activePetId: null,
  setUser: (user) => set({ user }),
  setPets: (pets) =>
    set((state) => ({
      pets,
      activePetId: pets.length > 0 ? state.activePetId || pets[0].id : null,
    })),
  addPet: (pet) => set((state) => ({ pets: [...state.pets, pet] })),
  updatePet: (petId, updatedFields) =>
    set((state) => ({
      pets: state.pets.map((pet) =>
        pet.id === petId ? { ...pet, ...updatedFields } : pet
      ),
    })),
  setActivePet: (petId) => set({ activePetId: petId }),
  logout: () => set({ user: null, pets: [], activePetId: null }),
}));
