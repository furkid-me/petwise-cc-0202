'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Gift, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/stores/user-store';
import { api } from '@/hooks/use-api';
import type { UserGender, User } from '@/types';

// 台灣縣市區資料
const taiwanCities = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
  '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
];

const genderOptions: { value: UserGender; label: string }[] = [
  { value: 'MALE', label: '男' },
  { value: 'FEMALE', label: '女' },
  { value: 'OTHER', label: '其他' },
  { value: 'PREFER_NOT_TO_SAY', label: '不願透露' },
];

export default function RedeemPage() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({
    realName: user?.realName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: (user?.gender || '') as UserGender | '',
    city: user?.city || '',
    district: user?.district || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    plan: string;
    periodEnd: string;
  } | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // 驗證
    if (!code.trim()) {
      setError('請輸入兌換碼');
      return;
    }

    if (!formData.realName || !formData.email || !formData.phone ||
        !formData.gender || !formData.city || !formData.district) {
      setError('請填寫完整的個人資料');
      return;
    }

    // Email 格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的 Email 格式');
      return;
    }

    // 電話格式驗證
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('請輸入有效的手機號碼（09開頭的10位數字）');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({
          code: code.trim(),
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess({
          plan: data.data.plan,
          periodEnd: new Date(data.data.periodEnd).toLocaleDateString('zh-TW'),
        });
        // 更新 user store
        if (data.data.user) {
          setUser(data.data.user as User);
        }
      } else {
        setError(data.error || '兌換失敗');
      }
    } catch (err) {
      setError('兌換失敗，請稍後再試');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold">兌換成功！</h2>
            <p className="mb-4 text-muted-foreground">
              已成功升級至 <span className="font-semibold text-primary">{success.plan === 'PREMIUM' ? '專業版' : '標準版'}</span>
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              有效期至：{success.periodEnd}
            </p>
            <Link href="/">
              <Button>返回首頁</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">兌換碼</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            輸入兌換碼
          </CardTitle>
          <CardDescription>
            輸入兌換碼升級您的訂閱方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="PETWISE-XXXXX-XXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center font-mono text-lg tracking-wider"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>個人資料</CardTitle>
          <CardDescription>
            首次兌換需填寫以下資料
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              姓名 <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="請輸入真實姓名"
              value={formData.realName}
              onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              手機號碼 <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              placeholder="0912345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              性別 <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as UserGender })}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                縣市 <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  {taiwanCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                區 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="請輸入區"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                兌換中...
              </>
            ) : (
              '確認兌換'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
