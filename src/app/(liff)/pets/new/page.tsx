'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/hooks/use-api';
import { useUserStore } from '@/stores/user-store';
import { getSpeciesEmoji } from '@/lib/utils';
import type { PetSpecies, PetGender, Pet } from '@/types';

const speciesOptions: { value: PetSpecies; label: string; emoji: string }[] = [
  { value: 'DOG', label: '狗', emoji: '🐕' },
  { value: 'CAT', label: '貓', emoji: '🐱' },
  { value: 'BIRD', label: '鳥', emoji: '🐦' },
  { value: 'RABBIT', label: '兔子', emoji: '🐰' },
  { value: 'HAMSTER', label: '倉鼠', emoji: '🐹' },
  { value: 'FISH', label: '魚', emoji: '🐟' },
  { value: 'REPTILE', label: '爬蟲類', emoji: '🦎' },
  { value: 'OTHER', label: '其他', emoji: '🐾' },
];

const genderOptions: { value: PetGender; label: string }[] = [
  { value: 'MALE', label: '男生' },
  { value: 'FEMALE', label: '女生' },
  { value: 'UNKNOWN', label: '不確定' },
];

export default function NewPetPage() {
  const router = useRouter();
  const { addPet } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG' as PetSpecies,
    breed: '',
    gender: 'UNKNOWN' as PetGender,
    birthday: '',
    weight: '',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await api.upload.image(file);
    if (result.success && result.data) {
      setPhotoUrl(result.data.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('請輸入寵物名字');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.pets.create({
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        gender: formData.gender,
        birthday: formData.birthday || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        photoUrl: photoUrl || undefined,
      });

      if (result.success && result.data) {
        addPet(result.data as Pet);
        router.push('/pets');
      } else {
        alert(result.error || '新增失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Failed to create pet:', error);
      alert('新增失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/pets">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">新增寵物</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Avatar className="h-24 w-24">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt="Pet photo" />
              ) : null}
              <AvatarFallback className="bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              點擊上傳照片
            </p>
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            名字 <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="例如：麻糬"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Species */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            種類 <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {speciesOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, species: option.value })}
                className={`flex flex-col items-center rounded-lg border p-3 transition-colors ${
                  formData.species === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="mt-1 text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Breed */}
        <div>
          <label className="mb-2 block text-sm font-medium">品種</label>
          <Input
            placeholder="例如：柴犬"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block text-sm font-medium">性別</label>
          <div className="flex gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.value })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                  formData.gender === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="mb-2 block text-sm font-medium">生日</label>
          <Input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="mb-2 block text-sm font-medium">體重 (kg)</label>
          <Input
            type="number"
            placeholder="例如：8.5"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            step="0.1"
            min="0"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !formData.name.trim()}
        >
          {isLoading ? '新增中...' : '新增寵物'}
        </Button>
      </form>
    </div>
  );
}
