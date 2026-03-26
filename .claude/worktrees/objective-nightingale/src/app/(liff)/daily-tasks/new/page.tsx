'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

const taskFrequencies = [
  { value: 'daily', label: '每日' }, { value: 'weekly', label: '每週' },
];

export default function NewDailyTaskPage() {
  const router = useRouter();
  const { user, currentPetId } = useUserStore();
  const [formData, setFormData] = useState({
    taskName: '', frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', isActive: true, notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const token = localStorage.getItem('petwise_jwt');
    if (!token || !user?.id || !currentPetId) {
      setError('用戶或寵物未認證，請重新登入。');
      setLoading(false); router.replace('/'); return;
    }
    if (!formData.taskName.trim()) { setError('任務名稱為必填。'); setLoading(false); return; }
    if (!formData.startDate) { setError('開始日期為必填。'); setLoading(false); return; }
    try {
      const response = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          petId: currentPetId, taskName: formData.taskName.trim(),
          frequency: formData.frequency, startDate: formData.startDate,
          endDate: formData.endDate || null, isActive: formData.isActive,
          notes: formData.notes || null,
        }),
      });
      if (response.ok) {
        router.replace('/daily-tasks');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '新增日常任務失敗。');
      }
    } catch (err) {
      console.error('Create daily task error:', err);
      setError('新增日常任務時發生未知錯誤。');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">新增日常任務</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-700">任務名稱 <span className="text-red-500">*</span></label>
          <input type="text" id="taskName" name="taskName" value={formData.taskName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">頻率 <span className="text-red-500">*</span></label>
          <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {taskFrequencies.map(freq => (<option key={freq.value} value={freq.value}>{freq.label}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">開始日期 <span className="text-red-500">*</span></label>
          <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">結束日期（選填）</label>
          <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">啟用任務</label>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">取消</button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={loading}>
            {loading ? '儲存中...' : '儲存'}
          </button>
        </div>
      </form>
    </div>
  );
}
