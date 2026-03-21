// src/app/api/medical-records/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/medical-records - 新增醫療記錄
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
      recordDate,
      type,
      title,
      clinicName,
      veterinarian,
      diagnosis,
      treatmentPlan,
      costTwd,
      notes,
      attachmentUrls,
      isOngoingIssue,
    } = await request.json();

    if (!petId || !recordDate || !type) {
      return NextResponse.json({ error: 'Missing required medical record fields' }, { status: 400 });
    }

    const newMedicalRecord = await prisma.medicalRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        recordDate: new Date(recordDate),
        type,
        title,
        clinicName,
        veterinarian,
        diagnosis,
        treatmentPlan,
        costTwd: costTwd ? parseFloat(costTwd) : null,
        notes,
        attachmentUrls: attachmentUrls || [],
        isOngoingIssue: isOngoingIssue || false,
      },
    });

    return NextResponse.json(newMedicalRecord, { status: 201 });
  } catch (error) {
    console.error('Create medical record API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/medical-records - 獲取用藥記錄列表（可帶查詢）
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
    const type = searchParams.get('type'); // vet_visit, checkup, symptom, ongoing_issue
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeOngoing = searchParams.get('includeOngoing') === 'true';

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }

    const whereClause: any = {
      userId: decodedToken.userId,
      petId: petId,
    };
    if (type) {
      whereClause.type = type;
    }
    if (startDate) {
      whereClause.recordDate = { ...whereClause.recordDate, gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.recordDate = { ...whereClause.recordDate, lte: new Date(endDate) };
    }
    if (includeOngoing) {
      whereClause.isOngoingIssue = true;
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: whereClause,
      orderBy: { recordDate: 'desc' },
      include: {
        medications: true,
        examinations: true,
      },
    });

    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error('Get medical records API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
