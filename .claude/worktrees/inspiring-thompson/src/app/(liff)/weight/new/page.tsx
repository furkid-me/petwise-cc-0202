'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

export default function NewWeightRecordPage() {
  const router = useRouter();
  const { user, currentPetId, pets: rawPets } = useUserStore();
  const pets = rawPets ?? [];
  const activePet = pets.find(p => p.id === currentPetId);

  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0], // 預設今天
    weightKg: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !currentPetId) {
      setError('用戶或寵物未選定，請重新登入。');
      router.replace('/');
    }
  }, [user, currentPetId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('petwise_jwt');
    if (!token || !user?.id || !currentPetId) {
      setError('認證失敗，請重新登入。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/weight-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: currentPetId,
          recordDate: formData.recordDate,
          weightKg: parseFloat(formData.weightKg),
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        router.push('/weight');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '儲存失敗，請再試一次。');
      }
    } catch (err) {
      console.error('Submit weight record error:', err);
      setError('發生未知錯誤。');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white p-4 pb-16 shadow-md">
        <h1 className="text-xl font-bold text-center">新增體重記錄</h1>
        <p className="text-center text-sm opacity-80 mb-4">為 {activePet.name} 記錄體重</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          <div>
            <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700">記錄日期 <span className="text-red-500">*</span></label>
            <input
              type="date"
              id="recordDate"
              name="recordDate"
              value={formData.recordDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">體重 (公斤) <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="weightKg"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              step="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
