'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DiaryCard } from '@/components/diary/diary-card';
import { PetSelector } from '@/components/liff/pet-selector';
import { ContentLoading } from '@/components/ui/loading';
import { useCurrentPet } from '@/stores/user-store';
import { useDiaryStore } from '@/stores/diary-store';
import { api } from '@/hooks/use-api';
import {
  formatDate,
  getCategoryIcon,
  getCategoryLabel,
} from '@/lib/utils';
import type { Diary, DiaryCategory } from '@/types';

const categories: { value: DiaryCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'FOOD', label: '飲食' },
  { value: 'HEALTH', label: '健康' },
  { value: 'ACTIVITY', label: '活動' },
  { value: 'MEDICAL', label: '醫療' },
  { value: 'GROOMING', label: '美容' },
  { value: 'BEHAVIOR', label: '行為' },
  { value: 'OTHER', label: '其他' },
];

export default function DiaryHistoryPage() {
  const currentPet = useCurrentPet();
  const { diaries, setDiaries, isLoading, setLoading, hasMore, setHasMore, page, setPage } =
    useDiaryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DiaryCategory | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchDiaries = useCallback(
    async (reset = false) => {
      if (!currentPet) return;

      setLoading(true);
      const currentPage = reset ? 1 : page;

      const result = await api.diaries.list({
        petId: currentPet.id,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 20,
      });

      if (result.success && result.data) {
        const newDiaries = result.data as Diary[];
        if (reset) {
          setDiaries(newDiaries);
        } else {
          setDiaries([...diaries, ...newDiaries]);
        }
        setHasMore(newDiaries.length === 20);
        setPage(currentPage + 1);
      }

      setLoading(false);
    },
    [currentPet, selectedCategory, searchQuery, startDate, endDate, page, diaries, setDiaries, setLoading, setHasMore, setPage]
  );

  useEffect(() => {
    fetchDiaries(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPet?.id, selectedCategory, startDate, endDate]);

  const handleSearch = () => {
    fetchDiaries(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'ALL' || startDate || endDate;

  // Group diaries by date
  const groupedDiaries = diaries.reduce((groups, diary) => {
    const date = new Date(diary.occurredAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(diary);
    return groups;
  }, {} as Record<string, Diary[]>);

  const sortedDates = Object.keys(groupedDiaries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">日記記錄</h1>
        <PetSelector />
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋日記..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>篩選條件</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium">分類</label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) =>
                    setSelectedCategory(value as DiaryCategory | 'ALL')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.value !== 'ALL' && getCategoryIcon(cat.value)}{' '}
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">開始日期</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">結束日期</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  清除篩選
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setIsFilterOpen(false)}
                >
                  套用
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedCategory !== 'ALL' && (
            <Badge variant="secondary" className="gap-1">
              {getCategoryIcon(selectedCategory)} {getCategoryLabel(selectedCategory)}
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {startDate && formatDate(startDate, 'date')}
              {startDate && endDate && ' ~ '}
              {endDate && formatDate(endDate, 'date')}
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Diary List */}
      {!currentPet ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">請先選擇或新增寵物</p>
          </CardContent>
        </Card>
      ) : isLoading && diaries.length === 0 ? (
        <ContentLoading />
      ) : diaries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters ? '找不到符合條件的日記' : '還沒有任何日記記錄'}
            </p>
            {!hasActiveFilters && (
              <Link href="/diary/new">
                <Button className="mt-4">新增第一則日記</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {formatDate(date, 'date')}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({groupedDiaries[date].length} 則)
                </span>
              </div>
              <div className="space-y-2">
                {groupedDiaries[date].map((diary) => (
                  <DiaryCard
                    key={diary.id}
                    diary={diary}
                    onDelete={(diaryId) => {
                      setDiaries(diaries.filter((d) => d.id !== diaryId));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchDiaries(false)}
                disabled={isLoading}
              >
                {isLoading ? '載入中...' : '載入更多'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
