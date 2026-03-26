'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Camera, Scale, Calendar, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentLoading } from '@/components/ui/loading';
import { api } from '@/hooks/use-api';
import { formatDate, getPetAge, getSpeciesEmoji, getSpeciesLabel } from '@/lib/utils';
import type { Pet } from '@/types';

interface WeightRecord {
  id: string;
  weight: number;
  recordedAt: string;
}

interface PetWithRecords extends Pet {
  weightRecords?: WeightRecord[];
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<PetWithRecords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const petId = params.id as string;

  useEffect(() => {
    const fetchPet = async () => {
      const result = await api.pets.get(petId);
      if (result.success && result.data) {
        setPet(result.data as PetWithRecords);
      }
      setIsLoading(false);
    };

    fetchPet();
  }, [petId]);

  const handleDelete = async () => {
    if (!confirm(`確定要刪除 ${pet?.name} 嗎？此操作無法復原。`)) return;

    const result = await api.pets.delete(petId);
    if (result.success) {
      router.push('/pets');
    }
  };

  if (isLoading) {
    return <ContentLoading />;
  }

  if (!pet) {
    return (
      <div className="mx-auto max-w-lg p-4 text-center">
        <p className="text-muted-foreground">找不到這隻寵物</p>
        <Link href="/pets">
          <Button variant="link">返回寵物列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/pets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/pets/${petId}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Pet Profile */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl">
          {pet.photoUrl ? (
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getSpeciesEmoji(pet.species)
          )}
        </div>
        <h1 className="text-2xl font-bold">{pet.name}</h1>
        <p className="text-muted-foreground">
          {getSpeciesLabel(pet.species)}
          {pet.breed && ` · ${pet.breed}`}
        </p>
        {pet.birthday && (
          <Badge variant="secondary" className="mt-2">
            {getPetAge(pet.birthday)}
          </Badge>
        )}
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="生日"
              value={pet.birthday ? formatDate(pet.birthday, 'date') : '未設定'}
            />
            <InfoRow
              icon={<Scale className="h-4 w-4" />}
              label="體重"
              value={pet.weight ? `${pet.weight} kg` : '未記錄'}
            />
            <InfoRow
              label="性別"
              value={
                pet.gender === 'MALE'
                  ? '公'
                  : pet.gender === 'FEMALE'
                  ? '母'
                  : '未設定'
              }
            />
            <InfoRow
              label="毛色"
              value={pet.color || '未設定'}
            />
            <InfoRow
              label="結紮"
              value={pet.isNeutered ? '已結紮' : '未結紮'}
            />
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4" />
              醫療資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="晶片號碼"
              value={pet.microchipId || '未登記'}
            />
            {pet.allergies && pet.allergies.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">過敏原</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {pet.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {pet.medicalNotes && (
              <div>
                <p className="text-sm text-muted-foreground">醫療備註</p>
                <p className="mt-1 text-sm">{pet.medicalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight History */}
        {pet.weightRecords && pet.weightRecords.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4" />
                體重記錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pet.weightRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(record.recordedAt, 'date')}
                    </span>
                    <span className="font-medium">{record.weight} kg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm">{value}</span>
    </div>
  );
}
