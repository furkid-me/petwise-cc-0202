import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/food-categories - 取得所有分類
export async function GET() {
  try {
    const categories = await prisma.foodCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { products: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: categories.map(c => ({
        ...c,
        productCount: c._count.products
      }))
    })
    
  } catch (error) {
    console.error('Food categories API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
