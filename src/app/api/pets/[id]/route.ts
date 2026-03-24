import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/pets/[id] - Get a specific pet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true,
      },
      include: {
        weightRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error('Get pet error:', error);
    return NextResponse.json(
      { error: 'Failed to get pet' },
      { status: 500 }
    );
  }
}

// PUT /api/pets/[id] - Update a pet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check pet ownership
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
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
      isDefault,
    } = body;

    // If setting this pet as default, unset other defaults
    if (isDefault) {
      await prisma.pet.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const pet = await prisma.pet.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(species !== undefined && { species }),
        ...(breed !== undefined && { breed }),
        ...(gender !== undefined && { gender }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(adoptionDate !== undefined && { adoptionDate: adoptionDate ? new Date(adoptionDate) : null }),
        ...(color !== undefined && { color }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(isNeutered !== undefined && { isNeutered }),
        ...(microchipId !== undefined && { microchipId }),
        ...(medicalNotes !== undefined && { medicalNotes }),
        ...(allergies !== undefined && { allergies }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    // Record new weight if changed
    if (weight && parseFloat(weight) !== existingPet.weight?.toNumber()) {
      await prisma.weightRecord.create({
        data: {
          petId: pet.id,
          userId: user.id,
          recordDate: new Date(),
          weightKg: parseFloat(weight),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error('Update pet error:', error);
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    );
  }
}

// DELETE /api/pets/[id] - Soft delete a pet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check pet ownership
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.pet.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    // If this was the default pet, set another as default
    if (existingPet.isDefault) {
      const nextPet = await prisma.pet.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextPet) {
        await prisma.pet.update({
          where: { id: nextPet.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
}
