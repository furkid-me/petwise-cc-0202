'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

export default function NewExaminationRecordPage() {
  const router = useRouter();
  const { user, currentPetId } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    examinationDate: new Date().toISOString().slice(0, 10),
    examinationType: '血液檢查',
    clinicName: '',
    reportUrl: '',
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
    if (!token || !user?.id || !currentPetId) {
      setError('用戶或寵物未認證，請重新登入。');
      setLoading(false);
      router.replace('/');
      return;
    }

    if (!formData.examinationDate || !formData.examinationType) {
      setError('檢驗日期和類型為必填。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/examination-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: currentPetId,
          examinationDate: formData.examinationDate,
          examinationType: formData.examinationType,
          clinicName: formData.clinicName || null,
          reportUrl: formData.reportUrl || null,
          notes: formData.notes || null,
          results: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增失敗');
      }

      router.push('/examination-records');
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
        <h1 className="text-lg font-semibold">新增檢驗記錄</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div>
          <label htmlFor="examinationDate" className="block text-sm font-medium text-gray-700">檢驗日期 *</label>
          <input type="date" id="examinationDate" name="examinationDate" value={formData.examinationDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="examinationType" className="block text-sm font-medium text-gray-700">檢驗類型 *</label>
          <select id="examinationType" name="examinationType" value={formData.examinationType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="血液檢查">血液檢查</option>
            <option value="尿液檢查">尿液檢查</option>
            <option value="糞便檢查">糞便檢查</option>
            <option value="X光">X光</option>
            <option value="超音波">超音波</option>
            <option value="心電圖">心電圖</option>
            <option value="皮膚檢查">皮膚檢查</option>
            <option value="眼科檢查">眼科檢查</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div>
          <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">診所名稱（選填）</label>
          <input type="text" id="clinicName" name="clinicName" value={formData.clinicName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="reportUrl" className="block text-sm font-medium text-gray-700">報告連結（選填）</label>
          <input type="url" id="reportUrl" name="reportUrl" value={formData.reportUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="https://..." />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">備註（選填）</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? '儲存中...' : '儲存記錄'}
        </button>
      </form>
    </div>
  );
}
