'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Clock, Pin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentLoading } from '@/components/ui/loading';
import { api } from '@/hooks/use-api';
import {
  formatDate,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getSpeciesEmoji,
} from '@/lib/utils';
import type { Diary, Pet } from '@/types';

interface DiaryWithPet extends Diary {
  pet?: Pet;
}

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [diary, setDiary] = useState<DiaryWithPet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const diaryId = params.id as string;

  useEffect(() => {
    const fetchDiary = async () => {
      const result = await api.diaries.get(diaryId);
      if (result.success && result.data) {
        setDiary(result.data as DiaryWithPet);
      }
      setIsLoading(false);
    };

    fetchDiary();
  }, [diaryId]);

  const handleDelete = async () => {
    if (!confirm('確定要刪除這則日記嗎？')) return;

    const result = await api.diaries.delete(diaryId);
    if (result.success) {
      router.push('/');
    }
  };

  const handleTogglePin = async () => {
    if (!diary) return;

    const result = await api.diaries.update(diaryId, {
      isPinned: !diary.isPinned,
    });
    if (result.success && result.data) {
      setDiary(result.data as DiaryWithPet);
    }
  };

  if (isLoading) {
    return <ContentLoading />;
  }

  if (!diary) {
    return (
      <div className="mx-auto max-w-lg p-4 text-center">
        <p className="text-muted-foreground">找不到這則日記</p>
        <Link href="/">
          <Button variant="link">返回首頁</Button>
        </Link>
      </div>
    );
  }

  const categoryColor = getCategoryColor(diary.category);

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleTogglePin}
            className={diary.isPinned ? 'text-primary' : ''}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Category Header */}
      <div
        className="mb-6 rounded-lg p-4"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getCategoryIcon(diary.category)}</span>
          <div>
            <Badge
              style={{
                backgroundColor: categoryColor,
                color: 'white',
              }}
            >
              {getCategoryLabel(diary.category)}
            </Badge>
            {diary.subCategory && (
              <span className="ml-2 text-sm text-muted-foreground">
                {diary.subCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pet Info */}
      {diary.pet && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">{getSpeciesEmoji(diary.pet.species)}</span>
          <span className="font-medium">{diary.pet.name}</span>
        </div>
      )}

      {/* Content */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-lg">{diary.content}</p>

          {/* Raw Input */}
          {diary.rawInput && diary.rawInput !== diary.content && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">原始輸入</p>
              <p className="mt-1 text-sm italic">{diary.rawInput}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      {diary.details && Object.keys(diary.details).length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              詳細資訊
            </h3>
            <dl className="space-y-2">
              {Object.entries(diary.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{formatDetailKey(key)}</dt>
                  <dd>{formatDetailValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {diary.photos && diary.photos.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              照片
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {diary.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt=""
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Severity Warning */}
      {diary.severity && diary.severity >= 3 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">需要注意</p>
            <p className="text-xs text-amber-700">
              這則記錄的嚴重程度較高，請持續觀察狀況
            </p>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>記錄於 {formatDate(diary.createdAt, 'full')}</span>
      </div>
      {diary.occurredAt !== diary.createdAt && (
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="ml-6">發生於 {formatDate(diary.occurredAt, 'full')}</span>
        </div>
      )}
    </div>
  );
}

function formatDetailKey(key: string): string {
  const keyMap: Record<string, string> = {
    amount: '份量',
    duration: '時長',
    distance: '距離',
    type: '類型',
    foodType: '食物類型',
    medicine: '藥物',
    symptom: '症狀',
    frequency: '頻率',
    location: '地點',
    notes: '備註',
  };
  return keyMap[key] || key;
}

function formatDetailValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.join('、');
  }
  return String(value);
}
