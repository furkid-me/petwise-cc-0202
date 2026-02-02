'use client';

import { useState, useEffect, useCallback } from 'react';
import { initLiff, isLoggedIn, login, logout, getProfile, isInClient, getOS } from '@/lib/liff';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface UseLiffReturn {
  isReady: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  os: string;
  profile: LiffProfile | null;
  error: Error | null;
  login: () => void;
  logout: () => void;
}

export function useLiff(): UseLiffReturn {
  const [isReady, setIsReady] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [os, setOs] = useState('unknown');
  const [inClient, setInClient] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initLiff();
        setIsReady(true);
        setIsUserLoggedIn(isLoggedIn());
        setOs(getOS());
        setInClient(isInClient());

        if (isLoggedIn()) {
          const userProfile = await getProfile();
          setProfile(userProfile as LiffProfile);
        }
      } catch (err) {
        console.error('LIFF initialization error:', err);
        setError(err instanceof Error ? err : new Error('LIFF initialization failed'));
      }
    };

    init();
  }, []);

  const handleLogin = useCallback(() => {
    login();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setProfile(null);
    setIsUserLoggedIn(false);
  }, []);

  return {
    isReady,
    isLoggedIn: isUserLoggedIn,
    isInClient: inClient,
    os,
    profile,
    error,
    login: handleLogin,
    logout: handleLogout,
  };
}
