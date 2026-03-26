'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

const HEALTH_OPTIONS = [
  '肝臟', '腎臟', '癌症', '心臟', '結石',
  '食物過敏', '其他', '尚未檢查', '超級健康',
];

export default function NewPetPage() {
  const router = useRouter();
  const { addPet } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    type: 'dog',
    breed: '',
    gender: '',
    isNeutered: false,
    dateOfBirth: '',
    chipNumber: '',
    initialWeightKg: '',
    dailyKcalTarget: '',
    dailyWaterMlTarget: '',
    healthNotes: [] as string[],
    personalityTraits: '',
  });

  const handleHealthToggle = (option: string) => {
    setForm((prev) => ({
      ...prev,
      healthNotes: prev.healthNotes.includes(option)
        ? prev.healthNotes.filter((h) => h !== option)
        : [...prev.healthNotes, option],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('petwise_jwt');
    if (!token) {
      setError('請重新登入');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          initialWeightKg: parseFloat(form.initialWeightKg),
          dailyKcalTarget: form.dailyKcalTarget
            ? parseInt(form.dailyKcalTarget)
            : undefined,
          dailyWaterMlTarget: form.dailyWaterMlTarget
            ? parseInt(form.dailyWaterMlTarget)
            : undefined,
          dateOfBirth: form.dateOfBirth || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '建立失敗');
      }

      const pet = await res.json();
      addPet(pet);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '建立失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🐾 新增寵物
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              寵物名字 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：小花"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              種類 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="dog">狗</option>
              <option value="cat">貓</option>
              <option value="other">其他</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              體重（公斤）<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={form.initialWeightKg}
              onChange={(e) =>
                setForm({ ...form, initialWeightKg: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：3.5"
            />
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              品種
            </label>
            <input
              type="text"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：柴犬"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">不確定</option>
              <option value="male">公</option>
              <option value="female">母</option>
            </select>
          </div>

          {/* Neutered */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNeutered"
              checked={form.isNeutered}
              onChange={(e) =>
                setForm({ ...form, isNeutered: e.target.checked })
              }
              className="w-4 h-4 text-green-500"
            />
            <label htmlFor="isNeutered" className="text-sm text-gray-700">
              已結紮
            </label>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Chip Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              晶片號碼
            </label>
            <input
              type="text"
              value={form.chipNumber}
              onChange={(e) =>
                setForm({ ...form, chipNumber: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Daily Kcal Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每日目標熱量（大卡）
            </label>
            <input
              type="number"
              value={form.dailyKcalTarget}
              onChange={(e) =>
                setForm({ ...form, dailyKcalTarget: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：300"
            />
          </div>

          {/* Daily Water Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              每日目標飲水量（毫升）
            </label>
            <input
              type="number"
              value={form.dailyWaterMlTarget}
              onChange={(e) =>
                setForm({ ...form, dailyWaterMlTarget: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：200"
            />
          </div>

          {/* Health Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              健康狀況（可複選）
            </label>
            <div className="flex flex-wrap gap-2">
              {HEALTH_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleHealthToggle(option)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.healthNotes.includes(option)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Traits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              個性描述
            </label>
            <textarea
              value={form.personalityTraits}
              onChange={(e) =>
                setForm({ ...form, personalityTraits: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="例：活潑好動，喜歡玩球..."
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isSubmitting ? '儲存中...' : '新增寵物 🐾'}
          </button>
        </form>
      </div>
    </div>
  );
}
