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

const CategoryLabels: Record<string, { label: string; emoji: string }> = {
  FOOD: { label: '飼料/零食', emoji: '🍖' },
  MEDICAL: { label: '醫療', emoji: '🏥' },
  GROOMING: { label: '美容', emoji: '✂️' },
  SUPPLIES: { label: '用品', emoji: '📦' },
  INSURANCE: { label: '保險', emoji: '🛡️' },
  OTHER: { label: '其他', emoji: '📝' },
};

export default function ExpensesPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId);

  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const fetchRecords = useCallback(async () => {
    if (!user || !activePet) { setLoading(false); return; }
    setLoading(true);
    const token = localStorage.getItem('petwise_jwt');
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    try {
      const url = new URL('/api/expense-records', window.location.origin);
      url.searchParams.append('petId', activePet.id);
      url.searchParams.append('startDate', firstDayOfMonth);
      url.searchParams.append('endDate', lastDayOfMonth);
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        const expenses = Array.isArray(data) ? data : [];
        setRecords(expenses);
        const total = expenses.reduce((sum: number, e: ExpenseRecord) => sum + Number(e.amount), 0);
        setTotalAmount(total);
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

  const currentMonth = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-indigo-600 text-white p-4 pb-16">
        <button onClick={() => router.push('/')} className="text-white mb-2">← 返回</button>
        <h1 className="text-xl font-bold">💰 花費記錄</h1>
        {activePet && <p className="text-sm opacity-80 mt-1">{activePet.name}的花費</p>}
      </div>

      {/* 本月總計 */}
      <div className="-mt-8 mx-4 bg-white rounded-xl shadow-md p-4 mb-4">
        <p className="text-sm text-gray-500">{currentMonth}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">
          NT$ {totalAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-gray-400 mt-1">{records.length} 筆記錄</p>
      </div>

      {/* 記錄列表 */}
      <div className="mx-4 bg-white rounded-xl shadow-md p-4 mb-20 flex-1">
        {loading ? (
          <p className="text-center text-gray-500 py-8">載入中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">本月還沒有花費記錄</p>
            <p className="text-sm text-gray-400 mt-2">在對話中說「花了XXX」即可記錄</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.map((record) => {
              const catInfo = CategoryLabels[record.category] || CategoryLabels.OTHER;
              return (
                <li key={record.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{catInfo.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{record.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(record.recordDate).toLocaleDateString('zh-TW')}
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                            {catInfo.label}
                          </span>
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-400 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 font-medium">
                      NT$ {Number(record.amount).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 底部導覽 */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 text-xs">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diet')} className="flex flex-col items-center text-gray-500 text-xs">🍽<span>飲食</span></button>
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-gray-500 text-xs">💊<span>健康</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 text-xs">⏰<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </div>
    </div>
  );
}
