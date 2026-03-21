'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export default function NewMedicationRecordPage() {
  const router = useRouter();
  const { user, activePetId } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosageValue: '',
    dosageUnit: '顆',
    frequency: '每天一次',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    purpose: '',
    sideEffectsObserved: '',
    postMedicationObservations: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('petwise_jwt');
    if (!token || !user?.id || !activePetId) {
      setError('用戶或寵物未認證，請重新登入。');
      setLoading(false);
      router.replace('/');
      return;
    }

    if (!formData.medicationName || !formData.dosageValue || !formData.dosageUnit || !formData.frequency || !formData.startDate) {
      setError('藥品名稱、劑量、頻率和開始日期為必填。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/medication-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: activePetId,
          medicationName: formData.medicationName,
          dosageValue: parseFloat(formData.dosageValue),
          dosageUnit: formData.dosageUnit,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          purpose: formData.purpose || null,
          sideEffectsObserved: formData.sideEffectsObserved || null,
          postMedicationObservations: formData.postMedicationObservations || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增失敗');
      }

      router.push('/medication-records');
    } catch (err: any) {
      setError(err.message || '新增失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => router.back()} className="text-gray-600 mr-3">← 返回</button>
        <h1 className="text-lg font-semibold">新增用藥記錄</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label htmlFor="medicationName" className="block text-sm font-medium text-gray-700">藥品名稱 *</label>
          <input type="text" id="medicationName" name="medicationName" value={formData.medicationName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="例：阿莫西林" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dosageValue" className="block text-sm font-medium text-gray-700">劑量 *</label>
            <input type="number" id="dosageValue" name="dosageValue" value={formData.dosageValue} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" step="0.1" />
          </div>
          <div>
            <label htmlFor="dosageUnit" className="block text-sm font-medium text-gray-700">單位 *</label>
            <select id="dosageUnit" name="dosageUnit" value={formData.dosageUnit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="顆">顆</option>
              <option value="ml">ml</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="滴">滴</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">頻率 *</label>
          <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="每天一次">每天一次</option>
            <option value="每天兩次">每天兩次</option>
            <option value="每天三次">每天三次</option>
            <option value="每兩天一次">每兩天一次</option>
            <option value="每週一次">每週一次</option>
            <option value="需要時服用">需要時服用</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">開始日期 *</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">結束日期（選填）</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">用途（選填）</label>
          <input type="text" id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="例：治療細菌感染" />
        </div>

        <div>
          <label htmlFor="sideEffectsObserved" className="block text-sm font-medium text-gray-700">觀察到的副作用（選填）</label>
          <textarea id="sideEffectsObserved" name="sideEffectsObserved" value={formData.sideEffectsObserved} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="postMedicationObservations" className="block text-sm font-medium text-gray-700">服藥後觀察（選填）</label>
          <textarea id="postMedicationObservations" name="postMedicationObservations" value={formData.postMedicationObservations} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? '儲存中...' : '儲存記錄'}
        </button>
      </form>
    </div>
  );
}
