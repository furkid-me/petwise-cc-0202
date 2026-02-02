'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initLiff, isLoggedIn, getProfile, getAccessToken, login } from '@/lib/liff';
import { api } from '@/hooks/use-api';
import { useUserStore } from '@/stores/user-store';
import { PageLoading } from '@/components/ui/loading';
import type { User, Pet } from '@/types';

interface LiffContextType {
  isReady: boolean;
  isLoggedIn: boolean;
  lineProfile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
  error: Error | null;
}

const LiffContext = createContext<LiffContextType>({
  isReady: false,
  isLoggedIn: false,
  lineProfile: null,
  error: null,
});

export function useLiffContext() {
  return useContext(LiffContext);
}

interface LiffProviderProps {
  children: ReactNode;
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [lineProfile, setLineProfile] = useState<LiffContextType['lineProfile']>(null);
  const [error, setError] = useState<Error | null>(null);

  const { setUser, setPets, setLoading, setInitialized } = useUserStore();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Initialize LIFF
        await initLiff();

        // Check if user is logged in
        if (!isLoggedIn()) {
          // Redirect to LINE login
          login();
          return;
        }

        // Get LINE profile
        const profile = await getProfile();
        setLineProfile({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        });

        // Authenticate with our backend
        const accessToken = getAccessToken();
        if (accessToken) {
          const authResult = await api.auth.login(accessToken);

          if (authResult.success && authResult.data) {
            const { user } = authResult.data as { user: User };
            setUser(user);

            // Fetch user's pets
            const petsResult = await api.pets.list();
            if (petsResult.success && petsResult.data) {
              setPets(petsResult.data as Pet[]);
            }
          }
        }

        setIsReady(true);
        setInitialized(true);
      } catch (err) {
        console.error('LIFF initialization error:', err);
        setError(err instanceof Error ? err : new Error('LIFF initialization failed'));
        setIsReady(true); // Still mark as ready to show error state
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [setUser, setPets, setLoading, setInitialized]);

  if (!isReady) {
    return <PageLoading />;
  }

  return (
    <LiffContext.Provider
      value={{
        isReady,
        isLoggedIn: isLoggedIn(),
        lineProfile,
        error,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}
