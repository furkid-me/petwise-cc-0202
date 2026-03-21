// src/app/api/medication-records/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/medication-records - 新增用藥記錄
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const {
      petId,
      medicalRecordId,
      medicationName,
      dosageValue,
      dosageUnit,
      frequency,
      startDate,
      endDate,
      purpose,
      sideEffectsObserved,
      postMedicationObservations,
      photoUrl,
    } = await request.json();

    if (!petId || !medicationName || dosageValue === undefined || !dosageUnit || !frequency || !startDate) {
      return NextResponse.json({ error: 'Missing required medication record fields' }, { status: 400 });
    }

    const newMedicationRecord = await prisma.medicationRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        medicalRecordId,
        medicationName,
        dosageValue: parseFloat(dosageValue),
        dosageUnit,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        purpose,
        sideEffectsObserved,
        postMedicationObservations,
        photoUrl,
      },
    });

    return NextResponse.json(newMedicationRecord, { status: 201 });
  } catch (error) {
    console.error('Create medication record API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/medication-records - 獲取用藥記錄列表（可帶查詢）
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');
    const medicalRecordId = searchParams.get('medicalRecordId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }

    const whereClause: any = {
      userId: decodedToken.userId,
      petId: petId,
    };
    if (medicalRecordId) {
      whereClause.medicalRecordId = medicalRecordId;
    }
    if (startDate) {
      whereClause.startDate = { ...whereClause.startDate, gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.startDate = { ...whereClause.startDate, lte: new Date(endDate) };
    }

    const medicationRecords = await prisma.medicationRecord.findMany({
      where: whereClause,
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(medicationRecords);
  } catch (error) {
    console.error('Get medication records API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
