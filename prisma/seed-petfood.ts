import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('開始匯入寵物食品資料...')
  
  const dataDir = path.join(process.cwd(), 'data')
  
  // 匯入分類
  console.log('匯入分類...')
  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'petfood_categories.json'), 'utf-8')
  )
  
  for (const cat of categoriesData) {
    await prisma.foodCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat
    })
  }
  console.log(`  已匯入 ${categoriesData.length} 個分類`)
  
  // 匯入品牌
  console.log('匯入品牌...')
  const brandsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'petfood_brands.json'), 'utf-8')
  )
  
  let brandCount = 0
  for (const brand of brandsData) {
    await prisma.foodBrand.upsert({
      where: { id: brand.id },
      update: brand,
      create: brand
    })
    brandCount++
    if (brandCount % 500 === 0) {
      console.log(`  已匯入 ${brandCount}/${brandsData.length} 品牌`)
    }
  }
  console.log(`  已匯入 ${brandCount} 個品牌`)
  
  // 匯入產品（分批處理）
  console.log('匯入產品...')
  const productsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'petfood_products.json'), 'utf-8')
  )
  
  const batchSize = 100
  let productCount = 0
  
  for (let i = 0; i < productsData.length; i += batchSize) {
    const batch = productsData.slice(i, i + batchSize)
    
    for (const product of batch) {
      // 清理 null 值
      const cleanProduct = Object.fromEntries(
        Object.entries(product).map(([k, v]) => [k, v === null ? undefined : v])
      )
      
      try {
        await prisma.foodProduct.upsert({
          where: { moaId: product.moaId },
          update: cleanProduct,
          create: cleanProduct as any
        })
        productCount++
      } catch (error) {
        console.error(`  產品匯入失敗: ${product.name}`, error)
      }
    }
    
    if ((i + batchSize) % 1000 === 0) {
      console.log(`  已匯入 ${productCount}/${productsData.length} 產品`)
    }
  }
  console.log(`  已匯入 ${productCount} 個產品`)
  
  console.log('匯入完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
