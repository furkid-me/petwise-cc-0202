'use client';

import { LiffProvider } from '@/components/liff/liff-provider';
import { BottomNav } from '@/components/liff/bottom-nav';

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiffProvider>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    </LiffProvider>
  );
}
