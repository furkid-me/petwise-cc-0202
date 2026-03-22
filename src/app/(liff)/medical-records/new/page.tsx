'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const { user, activePetId } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().slice(0, 10),
    type: 'vet_visit',
    title: '',
    clinicName: '',
    veterinarian: '',
    diagnosis: '',
    treatmentPlan: '',
    costTwd: '',
    notes: '',
    isOngoingIssue: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

    if (!formData.recordDate || !formData.type) {
      setError('記錄日期和類型為必填。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: activePetId,
          recordDate: formData.recordDate,
          type: formData.type,
          title: formData.title || null,
          clinicName: formData.clinicName || null,
          veterinarian: formData.veterinarian || null,
          diagnosis: formData.diagnosis || null,
          treatmentPlan: formData.treatmentPlan || null,
          costTwd: formData.costTwd ? parseFloat(formData.costTwd) : null,
          notes: formData.notes || null,
          isOngoingIssue: formData.isOngoingIssue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增失敗');
      }

      router.push('/medical-records');
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
        <h1 className="text-lg font-semibold">新增醫療記錄</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700">記錄日期 *</label>
          <input type="date" id="recordDate" name="recordDate" value={formData.recordDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">類型 *</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="vet_visit">就診</option>
            <option value="checkup">健康檢查</option>
            <option value="symptom">症狀記錄</option>
            <option value="ongoing_issue">持續問題</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題（選填）</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="例：年度健康檢查" />
        </div>

        <div>
          <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">診所名稱（選填）</label>
          <input type="text" id="clinicName" name="clinicName" value={formData.clinicName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="veterinarian" className="block text-sm font-medium text-gray-700">獸醫姓名（選填）</label>
          <input type="text" id="veterinarian" name="veterinarian" value={formData.veterinarian} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">診斷結果（選填）</label>
          <textarea id="diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="treatmentPlan" className="block text-sm font-medium text-gray-700">治療計畫（選填）</label>
          <textarea id="treatmentPlan" name="treatmentPlan" value={formData.treatmentPlan} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="costTwd" className="block text-sm font-medium text-gray-700">費用（台幣，選填）</label>
          <input type="number" id="costTwd" name="costTwd" value={formData.costTwd} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" step="1" />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註（選填）</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="isOngoingIssue" name="isOngoingIssue" checked={formData.isOngoingIssue} onChange={handleChange} className="mr-2" />
          <label htmlFor="isOngoingIssue" className="text-sm font-medium text-gray-700">標記為持續問題</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? '儲存中...' : '儲存記錄'}
        </button>
      </form>
    </div>
  );
}
