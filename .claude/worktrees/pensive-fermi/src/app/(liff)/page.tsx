// src/app/(liff)/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface DietRecord {
  id: string;
  petId: string;
  recordDate: string; // ISO Date String
  recordTime: string; // ISO Time String (HH:mm:ss)
  foodName: string;
  foodType: string;
  amountValue: number;
  amountUnit: string;
  totalKcal: number | null;
  drankWaterMl: number | null;
  specialReaction: string | null;
  foodProduct?: { // 如果有關聯的食品產品
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

export default function HomePage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId) || pets[0] || null;

  const [todayDietRecords, setTodayDietRecords] = useState<DietRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [errorRecords, setErrorRecords] = useState<string | null>(null);

  const formattedDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const setTodayDietRecordsData = useCallback((data: DietRecord[]) => {
    setTodayDietRecords(data);
  }, []);

  const setErrorRecordsData = useCallback((error: string) => {
    setErrorRecords(error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !activePet) {
        setLoadingRecords(false);
        return;
      }
      setLoadingRecords(true);
      try {
        const token = localStorage.getItem('petwise_jwt');

        // 獲取今日飲食記錄
        const today = new Date().toISOString().split('T')[0];
        const dietUrl = new URL('/api/diet-records', window.location.origin);
        dietUrl.searchParams.append('petId', activePet.id);
        dietUrl.searchParams.append('date', today);

        const dietResponse = await fetch(dietUrl.toString(), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (dietResponse.ok) {
          const dietData = await dietResponse.json();
          setTodayDietRecordsData(Array.isArray(dietData) ? dietData : []);
        } else {
          const errorData = await dietResponse.json();
          setErrorRecordsData(errorData.error || '載入本日飲食記錄失敗。');
        }

        // 獲取最新體重記錄
        const weightUrl = new URL('/api/weight-records', window.location.origin);
        weightUrl.searchParams.append('petId', activePet.id);
        // 只獲取一筆最新的記錄
        const weightResponse = await fetch(weightUrl.toString() + '&limit=1&orderBy=recordDate&order=desc', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (weightResponse.ok) {
          const weightData = await weightResponse.json();
          if (Array.isArray(weightData) && weightData.length > 0) {
            setLatestWeight(weightData[0]);
          } else {
            setLatestWeight(null);
          }
        } else {
          const errorData = await weightResponse.json();
          console.error('Failed to fetch latest weight:', errorData.error);
          // 不設錯誤，因為沒有體重是正常情況
        }
      } catch (err) {
        console.error('Fetch weight records error:', err);
        setErrorRecords('載入記錄時發生未知錯誤。');
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchData();
  }, [user?.id, activePet?.id]);

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  const safeRecords = Array.isArray(todayDietRecords) ? todayDietRecords : [];
  const totalKcalConsumed = safeRecords.reduce((sum, record) => sum + (record.totalKcal || 0), 0);
  const totalWaterConsumed = safeRecords.reduce((sum, record) => sum + (record.drankWaterMl || 0), 0);

  const kcalProgress = activePet.dailyKcalTarget
    ? Math.min((totalKcalConsumed / activePet.dailyKcalTarget) * 100, 100)
    : 0;
  const waterProgress = activePet.dailyWaterMlTarget
    ? Math.min((totalWaterConsumed / activePet.dailyWaterMlTarget) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-indigo-600 text-white p-4 pb-16 shadow-md relative">
        <p className="text-sm opacity-80">{formattedDate}</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-xl font-bold">嗨安！{user.displayName?.split(' ')[0] || 'Master'}！🐾</h1>
          {activePet && (
            <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1 rounded-full">
              {activePet.photoUrl && (
                <img src={activePet.photoUrl} alt={activePet.name} className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="text-sm font-medium">{activePet.name}</span>
              {/* 這裡可以放切換寵物的按鈕或下拉選單 */}
            </div>
          )}
        </div>
      </div>

      {activePet && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => router.push('/weight/new')} // 導向新增體重記錄頁面
            className="bg-white text-indigo-600 rounded-full p-3 shadow-lg flex items-center justify-center"
            aria-label="新增體重記錄"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      )}

      {/* 寵物當前狀態卡片 */}
      <div className="-mt-8 mx-4 bg-white rounded-xl shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-500">今日營養進度</h2>
          {latestWeight && (
            <span className="text-xs text-indigo-600 font-medium">
              體重: {Number(latestWeight.weightKg).toFixed(1)} kg
            </span>
          )}
        </div>

        {activePet.dailyKcalTarget ? (
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>熱量</span>
              <span>{totalKcalConsumed.toFixed(0)} kcal / {activePet.dailyKcalTarget} kcal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${kcalProgress}%` }}>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-2">未設定每日熱量目標，請在寵物檔案中設定。</p>
        )}

        {activePet.dailyWaterMlTarget ? (
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>飲水</span>
              <span>{totalWaterConsumed.toFixed(0)} ml / {activePet.dailyWaterMlTarget} ml</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${waterProgress}%` }}>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-2">未設定每日飲水目標，請在寵物檔案中設定。</p>
        )}
      </div>

      {/* 今日飲食記錄列表 */}
      <div className="mx-4 bg-white rounded-xl shadow-md p-4 mb-20 flex-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-500">今日飲食記錄</h2>
          <button
            onClick={() => router.push('/diary/new')}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            + 新增
          </button>
        </div>

        {loadingRecords ? (
          <p className="text-center text-gray-400 py-4">載入中...</p>
        ) : errorRecords ? (
          <p className="text-center text-red-500 py-4">{errorRecords}</p>
        ) : safeRecords.length === 0 ? (
          <p className="text-center text-gray-400 py-4">今日尚無飲食記錄，點擊 + 新增！</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {safeRecords.map(record => (
              <li key={record.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{record.foodName}</p>
                    <p className="text-xs text-gray-500">{record.foodType} · {record.amountValue} {record.amountUnit}</p>
                    {record.specialReaction && (
                      <p className="text-xs text-orange-500 mt-0.5">⚠️ {record.specialReaction}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {record.totalKcal !== null && (
                      <p className="text-xs text-green-600">{record.totalKcal?.toFixed(0)} kcal</p>
                    )}
                    {record.drankWaterMl !== null && (
                      <p className="text-xs text-blue-600">{record.drankWaterMl} ml</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 底部導覽列 */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">首頁</span>
        </button>
        <button onClick={() => router.push('/diary/new')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">飲食</span>
        </button>
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">照護</span>
        </button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs">提醒</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">我的</span>
        </button>
      </div>

      {/* FAB 按鈕 - 快速記錄飲食 */}
      <button
        onClick={() => router.push('/diary/new')}
        className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="新增飲食記錄"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
