'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDate, getCategoryIcon, getCategoryLabel, getCategoryColor } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pin, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/hooks/use-api';
import type { Diary } from '@/types';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
  onDelete?: (diaryId: string) => void;
  showDeleteButton?: boolean;
}

export function DiaryCard({ diary, onClick, onDelete, showDeleteButton = true }: DiaryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await api.diaries.delete(diary.id);
    if (result.success) {
      onDelete?.(diary.id);
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };
  const categoryVariant = diary.category.toLowerCase() as 'food' | 'health' | 'activity' | 'medical' | 'grooming' | 'behavior' | 'other';

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
            style={{ backgroundColor: `${getCategoryColor(diary.category)}20` }}
          >
            {getCategoryIcon(diary.category)}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={categoryVariant}>
                {getCategoryLabel(diary.category)}
              </Badge>
              {diary.subCategory && (
                <span className="text-xs text-muted-foreground">
                  {diary.subCategory}
                </span>
              )}
              {diary.isPinned && (
                <Pin className="h-3 w-3 text-primary" />
              )}
              {diary.isImportant && (
                <AlertCircle className="h-3 w-3 text-destructive" />
              )}
            </div>

            <p className="line-clamp-2 text-sm">{diary.content}</p>

            {/* Photos Preview */}
            {diary.photos.length > 0 && (
              <div className="mt-2 flex gap-1">
                {diary.photos.slice(0, 3).map((photo, index) => (
                  <div
                    key={index}
                    className="relative h-12 w-12 overflow-hidden rounded"
                  >
                    <Image
                      src={photo}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {diary.photos.length > 3 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    +{diary.photos.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Mood/Severity */}
            {(diary.mood || diary.severity) && (
              <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                {diary.mood && (
                  <span>心情: {'😊'.repeat(diary.mood)}</span>
                )}
                {diary.severity && (
                  <span>嚴重度: {diary.severity}/5</span>
                )}
              </div>
            )}

            {/* Time & Delete */}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDate(diary.occurredAt, 'relative')}
              </p>
              {showDeleteButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除這則日記嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原。這則日記將會被永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刪除中...
                </>
              ) : (
                '確定刪除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
