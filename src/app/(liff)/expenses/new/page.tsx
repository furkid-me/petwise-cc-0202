'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

const CATEGORIES = [
  { value: 'FOOD', label: '飼料/零食', emoji: '🍖' },
  { value: 'MEDICAL', label: '醫療', emoji: '🏥' },
  { value: 'GROOMING', label: '美容', emoji: '✂️' },
  { value: 'SUPPLIES', label: '用品', emoji: '📦' },
  { value: 'INSURANCE', label: '保險', emoji: '🛡️' },
  { value: 'OTHER', label: '其他', emoji: '📝' },
];

export default function NewExpensePage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId) || pets[0];

  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    category: 'FOOD',
    description: '',
    amount: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePet) { setError('請先登入並選擇寵物'); return; }
    if (!formData.description.trim()) { setError('請填寫花費描述'); return; }
    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      setError('請填寫有效金額');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('petwise_jwt');

    try {
      const res = await fetch('/api/expense-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          petId: activePet.id,
          recordDate: formData.recordDate,
          category: formData.category,
          description: formData.description.trim(),
          amount: amt,
          notes: formData.notes.trim() || null,
        }),
      });

      if (res.ok) {
        router.push('/expenses');
      } else {
        const data = await res.json();
        setError(data.error || '新增失敗，請稍後再試');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.value === formData.category);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部 */}
      <div className="bg-gradient-to-br from-[#FB9966] via-[#FB9966] to-[#B5495B] text-white px-5 pt-5 pb-16">
        <button
          onClick={() => router.back()}
          className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold tracking-tight">新增花費</h1>
        {activePet && (
          <p className="text-sm text-orange-100 mt-1">{activePet.name}的花費記錄</p>
        )}
      </div>

      {/* 表單 */}
      <div className="-mt-8 mx-4 bg-white rounded-2xl ring-1 ring-gray-950/10 p-5 mb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 類別選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">花費類別</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  className={
                    'flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ' +
                    (formData.category === cat.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200')
                  }
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 花費描述 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              描述 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={
                selectedCat?.value === 'FOOD' ? '例：皇家幼犬糧 2kg' :
                selectedCat?.value === 'MEDICAL' ? '例：年度健檢' : '花費名稱'
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              required
            />
          </div>

          {/* 金額 */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              金額（台幣） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">NT$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                required
              />
            </div>
          </div>

          {/* 日期 */}
          <div>
            <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              id="recordDate"
              name="recordDate"
              value={formData.recordDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
          </div>

          {/* 備註 */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="其他補充說明..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
            />
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FB9966] to-[#B5495B] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存花費'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
