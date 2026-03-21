'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import FoodProductSearch from '@/components/FoodProductSearch';

interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  kcalPer100g: number;
  imageURL: string;
  type: string;
}

interface FormData {
  recordDate: string;
  recordTime: string;
  foodProductId: string;
  foodName: string;
  foodType: string;
  amountValue: string;
  amountUnit: string;
  totalKcal: string;
  drankWaterMl: string;
  specialReaction: string;
  photoUrl: string;
  mainIngredients: string[];
}

export default function NewDiaryPage() {
  const router = useRouter();
  const { user, pets, activePetId } = useUserStore();
  const activePet = pets.find((p) => p.id === activePetId);

  const [recordMode, setRecordMode] = useState<'manual' | 'ai-chat'>('manual');
  const [formData, setFormData] = useState<FormData>({
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    foodProductId: '',
    foodName: '',
    foodType: '主食',
    amountValue: '',
    amountUnit: '克',
    totalKcal: '',
    drankWaterMl: '',
    specialReaction: '',
    photoUrl: '',
    mainIngredients: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !activePetId) {
      setError('用戶或寵物未選定，請重新登入。');
      router.replace('/');
    }
  }, [user, activePetId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (product: FoodProduct) => {
    setFormData((prev) => ({
      ...prev,
      foodProductId: product.id,
      foodName: product.name,
      foodType: product.type,
      totalKcal: product.kcalPer100g && prev.amountValue
        ? (product.kcalPer100g * parseFloat(prev.amountValue) / 100).toFixed(2)
        : prev.totalKcal,
    }));
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('petwise_jwt');
    if (!token || !user?.id || !activePetId) {
      setError('用戶或寵物未選定，請重新登入。');
      setLoading(false);
      router.replace('/');
      return;
    }

    if (!formData.foodName.trim() || !formData.foodType.trim() || formData.amountValue === '') {
      setError('請填寫食物名稱、類型和份量。');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/diet-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: activePetId,
          foodProductId: formData.foodProductId || null,
          foodName: formData.foodName,
          foodType: formData.foodType,
          amountValue: formData.amountValue,
          amountUnit: formData.amountUnit,
          totalKcal: formData.totalKcal || null,
          drankWaterMl: formData.drankWaterMl || null,
          specialReaction: formData.specialReaction || null,
          photoUrl: formData.photoUrl || null,
          mainIngredients: formData.mainIngredients,
          recordedAt: `${formData.recordDate}T${formData.recordTime}:00`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增失敗');
      }

      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '新增失敗，請重試。');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    const token = localStorage.getItem('petwise_jwt');
    if (!token || !activePetId) {
      setAiError('用戶或寵物未選定');
      setAiLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userInput: aiInput,
          petId: activePetId,
          recordedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 解析失敗');
      }

      const data = await response.json();
      const count = data.createdRecords?.count || 0;
      setAiResult(`✅ AI 已解析並建立 ${count} 筆飲食記錄！`);
      setTimeout(() => router.back(), 1500);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI 解析失敗，請重試。');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center mb-4">
          <button onClick={() => router.back()} className="mr-2 text-gray-600 hover:text-gray-800">
            ← 返回
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            新增飲食記錄 {activePet ? `(${activePet.name})` : ''}
          </h1>
        </div>

        {/* 模式切換 */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setRecordMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              recordMode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            手動輸入
          </button>
          <button
            onClick={() => setRecordMode('ai-chat')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              recordMode === 'ai-chat' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            AI 智能解析
          </button>
        </div>

        {recordMode === 'manual' ? (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

            <div>
              <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700">記錄日期</label>
              <input type="date" id="recordDate" name="recordDate" value={formData.recordDate} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="recordTime" className="block text-sm font-medium text-gray-700">記錄時間</label>
              <input type="time" id="recordTime" name="recordTime" value={formData.recordTime} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>

            <div className="border p-3 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2 text-sm">搜尋並選擇食品（選填）</h3>
              <FoodProductSearch onSelect={handleProductSelect} petType={activePet?.type ?? undefined} />
            </div>

            <div>
              <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">食物名稱 *</label>
              <input type="text" id="foodName" name="foodName" value={formData.foodName} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required placeholder="例：皇家幼犬糧" />
            </div>
            <div>
              <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">食物類型 *</label>
              <select id="foodType" name="foodType" value={formData.foodType} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                {['主食', '零食', '鮮食', '罐頭', '水', '保健品', '其他'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="amountValue" className="block text-sm font-medium text-gray-700">份量 *</label>
                <input type="number" id="amountValue" name="amountValue" value={formData.amountValue}
                  onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required step="0.1" placeholder="80" />
              </div>
              <div className="w-24">
                <label htmlFor="amountUnit" className="block text-sm font-medium text-gray-700">單位</label>
                <select id="amountUnit" name="amountUnit" value={formData.amountUnit} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  {['克', 'ml', '份', '碗', '罐', '匙', 'kg'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="totalKcal" className="block text-sm font-medium text-gray-700">總熱量 (kcal)</label>
              <input type="number" id="totalKcal" name="totalKcal" value={formData.totalKcal}
                onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                step="1" />
            </div>
            <div>
              <label htmlFor="drankWaterMl" className="block text-sm font-medium text-gray-700">飲水量 (ml)</label>
              <input type="number" id="drankWaterMl" name="drankWaterMl" value={formData.drankWaterMl}
                onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                step="1" />
            </div>
            <div>
              <label htmlFor="specialReaction" className="block text-sm font-medium text-gray-700">特殊反應/備註</label>
              <textarea id="specialReaction" name="specialReaction" value={formData.specialReaction}
                onChange={handleChange} rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button type="button" onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300">
                {loading ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              用自然語言描述寵物今天吃了什麼，AI 會自動解析並建立記錄。
            </p>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="例：小花今天早上吃了80克皇家幼犬糧，加了半罐巔峰羊肉罐頭，還喝了很多水..."
            />
            {aiError && <div className="bg-red-100 text-red-700 p-2 rounded">{aiError}</div>}
            {aiResult && <div className="bg-green-100 text-green-700 p-2 rounded">{aiResult}</div>}
            <button
              onClick={handleSubmitAI}
              disabled={aiLoading || !aiInput.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
            >
              {aiLoading ? '解析中...' : '🤖 AI 解析並儲存'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
