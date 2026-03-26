'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

interface SupplementRecord {
  id: string;
  petId: string;
  medicationName: string;
  dosageValue: number;
  dosageUnit: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  purpose: string | null;
  notes: string | null;
}

export default function SupplementsPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId);

  const [records, setRecords] = useState<SupplementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user || !activePet) { setLoading(false); return; }
    setLoading(true);
    const token = localStorage.getItem('petwise_jwt');
    try {
      const res = await fetch(`/api/medication-records?petId=${activePet.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter for supplements (purpose contains 營養, supplement, etc.)
        const supplementRecords = (Array.isArray(data) ? data : []).filter(
          (r: any) => r.purpose?.toLowerCase().includes('supplement') ||
                      r.purpose?.includes('營養') ||
                      r.purpose?.includes('保健品') ||
                      r.medicationName?.toLowerCase().includes('supplement') ||
                      r.medicationName?.includes('維他命') ||
                      r.medicationName?.includes('魚油') ||
                      r.medicationName?.includes('鈣')
        );
        setRecords(supplementRecords);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-amber-500 text-white p-4 pb-16">
        <button onClick={() => router.push('/health')} className="text-white mb-2">← 返回</button>
        <h1 className="text-xl font-bold">🥩 營養品記錄</h1>
        {activePet && <p className="text-sm opacity-80 mt-1">{activePet.name}的保健品</p>}
      </div>

      {/* 說明文字 */}
      <div className="-mt-4 mx-4 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-amber-800">
          💡 營養品包含維他命、魚油、鈣片、益生菌等保健品。請在「用藥記錄」中新增時，用途選擇「營養補充」。
        </p>
      </div>

      {/* 記錄列表 */}
      <div className="mx-4 bg-white rounded-xl shadow-md p-4 mb-20 flex-1">
        {loading ? (
          <p className="text-center text-gray-500 py-8">載入中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">還沒有營養品記錄</p>
            <p className="text-sm text-gray-400 mt-2">在「用藥記錄」中新增保健品</p>
            <button
              onClick={() => router.push('/medication-records/new?redirect=/supplements')}
              className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-full"
            >
              + 新增營養品
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.map((record) => (
              <li key={record.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{record.medicationName}</p>
                    <p className="text-sm text-gray-500">
                      劑量：{record.dosageValue} {record.dosageUnit} / {record.frequency}
                    </p>
                    <p className="text-sm text-gray-500">
                      開始：{new Date(record.startDate).toLocaleDateString('zh-TW')}
                    </p>
                    {record.purpose && (
                      <p className="text-sm text-amber-600 mt-1">用途：{record.purpose}</p>
                    )}
                    {record.notes && (
                      <p className="text-sm text-gray-400 mt-1">{record.notes}</p>
                    )}
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
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-amber-500 text-xs">💊<span>健康</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 text-xs">⏰<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </div>
    </div>
  );
}
