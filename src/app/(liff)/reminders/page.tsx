'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Bell, Check, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentLoading } from '@/components/ui/loading';
import { PetSelector } from '@/components/liff/pet-selector';
import { api } from '@/hooks/use-api';
import { useCurrentPet } from '@/stores/user-store';
import { formatDate } from '@/lib/utils';
import type { Reminder } from '@/types';

const categoryLabels: Record<string, string> = {
  VACCINE: '疫苗',
  DEWORMING: '驅蟲',
  GROOMING: '美容',
  CHECKUP: '健檢',
  MEDICATION: '用藥',
  FOOD: '餵食',
  OTHER: '其他',
};

const categoryIcons: Record<string, string> = {
  VACCINE: '💉',
  DEWORMING: '🐛',
  GROOMING: '✨',
  CHECKUP: '🏥',
  MEDICATION: '💊',
  FOOD: '🍽️',
  OTHER: '📝',
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentPet = useCurrentPet();

  const fetchReminders = async () => {
    setIsLoading(true);
    const result = await api.reminders.list();
    if (result.success && result.data) {
      setReminders(result.data as Reminder[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleComplete = async (id: string) => {
    const result = await api.reminders.complete(id);
    if (result.success) {
      fetchReminders();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個提醒嗎？')) return;

    const result = await api.reminders.delete(id);
    if (result.success) {
      setReminders(reminders.filter((r) => r.id !== id));
    }
  };

  // Group reminders by date
  const groupedReminders = reminders.reduce((groups, reminder) => {
    const date = new Date(reminder.remindAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {} as Record<string, Reminder[]>);

  const sortedDates = Object.keys(groupedReminders).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">提醒</h1>
        <div className="flex items-center gap-2">
          <PetSelector />
          <Link href="/reminders/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              新增
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <ContentLoading />
      ) : reminders.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">沒有提醒</h2>
          <p className="mb-6 text-muted-foreground">
            新增提醒以追蹤疫苗、驅蟲等重要事項
          </p>
          <Link href="/reminders/new">
            <Button>新增提醒</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const isToday = new Date(date).toDateString() === new Date().toDateString();
            const isPast = new Date(date) < new Date(new Date().toDateString());

            return (
              <div key={date}>
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={`text-sm font-medium ${isPast ? 'text-destructive' : ''}`}>
                    {isToday ? '今天' : formatDate(date, 'date')}
                    {isPast && !isToday && ' (已過期)'}
                  </span>
                </div>

                <div className="space-y-2">
                  {groupedReminders[date].map((reminder) => (
                    <Card key={reminder.id}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="text-2xl">
                          {categoryIcons[reminder.category] || '📝'}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{reminder.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[reminder.category] || '其他'}
                            </Badge>
                          </div>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {reminder.description}
                            </p>
                          )}
                          {reminder.pet && (
                            <p className="text-sm text-muted-foreground">
                              {reminder.pet.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(reminder.remindAt, 'time')}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleComplete(reminder.id)}
                            title="完成"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reminder.id)}
                            title="刪除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
