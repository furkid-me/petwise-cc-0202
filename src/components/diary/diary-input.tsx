'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Send, X, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDiaryStore } from '@/stores/diary-store';
import { useCurrentPet } from '@/stores/user-store';
import { api } from '@/hooks/use-api';
import { cn } from '@/lib/utils';

interface DiaryInputProps {
  onSuccess?: () => void;
}

export function DiaryInput({ onSuccess }: DiaryInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { draftInput, draftPhotos, setDraftInput, addDraftPhoto, removeDraftPhoto, clearDraft, addDiary } = useDiaryStore();
  const currentPet = useCurrentPet();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Upload to server
      const result = await api.upload.image(file);
      if (result.success && result.data) {
        addDraftPhoto(result.data.url);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!draftInput.trim() || !currentPet) return;

    setIsSubmitting(true);
    setIsParsing(true);
    setError(null);

    try {
      // Create diary with AI parsing
      const result = await api.diaries.create({
        petId: currentPet.id,
        rawInput: draftInput,
        photos: draftPhotos,
        useAiParsing: true,
      });

      if (result.success && result.data) {
        // Add to store
        const diaries = Array.isArray(result.data) ? result.data : [result.data];
        diaries.forEach((diary: unknown) => addDiary(diary as Parameters<typeof addDiary>[0]));

        // Clear draft
        clearDraft();

        // Callback
        onSuccess?.();
      } else {
        // Show error message
        setError(result.error || '記錄建立失敗，請稍後再試');
      }
    } catch (err) {
      console.error('Failed to create diary:', err);
      setError('記錄建立失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
      setIsParsing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Text Input */}
      <div className="relative">
        <Textarea
          placeholder={currentPet
            ? `告訴我 ${currentPet.name} 今天做了什麼...`
            : '請先選擇或新增寵物'}
          value={draftInput}
          onChange={(e) => setDraftInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!currentPet || isSubmitting}
          className="min-h-[80px] resize-none pr-10"
        />
        {isParsing && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Photo Preview */}
      {draftPhotos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {draftPhotos.map((photo, index) => (
            <div key={index} className="relative h-16 w-16">
              <img
                src={photo}
                alt=""
                className="h-full w-full rounded object-cover"
              />
              <button
                onClick={() => removeDraftPhoto(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {/* Camera */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = 'environment';
                fileInputRef.current.click();
              }
            }}
            disabled={!currentPet || isSubmitting}
          >
            <Camera className="h-5 w-5" />
          </Button>

          {/* Gallery */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
            disabled={!currentPet || isSubmitting}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          {/* Voice Input (Future) */}
          <Button
            variant="ghost"
            size="icon"
            disabled
            title="語音輸入 (即將推出)"
          >
            <Mic className="h-5 w-5" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!draftInput.trim() || !currentPet || isSubmitting}
          className={cn(
            'gap-2',
            isSubmitting && 'opacity-70'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isParsing ? 'AI 解析中...' : '送出'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Hint */}
      <p className="mt-2 text-xs text-muted-foreground">
        用自然的方式描述寵物的日常，AI 會自動幫你分類記錄
      </p>
    </div>
  );
}
