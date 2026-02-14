'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Calendar, RefreshCw, Bell, ChevronRight, BarChart3 } from 'lucide-react';
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
import type { Diary, Pet } from '@/types';

interface Reminder {
  id: string;
  title: string;
  category: string;
  remindAt: string;
  pet?: { name: string } | null;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const hasFetched = useRef(false);
  const user = useUserStore((state) => state.user);
  const pets = useUserStore((state) => state.pets);
  const setPets = useUserStore((state) => state.setPets);
  const currentPet = useCurrentPet();
  const currentPetId = currentPet?.id;
  const { setDiaries } = useDiaryStore();
  const todayDiaries = useTodayDiaries();

  // Initial fetch only once per pet
  useEffect(() => {
    const fetchData = async () => {
      if (!currentPetId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Fetch diaries and reminders in parallel
      const [diariesResult, remindersResult] = await Promise.all([
        api.diaries.list({ petId: currentPetId, limit: 20 }),
        api.reminders.list(),
      ]);

      if (diariesResult.success && diariesResult.data) {
        setDiaries(diariesResult.data as Diary[]);
      }

      if (remindersResult.success && remindersResult.data) {
        // Filter upcoming reminders (next 7 days)
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = (remindersResult.data as Reminder[])
          .filter(r => {
            const remindAt = new Date(r.remindAt);
            return remindAt >= now && remindAt <= weekLater;
          })
          .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())
          .slice(0, 3);
        setUpcomingReminders(upcoming);
      }

      setIsLoading(false);
      hasFetched.current = true;
    };

    fetchData();
  }, [currentPetId, setDiaries]);

  const handleRefresh = async () => {
    if (!currentPetId) return;

    setIsRefreshing(true);

    // Fetch fresh pets data
    const petsResult = await api.pets.list();
    if (petsResult.success && petsResult.data) {
      setPets(petsResult.data as Pet[]);
    }

    // Fetch diaries
    const result = await api.diaries.list({ petId: currentPetId, limit: 20 });
    if (result.success && result.data) {
      setDiaries(result.data as Diary[]);
    }

    // Fetch reminders
    const remindersResult = await api.reminders.list();
    if (remindersResult.success && remindersResult.data) {
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = (remindersResult.data as Reminder[])
        .filter(r => {
          const remindAt = new Date(r.remindAt);
          return remindAt >= now && remindAt <= weekLater;
        })
        .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())
        .slice(0, 3);
      setUpcomingReminders(upcoming);
    }

    setIsRefreshing(false);
  };

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

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      VACCINE: '💉',
      DEWORMING: '🐛',
      GROOMING: '✨',
      CHECKUP: '🏥',
      MEDICATION: '💊',
      FOOD: '🍽️',
      OTHER: '📝',
    };
    return emojis[category] || '🔔';
  };

  const formatReminderTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今天 ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `明天 ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }
  };

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
        <Card className="mb-4">
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
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{currentPet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentPet.breed || '未設定品種'}
                {currentPet.birthday && ` · ${getPetAge(currentPet.birthday)}`}
              </p>
              {currentPet.weight && (
                <p className="text-sm text-primary font-medium">
                  體重：{Number(currentPet.weight)} kg
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link href="/reminders">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">提醒設定</p>
                <p className="text-xs text-muted-foreground truncate">疫苗、驅蟲、看診</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/stats">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">統計分析</p>
                <p className="text-xs text-muted-foreground truncate">體重趨勢、健康</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              近期提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
              >
                <span className="text-lg">{getCategoryEmoji(reminder.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {reminder.pet?.name && `${reminder.pet.name} · `}
                    {formatReminderTime(reminder.remindAt)}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/reminders" className="block">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                查看全部提醒 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Input */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">快速記錄</CardTitle>
        </CardHeader>
        <CardContent>
          <DiaryInput />
        </CardContent>
      </Card>

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
            <div className="py-6 text-center text-muted-foreground">
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
                查看全部記錄 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
