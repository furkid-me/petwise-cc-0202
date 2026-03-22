import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

function typeToSpecies(type: string | null | undefined): string | null {
  if (!type) return null;
  const map: Record<string, string> = { dog: 'DOG', cat: 'CAT', other: 'OTHER' };
  return map[type.toLowerCase()] ?? 'OTHER';
}

function normalizePet(pet: Record<string, unknown>) {
  return {
    ...pet,
    species: (pet.species as string | null) ?? typeToSpecies(pet.type as string | null),
    birthday: (pet.birthday as string | null) ?? (pet.dateOfBirth as string | null) ?? null,
    microchipId: (pet.microchipId as string | null) ?? (pet.chipNumber as string | null) ?? null,
    weight: pet.weight != null ? Number(pet.weight) : (pet.initialWeightKg != null ? Number(pet.initialWeightKg) : null),
    photoUrl: (pet.photoUrl as string | null) ?? (pet.profilePictureUrl as string | null) ?? null,
    dailyKcalTarget: pet.dailyKcalTarget != null ? Number(pet.dailyKcalTarget) : null,
    dailyWaterMlTarget: pet.dailyWaterMlTarget != null ? Number(pet.dailyWaterMlTarget) : null,
    isDefault: (pet.isDefault as boolean) ?? false,
    isActive: (pet.isActive as boolean) ?? true,
  };
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decodedToken: { userId: string; lineUserId: string };
    try { decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; lineUserId: string }; } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const body = await request.json();
    const {
      name,
      // New field names (preferred)
      species, birthday, microchipId, weight, photoUrl, medicalNotes, allergies,
      // Old field names (fallback for backward compat)
      type, dateOfBirth, chipNumber, initialWeightKg, profilePictureUrl, healthNotes,
      // Shared fields
      breed, gender, isNeutered, dailyKcalTarget, dailyWaterMlTarget, personalityTraits,
    } = body;

    const resolvedSpecies = species ?? typeToSpecies(type);
    const resolvedWeight = weight ?? initialWeightKg;

    if (!name || !resolvedSpecies || resolvedWeight === undefined) {
      return NextResponse.json({ error: 'Name, species, and weight are required' }, { status: 400 });
    }

    const normalizedGender = gender === 'male' || gender === 'MALE' ? 'MALE'
      : gender === 'female' || gender === 'FEMALE' ? 'FEMALE'
      : gender === 'unknown' || gender === 'UNKNOWN' ? 'UNKNOWN'
      : null;

    const newPet = await prisma.pet.create({
      data: {
        userId: decodedToken.userId,
        name,
        species: resolvedSpecies as 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'HAMSTER' | 'FISH' | 'REPTILE' | 'OTHER',
        type: type ?? resolvedSpecies?.toLowerCase(),
        breed: breed ?? null,
        gender: normalizedGender as 'MALE' | 'FEMALE' | 'UNKNOWN' | null,
        isNeutered: isNeutered ?? false,
        birthday: birthday ? new Date(birthday) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : (birthday ? new Date(birthday) : null),
        microchipId: microchipId ?? null,
        chipNumber: chipNumber ?? microchipId ?? null,
        weight: resolvedWeight ? parseFloat(String(resolvedWeight)) : null,
        initialWeightKg: resolvedWeight ? parseFloat(String(resolvedWeight)) : null,
        photoUrl: photoUrl ?? profilePictureUrl ?? null,
        profilePictureUrl: profilePictureUrl ?? photoUrl ?? null,
        medicalNotes: medicalNotes ?? null,
        healthNotes: healthNotes ?? [],
        allergies: allergies ?? [],
        dailyKcalTarget: dailyKcalTarget ? parseFloat(String(dailyKcalTarget)) : null,
        dailyWaterMlTarget: dailyWaterMlTarget ? parseFloat(String(dailyWaterMlTarget)) : null,
        personalityTraits: personalityTraits ?? null,
      },
    });

    return NextResponse.json(normalizePet(newPet as unknown as Record<string, unknown>), { status: 201 });
  } catch (error) {
    console.error('Create pet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decodedToken: { userId: string; lineUserId: string };
    try { decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; lineUserId: string }; } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const pets = await prisma.pet.findMany({ where: { userId: decodedToken.userId }, orderBy: { createdAt: 'asc' } });
    const normalizedPets = pets.map(p => normalizePet(p as unknown as Record<string, unknown>));
    return NextResponse.json({ pets: normalizedPets }, { status: 200 });
  } catch (error) {
    console.error('Get pets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
