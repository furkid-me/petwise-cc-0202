import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, checkSubscriptionLimit } from '@/lib/auth';

// GET /api/pets - List all pets for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pets = await prisma.pet.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    console.error('Get pets error:', error);
    return NextResponse.json(
      { error: 'Failed to get pets' },
      { status: 500 }
    );
  }
}

// POST /api/pets - Create a new pet
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription limit
    const petCount = await prisma.pet.count({
      where: { userId: user.id, isActive: true },
    });

    const limitCheck = checkSubscriptionLimit(user, 'maxPets', petCount);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `已達到寵物數量上限 (${limitCheck.limit} 隻)，請升級方案以新增更多寵物`,
          code: 'LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      species,
      breed,
      gender,
      birthday,
      adoptionDate,
      color,
      weight,
      photoUrl,
      isNeutered,
      microchipId,
      medicalNotes,
      allergies,
    } = body;

    if (!name || !species) {
      return NextResponse.json(
        { error: 'Name and species are required' },
        { status: 400 }
      );
    }

    // If this is the first pet, make it default
    const isFirstPet = petCount === 0;

    const pet = await prisma.pet.create({
      data: {
        userId: user.id,
        name,
        species,
        breed,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        adoptionDate: adoptionDate ? new Date(adoptionDate) : null,
        color,
        weight: weight ? parseFloat(weight) : null,
        photoUrl,
        isNeutered: isNeutered ?? false,
        microchipId,
        medicalNotes,
        allergies: allergies || [],
        isDefault: isFirstPet,
      },
    });

    // Record initial weight if provided
    if (weight) {
      await prisma.weightRecord.create({
        data: {
          petId: pet.id,
          weight: parseFloat(weight),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error('Create pet error:', error);
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    );
  }
}
