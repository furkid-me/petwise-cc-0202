// src/app/api/food-products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// GET /api/food-products - 獲取寵物食品列表（可帶查詢參數）
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
    const query = searchParams.get('query') || '';
    const petType = searchParams.get('petType') || '';
    const type = searchParams.get('type') || '';

    const foodProducts = await prisma.foodProduct.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
            ],
          } : {},
          petType ? { petType: { has: petType } } : {},
          type ? { type: { contains: type, mode: 'insensitive' } } : {},
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    return NextResponse.json({ foodProducts }, { status: 200 });
  } catch (error) {
    console.error('Get food products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/food-products - 新增寵物食品資料
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

    const data = await request.json();

    const newFoodProduct = await prisma.foodProduct.create({
      data: {
        ...data,
        caloriesPer100g: data.caloriesPer100g ? parseFloat(data.caloriesPer100g) : null,
        proteinPer100g: data.proteinPer100g ? parseFloat(data.proteinPer100g) : null,
        fatPer100g: data.fatPer100g ? parseFloat(data.fatPer100g) : null,
        carbsPer100g: data.carbsPer100g ? parseFloat(data.carbsPer100g) : null,
        moisturePer100g: data.moisturePer100g ? parseFloat(data.moisturePer100g) : null,
        fiberPer100g: data.fiberPer100g ? parseFloat(data.fiberPer100g) : null,
        ashPer100g: data.ashPer100g ? parseFloat(data.ashPer100g) : null,
        packageSizeG: data.packageSizeG ? parseFloat(data.packageSizeG) : null,
        servingSizeG: data.servingSizeG ? parseFloat(data.servingSizeG) : null,
      },
    });

    return NextResponse.json(newFoodProduct, { status: 201 });
  } catch (error) {
    console.error('Create food product API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
