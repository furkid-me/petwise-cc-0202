'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// 示範資料
const DEMO_PRODUCTS = [
  { id: '1', name: '雞肉乾', brand: '皇家寵物食品', type: '零食', petType: ['dog_cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 164.5, proteinPer100g: 12.8, fatPer100g: 3.0, carbsPer100g: 0.8, fiberPer100g: 0.3, moisturePer100g: 18.5, ashPer100g: 2.1, sodiumPer100g: 215, calciumPer100g: 8, phosphorusPer100g: 98, potassiumPer100g: 180, magnesiumPer100g: 12, ironPer100g: 0.8, zincPer100g: 0.5, vitaminAPer100g: 0, vitaminDPer100g: 0, vitaminEPer100g: 0.1, omega3Per100g: 0.02, omega6Per100g: 0.5, taurinePer100g: 0, allergens: ['蛋'], ingredients: '100%雞胸肉、蛋黃、花椰菜、紅蘿蔔、維生素E保存劑', mainIngredients: ['雞肉'], specialTags: [], usageMethod: '請將零食撥開或剪成小塊', storageMethod: '冷藏保存' },
  { id: '2', name: '頂級無穀貓糧', brand: '皇家寵物食品', type: '乾飼糧', petType: ['cat'], ageGroup: ['成年'], origin: '法國', caloriesPer100g: 380.0, proteinPer100g: 40.0, fatPer100g: 18.0, carbsPer100g: 25.0, fiberPer100g: 3.5, moisturePer100g: 8.0, ashPer100g: 8.0, sodiumPer100g: 8000, calciumPer100g: 1200, phosphorusPer100g: 1000, potassiumPer100g: 6500, magnesiumPer100g: 1000, ironPer100g: 150, zincPer100g: 120, vitaminAPer100g: 15000, vitaminDPer100g: 1500, vitaminEPer100g: 600, omega3Per100g: 2.5, omega6Per100g: 8.0, taurinePer100g: 1600, allergens: [], ingredients: '脫水雞肉、火雞肉、豌豆、馬鈴薯澱粉、雞脂肪', mainIngredients: ['雞肉', '火雞肉'], specialTags: ['無穀', '高蛋白'], usageMethod: '每日餵食量為體重的2-3%', storageMethod: '陰涼乾燥處' },
  { id: '3', name: '天然狗罐頭', brand: '希爾思寵物食品', type: '罐頭', petType: ['dog'], ageGroup: ['成年', '老年'], origin: '美國', caloriesPer100g: 120.0, proteinPer100g: 10.0, fatPer100g: 7.0, carbsPer100g: 5.0, fiberPer100g: 1.0, moisturePer100g: 78.0, ashPer100g: 2.5, sodiumPer100g: 4500, calciumPer100g: 200, phosphorusPer100g: 180, potassiumPer100g: 2500, magnesiumPer100g: 150, ironPer100g: 25, zincPer100g: 20, vitaminAPer100g: 50000, vitaminDPer100g: 500, vitaminEPer100g: 50, omega3Per100g: 0.5, omega6Per100g: 1.2, taurinePer100g: 0, allergens: ['玉米', '大豆'], ingredients: '牛肉湯、牛肉、雞肉、胡蘿蔔、豌豆', mainIngredients: ['牛肉', '胡蘿蔔'], specialTags: ['減肥'], usageMethod: '直接餵食或搭配乾糧', storageMethod: '開封後冷藏' },
  { id: '4', name: '貓咪化毛膏', brand: '荒野饗宴', type: '補助食品', petType: ['cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 250.0, proteinPer100g: 5.0, fatPer100g: 15.0, carbsPer100g: 20.0, fiberPer100g: 3.0, moisturePer100g: 10.0, ashPer100g: 1.5, sodiumPer100g: 3000, calciumPer100g: 50, phosphorusPer100g: 40, potassiumPer100g: 800, magnesiumPer100g: 30, ironPer100g: 2, zincPer100g: 3, vitaminAPer100g: 1000, vitaminDPer100g: 50, vitaminEPer100g: 30, omega3Per100g: 2.0, omega6Per100g: 0.5, taurinePer100g: 500, allergens: ['魚'], ingredients: '麥芽糊精、魚油、纖維素、維生素', mainIngredients: ['魚油', '麥芽糊精'], specialTags: ['化毛'], usageMethod: '每日5cm供貓舔食', storageMethod: '陰涼乾燥處' },
  { id: '5', name: '低敏無穀狗糧', brand: '本能', type: '乾飼糧', petType: ['dog'], ageGroup: ['全齡'], origin: '加拿大', caloriesPer100g: 360.0, proteinPer100g: 38.0, fatPer100g: 16.0, carbsPer100g: 28.0, fiberPer100g: 4.0, moisturePer100g: 10.0, ashPer100g: 7.5, sodiumPer100g: 6000, calciumPer100g: 1000, phosphorusPer100g: 800, potassiumPer100g: 5500, magnesiumPer100g: 800, ironPer100g: 100, zincPer100g: 100, vitaminAPer100g: 12000, vitaminDPer100g: 1000, vitaminEPer100g: 400, omega3Per100g: 3.0, omega6Per100g: 7.0, taurinePer100g: 0, allergens: [], ingredients: '野豬肉、鹿肉、地瓜、綠豌豆、鷹嘴豆', mainIngredients: ['野豬肉', '鹿肉', '地瓜'], specialTags: ['低敏', '無穀'], usageMethod: '依照包裝建議餵食量', storageMethod: '陰涼乾燥處' },
  { id: '6', name: '老貓腎臟配方罐頭', brand: '希爾思寵物食品', type: '罐頭', petType: ['cat'], ageGroup: ['老年'], origin: '美國', caloriesPer100g: 100.0, proteinPer100g: 8.0, fatPer100g: 4.0, carbsPer100g: 8.0, fiberPer100g: 0.5, moisturePer100g: 80.0, ashPer100g: 1.8, sodiumPer100g: 2500, calciumPer100g: 180, phosphorusPer100g: 150, potassiumPer100g: 3500, magnesiumPer100g: 80, ironPer100g: 25, zincPer100g: 20, vitaminAPer100g: 80000, vitaminDPer100g: 800, vitaminEPer100g: 120, omega3Per100g: 0.8, omega6Per100g: 1.5, taurinePer100g: 800, allergens: [], ingredients: '豬肉湯、豬肉、雞肝、雞肉、糙米', mainIngredients: ['豬肉', '雞肝', '雞肉'], specialTags: ['低磷', '老貓專用'], usageMethod: '每日2-3餐', storageMethod: '開封後冷藏' },
  { id: '7', name: '幼犬專用飼料', brand: '冠能寵物食品', type: '乾飼糧', petType: ['dog'], ageGroup: ['幼年'], origin: '法國', caloriesPer100g: 350.0, proteinPer100g: 30.0, fatPer100g: 20.0, carbsPer100g: 30.0, fiberPer100g: 3.0, moisturePer100g: 8.0, ashPer100g: 7.0, sodiumPer100g: 7000, calciumPer100g: 1200, phosphorusPer100g: 1000, potassiumPer100g: 6000, magnesiumPer100g: 900, ironPer100g: 200, zincPer100g: 150, vitaminAPer100g: 20000, vitaminDPer100g: 1500, vitaminEPer100g: 500, omega3Per100g: 1.5, omega6Per100g: 5.0, taurinePer100g: 0, allergens: ['玉米', '大豆', '小麥'], ingredients: '脫水禽肉粉、雞肉粉、小麥、玉米、米', mainIngredients: ['雞肉粉', '小麥', '玉米', '米'], specialTags: ['幼犬專用'], usageMethod: '幼犬每日需分3-4餐', storageMethod: '陰涼乾燥處' },
  { id: '8', name: '鮮食生鮮包', brand: '愛肯拿', type: '生鮮、冷凍', petType: ['dog_cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 180.0, proteinPer100g: 15.0, fatPer100g: 12.0, carbsPer100g: 3.0, fiberPer100g: 1.0, moisturePer100g: 68.0, ashPer100g: 1.5, sodiumPer100g: 1500, calciumPer100g: 100, phosphorusPer100g: 90, potassiumPer100g: 1200, magnesiumPer100g: 80, ironPer100g: 5, zincPer100g: 4, vitaminAPer100g: 5000, vitaminDPer100g: 100, vitaminEPer100g: 5, omega3Per100g: 1.0, omega6Per100g: 2.0, taurinePer100g: 200, allergens: [], ingredients: '雞胸肉、南瓜、胡蘿蔔、雞肝、藍莓', mainIngredients: ['雞胸肉', '南瓜', '胡蘿蔔'], specialTags: ['天然', '無穀'], usageMethod: '退冰後直接食用', storageMethod: '冷凍保存' },
]

const CATEGORIES = ['全部', '零食', '罐頭', '乾飼糧', '補助食品', '生鮮、冷凍', '潔牙骨']
const ALLERGENS = ['雞肉', '蛋', '玉米', '大豆', '小麥', '牛肉', '羊肉', '魚', '火雞肉']

const PET_TYPES = [
  { value: 'dog', label: '狗', icon: '🐕' },
  { value: 'cat', label: '貓', icon: '🐱' },
  { value: 'dog_cat', label: '狗貓', icon: '🐾' }
]

const AGE_GROUPS = ['全部', '幼年', '成年', '老年', '全齡']

const SPECIAL_TAGS = ['無穀', '低敏', '減肥', '高蛋白', '化毛', '潔牙', '低磷', '天然', '老貓專用', '幼犬專用']

const SORT_OPTIONS = [
  { value: 'calories-asc', label: '熱量 低→高' },
  { value: 'calories-desc', label: '熱量 高→低' },
  { value: 'protein-desc', label: '蛋白質 高→低' },
  { value: 'name-asc', label: '名稱 A→Z' }
]

const PET_TYPE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  dog: { label: '🐕', bg: '#E3F2FD', color: '#1976D2' },
  cat: { label: '🐱', bg: '#FCE4EC', color: '#C2185B' },
  dog_cat: { label: '🐾', bg: '#FFF3E0', color: '#F57C00' }
}

// 設計規範
const DESIGN = {
  colors: {
    bg: '#FDFCFB',
    surface: '#FFFFFF',
    primary: '#FB9966',
    primaryDark: '#A36B4A',
    secondary: '#B5495B',
    text: '#554236',
    textSecondary: '#7D6559',
    textMuted: '#A8958C',
    border: '#EDE6E1',
    accent: '#554236',
    success: '#5A8F5A',
    warning: '#E9C46A',
    error: '#B5495B',
  },
  font: {
    heading: 'system-ui, -apple-system, sans-serif',
    body: 'system-ui, -apple-system, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    full: '9999px',
  },
  transition: '200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

export default function PetFoodDB() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PetFoodDBContent />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: DESIGN.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #E0E0E0', borderTopColor: DESIGN.colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: DESIGN.colors.textMuted, fontSize: '14px' }}>載入中...</p>
      </div>
    </div>
  )
}

function PetFoodDBContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState('')
  const [selectedPetType, setSelectedPetType] = useState('')
  const [selectedAge, setSelectedAge] = useState('全部')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('calories-asc')
  
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 500])
  const [proteinRange, setProteinRange] = useState<[number, number]>([0, 50])
  const [fatRange, setFatRange] = useState<[number, number]>([0, 30])
  const [phosphorusRange, setPhosphorusRange] = useState<[number, number]>([0, 2000])
  
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [selectedProduct, setSelectedProduct] = useState<typeof DEMO_PRODUCTS[0] | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [brandFilter, setBrandFilter] = useState<string | null>(null)

  useEffect(() => {
    const brandParam = searchParams.get('brand')
    if (brandParam) {
      setBrandFilter(decodeURIComponent(brandParam))
      setSearch(decodeURIComponent(brandParam))
    }
  }, [searchParams])

  useEffect(() => {
    let filtered = DEMO_PRODUCTS

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.mainIngredients.some(i => i.toLowerCase().includes(s))
      )
    }

    if (brandFilter) {
      filtered = filtered.filter(p => p.brand.includes(brandFilter))
    }

    filtered = filtered.filter(p => !p.brand.includes('【個人】'))

    if (selectedPetType) {
      filtered = filtered.filter(p => p.petType.includes(selectedPetType))
    }

    if (selectedAge && selectedAge !== '全部') {
      filtered = filtered.filter(p => p.ageGroup.includes(selectedAge))
    }

    if (selectedCategory && selectedCategory !== '全部') {
      filtered = filtered.filter(p => p.type === selectedCategory)
    }

    if (selectedAllergens.length > 0) {
      filtered = filtered.filter(p => !p.allergens.some(a => selectedAllergens.includes(a)))
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => selectedTags.every(t => p.specialTags.includes(t)))
    }

    filtered = filtered.filter(p => {
      if (p.caloriesPer100g < calorieRange[0] || p.caloriesPer100g > calorieRange[1]) return false
      if (p.proteinPer100g < proteinRange[0] || p.proteinPer100g > proteinRange[1]) return false
      if (p.fatPer100g < fatRange[0] || p.fatPer100g > fatRange[1]) return false
      if (p.phosphorusPer100g < phosphorusRange[0] || p.phosphorusPer100g > phosphorusRange[1]) return false
      return true
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'calories-asc': return a.caloriesPer100g - b.caloriesPer100g
        case 'calories-desc': return b.caloriesPer100g - a.caloriesPer100g
        case 'protein-desc': return b.proteinPer100g - a.proteinPer100g
        case 'name-asc': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

    setProducts(filtered)
  }, [search, selectedPetType, selectedAge, selectedCategory, selectedAllergens, selectedTags, sortBy, calorieRange, proteinRange, fatRange, phosphorusRange, brandFilter])

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedPetType('')
    setSelectedAge('全部')
    setSelectedCategory('全部')
    setSelectedAllergens([])
    setSelectedTags([])
    setSortBy('calories-asc')
    setCalorieRange([0, 500])
    setProteinRange([0, 50])
    setFatRange([0, 30])
    setPhosphorusRange([0, 2000])
    setBrandFilter(null)
  }

  const activeFilterCount = [selectedPetType, selectedAge !== '全部', selectedCategory !== '全部', selectedAllergens.length > 0, selectedTags.length > 0].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: DESIGN.colors.bg, paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${DESIGN.colors.primary} 0%, ${DESIGN.colors.primary} 100%)`, color: 'white', padding: `${DESIGN.spacing.lg} ${DESIGN.spacing.md}`, paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: DESIGN.spacing.md, letterSpacing: '-0.02em' }}>寵物食品庫</h1>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: DESIGN.spacing.sm }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="搜尋名稱、品牌、成分..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                border: 'none',
                borderRadius: DESIGN.radius.md,
                fontSize: '15px',
                background: 'rgba(255,255,255,0.98)',
                color: DESIGN.colors.text,
                outline: 'none',
                transition: DESIGN.transition,
              }}
            />
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: DESIGN.colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '14px 18px',
              background: activeFilterCount > 0 ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeFilterCount > 0 ? DESIGN.colors.primary : 'white',
              border: 'none',
              borderRadius: DESIGN.radius.md,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: DESIGN.transition,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            {activeFilterCount > 0 && (
              <span style={{ background: DESIGN.colors.primary, color: 'white', borderRadius: DESIGN.radius.full, padding: '2px 8px', fontSize: '11px' }}>{activeFilterCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ background: DESIGN.colors.surface, borderBottom: `1px solid ${DESIGN.colors.border}`, padding: DESIGN.spacing.md }}>
          {/* Pet Type */}
          <div style={{ marginBottom: DESIGN.spacing.lg }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: DESIGN.colors.textMuted, marginBottom: DESIGN.spacing.sm, textTransform: 'uppercase', letterSpacing: '0.05em' }}>寵物類型</label>
            <div style={{ display: 'flex', gap: DESIGN.spacing.sm }}>
              {PET_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setSelectedPetType(selectedPetType === pt.value ? '' : pt.value)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    background: selectedPetType === pt.value ? `${DESIGN.colors.primary}10` : DESIGN.colors.bg,
                    color: selectedPetType === pt.value ? DESIGN.colors.primary : DESIGN.colors.text,
                    border: `2px solid ${selectedPetType === pt.value ? DESIGN.colors.primary : 'transparent'}`,
                    borderRadius: DESIGN.radius.md,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: DESIGN.transition,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{pt.icon}</span>
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: DESIGN.spacing.lg }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: DESIGN.colors.textMuted, marginBottom: DESIGN.spacing.sm, textTransform: 'uppercase', letterSpacing: '0.05em' }}>食品分類</label>
            <div style={{ display: 'flex', gap: DESIGN.spacing.xs, overflowX: 'auto', paddingBottom: '4px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 14px',
                    background: selectedCategory === cat ? DESIGN.colors.accent : DESIGN.colors.bg,
                    color: selectedCategory === cat ? 'white' : DESIGN.colors.text,
                    border: 'none',
                    borderRadius: DESIGN.radius.full,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: DESIGN.transition,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div style={{ marginBottom: DESIGN.spacing.lg }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: DESIGN.colors.textMuted, marginBottom: DESIGN.spacing.sm, textTransform: 'uppercase', letterSpacing: '0.05em' }}>過敏原排除</label>
            <div style={{ display: 'flex', gap: DESIGN.spacing.xs, flexWrap: 'wrap' }}>
              {ALLERGENS.map(allergen => (
                <button
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  style={{
                    padding: '8px 14px',
                    background: selectedAllergens.includes(allergen) ? DESIGN.colors.error + '15' : DESIGN.colors.bg,
                    color: selectedAllergens.includes(allergen) ? DESIGN.colors.error : DESIGN.colors.text,
                    border: `1px solid ${selectedAllergens.includes(allergen) ? DESIGN.colors.error : 'transparent'}`,
                    borderRadius: DESIGN.radius.md,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: DESIGN.transition,
                    textDecoration: selectedAllergens.includes(allergen) ? 'line-through' : 'none',
                  }}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition Range Toggle */}
          <button
            onClick={() => setExpandedSection(expandedSection === 'nutrition' ? null : 'nutrition')}
            style={{
              width: '100%',
              padding: '14px',
              background: DESIGN.colors.bg,
              border: 'none',
              borderRadius: DESIGN.radius.md,
              fontSize: '14px',
              color: DESIGN.colors.text,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: expandedSection === 'nutrition' ? DESIGN.spacing.md : 0,
            }}
          >
            <span>營養範圍</span>
            <span style={{ color: DESIGN.colors.primary, fontSize: '12px' }}>{expandedSection === 'nutrition' ? '收合' : '展開'}</span>
          </button>

          {expandedSection === 'nutrition' && (
            <div style={{ marginTop: DESIGN.spacing.md }}>
              <RangeSlider label="熱量 (kcal)" min={0} max={500} value={calorieRange} onChange={setCalorieRange} unit="kcal" />
              <RangeSlider label="蛋白質 (g)" min={0} max={50} value={proteinRange} onChange={setProteinRange} unit="g" />
              <RangeSlider label="脂肪 (g)" min={0} max={30} value={fatRange} onChange={setFatRange} unit="g" />
              <RangeSlider label="磷 (mg)" min={0} max={2000} value={phosphorusRange} onChange={setPhosphorusRange} unit="mg" />
            </div>
          )}

          {/* Sort & Clear */}
          <div style={{ display: 'flex', gap: DESIGN.spacing.sm, marginTop: DESIGN.spacing.lg }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${DESIGN.colors.border}`,
                borderRadius: DESIGN.radius.md,
                fontSize: '14px',
                background: DESIGN.colors.surface,
                color: DESIGN.colors.text,
                cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            <button
              onClick={clearAllFilters}
              style={{
                padding: '12px 18px',
                background: DESIGN.colors.bg,
                border: 'none',
                borderRadius: DESIGN.radius.md,
                fontSize: '14px',
                color: DESIGN.colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              清除
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: `${DESIGN.spacing.md} ${DESIGN.spacing.md} ${DESIGN.spacing.sm}` }}>
        <p style={{ fontSize: '13px', color: DESIGN.colors.textMuted }}>
          共 <strong style={{ color: DESIGN.colors.text }}>{products.length}</strong> 項產品
        </p>
      </div>

      {/* Product List */}
      <div style={{ padding: `0 ${DESIGN.spacing.md}`, display: 'flex', flexDirection: 'column', gap: DESIGN.spacing.sm }}>
        {products.map((product, index) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            style={{
              background: DESIGN.colors.surface,
              borderRadius: DESIGN.radius.lg,
              padding: DESIGN.spacing.md,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: DESIGN.transition,
              border: `1px solid ${DESIGN.colors.border}`,
              animation: `fadeIn 300ms ease-out ${index * 50}ms both`,
            }}
          >
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: DESIGN.spacing.sm }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {product.petType.map(pt => PET_TYPE_BADGES[pt] && (
                  <span key={pt} style={{ padding: '3px 8px', background: PET_TYPE_BADGES[pt].bg, color: PET_TYPE_BADGES[pt].color, borderRadius: DESIGN.radius.sm, fontSize: '12px' }}>
                    {PET_TYPE_BADGES[pt].label}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>{product.type}</span>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: DESIGN.colors.text, marginBottom: '4px', letterSpacing: '-0.01em' }}>{product.name}</h3>
            <p style={{ fontSize: '13px', color: DESIGN.colors.textSecondary, marginBottom: DESIGN.spacing.sm }}>{product.brand}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: DESIGN.spacing.xs }}>
              {[
                { label: '熱量', value: product.caloriesPer100g, unit: 'kcal' },
                { label: '蛋白', value: product.proteinPer100g, unit: 'g' },
                { label: '脂肪', value: product.fatPer100g, unit: 'g' },
                { label: '磷', value: product.phosphorusPer100g, unit: 'mg' },
              ].map((item, i) => (
                <div key={i} style={{ background: DESIGN.colors.bg, borderRadius: DESIGN.radius.sm, padding: '8px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: DESIGN.colors.primary }}>{item.value}</div>
                  <div style={{ fontSize: '10px', color: DESIGN.colors.textMuted }}>{item.unit}</div>
                </div>
              ))}
            </div>

            {product.allergens.length > 0 && (
              <div style={{ marginTop: DESIGN.spacing.sm, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {product.allergens.map(a => (
                  <span key={a} style={{ padding: '2px 8px', background: DESIGN.colors.error + '12', color: DESIGN.colors.error, borderRadius: DESIGN.radius.sm, fontSize: '11px' }}>
                    ⚠️ {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: DESIGN.spacing.xxl }}>
            <div style={{ fontSize: '48px', marginBottom: DESIGN.spacing.md }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: DESIGN.colors.text, marginBottom: '4px' }}>找不到符合的產品</h3>
            <p style={{ fontSize: '14px', color: DESIGN.colors.textMuted }}>試試放寬篩選條件</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: DESIGN.colors.surface,
              borderRadius: `${DESIGN.radius.lg} ${DESIGN.radius.lg} 0 0`,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              animation: 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            
            <div style={{ padding: DESIGN.spacing.md, borderBottom: `1px solid ${DESIGN.colors.border}` }}>
              <div style={{ width: '36px', height: '4px', background: DESIGN.colors.border, borderRadius: '2px', margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: DESIGN.spacing.sm }}>
                {selectedProduct.petType.map(pt => PET_TYPE_BADGES[pt] && (
                  <span key={pt} style={{ padding: '4px 10px', background: PET_TYPE_BADGES[pt].bg, color: PET_TYPE_BADGES[pt].color, borderRadius: DESIGN.radius.sm, fontSize: '12px' }}>
                    {PET_TYPE_BADGES[pt].label}
                  </span>
                ))}
                <span style={{ padding: '4px 10px', background: DESIGN.colors.bg, borderRadius: DESIGN.radius.sm, fontSize: '12px' }}>{selectedProduct.type}</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: DESIGN.colors.text, marginBottom: '4px', letterSpacing: '-0.02em' }}>{selectedProduct.name}</h2>
              <p style={{ fontSize: '14px', color: DESIGN.colors.textSecondary }}>{selectedProduct.brand} · {selectedProduct.origin}</p>
            </div>

            {/* Nutrition Table */}
            <div style={{ padding: DESIGN.spacing.md, borderBottom: `1px solid ${DESIGN.colors.border}` }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: DESIGN.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: DESIGN.spacing.md }}>營養標示（每100g）</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['熱量', selectedProduct.caloriesPer100g, 'kcal'],
                    ['蛋白質', selectedProduct.proteinPer100g, 'g'],
                    ['脂肪', selectedProduct.fatPer100g, 'g'],
                    ['碳水', selectedProduct.carbsPer100g, 'g'],
                    ['纖維', selectedProduct.fiberPer100g, 'g'],
                    ['水分', selectedProduct.moisturePer100g, 'g'],
                    ['鈉', selectedProduct.sodiumPer100g, 'mg'],
                    ['鈣', selectedProduct.calciumPer100g, 'mg'],
                    ['磷', selectedProduct.phosphorusPer100g, 'mg'],
                    ['鉀', selectedProduct.potassiumPer100g, 'mg'],
                  ].map(([label, value, unit], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${DESIGN.colors.border}` }}>
                      <td style={{ padding: '10px 0', color: DESIGN.colors.textSecondary }}>{label}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '600', color: DESIGN.colors.primary }}>{value} {unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ingredients */}
            <div style={{ padding: DESIGN.spacing.md, borderBottom: `1px solid ${DESIGN.colors.border}` }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: DESIGN.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: DESIGN.spacing.sm }}>完整成分</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: DESIGN.colors.text }}>{selectedProduct.ingredients}</p>
            </div>

            {selectedProduct.allergens.length > 0 && (
              <div style={{ padding: DESIGN.spacing.md, borderBottom: `1px solid ${DESIGN.colors.border}` }}>
                <h3 style={{ fontSize: '12px', fontWeight: '600', color: DESIGN.colors.error, marginBottom: DESIGN.spacing.sm }}>⚠️ 過敏原</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedProduct.allergens.map(a => (
                    <span key={a} style={{ padding: '6px 14px', background: DESIGN.colors.error + '12', color: DESIGN.colors.error, borderRadius: DESIGN.radius.full, fontSize: '13px' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: DESIGN.spacing.lg, paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: DESIGN.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: DESIGN.radius.md,
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: DESIGN.colors.surface, borderTop: `1px solid ${DESIGN.colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🏠</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>首頁</span>
        </button>
        <button onClick={() => router.push('/brands')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🏪</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>品牌</span>
        </button>
        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.primary, fontWeight: '600' }}>食品庫</span>
        </button>
      </nav>
    </div>
  )
}

function RangeSlider({ label, min, max, value, onChange, unit, step = 1 }: {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  unit: string
  step?: number
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: DESIGN.colors.text }}>{label}</span>
        <span style={{ fontSize: '12px', color: DESIGN.colors.primary, fontWeight: '500' }}>{value[0]} - {value[1]} {unit}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          style={{ flex: 1, accentColor: DESIGN.colors.primary }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          style={{ flex: 1, accentColor: DESIGN.colors.primary }}
        />
      </div>
    </div>
  )
}
