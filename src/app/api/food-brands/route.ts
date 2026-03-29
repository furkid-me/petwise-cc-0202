import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/food-brands - 取得所有品牌
export async function GET() {
  try {
    const brands = await prisma.foodBrand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        origin: true,
        _count: {
          select: { products: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: brands.map(b => ({
        ...b,
        productCount: b._count.products
      }))
    })
    
  } catch (error) {
    console.error('Food brands API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
