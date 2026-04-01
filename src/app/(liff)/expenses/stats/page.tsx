'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface ExpenseRecord {
  id: string;
  petId: string;
  recordDate: string;
  category: string;
  description: string;
  amount: number;
  notes: string | null;
}

interface CategoryStat {
  category: string;
  label: string;
  emoji: string;
  total: number;
  count: number;
  percentage: number;
}

interface MonthStat {
  month: string;
  label: string;
  total: number;
}

const CategoryMeta: Record<string, { label: string; emoji: string; color: string }> = {
  FOOD:       { label: '飼料/零食', emoji: '🍖', color: '#FB9966' },
  MEDICAL:    { label: '醫療',      emoji: '🏥', color: '#EF4444' },
  MEDICATION: { label: '藥品',      emoji: '💊', color: '#8B5CF6' },
  GROOMING:   { label: '美容',      emoji: '✂️', color: '#EC4899' },
  SUPPLIES:   { label: '用品',      emoji: '📦', color: '#3B82F6' },
  INSURANCE:  { label: '保險',      emoji: '🛡️', color: '#10B981' },
  OTHER:      { label: '其他',      emoji: '📝', color: '#6B7280' },
};

const PERIOD_OPTIONS = [
  { value: 1,  label: '本月' },
  { value: 3,  label: '近 3 個月' },
  { value: 6,  label: '近 6 個月' },
  { value: 12, label: '近 12 個月' },
];

function getPeriodRange(months: number): { startDate: string; endDate: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${year}/${month}`;
}

export default function ExpenseStatsPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId);

  const [period, setPeriod] = useState(3);
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user || !activePet) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('petwise_jwt');
    const { startDate, endDate } = getPeriodRange(period);

    try {
      const url = new URL('/api/expense-records', window.location.origin);
      url.searchParams.append('petId', activePet.id);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setError('載入失敗');
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [user, activePet, period]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);

  // 分類統計
  const categoryStats: CategoryStat[] = Object.entries(
    records.reduce<Record<string, { total: number; count: number }>>((acc, r) => {
      const key = r.category;
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += Number(r.amount);
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .map(([category, { total, count }]) => ({
      category,
      label: CategoryMeta[category]?.label ?? category,
      emoji: CategoryMeta[category]?.emoji ?? '📝',
      total,
      count,
      percentage: totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 月份統計
  const monthStats: MonthStat[] = Object.entries(
    records.reduce<Record<string, number>>((acc, r) => {
      const key = getMonthKey(r.recordDate);
      acc[key] = (acc[key] ?? 0) + Number(r.amount);
      return acc;
    }, {})
  )
    .map(([month, total]) => ({ month, label: getMonthLabel(month), total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const maxMonthTotal = Math.max(...monthStats.map(m => m.total), 1);

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label ?? '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
      {/* 頂部 */}
      <div className="bg-indigo-600 text-white px-4 pt-4 pb-16">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.back()} className="text-white">← 返回</button>
        </div>
        <h1 className="text-xl font-bold">📊 花費統計</h1>
        {activePet && <p className="text-sm opacity-80 mt-1">{activePet.name}的花費分析</p>}
      </div>

      <div className="mx-4 -mt-8 space-y-4">
        {/* 期間選擇 */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2 flex-wrap">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                  (period === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">載入中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : (
          <>
            {/* 總計卡片 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">{periodLabel}總花費</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                NT$ {totalAmount.toLocaleString('zh-TW')}
              </p>
              <p className="text-sm text-gray-400 mt-1">共 {records.length} 筆記錄</p>
            </div>

            {/* 月份趨勢 */}
            {monthStats.length > 1 && (
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">每月花費趨勢</h2>
                <div className="space-y-2">
                  {monthStats.map(m => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-14 flex-shrink-0">{m.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(m.total / maxMonthTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-700 w-20 text-right flex-shrink-0">
                        NT$ {m.total.toLocaleString('zh-TW')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 分類統計 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">分類明細</h2>
              {categoryStats.length === 0 ? (
                <p className="text-center text-gray-400 py-6">此期間無花費記錄</p>
              ) : (
                <div className="space-y-4">
                  {categoryStats.map(stat => {
                    const color = CategoryMeta[stat.category]?.color ?? '#6B7280';
                    return (
                      <div key={stat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{stat.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                            <span className="text-xs text-gray-400">{stat.count} 筆</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-800">
                              NT$ {stat.total.toLocaleString('zh-TW')}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">({stat.percentage}%)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${stat.percentage}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 最近 5 筆 */}
            {records.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">最近記錄</h2>
                  <button
                    onClick={() => router.push('/expenses')}
                    className="text-xs text-indigo-600"
                  >
                    查看全部
                  </button>
                </div>
                <ul className="divide-y divide-gray-100">
                  {records.slice(0, 5).map(record => {
                    const meta = CategoryMeta[record.category] ?? CategoryMeta.OTHER;
                    return (
                      <li key={record.id} className="py-2.5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{meta.emoji}</span>
                          <div>
                            <p className="text-sm text-gray-800">{record.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(record.recordDate).toLocaleDateString('zh-TW')}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          NT$ {Number(record.amount).toLocaleString('zh-TW')}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
