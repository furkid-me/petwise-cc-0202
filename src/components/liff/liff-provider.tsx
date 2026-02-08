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
  const [isRedirecting, setIsRedirecting] = useState(false);
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
          // Mark as redirecting and trigger login
          setIsRedirecting(true);
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

  // Show loading while redirecting to LINE login
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">正在跳轉到 LINE 登入...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">初始化失敗</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

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
