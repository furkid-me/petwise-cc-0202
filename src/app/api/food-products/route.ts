import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/food-products - 搜尋/篩選寵物食品
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // 搜尋參數
    const query = searchParams.get('q') || ''
    const petType = searchParams.get('petType') // dog, cat, dog_cat, other_small_animal
    const category = searchParams.get('category') // treats, canned, dry_food, etc.
    const brand = searchParams.get('brand')
    const origin = searchParams.get('origin')
    const minProtein = searchParams.get('minProtein')
    const maxCalories = searchParams.get('maxCalories')
    const allergens = searchParams.get('allergens') // comma-separated: 雞肉,蛋,玉米
    
    // 分頁
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit
    
    // 建立查詢條件
    const where: any = {}
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { fullIngredientsList: { contains: query, mode: 'insensitive' } }
      ]
    }
    
    if (petType) {
      where.petType = { has: petType }
    }
    
    if (category) {
      where.type = category
    }
    
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }
    
    if (origin) {
      where.origin = origin
    }
    
    if (minProtein) {
      where.proteinPer100g = { gte: parseFloat(minProtein) }
    }
    
    if (maxCalories) {
      where.caloriesPer100g = { lte: parseFloat(maxCalories) }
    }
    
    if (allergens) {
      const allergenList = allergens.split(',').map(a => a.trim())
      where.NOT = {
        allergens: {
          hasSome: allergenList
        }
      }
    }
    
    // 查詢資料庫
    const [products, total] = await Promise.all([
      prisma.foodProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          brand: true,
          type: true,
          petType: true,
          origin: true,
          caloriesPer100g: true,
          proteinPer100g: true,
          fatPer100g: true,
          carbsPer100g: true,
          fiberPer100g: true,
          moisturePer100g: true,
          sodiumPer100g: true,
          calciumPer100g: true,
          phosphorusPer100g: true,
          potassiumPer100g: true,
          mainIngredients: true,
          allergens: true,
          fullIngredientsList: true,
          packageDesc: true,
          imageUrl: true
        }
      }),
      prisma.foodProduct.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Food products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch food products' },
      { status: 500 }
    )
  }
}

// POST /api/food-products - 取得產品詳情（多筆）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: 'ids array is required' },
        { status: 400 }
      )
    }
    
    const products = await prisma.foodProduct.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
        petType: true,
        origin: true,
        fullIngredientsList: true,
        mainIngredients: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        fatPer100g: true,
        carbsPer100g: true,
        fiberPer100g: true,
        moisturePer100g: true,
        sodiumPer100g: true,
        calciumPer100g: true,
        phosphorusPer100g: true,
        allergens: true,
        packageDesc: true,
        usageMethod: true,
        storageMethod: true,
        imageUrl: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: products
    })
    
  } catch (error) {
    console.error('Food products batch API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch food products' },
      { status: 500 }
    )
  }
}
