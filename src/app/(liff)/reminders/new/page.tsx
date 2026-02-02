'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/hooks/use-api';
import { useUserStore } from '@/stores/user-store';
import type { ReminderCategory, RepeatType } from '@/types';

const categories: { value: ReminderCategory; label: string; emoji: string }[] = [
  { value: 'VACCINE', label: '疫苗', emoji: '💉' },
  { value: 'DEWORMING', label: '驅蟲', emoji: '🐛' },
  { value: 'GROOMING', label: '美容', emoji: '✨' },
  { value: 'CHECKUP', label: '健檢', emoji: '🏥' },
  { value: 'MEDICATION', label: '用藥', emoji: '💊' },
  { value: 'FOOD', label: '餵食', emoji: '🍽️' },
  { value: 'OTHER', label: '其他', emoji: '📝' },
];

const repeatOptions: { value: RepeatType; label: string }[] = [
  { value: 'NONE', label: '不重複' },
  { value: 'DAILY', label: '每天' },
  { value: 'WEEKLY', label: '每週' },
  { value: 'MONTHLY', label: '每月' },
  { value: 'YEARLY', label: '每年' },
];

export default function NewReminderPage() {
  const router = useRouter();
  const pets = useUserStore((state) => state.pets);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER' as ReminderCategory,
    petId: pets[0]?.id || '',
    remindAt: '',
    remindTime: '09:00',
    repeatType: 'NONE' as RepeatType,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.remindAt) {
      alert('請填寫標題和提醒日期');
      return;
    }

    setIsSubmitting(true);

    // Combine date and time
    const remindAt = new Date(`${formData.remindAt}T${formData.remindTime}`);

    const result = await api.reminders.create({
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      petId: formData.petId || undefined,
      remindAt: remindAt.toISOString(),
      repeatType: formData.repeatType,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push('/reminders');
    } else {
      alert('建立提醒失敗，請稍後再試');
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/reminders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">新增提醒</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">提醒內容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                標題 <span className="text-destructive">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="例如：狂犬病疫苗接種"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">說明</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="備註說明（選填）"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">類別</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, category: cat.value }))
                  }
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pet */}
        {pets.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">寵物</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                name="petId"
                value={formData.petId}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">不指定寵物</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Date & Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">提醒時間</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  日期 <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  name="remindAt"
                  value={formData.remindAt}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">時間</label>
                <Input
                  type="time"
                  name="remindTime"
                  value={formData.remindTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">重複</label>
              <select
                name="repeatType"
                value={formData.repeatType}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {repeatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              建立中...
            </>
          ) : (
            '建立提醒'
          )}
        </Button>
      </form>
    </div>
  );
}
