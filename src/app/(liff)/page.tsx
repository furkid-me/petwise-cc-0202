// src/app/(liff)/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface DietRecord {
  id: string;
  petId: string;
  recordDate: string;
  recordTime: string;
  foodName: string;
  foodType: string;
  amountValue: number;
  amountUnit: string;
  totalKcal: number | null;
  drankWaterMl: number | null;
  specialReaction: string | null;
  foodProduct?: {
    name: string;
    brand: string;
    kcalPer100g: number;
  } | null;
}

interface WeightRecord {
  id: string;
  petId: string;
  recordDate: string;
  weightKg: number;
  notes?: string | null;
}

interface ExpenseRecord {
  id: string;
  petId: string;
  recordDate: string;
  category: string;
  description: string;
  amount: number;
  notes: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId) || pets[0] || null;

  const [todayDietRecords, setTodayDietRecords] = useState<DietRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [errorRecords, setErrorRecords] = useState<string | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseRecord[]>([]);
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState<number>(0);

  const formattedDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const setTodayDietRecordsData = useCallback((data: DietRecord[]) => {
    setTodayDietRecords(data);
  }, []);

  const setErrorRecordsData = useCallback((error: string) => {
    setErrorRecords(error);
  }, []);

  // Test diet records with state update
  useEffect(() => {
    if (!user || !activePet) return;
    
    const token = localStorage.getItem('petwise_jwt');
    if (!token) return;
    
    setLoadingRecords(true);
    
    fetch('/api/diet-records', {
      headers: { 'Authorization': 'Bearer ' + token },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Diet data:', data);
        if (data?.dietRecords) {
          setTodayDietRecords(data.dietRecords);
        }
        setLoadingRecords(false);
      })
      .catch(err => {
        console.log('Diet error:', err);
        setLoadingRecords(false);
      });
  }, []);

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  const safeRecords = Array.isArray(todayDietRecords) ? todayDietRecords : [];
  const totalKcalConsumed = safeRecords.reduce((sum, record) => sum + (record.totalKcal || 0), 0);
  const totalWaterConsumed = safeRecords.reduce((sum, record) => sum + (record.drankWaterMl || 0), 0);

  const kcalTarget = activePet?.dailyKcalTarget ?? 0;
  const waterTarget = activePet?.dailyWaterMlTarget ?? 0;
  const kcalProgress = kcalTarget > 0
    ? Math.min((totalKcalConsumed / kcalTarget) * 100, 100)
    : 0;
  const waterProgress = waterTarget > 0
    ? Math.min((totalWaterConsumed / waterTarget) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Hero — 左對齊 */}
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-indigo-700 text-white px-5 pt-5 pb-16">
        <p className="font-mono text-xs uppercase tracking-wider text-indigo-200/80 mb-1">
          {formattedDate}
        </p>
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            嗨，{user.displayName?.split(' ')[0] || 'Master'}！
          </h1>
          {activePet && (
            <div className="flex items-center gap-1.5 bg-white/10 ring-1 ring-inset ring-white/20 px-3 py-1.5 rounded-full mt-0.5">
              {activePet.photoUrl && (
                <img src={activePet.photoUrl} alt={activePet.name} className="w-5 h-5 rounded-full object-cover" />
              )}
              <span className="text-xs font-medium">{activePet.name}</span>
            </div>
          )}
        </div>
        <img src="/images/hero-cat.png" alt="Petwise hero cat" className="w-full max-w-xs mx-auto mt-4 drop-shadow-lg" />
      </div>

      {/* 今日營養進度 */}
      <div className="-mt-8 mx-4 bg-white rounded-2xl ring-1 ring-gray-950/10 p-4 mb-3">
        <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-3">
          今日營養進度
        </p>
        {latestWeight && (
          <p className="text-xs text-indigo-600 font-medium mb-3">
            最新體重：{Number(latestWeight.weightKg).toFixed(1)} kg
          </p>
        )}
        {kcalTarget > 0 ? (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-700 mb-1.5">
              <span>熱量</span>
              <span className="text-gray-400 text-xs tabular-nums">
                {totalKcalConsumed.toFixed(0)} / {kcalTarget} kcal
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${kcalProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3 leading-7 text-pretty">
            未設定每日熱量目標，請在寵物檔案中設定。
          </p>
        )}
        {waterTarget > 0 ? (
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1.5">
              <span>飲水</span>
              <span className="text-gray-400 text-xs tabular-nums">
                {totalWaterConsumed.toFixed(0)} / {waterTarget} ml
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 leading-7 text-pretty">
            未設定每日飲水目標，請在寵物檔案中設定。
          </p>
        )}
      </div>

      {/* 本月花費卡片 */}
      <div className="-mt-2 mx-4 bg-white rounded-2xl ring-1 ring-gray-950/10 p-4 mb-3">
        <div className="flex justify-between items-center mb-2">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-400">
            本月花費
          </p>
          <button
            onClick={() => router.push('/expenses')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            詳情 →
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              NT$ {(totalMonthlyExpense || 0).toLocaleString('zh-TW', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-right">
            {monthlyExpenses.length > 0 && (
              <p className="text-xs text-gray-500">
                {monthlyExpenses.length} 筆記錄
              </p>
            )}
          </div>
        </div>
        {/* 花費類別小標籤 */}
        {monthlyExpenses.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {Array.from(new Set(monthlyExpenses.map((e: ExpenseRecord) => e.category))).slice(0, 4).map((cat: string) => (
              <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {cat === 'FOOD' ? '🍖 飼料' :
                 cat === 'MEDICAL' ? '🏥 醫療' :
                 cat === 'GROOMING' ? '✂️ 美容' :
                 cat === 'SUPPLIES' ? '📦 用品' :
                 cat === 'INSURANCE' ? '🛡️ 保險' : '其他'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section 分隔線 */}
      <div className="mx-4 border-t border-gray-950/[0.08]" />

      {/* 今日飲食記錄 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl ring-1 ring-gray-950/10 p-4 mb-24 flex-1">
        <div className="flex justify-between items-center mb-3">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-400">
            今日飲食記錄
          </p>
          <button
            onClick={() => router.push('/diary/new')}
            className="h-9 px-4 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + 新增
          </button>
        </div>
        {loadingRecords ? (
          <p className="text-center text-gray-400 py-6 text-sm">載入中...</p>
        ) : errorRecords ? (
          <p className="text-center text-red-500 py-6 text-sm">{errorRecords}</p>
        ) : safeRecords.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm leading-7">
            今日尚無飲食記錄，點擊右上角新增！
          </p>
        ) : (
          <ul className="divide-y divide-gray-950/[0.06]">
            {safeRecords.map(record => (
              <li key={record.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{record.foodName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {record.foodType} · {record.amountValue} {record.amountUnit}
                    </p>
                    {record.specialReaction && (
                      <p className="text-xs text-amber-600 mt-0.5">⚠ {record.specialReaction}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {record.totalKcal != null && (
                      <p className="text-xs text-emerald-600 font-medium tabular-nums">
                        {(record.totalKcal || 0).toFixed(0)} kcal
                      </p>
                    )}
                    {record.drankWaterMl !== null && (
                      <p className="text-xs text-sky-600 mt-0.5 tabular-nums">{record.drankWaterMl} ml</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 底部導覽列 */}
      <div className="h-16 bg-white ring-1 ring-inset ring-gray-950/[0.08] flex justify-around items-center fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">首頁</span>
        </button>
        <button onClick={() => router.push('/diary/new')} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">飲食</span>
        </button>
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs">健康</span>
        </button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs">提醒</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-400 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">我的</span>
        </button>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/diary/new')}
        className="fixed bottom-20 right-4 bg-gray-950 text-white rounded-full w-14 h-14 flex items-center justify-center ring-4 ring-gray-950/20 hover:bg-gray-800 transition-colors focus:outline-none"
        aria-label="新增飲食記錄"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
