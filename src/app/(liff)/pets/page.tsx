'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserStore, useCurrentPet } from '@/stores/user-store';
import { getSpeciesEmoji, getSpeciesLabel, getPetAge } from '@/lib/utils';

export default function PetsPage() {
  const pets = useUserStore((state) => state.pets);
  const setCurrentPetId = useUserStore((state) => state.setCurrentPetId);
  const currentPet = useCurrentPet();
  const user = useUserStore((state) => state.user);

  const canAddMorePets = () => {
    if (!user) return false;
    const limits: Record<string, number> = {
      FREE: 1,
      STANDARD: 3,
      PREMIUM: -1,
    };
    const limit = limits[user.subscriptionPlan];
    return limit === -1 || pets.length < limit;
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">我的寵物</h1>
        {canAddMorePets() && (
          <Link href="/pets/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              新增
            </Button>
          </Link>
        )}
      </div>

      {pets.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🐾</div>
          <h2 className="mb-2 text-lg font-semibold">還沒有寵物</h2>
          <p className="mb-6 text-muted-foreground">
            新增你的第一隻毛小孩開始記錄生活
          </p>
          <Link href="/pets/new">
            <Button>新增寵物</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => (
            <Card
              key={pet.id}
              className={`cursor-pointer transition-all ${
                pet.id === currentPet?.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentPetId(pet.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-16 w-16">
                  {pet.photoUrl ? (
                    <AvatarImage src={pet.photoUrl} alt={pet.name} />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {getSpeciesEmoji(pet.species)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pet.name}</h3>
                    {pet.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        預設
                      </Badge>
                    )}
                    {pet.id === currentPet?.id && (
                      <Badge variant="default" className="text-xs">
                        目前
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSpeciesLabel(pet.species)}
                    {pet.breed && ` · ${pet.breed}`}
                  </p>
                  {pet.birthday && (
                    <p className="text-sm text-muted-foreground">
                      {getPetAge(pet.birthday)}
                    </p>
                  )}
                </div>

                <Link href={`/pets/${pet.id}`}>
                  <Button variant="ghost" size="sm">
                    詳情
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!canAddMorePets() && pets.length > 0 && (
        <div className="mt-6 rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            已達到寵物數量上限 ({user?.subscriptionPlan === 'FREE' ? 1 : 3} 隻)
          </p>
          <Link href="/subscription">
            <Button variant="link" size="sm">
              升級方案以新增更多寵物
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
