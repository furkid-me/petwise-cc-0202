'use client';

import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserStore, useCurrentPet } from '@/stores/user-store';
import { getSpeciesEmoji } from '@/lib/utils';
import Link from 'next/link';

export function PetSelector() {
  const pets = useUserStore((state) => state.pets);
  const setCurrentPetId = useUserStore((state) => state.setCurrentPetId);
  const currentPet = useCurrentPet();

  if (pets.length === 0) {
    return (
      <Link href="/pets/new">
        <Button variant="outline" size="sm">
          新增寵物
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {currentPet?.photoUrl ? (
              <AvatarImage src={currentPet.photoUrl} alt={currentPet.name} />
            ) : null}
            <AvatarFallback className="text-xs">
              {currentPet ? getSpeciesEmoji(currentPet.species) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate">{currentPet?.name || '選擇寵物'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {pets.map((pet) => (
          <DropdownMenuItem
            key={pet.id}
            onClick={() => setCurrentPetId(pet.id)}
            className="flex items-center gap-2"
          >
            <Avatar className="h-6 w-6">
              {pet.photoUrl ? (
                <AvatarImage src={pet.photoUrl} alt={pet.name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {getSpeciesEmoji(pet.species)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{pet.name}</span>
            {pet.id === currentPet?.id && (
              <span className="ml-auto text-xs text-primary">目前</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pets/new" className="w-full">
            + 新增寵物
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
