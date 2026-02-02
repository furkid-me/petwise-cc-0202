import { create } from 'zustand';
import type { Diary, DiaryCategory } from '@/types';

interface DiaryFilter {
  petId?: string;
  category?: DiaryCategory;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

interface DiaryState {
  diaries: Diary[];
  filter: DiaryFilter;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // Draft for new diary
  draftInput: string;
  draftPhotos: string[];

  // Actions
  setDiaries: (diaries: Diary[]) => void;
  addDiary: (diary: Diary) => void;
  addDiaries: (diaries: Diary[]) => void;
  updateDiary: (diaryId: string, updates: Partial<Diary>) => void;
  removeDiary: (diaryId: string) => void;
  setFilter: (filter: Partial<DiaryFilter>) => void;
  clearFilter: () => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setDraftInput: (input: string) => void;
  setDraftPhotos: (photos: string[]) => void;
  addDraftPhoto: (photo: string) => void;
  removeDraftPhoto: (index: number) => void;
  clearDraft: () => void;
  reset: () => void;
}

const initialState = {
  diaries: [],
  filter: {},
  isLoading: false,
  hasMore: true,
  page: 1,
  draftInput: '',
  draftPhotos: [],
};

export const useDiaryStore = create<DiaryState>((set, get) => ({
  ...initialState,

  setDiaries: (diaries) => set({ diaries }),

  addDiary: (diary) => {
    // 插入到正確的位置（按時間排序）
    const diaries = [...get().diaries];
    const insertIndex = diaries.findIndex(
      d => new Date(d.occurredAt) < new Date(diary.occurredAt)
    );

    if (insertIndex === -1) {
      diaries.push(diary);
    } else {
      diaries.splice(insertIndex, 0, diary);
    }

    set({ diaries });
  },

  addDiaries: (newDiaries) => {
    const existingIds = new Set(get().diaries.map(d => d.id));
    const uniqueNewDiaries = newDiaries.filter(d => !existingIds.has(d.id));
    set({ diaries: [...get().diaries, ...uniqueNewDiaries] });
  },

  updateDiary: (diaryId, updates) => {
    set({
      diaries: get().diaries.map(d =>
        d.id === diaryId ? { ...d, ...updates } : d
      ),
    });
  },

  removeDiary: (diaryId) => {
    set({
      diaries: get().diaries.filter(d => d.id !== diaryId),
    });
  },

  setFilter: (filter) => {
    set({
      filter: { ...get().filter, ...filter },
      page: 1,
      diaries: [],
      hasMore: true,
    });
  },

  clearFilter: () => {
    set({
      filter: {},
      page: 1,
      diaries: [],
      hasMore: true,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setHasMore: (hasMore) => set({ hasMore }),

  setPage: (page) => set({ page }),

  setDraftInput: (draftInput) => set({ draftInput }),

  setDraftPhotos: (draftPhotos) => set({ draftPhotos }),

  addDraftPhoto: (photo) => {
    set({ draftPhotos: [...get().draftPhotos, photo] });
  },

  removeDraftPhoto: (index) => {
    const photos = [...get().draftPhotos];
    photos.splice(index, 1);
    set({ draftPhotos: photos });
  },

  clearDraft: () => set({ draftInput: '', draftPhotos: [] }),

  reset: () => set(initialState),
}));

// Selectors
export const useFilteredDiaries = () => {
  const diaries = useDiaryStore(state => state.diaries);
  const filter = useDiaryStore(state => state.filter);

  return diaries.filter(diary => {
    if (filter.petId && diary.petId !== filter.petId) return false;
    if (filter.category && diary.category !== filter.category) return false;
    if (filter.startDate && new Date(diary.occurredAt) < filter.startDate) return false;
    if (filter.endDate && new Date(diary.occurredAt) > filter.endDate) return false;
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        diary.content.toLowerCase().includes(query) ||
        diary.rawInput?.toLowerCase().includes(query)
      );
    }
    return true;
  });
};

export const useTodayDiaries = () => {
  const diaries = useDiaryStore(state => state.diaries);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return diaries.filter(diary => {
    const diaryDate = new Date(diary.occurredAt);
    diaryDate.setHours(0, 0, 0, 0);
    return diaryDate.getTime() === today.getTime();
  });
};
