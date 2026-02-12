'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiaryCard } from '@/components/diary/diary-card';
import { DiaryInput } from '@/components/diary/diary-input';
import { PetSelector } from '@/components/liff/pet-selector';
import { ContentLoading } from '@/components/ui/loading';
import { useUserStore, useCurrentPet } from '@/stores/user-store';
import { useDiaryStore, useTodayDiaries } from '@/stores/diary-store';
import { api } from '@/hooks/use-api';
import { formatDate, getSpeciesEmoji, getPetAge } from '@/lib/utils';
import type { Diary } from '@/types';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const pets = useUserStore((state) => state.pets);
  const currentPet = useCurrentPet();
  const { setDiaries } = useDiaryStore();
  const todayDiaries = useTodayDiaries();

  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentPet) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const result = await api.diaries.list({ petId: currentPet.id, limit: 20 });
      if (result.success && result.data) {
        setDiaries(result.data as Diary[]);
      }
      setIsLoading(false);
    };

    fetchDiaries();
  }, [currentPet, setDiaries]);

  // No pets - show onboarding
  if (pets.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-6xl">🐾</div>
        <h1 className="mb-2 text-2xl font-bold">歡迎使用 PetWise!</h1>
        <p className="mb-6 text-muted-foreground">
          讓我們開始記錄毛小孩的生活點滴吧
        </p>
        <Link href="/pets/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            新增第一隻寵物
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {user?.displayName ? `${user.displayName}，` : ''}你好！
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(), 'date')}
          </p>
        </div>
        <PetSelector />
      </div>

      {/* Current Pet Card */}
      {currentPet && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              {currentPet.photoUrl ? (
                <img
                  src={currentPet.photoUrl}
                  alt={currentPet.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getSpeciesEmoji(currentPet.species)
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{currentPet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentPet.breed || '未設定品種'}
                {currentPet.birthday && ` · ${getPetAge(currentPet.birthday)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Input */}
      <div className="mb-6">
        <DiaryInput />
      </div>

      {/* Today's Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            今日記錄
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {todayDiaries.length} 則
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <ContentLoading />
          ) : todayDiaries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>今天還沒有記錄</p>
              <p className="text-sm">用上方的輸入框開始記錄吧！</p>
            </div>
          ) : (
            todayDiaries.map((diary) => (
              <DiaryCard key={diary.id} diary={diary} />
            ))
          )}

          {/* 查看全部記錄連結 */}
          <div className="pt-2 text-center">
            <Link href="/diary/history">
              <Button variant="ghost" size="sm" className="text-primary">
                查看全部記錄 →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
