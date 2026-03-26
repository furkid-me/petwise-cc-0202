'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface DewormingRecord {
  id: string;
  petId: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string | null;
  frequency: string;
  notes: string | null;
  isActive: boolean;
  isCompleted: boolean;
}

const FrequencyMap: Record<string, string> = {
  'once': '單次',
  'daily': '每日',
  'weekly': '每週',
  'monthly': '每月',
  'yearly': '每年',
};

export default function DewormingPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId);

  const [records, setRecords] = useState<DewormingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user || !activePet) { setLoading(false); return; }
    setLoading(true);
    const token = localStorage.getItem('petwise_jwt');
    try {
      const res = await fetch(`/api/reminders?petId=${activePet.id}&type=deworming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter only DEWORMING type reminders
        const dewormingRecords = (Array.isArray(data) ? data : data.data || []).filter(
          (r: any) => r.type === 'DEWORMING' || r.type === 'deworming'
        );
        setRecords(dewormingRecords);
      } else {
        setError('載入失敗');
      }
    } catch (err) {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [user, activePet]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-purple-600 text-white p-4 pb-16">
        <button onClick={() => router.push('/health')} className="text-white mb-2">← 返回</button>
        <h1 className="text-xl font-bold">🐛 驅蟲記錄</h1>
        {activePet && <p className="text-sm opacity-80 mt-1">{activePet.name}的驅蟲計劃</p>}
      </div>

      {/* 記錄列表 */}
      <div className="-mt-8 mx-4 bg-white rounded-xl shadow-md p-4 mb-20 flex-1">
        {loading ? (
          <p className="text-center text-gray-500 py-8">載入中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">還沒有驅蟲記錄</p>
            <p className="text-sm text-gray-400 mt-2">前往「提醒」新增驅蟲提醒</p>
            <button
              onClick={() => router.push('/reminders/new')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full"
            >
              + 新增驅蟲提醒
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.map((record) => (
              <li key={record.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{record.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.scheduledDate).toLocaleDateString('zh-TW')}
                      {record.scheduledTime && ` ${record.scheduledTime}`}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-gray-400 mt-1">{record.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.isCompleted ? 'bg-green-100 text-green-700' : 
                      record.scheduledDate < today ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {record.isCompleted ? '已完成' : 
                       record.scheduledDate < today ? '已逾期' : 
                       FrequencyMap[record.frequency] || record.frequency}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 底部導覽 */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 text-xs">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diet')} className="flex flex-col items-center text-gray-500 text-xs">🍽<span>飲食</span></button>
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-purple-600 text-xs">💊<span>健康</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 text-xs">⏰<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </div>
    </div>
  );
}
