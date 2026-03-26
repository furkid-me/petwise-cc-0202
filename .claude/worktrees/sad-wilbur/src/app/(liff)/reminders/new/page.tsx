'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

const reminderTypes = [
  { value: 'vaccine', label: '疫苗' }, { value: 'deworming', label: '驅蟲' },
  { value: 'vet_visit', label: '回診' }, { value: 'grooming', label: '美容' },
  { value: 'life', label: '生活提醒' }, { value: 'other', label: '其他' },
];

const frequencies = [
  { value: 'once', label: '單次' }, { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每週' }, { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
];

export default function NewReminderPage() {
  const router = useRouter();
  const { user, activePetId } = useUserStore();
  const [formData, setFormData] = useState({
    title: '', type: 'vaccine', scheduledDate: '', scheduledTime: '',
    frequency: 'once', isActive: true, notes: '',
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
    if (!token || !user?.id || !activePetId) {
      setError('用戶或寵物未認證，請重新登入。');
      setLoading(false); router.replace('/'); return;
    }
    if (!formData.title.trim()) { setError('提醒標題為必填。'); setLoading(false); return; }
    if (!formData.scheduledDate) { setError('提醒日期為必填。'); setLoading(false); return; }
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          petId: activePetId, title: formData.title.trim(),
          type: formData.type, scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime || null,
          frequency: formData.frequency, isActive: formData.isActive,
          notes: formData.notes || null,
        }),
      });
      if (response.ok) {
        router.replace('/reminders');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '新增提醒失敗。');
      }
    } catch (err) {
      console.error('Create reminder error:', err);
      setError('新增提醒時發生未知錯誤。');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">新增提醒</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題 <span className="text-red-500">*</span></label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">提醒類型 <span className="text-red-500">*</span></label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {reminderTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">提醒日期 <span className="text-red-500">*</span></label>
          <input type="date" id="scheduledDate" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">提醒時間（選填）</label>
          <input type="time" id="scheduledTime" name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">提醒頻率 <span className="text-red-500">*</span></label>
          <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {frequencies.map(freq => (<option key={freq.value} value={freq.value}>{freq.label}</option>))}
          </select>
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
