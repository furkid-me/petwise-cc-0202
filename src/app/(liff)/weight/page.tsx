'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface WeightRecord {
  id: string;
  petId: string;
  recordDate: string;
  weightKg: number;
  notes?: string | null;
}

export default function WeightPage() {
  const router = useRouter();
  const { user, activePetId, pets } = useUserStore();
  const activePet = pets.find(p => p.id === activePetId);

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchWeightRecords = useCallback(async () => {
    if (!user || !activePet) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('petwise_jwt');
      const url = new URL('/api/weight-records', window.location.origin);
      url.searchParams.append('petId', activePet.id);

      const weightResponse = await fetch(url.toString() + '&limit=1&orderBy=recordDate&order=desc', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (weightResponse.ok) {
        const weightData = await weightResponse.json();
        if (weightData.length > 0) {
          setLatestWeight(weightData[0]);
        } else {
          setLatestWeight(null);
        }
      } else {
        const errorData = await weightResponse.json();
        console.error('Failed to fetch latest weight:', errorData.error);
      }

      // 獲取所有體重記錄
      const allUrl = new URL('/api/weight-records', window.location.origin);
      allUrl.searchParams.append('petId', activePet.id);
      const response = await fetch(allUrl.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const sortedRecords = data.map((record: WeightRecord) => ({
          ...record,
          recordDate: new Date(record.recordDate).toISOString().split('T')[0],
        })).sort((a: WeightRecord, b: WeightRecord) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
        );
        setWeightRecords(sortedRecords);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '載入體重記錄失敗。');
      }
    } catch (err) {
      console.error('Fetch weight records error:', err);
      setError('載入記錄時發生未知錯誤。');
    } finally {
      setLoading(false);
    }
  }, [user, activePet]);

  useEffect(() => {
    fetchWeightRecords();
  }, [user, activePet]);

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">請先登入並選擇寵物。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-indigo-600 text-white p-4 pb-16 shadow-md relative">
        <p className="text-sm opacity-80">{formattedDate}</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-xl font-bold">體重記錄 🐾</h1>
          {activePet && (
            <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1 rounded-full">
              {activePet.profilePictureUrl && (
                <img src={activePet.profilePictureUrl} alt={activePet.name} className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="text-sm font-medium">{activePet.name}</span>
            </div>
          )}
        </div>

        {activePet && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => router.push('/weight/new')} // 導向新增體重記錄頁面
              className="bg-white text-indigo-600 rounded-full p-3 shadow-lg flex items-center justify-center"
              aria-label="新增體重記錄"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 最新體重卡片 */}
      <div className="-mt-8 mx-4 bg-white rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">最新體重</h2>
        {latestWeight ? (
          <div>
            <p className="text-3xl font-bold text-indigo-600">{Number(latestWeight.weightKg).toFixed(1)} kg</p>
            <p className="text-xs text-gray-400 mt-1">記錄於 {new Date(latestWeight.recordDate).toLocaleDateString('zh-TW')}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">尚無體重記錄</p>
        )}
      </div>

      {/* 體重趨勢圖 (Placeholder) */}
      <div className="mx-4 bg-white rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">體重趨勢</h2>
        <div className="h-32 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-400">圖表即將推出</p>
        </div>
      </div>

      {/* 體重記錄列表 */}
      <div className="mx-4 bg-white rounded-xl shadow-md p-4 mb-20 flex-1">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">歷史記錄</h2>
        {loading ? (
          <p className="text-center text-gray-400 py-4">載入中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : weightRecords.length === 0 ? (
          <p className="text-center text-gray-400 py-4">尚無體重記錄，點擊 + 新增！</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {weightRecords.map(record => (
              <li key={record.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{new Date(record.recordDate).toLocaleDateString('zh-TW')}</p>
                  {record.notes && <p className="text-xs text-gray-500">{record.notes}</p>}
                </div>
                <p className="text-lg font-bold text-indigo-600">{Number(record.weightKg).toFixed(1)} kg</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 底部導覽列 */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
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
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center text-indigo-600">
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
    </div>
  );
}
