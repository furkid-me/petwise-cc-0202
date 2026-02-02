'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiaryInput } from '@/components/diary/diary-input';
import { PetSelector } from '@/components/liff/pet-selector';
import { Badge } from '@/components/ui/badge';
import { useCurrentPet } from '@/stores/user-store';
import { getCategoryIcon, getCategoryLabel } from '@/lib/utils';
import type { DiaryCategory } from '@/types';

const categories: { value: DiaryCategory; label: string; icon: string; examples: string[] }[] = [
  {
    value: 'FOOD',
    label: '飲食',
    icon: '🍽️',
    examples: ['今天吃了一碗飼料', '喝了很多水', '給了零食'],
  },
  {
    value: 'HEALTH',
    label: '健康',
    icon: '❤️',
    examples: ['大便正常', '精神很好', '體重 8.5kg'],
  },
  {
    value: 'ACTIVITY',
    label: '活動',
    icon: '🏃',
    examples: ['散步了 30 分鐘', '在家玩球', '睡了很久'],
  },
  {
    value: 'MEDICAL',
    label: '醫療',
    icon: '🏥',
    examples: ['打了疫苗', '吃了驅蟲藥', '看了醫生'],
  },
  {
    value: 'GROOMING',
    label: '美容',
    icon: '✨',
    examples: ['洗澡了', '梳毛 15 分鐘', '剪了指甲'],
  },
  {
    value: 'BEHAVIOR',
    label: '行為',
    icon: '🐾',
    examples: ['心情很好', '今天有點黏人', '學會新技能'],
  },
];

export default function NewDiaryPage() {
  const router = useRouter();
  const currentPet = useCurrentPet();
  const [selectedCategory, setSelectedCategory] = useState<DiaryCategory | null>(null);

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="flex-1 text-xl font-bold">新增記錄</h1>
        <PetSelector />
      </div>

      {!currentPet ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">請先選擇或新增寵物</p>
          <Link href="/pets/new">
            <Button className="mt-4">新增寵物</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                口語化輸入
                <Badge variant="secondary" className="text-xs">AI 解析</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DiaryInput onSuccess={handleSuccess} />
            </CardContent>
          </Card>

          {/* Category Shortcuts */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              或選擇分類快速記錄
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.value ? null : category.value
                  )}
                  className={`flex flex-col items-center rounded-lg border p-4 transition-colors ${
                    selectedCategory === category.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="mt-1 text-sm">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Category Examples */}
          {selectedCategory && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-medium">
                  {getCategoryIcon(selectedCategory)}{' '}
                  {getCategoryLabel(selectedCategory)} 記錄範例：
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {categories
                    .find((c) => c.value === selectedCategory)
                    ?.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-medium">使用提示</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 用自然的方式描述，AI 會自動分類</li>
              <li>• 一次可以記錄多件事（例如：吃飯+散步）</li>
              <li>• 可以上傳照片讓記錄更完整</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
