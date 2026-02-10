import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Pet } from '@/types';

interface UserState {
  user: User | null;
  pets: Pet[];
  currentPetId: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  removePet: (petId: string) => void;
  setCurrentPetId: (petId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  pets: [],
  currentPetId: null,
  isLoading: false,
  isInitialized: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setPets: (pets) => {
        const currentPetId = get().currentPetId;
        // 如果當前選擇的寵物不在列表中，自動選擇預設或第一隻
        if (pets.length > 0 && (!currentPetId || !pets.find(p => p.id === currentPetId))) {
          const defaultPet = pets.find(p => p.isDefault) || pets[0];
          set({ pets, currentPetId: defaultPet.id });
        } else {
          set({ pets });
        }
      },

      addPet: (pet) => {
        const pets = [...get().pets, pet];
        // 如果是第一隻或設為預設，更新 currentPetId
        if (pets.length === 1 || pet.isDefault) {
          set({ pets, currentPetId: pet.id });
        } else {
          set({ pets });
        }
      },

      updatePet: (petId, updates) => {
        set({
          pets: get().pets.map(p =>
            p.id === petId ? { ...p, ...updates } : p
          ),
        });
      },

      removePet: (petId) => {
        const newPets = get().pets.filter(p => p.id !== petId);
        const currentPetId = get().currentPetId;

        if (currentPetId === petId && newPets.length > 0) {
          const defaultPet = newPets.find(p => p.isDefault) || newPets[0];
          set({ pets: newPets, currentPetId: defaultPet.id });
        } else {
          set({ pets: newPets });
        }
      },

      setCurrentPetId: (petId) => set({ currentPetId: petId }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      reset: () => set(initialState),
    }),
    {
      name: 'petwise-user-store',
      partialize: (state) => ({
        user: state.user,
        pets: state.pets,
        currentPetId: state.currentPetId,
      }),
    }
  )
);

// Selectors
export const useCurrentPet = () => {
  const pets = useUserStore(state => state.pets);
  const currentPetId = useUserStore(state => state.currentPetId);
  return pets.find(p => p.id === currentPetId) || pets[0] || null;
};

export const useSubscriptionPlan = () => {
  return useUserStore(state => state.user?.subscriptionPlan || 'FREE');
};
