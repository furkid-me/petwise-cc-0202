'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { setUser, setPets } = useUserStore();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();

        // Backend login/register
        const authRes = await fetch('/api/auth/line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: profile.userId,
            displayName: profile.displayName,
            profilePictureUrl: profile.pictureUrl,
          }),
        });

        if (!authRes.ok) throw new Error('Auth failed');

        const { token, user } = await authRes.json();
        localStorage.setItem('petwise_jwt', token);
        localStorage.setItem('petwise_user_id', user.id);
        setUser(user);

        // Fetch pets
        const petsRes = await fetch('/api/pets', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (petsRes.ok) {
          const { pets } = await petsRes.json();
          setPets(pets);
          if (pets.length === 0) {
            router.push('/pets/new');
          }
        }
      } catch (err) {
        console.error('LIFF init error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    useUserStore.persist.rehydrate();
    initLiff();
  }, [router, setUser, setPets]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return <>{children}</>;
}
