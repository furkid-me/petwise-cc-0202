'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface Reminder {
  id: string; petId: string; userId: string; title: string;
  type: string; scheduledDate: string; scheduledTime?: string | null;
  frequency: string; isActive: boolean; notes: string | null; createdAt: string;
}

const ReminderTypeMap: Record<string, string> = {
  'vaccine': '疫苗', 'deworming': '驅蟲', 'vet_visit': '回診',
  'grooming': '美容', 'life': '生活提醒', 'other': '其他',
  'VACCINE': '疫苗', 'DEWORMING': '驅蟲', 'GROOMING': '美容',
  'VET_VISIT': '回診', 'MEDICATION': '用藥', 'CHECKUP': '健檢',
};

const FrequencyMap: Record<string, string> = {
  'once': '單次', 'daily': '每日', 'weekly': '每週', 'monthly': '每月', 'yearly': '每年',
  'NONE': '單次', 'DAILY': '每日', 'WEEKLY': '每週', 'MONTHLY': '每月', 'YEARLY': '每年',
};

export default function RemindersPage() {
  const router = useRouter();
  const { user, activePetId, pets } = useUserStore();
  const activePet = useMemo(() => pets.find(p => p.id === activePetId), [pets, activePetId]);

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
          const data: Record<string, unknown>[] = Array.isArray(res) ? res : (res.data ?? []);
          const normalised: Reminder[] = data.map((r) => {
            const remindAt = r.remindAt as string | undefined;
            const scheduledDate = (r.scheduledDate as string | undefined) ??
              (remindAt ? new Date(remindAt).toISOString().split('T')[0] : '');
            const scheduledTime = (r.scheduledTime as string | null | undefined) ??
              (remindAt ? new Date(remindAt).toTimeString().slice(0, 5) : null);
            const rawType = (r.type as string | undefined) ?? (r.category as string | undefined) ?? 'other';
            const rawFreq = (r.frequency as string | undefined) ?? (r.repeatType as string | undefined) ?? 'NONE';
            const frequency = rawFreq === 'NONE' ? 'once' : rawFreq.toLowerCase();
            return {
              id: r.id as string,
              petId: (r.petId as string | undefined) ?? '',
              userId: (r.userId as string | undefined) ?? '',
              title: r.title as string,
              type: rawType,
              scheduledDate,
              scheduledTime: scheduledTime ?? null,
              frequency,
              isActive: r.isActive as boolean,
              notes: (r.notes as string | null | undefined) ?? (r.description as string | null | undefined) ?? null,
              createdAt: r.createdAt as string,
            };
          });
          setReminders(normalised);
        } else {
          const errorData = await response.json();
          setError(errorData.error || '載入提醒列表失敗。');
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
                  reminder.scheduledDate < today && reminder.frequency === 'once'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {ReminderTypeMap[reminder.type] || reminder.type}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                日期：{reminder.scheduledDate}
                {reminder.scheduledTime
                  ? ` 時間：${new Date('1970-01-01T' + reminder.scheduledTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`
                  : ''}
              </p>
              <p className="text-sm text-gray-600">頻率：{FrequencyMap[reminder.frequency] || reminder.frequency}</p>
              {reminder.notes && <p className="text-sm text-gray-600 mt-1">備註：{reminder.notes}</p>}
            </div>
          ))}
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 max-w-md mx-auto">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 text-xs">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diet')} className="flex flex-col items-center text-gray-500 text-xs">🍽️<span>飲食</span></button>
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center text-gray-500 text-xs">⚖️<span>照護</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-indigo-600 text-xs">🔔<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </nav>
    </div>
  );
}
