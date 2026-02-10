'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentLoading } from '@/components/ui/loading';
import { PetSelector } from '@/components/liff/pet-selector';
import { useCurrentPet, useSubscriptionPlan } from '@/stores/user-store';
import { api } from '@/hooks/use-api';
import { getCategoryIcon, getCategoryLabel, getCategoryColor, formatDate } from '@/lib/utils';
import type { DiaryCategory } from '@/types';

interface StatsData {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  totalEntries: number;
  categoryBreakdown: {
    category: DiaryCategory;
    count: number;
    percentage: number;
  }[];
  dailyTrend: {
    date: string;
    count: number;
  }[];
  upcomingReminders: {
    id: string;
    title: string;
    remindAt: string;
    pet?: {
      name: string;
    };
  }[];
  petSummary?: {
    petId: string;
    petName: string;
    currentWeight: number | null;
    weightTrend: 'up' | 'down' | 'stable';
    lastVetVisit: string | null;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentPet = useCurrentPet();
  const subscriptionPlan = useSubscriptionPlan();

  const maxDays = subscriptionPlan === 'FREE' ? 7 : subscriptionPlan === 'STANDARD' ? 90 : 365;

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentPet) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const result = await api.stats.overview(currentPet.id, maxDays);
      if (result.success && result.data) {
        setStats(result.data as StatsData);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [currentPet, maxDays]);

  if (isLoading) {
    return <ContentLoading />;
  }

  if (!currentPet) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <h1 className="mb-6 text-xl font-bold">統計報告</h1>
        <p className="text-center text-muted-foreground">請先選擇或新增寵物</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">統計報告</h1>
        <PetSelector />
      </div>

      {stats && (
        <div className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                總覽
                <Badge variant="outline" className="ml-auto text-xs">
                  最近 {stats.period.days} 天
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {stats.totalEntries}
                </p>
                <p className="text-sm text-muted-foreground">則記錄</p>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">分類統計</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.categoryBreakdown.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  尚無記錄
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.categoryBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <span className="text-xl">
                        {getCategoryIcon(item.category)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {getCategoryLabel(item.category)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} 則 ({item.percentage}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: getCategoryColor(item.category),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pet Summary */}
          {stats.petSummary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  {stats.petSummary.petName} 健康摘要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">目前體重</p>
                    <p className="text-lg font-semibold">
                      {stats.petSummary.currentWeight
                        ? `${stats.petSummary.currentWeight} kg`
                        : '未記錄'}
                    </p>
                    {stats.petSummary.weightTrend !== 'stable' && (
                      <Badge
                        variant={stats.petSummary.weightTrend === 'up' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {stats.petSummary.weightTrend === 'up' ? '↑ 上升' : '↓ 下降'}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">上次就醫</p>
                    <p className="text-lg font-semibold">
                      {stats.petSummary.lastVetVisit
                        ? formatDate(stats.petSummary.lastVetVisit, 'date')
                        : '無記錄'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                即將到來的提醒
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.upcomingReminders.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  沒有即將到來的提醒
                </p>
              ) : (
                <ul className="space-y-2">
                  {stats.upcomingReminders.map((reminder) => (
                    <li
                      key={reminder.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(reminder.remindAt, 'full')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Subscription Note */}
          {subscriptionPlan === 'FREE' && (
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                免費版僅顯示最近 7 天的統計資料
              </p>
              <a href="/subscription" className="text-sm text-primary hover:underline">
                升級方案查看更多
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
