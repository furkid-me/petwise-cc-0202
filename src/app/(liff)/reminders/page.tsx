'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface Reminder {
  id: string;
  petId: string | null;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  remindAt: string;
  repeatType: string;
  repeatInterval: number | null;
  repeatEndAt: string | null;
  isActive: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  notifySent: boolean;
  notifySentAt: string | null;
  pet?: {
    id: string;
    name: string;
    species: string;
    photoUrl: string | null;
  };
}

const ReminderCategoryMap: Record<string, string> = {
  'VACCINE': '疫苗', 'DEWORMING': '驅蟲', 'GROOMING': '美容',
  'CHECKUP': '健檢', 'MEDICATION': '用藥', 'FOOD': '飲食', 'OTHER': '其他',
};

const RepeatTypeMap: Record<string, string> = {
  'NONE': '單次', 'DAILY': '每日', 'WEEKLY': '每週', 'MONTHLY': '每月', 'YEARLY': '每年',
};

export default function RemindersPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = useMemo(() => pets.find(p => p.id === currentPetId), [pets, currentPetId]);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user || !activePet) { setLoading(false); return; }
      setLoading(true); setError(null);
      const token = localStorage.getItem('petwise_jwt');
      if (!token) { setError('用戶未認證。'); setLoading(false); return; }
      try {
        const url = new URL('/api/reminders', window.location.origin);
        url.searchParams.append('petId', activePet.id);
        url.searchParams.append('includeInactive', 'false');
        const response = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const res = await response.json();
          const remindersData = Array.isArray(res) ? res : (res.data ?? []);
          setReminders(remindersData as Reminder[]);
        } else if (response.status === 401) {
          setError('未授權，請重新登入。');
        } else {
          const errorText = await response.text();
          console.error('Fetch reminders error:', response.status, errorText);
          setError(`載入提醒列表失敗 (${response.status})`);
        }
      } catch (err) {
        console.error('Fetch reminders error:', err);
        setError('載入提醒時發生未知錯誤。');
      } finally { setLoading(false); }
    };
    fetchReminders();
  }, [user, activePet]);

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中或用戶/寵物未選定...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{activePet.name} 的提醒</h1>
        <button
          onClick={() => router.push('/reminders/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
        >
          + 新增
        </button>
      </div>
      {loading ? (
        <p className="text-gray-500 text-center">載入提醒列表...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : reminders.length === 0 ? (
        <p className="text-gray-600 text-center">目前沒有 {activePet.name} 的提醒。</p>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">{reminder.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  new Date(reminder.remindAt) < new Date() && reminder.repeatType === 'NONE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {ReminderCategoryMap[reminder.category] || reminder.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                日期：{new Date(reminder.remindAt).toLocaleDateString('zh-TW')}
              </p>
              <p className="text-sm text-gray-600">頻率：{RepeatTypeMap[reminder.repeatType] || reminder.repeatType}</p>
              {reminder.description && <p className="text-sm text-gray-600 mt-1">備註：{reminder.description}</p>}
            </div>
          ))}
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 max-w-md mx-auto">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 text-xs">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diary/new')} className="flex flex-col items-center text-gray-500 text-xs">🍽<span>飲食</span></button>
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-gray-500 text-xs">💊<span>健康</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-indigo-600 text-xs">🔔<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </nav>
    </div>
  );
}
