'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Calendar, Bell, AlertTriangle, Scale, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  calendarData: {
    date: string;
    count: number;
  }[];
  weightHistory: {
    date: string;
    weight: number;
  }[];
  healthAlerts: {
    type: string;
    count: number;
    lastOccurred: string | null;
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

// 簡單的體重趨勢圖組件
function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground">
        尚無體重記錄
      </p>
    );
  }

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;

  return (
    <div className="space-y-2">
      {/* 圖表 */}
      <div className="relative h-32">
        <svg className="h-full w-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* 網格線 */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />

          {/* 折線 */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = 50 - ((d.weight - minWeight) / range) * 40 - 5;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* 數據點 */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 100;
            const y = 50 - ((d.weight - minWeight) / range) * 40 - 5;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="hsl(var(--primary))"
              />
            );
          })}
        </svg>
      </div>

      {/* 數據摘要 */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(data[0].date, 'date')}</span>
        <span>最新：{data[data.length - 1].weight} kg</span>
        <span>{formatDate(data[data.length - 1].date, 'date')}</span>
      </div>
    </div>
  );
}

// 取得本地日期字串 (YYYY-MM-DD)
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 健康日曆組件
function HealthCalendar({
  data,
  days,
  onDateClick,
}: {
  data: { date: string; count: number }[];
  days: number;
  onDateClick?: (date: string) => void;
}) {
  // 生成最近 N 天的日期（使用本地時區）
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const calendarDays = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return getLocalDateString(date);
  }).reverse();

  const dataMap = new Map(
    data.map((d) => {
      const dateObj = new Date(d.date);
      return [getLocalDateString(dateObj), d.count];
    })
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dateStr) => {
          const count = dataMap.get(dateStr) || 0;
          const date = new Date(dateStr + 'T00:00:00');
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => count > 0 && onDateClick?.(dateStr)}
              className={`aspect-square rounded text-center text-xs flex items-center justify-center transition-all
                ${count > 0 ? 'bg-primary/20 text-primary font-medium cursor-pointer hover:bg-primary/40' : 'bg-muted/50 cursor-default'}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
              title={`${dateStr}: ${count} 則記錄`}
              disabled={count === 0}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        點擊有記錄的日子可查看詳情
      </p>
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentPet = useCurrentPet();
  const currentPetId = currentPet?.id;
  const subscriptionPlan = useSubscriptionPlan();

  const maxDays = subscriptionPlan === 'FREE' ? 7 : subscriptionPlan === 'STANDARD' ? 90 : 365;

  const fetchStats = async (showRefreshing = false) => {
    if (!currentPetId) {
      setIsLoading(false);
      return;
    }

    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    const result = await api.stats.overview(currentPetId, maxDays);
    if (result.success && result.data) {
      setStats(result.data as StatsData);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, [currentPetId, maxDays]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const handleDateClick = (dateStr: string) => {
    // 導航到日記歷史頁面，並帶上日期參數
    router.push(`/diary/history?date=${dateStr}`);
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <PetSelector />
        </div>
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

          {/* Health Alerts */}
          {stats.healthAlerts && stats.healthAlerts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  健康異常提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.healthAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-white p-3"
                    >
                      <div>
                        <p className="font-medium text-orange-800">{alert.type}</p>
                        <p className="text-sm text-orange-600">
                          最近 {stats.period.days} 天內出現 {alert.count} 次
                        </p>
                      </div>
                      {alert.lastOccurred && (
                        <Badge variant="outline" className="bg-white">
                          最近：{formatDate(alert.lastOccurred, 'date')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4" />
                體重趨勢
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeightChart data={stats.weightHistory || []} />
            </CardContent>
          </Card>

          {/* Health Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                記錄日曆
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthCalendar
                data={stats.calendarData || []}
                days={stats.period.days}
                onDateClick={handleDateClick}
              />
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
