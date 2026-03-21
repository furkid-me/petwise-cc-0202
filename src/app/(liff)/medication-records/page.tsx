'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export default function MedicationRecordsPage() {
  const router = useRouter();
  const { user, activePetId } = useUserStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user?.id || !activePetId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('petwise_jwt');
      const res = await fetch(`/api/medication-records?petId=${activePetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError('載入失敗，請重試');
    } finally {
      setLoading(false);
    }
  }, [user, activePetId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gray-600">← 返回</button>
        <h1 className="text-lg font-semibold">用藥記錄</h1>
        <button
          onClick={() => router.push('/medication-records/new')}
          className="text-blue-600 font-medium"
        >
          + 新增
        </button>
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-red-500 text-center">{error}</p>}
        {records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">還沒有用藥記錄</p>
            <button
              onClick={() => router.push('/medication-records/new')}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full"
            >
              新增第一筆記錄
            </button>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{record.medicationName}</p>
                  <p className="text-sm text-gray-500">劑量：{record.dosageValue} {record.dosageUnit} / {record.frequency}</p>
                  <p className="text-sm text-gray-500">開始：{record.startDate?.slice(0, 10)}</p>
                  {record.endDate && (
                    <p className="text-sm text-gray-500">結束：{record.endDate?.slice(0, 10)}</p>
                  )}
                  {record.purpose && (
                    <p className="text-sm text-gray-600 mt-1">用途：{record.purpose}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-xs text-gray-500">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diet')} className="flex flex-col items-center text-xs text-gray-500">🍽<span>飲食</span></button>
        <button onClick={() => router.push('/medical-records')} className="flex flex-col items-center text-xs text-gray-500">🏥<span>醫療</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-xs text-gray-500">⏰<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-xs text-gray-500">👤<span>我的</span></button>
      </nav>
    </div>
  );
}
