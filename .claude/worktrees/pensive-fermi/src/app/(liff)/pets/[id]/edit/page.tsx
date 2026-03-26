'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLoading } from '@/components/ui/loading';
import { ImageUpload } from '@/components/common/image-upload';
import { api } from '@/hooks/use-api';
import { toast } from '@/components/ui/use-toast';
import type { Pet, PetSpecies, PetGender } from '@/types';

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
  { value: 'MALE', label: '公' },
  { value: 'FEMALE', label: '母' },
  { value: 'UNKNOWN', label: '不確定' },
];

export default function EditPetPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG' as PetSpecies,
    breed: '',
    gender: 'UNKNOWN' as PetGender,
    birthday: '',
    color: '',
    weight: '',
    photoUrl: '',
    isNeutered: false,
    microchipId: '',
    medicalNotes: '',
    allergies: '',
  });

  useEffect(() => {
    const fetchPet = async () => {
      const result = await api.pets.get(petId);
      if (result.success && result.data) {
        const pet = result.data as Pet;
        setFormData({
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          gender: pet.gender || 'UNKNOWN',
          birthday: pet.birthday
            ? new Date(pet.birthday).toISOString().split('T')[0]
            : '',
          color: pet.color || '',
          weight: pet.weight?.toString() || '',
          photoUrl: pet.photoUrl || '',
          isNeutered: pet.isNeutered,
          microchipId: pet.microchipId || '',
          medicalNotes: pet.medicalNotes || '',
          allergies: pet.allergies?.join(', ') || '',
        });
      }
      setIsLoading(false);
    };

    fetchPet();
  }, [petId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: '請輸入寵物名字',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const result = await api.pets.update(petId, {
      name: formData.name,
      species: formData.species,
      breed: formData.breed || undefined,
      gender: formData.gender,
      birthday: formData.birthday || undefined,
      color: formData.color || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      photoUrl: formData.photoUrl || undefined,
      isNeutered: formData.isNeutered,
      microchipId: formData.microchipId || undefined,
      medicalNotes: formData.medicalNotes || undefined,
      allergies: formData.allergies
        ? formData.allergies.split(',').map((a) => a.trim())
        : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: '更新成功',
        description: `${formData.name} 的資料已更新`,
        variant: 'success',
      });
      router.push(`/pets/${petId}`);
    } else {
      toast({
        title: '更新失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <ContentLoading />;
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/pets/${petId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">編輯寵物</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <Card>
          <CardContent className="flex justify-center p-6">
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, photoUrl: url }))}
              className="h-32 w-32 rounded-full"
            />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                名字 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="毛小孩的名字"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>種類</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value: PetSpecies) =>
                    setFormData((prev) => ({ ...prev, species: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>性別</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: PetGender) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div>
              <Label htmlFor="breed">品種</Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="例如：柴犬、波斯貓"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthday">生日</Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="weight">體重 (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="例如：5.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color">毛色</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="例如：黃色、黑白相間"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isNeutered">已結紮</Label>
              <Switch
                id="isNeutered"
                checked={formData.isNeutered}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isNeutered: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">醫療資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="microchipId">晶片號碼</Label>
              <Input
                id="microchipId"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleChange}
                placeholder="15 碼晶片號碼"
              />
            </div>

            <div>
              <Label htmlFor="allergies">過敏原（用逗號分隔）</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="例如：雞肉, 牛肉"
              />
            </div>

            <div>
              <Label htmlFor="medicalNotes">醫療備註</Label>
              <Textarea
                id="medicalNotes"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                placeholder="其他需要注意的醫療資訊"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              儲存中...
            </>
          ) : (
            '儲存變更'
          )}
        </Button>
      </form>
    </div>
  );
}
