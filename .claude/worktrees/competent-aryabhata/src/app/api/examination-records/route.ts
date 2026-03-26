// src/app/api/examination-records/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// POST /api/examination-records - 新增檢驗報告記錄
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
      examinationDate,
      examinationType,
      clinicName,
      reportUrl,
      notes,
      results, // JSONB 格式的檢驗結果
    } = await request.json();

    if (!petId || !examinationDate || !examinationType) {
      return NextResponse.json({ error: 'Missing required examination record fields' }, { status: 400 });
    }

    const newExaminationRecord = await prisma.examinationRecord.create({
      data: {
        userId: decodedToken.userId,
        petId,
        medicalRecordId,
        examinationDate: new Date(examinationDate),
        examinationType,
        clinicName,
        reportUrl,
        notes,
        results: results || null,
      },
    });

    return NextResponse.json(newExaminationRecord, { status: 201 });
  } catch (error) {
    console.error('Create examination record API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/examination-records - 獲取檢驗報告列表（可帶查詢）
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
      whereClause.examinationDate = { ...whereClause.examinationDate, gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.examinationDate = { ...whereClause.examinationDate, lte: new Date(endDate) };
    }

    const examinationRecords = await prisma.examinationRecord.findMany({
      where: whereClause,
      orderBy: { examinationDate: 'desc' },
    });

    return NextResponse.json(examinationRecords);
  } catch (error) {
    console.error('Get examination records API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
