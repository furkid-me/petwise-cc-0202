'use client'

import { useState, useEffect } from 'react'

// 示範資料
const DEMO_PRODUCTS = [
  { id: '1', name: '雞肉乾', brand: '【個人】楊甯喬', type: '零食', petType: ['dog_cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 164.5, proteinPer100g: 12.8, fatPer100g: 3.0, carbsPer100g: 0.8, phosphorusPer100g: 0.1, allergens: ['蛋'], mainIngredients: ['雞肉'], specialTags: [], usageMethod: '請將零食撥開或剪成小塊', storageMethod: '冷藏保存' },
  { id: '2', name: '羊奶荷包蛋', brand: '【個人】楊甯喬', type: '零食', petType: ['dog_cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 46.2, proteinPer100g: 8.5, fatPer100g: 9.6, carbsPer100g: 1.2, phosphorusPer100g: 0.08, allergens: ['蛋'], mainIngredients: ['羊肉', '雞蛋'], specialTags: [], usageMethod: '適量給予', storageMethod: '冷藏保存' },
  { id: '3', name: '鴨氣管', brand: '【個人】黃如盈', type: '零食', petType: ['dog'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 200.0, proteinPer100g: 15.0, fatPer100g: 8.0, carbsPer100g: 0.5, phosphorusPer100g: 0.12, allergens: [], mainIngredients: ['鴨肉'], specialTags: [], usageMethod: '作為零食適量給予', storageMethod: '陰涼乾燥處' },
  { id: '4', name: '頂級無穀貓糧', brand: '皇家寵物食品', type: '乾飼糧', petType: ['cat'], ageGroup: ['成年'], origin: '法國', caloriesPer100g: 380.0, proteinPer100g: 40.0, fatPer100g: 18.0, carbsPer100g: 25.0, phosphorusPer100g: 1.2, allergens: [], mainIngredients: ['雞肉', '火雞肉'], specialTags: ['無穀', '高蛋白'], usageMethod: '每日適量', storageMethod: '陰涼乾燥處' },
  { id: '5', name: '天然狗罐頭', brand: '希爾思寵物食品', type: '罐頭', petType: ['dog'], ageGroup: ['成年', '老年'], origin: '美國', caloriesPer100g: 120.0, proteinPer100g: 10.0, fatPer100g: 7.0, carbsPer100g: 5.0, phosphorusPer100g: 0.8, allergens: ['玉米', '大豆'], mainIngredients: ['牛肉', '胡蘿蔔'], specialTags: ['減肥'], usageMethod: '直接餵食或搭配乾糧', storageMethod: '開封後冷藏' },
  { id: '6', name: '貓咪化毛膏', brand: '喵喵星球', type: '補助食品', petType: ['cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 250.0, proteinPer100g: 5.0, fatPer100g: 15.0, carbsPer100g: 20.0, phosphorusPer100g: 0.05, allergens: ['魚'], mainIngredients: ['魚油', '麥芽糊精'], specialTags: ['化毛'], usageMethod: '每日擠出約5cm供貓舔食', storageMethod: '陰涼乾燥處，避免陽光直射' },
  { id: '7', name: '狗狗潔牙骨', brand: 'Greenies', type: '潔牙骨', petType: ['dog'], ageGroup: ['成年'], origin: '美國', caloriesPer100g: 290.0, proteinPer100g: 28.0, fatPer100g: 8.0, carbsPer100g: 35.0, phosphorusPer100g: 0.5, allergens: ['小麥'], mainIngredients: ['玉米澱粉', '小麥蛋白'], specialTags: ['潔牙'], usageMethod: '每日一根，幫助清潔牙齒', storageMethod: '室溫保存' },
  { id: '8', name: '鮮食生鮮包', brand: '鮮食家', type: '生鮮、冷凍', petType: ['dog_cat'], ageGroup: ['全齡'], origin: '台灣', caloriesPer100g: 180.0, proteinPer100g: 15.0, fatPer100g: 12.0, carbsPer100g: 3.0, phosphorusPer100g: 0.3, allergens: [], mainIngredients: ['雞胸肉', '南瓜', '胡蘿蔔'], specialTags: ['天然', '無穀'], usageMethod: '退冰後直接食用或搭配乾糧', storageMethod: '冷凍保存，開封後冷藏' },
  { id: '9', name: '幼犬專用飼料', brand: '皇家寵物食品', type: '乾飼糧', petType: ['dog'], ageGroup: ['幼年'], origin: '法國', caloriesPer100g: 350.0, proteinPer100g: 30.0, fatPer100g: 20.0, carbsPer100g: 30.0, phosphorusPer100g: 1.0, allergens: ['玉米', '大豆', '小麥'], mainIngredients: ['雞肉粉', '米', '玉米'], specialTags: ['幼犬專用', '高鈣'], usageMethod: '依照包裝建議量餵食', storageMethod: '陰涼乾燥處' },
  { id: '10', name: '老貓腎臟配方', brand: '希爾思寵物食品', type: '罐頭', petType: ['cat'], ageGroup: ['老年'], origin: '美國', caloriesPer100g: 100.0, proteinPer100g: 8.0, fatPer100g: 4.0, carbsPer100g: 8.0, phosphorusPer100g: 0.3, allergens: [], mainIngredients: ['豬肉', '雞肝'], specialTags: ['低磷', '腎臟配方', '老貓專用'], usageMethod: '每日2-3餐', storageMethod: '開封後冷藏' },
  { id: '11', name: '低敏無穀狗糧', brand: '荒野饗宴', type: '乾飼糧', petType: ['dog'], ageGroup: ['全齡'], origin: '美國', caloriesPer100g: 360.0, proteinPer100g: 38.0, fatPer100g: 16.0, carbsPer100g: 28.0, phosphorusPer100g: 1.1, allergens: [], mainIngredients: ['野豬肉', '鹿肉', '地瓜'], specialTags: ['低敏', '無穀', '單一蛋白'], usageMethod: '每日適量', storageMethod: '陰涼乾燥處' },
  { id: '12', name: '減重配方貓粮', brand: '皇家寵物食品', type: '乾飼糧', petType: ['cat'], ageGroup: ['成年'], origin: '法國', caloriesPer100g: 300.0, proteinPer100g: 35.0, fatPer100g: 10.0, carbsPer100g: 30.0, phosphorusPer100g: 0.9, allergens: ['玉米'], mainIngredients: ['雞胸肉', '纖維素'], specialTags: ['減肥', '低脂', '高纖'], usageMethod: '控制每日攝取量', storageMethod: '陰涼乾燥處' }
]

const ALLERGENS = ['雞肉', '蛋', '玉米', '大豆', '小麥', '牛肉', '羊肉', '魚', '火雞肉']

const PET_TYPES = [
  { value: 'dog', label: '🐕 狗', icon: 'dog' },
  { value: 'cat', label: '🐱 貓', icon: 'cat' },
  { value: 'dog_cat', label: '🐾 狗貓', icon: 'both' }
]

const AGE_GROUPS = ['全部', '幼年', '成年', '老年', '全齡']

const SPECIAL_TAGS = [
  { value: '無穀', label: '🌾 無穀' },
  { value: '低敏', label: '💧 低敏' },
  { value: '減肥', label: '⚖️ 減肥' },
  { value: '高蛋白', label: '💪 高蛋白' },
  { value: '化毛', label: '🌿 化毛' },
  { value: '潔牙', label: '🦷 潔牙' },
  { value: '低磷', label: '❤️‍🔥 低磷' },
  { value: '天然', label: '🌱 天然' },
  { value: '老貓專用', label: '👴 老貓專用' },
  { value: '幼犬專用', label: '👶 幼犬專用' }
]

const SORT_OPTIONS = [
  { value: 'calories-asc', label: '⬆️ 熱量 低→高' },
  { value: 'calories-desc', label: '⬇️ 熱量 高→低' },
  { value: 'protein-desc', label: '⬇️ 蛋白質 高→低' },
  { value: 'fat-desc', label: '⬇️ 脂肪 高→低' },
  { value: 'phosphorus-asc', label: '⬆️ 磷 低→高' },
  { value: 'name-asc', label: '🔤 名稱 A→Z' }
]

const PET_TYPE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  dog: { label: '🐕', bg: '#E3F2FD', color: '#1976D2' },
  cat: { label: '🐱', bg: '#FCE4EC', color: '#C2185B' },
  dog_cat: { label: '🐾', bg: '#FFF3E0', color: '#F57C00' }
}

export default function PetFoodDB() {
  const [search, setSearch] = useState('')
  const [selectedPetType, setSelectedPetType] = useState('')
  const [selectedAge, setSelectedAge] = useState('全部')
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('calories-asc')
  
  // Range sliders
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 500])
  const [proteinRange, setProteinRange] = useState<[number, number]>([0, 50])
  const [fatRange, setFatRange] = useState<[number, number]>([0, 30])
  const [phosphorusRange, setPhosphorusRange] = useState<[number, number]>([0, 2])
  
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [selectedProduct, setSelectedProduct] = useState<typeof DEMO_PRODUCTS[0] | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    let filtered = DEMO_PRODUCTS

    // 搜尋
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.mainIngredients.some(i => i.toLowerCase().includes(s))
      )
    }

    // 寵物類型
    if (selectedPetType) {
      filtered = filtered.filter(p => p.petType.includes(selectedPetType))
    }

    // 年齡
    if (selectedAge && selectedAge !== '全部') {
      filtered = filtered.filter(p => p.ageGroup.includes(selectedAge))
    }

    // 過敏原排除
    if (selectedAllergens.length > 0) {
      filtered = filtered.filter(p => 
        !p.allergens.some(a => selectedAllergens.includes(a))
      )
    }

    // 特殊標籤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.every(t => p.specialTags.includes(t))
      )
    }

    // 營養範圍
    filtered = filtered.filter(p => {
      if (p.caloriesPer100g < calorieRange[0] || p.caloriesPer100g > calorieRange[1]) return false
      if (p.proteinPer100g < proteinRange[0] || p.proteinPer100g > proteinRange[1]) return false
      if (p.fatPer100g < fatRange[0] || p.fatPer100g > fatRange[1]) return false
      if (p.phosphorusPer100g < phosphorusRange[0] || p.phosphorusPer100g > phosphorusRange[1]) return false
      return true
    })

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'calories-asc': return a.caloriesPer100g - b.caloriesPer100g
        case 'calories-desc': return b.caloriesPer100g - a.caloriesPer100g
        case 'protein-desc': return b.proteinPer100g - a.proteinPer100g
        case 'fat-desc': return b.fatPer100g - a.fatPer100g
        case 'phosphorus-asc': return a.phosphorusPer100g - b.phosphorusPer100g
        case 'name-asc': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

    setProducts(filtered)
  }, [search, selectedPetType, selectedAge, selectedAllergens, selectedTags, sortBy, calorieRange, proteinRange, fatRange, phosphorusRange])

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedPetType('')
    setSelectedAge('全部')
    setSelectedAllergens([])
    setSelectedTags([])
    setSortBy('calories-asc')
    setCalorieRange([0, 500])
    setProteinRange([0, 50])
    setFatRange([0, 30])
    setPhosphorusRange([0, 2])
  }

  const activeFilterCount = [
    selectedPetType,
    selectedAge !== '全部',
    selectedAllergens.length > 0,
    selectedTags.length > 0,
    calorieRange[0] > 0 || calorieRange[1] < 500,
    proteinRange[0] > 0 || proteinRange[1] < 50,
    fatRange[0] > 0 || fatRange[1] < 30,
    phosphorusRange[0] > 0 || phosphorusRange[1] < 2
  ].filter(Boolean).length

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🐾 寵物食品搜尋</h1>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="搜尋名稱、品牌、成分..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button 
            style={{...styles.filterBtn, ...(activeFilterCount > 0 ? styles.filterBtnActive : {})}}
            onClick={() => setShowFilters(!showFilters)}
          >
            篩選 {activeFilterCount > 0 && <span style={styles.filterBadge}>{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          {/* 寵物類型 */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>寵物類型</div>
            <div style={styles.petTypeRow}>
              {PET_TYPES.map(pt => (
                <button
                  key={pt.value}
                  style={{...styles.petTypeBtn, ...(selectedPetType === pt.value ? styles.petTypeBtnActive : {})}}
                  onClick={() => setSelectedPetType(selectedPetType === pt.value ? '' : pt.value)}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 年齡 */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>年齡</div>
            <div style={styles.ageRow}>
              {AGE_GROUPS.map(age => (
                <button
                  key={age}
                  style={{...styles.ageBtn, ...(selectedAge === age ? styles.ageBtnActive : {})}}
                  onClick={() => setSelectedAge(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 過敏原 */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>過敏原排除（點選排除）</div>
            <div style={styles.allergenGrid}>
              {ALLERGENS.map(allergen => (
                <button
                  key={allergen}
                  style={{...styles.allergenBtn, ...(selectedAllergens.includes(allergen) ? styles.allergenBtnActive : {})}}
                  onClick={() => toggleAllergen(allergen)}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* 特殊需求 */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>特殊需求</div>
            <div style={styles.tagGrid}>
              {SPECIAL_TAGS.map(tag => (
                <button
                  key={tag.value}
                  style={{...styles.tagBtn, ...(selectedTags.includes(tag.value) ? styles.tagBtnActive : {})}}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* 營養範圍 - 可展開 */}
          <div style={styles.filterSection}>
            <button 
              style={styles.sectionToggle}
              onClick={() => setExpandedSection(expandedSection === 'nutrition' ? null : 'nutrition')}
            >
              <span>營養範圍</span>
              <span>{expandedSection === 'nutrition' ? '▲' : '▼'}</span>
            </button>
            
            {expandedSection === 'nutrition' && (
              <div style={styles.nutritionRanges}>
                <RangeSlider 
                  label="熱量 (kcal/100g)" 
                  min={0} max={500} 
                  value={calorieRange} 
                  onChange={setCalorieRange}
                  unit="kcal"
                />
                <RangeSlider 
                  label="蛋白質 (g/100g)" 
                  min={0} max={50} 
                  value={proteinRange} 
                  onChange={setProteinRange}
                  unit="g"
                />
                <RangeSlider 
                  label="脂肪 (g/100g)" 
                  min={0} max={30} 
                  value={fatRange} 
                  onChange={setFatRange}
                  unit="g"
                />
                <RangeSlider 
                  label="磷 (g/100g)" 
                  min={0} max={2} 
                  value={phosphorusRange} 
                  onChange={setPhosphorusRange}
                  unit="g"
                  step={0.1}
                />
              </div>
            )}
          </div>

          {/* 排序 */}
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>排序方式</div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button style={styles.clearBtn} onClick={clearAllFilters}>
            清除所有篩選
          </button>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && !showFilters && (
        <div style={styles.activeFilters}>
          {selectedPetType && (
            <span style={styles.activeChip}>
              {PET_TYPES.find(p => p.value === selectedPetType)?.label}
              <button onClick={() => setSelectedPetType('')}>✕</button>
            </span>
          )}
          {selectedAge !== '全部' && (
            <span style={styles.activeChip}>
              {selectedAge}
              <button onClick={() => setSelectedAge('全部')}>✕</button>
            </span>
          )}
          {selectedAllergens.map(a => (
            <span key={a} style={styles.activeChipExcluded}>
              ✕ {a}
              <button onClick={() => toggleAllergen(a)}>✕</button>
            </span>
          ))}
          {selectedTags.map(t => (
            <span key={t} style={styles.activeChip}>
              {SPECIAL_TAGS.find(s => s.value === t)?.label}
              <button onClick={() => toggleTag(t)}>✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>共 {products.length} 項</span>
      </div>

      <div style={styles.productList}>
        {products.map(product => (
          <div
            key={product.id}
            style={styles.productCard}
            onClick={() => setSelectedProduct(product)}
          >
            <div style={styles.productHeader}>
              <div style={styles.productBadges}>
                {product.petType.map(pt => PET_TYPE_BADGES[pt] && (
                  <span key={pt} style={{...styles.petBadge, background: PET_TYPE_BADGES[pt].bg, color: PET_TYPE_BADGES[pt].color}}>
                    {PET_TYPE_BADGES[pt].label}
                  </span>
                ))}
              </div>
              <span style={styles.productType}>{product.type}</span>
            </div>
            <div style={styles.productName}>{product.name}</div>
            <div style={styles.productBrand}>{product.brand}</div>
            
            <div style={styles.nutritionRow}>
              <div style={styles.nutritionChip}>
                <span style={styles.nutritionValue}>{product.caloriesPer100g}</span>
                <span style={styles.nutritionUnit}>kcal</span>
              </div>
              <div style={styles.nutritionChip}>
                <span style={styles.nutritionValue}>{product.proteinPer100g}</span>
                <span style={styles.nutritionUnit}>蛋白</span>
              </div>
              <div style={styles.nutritionChip}>
                <span style={styles.nutritionValue}>{product.fatPer100g}</span>
                <span style={styles.nutritionUnit}>脂肪</span>
              </div>
              <div style={styles.nutritionChip}>
                <span style={styles.nutritionValue}>{product.phosphorusPer100g}</span>
                <span style={styles.nutritionUnit}>磷</span>
              </div>
            </div>

            {product.allergens.length > 0 && (
              <div style={styles.allergenRow}>
                <span style={styles.allergenLabel}>⚠️ 含有：</span>
                {product.allergens.map(a => <span key={a} style={styles.allergenTag}>{a}</span>)}
              </div>
            )}
            {product.specialTags.length > 0 && (
              <div style={styles.tagRow}>
                {product.specialTags.map(t => <span key={t} style={styles.specialTag}>{t}</span>)}
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>找不到符合的產品</h3>
            <p>試試放寬篩選條件</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <div style={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHandle}></div>
            <button style={styles.closeBtn} onClick={() => setSelectedProduct(null)}>✕</button>
            
            <div style={styles.modalHeader}>
              <div style={styles.modalBadges}>
                {selectedProduct.petType.map(pt => PET_TYPE_BADGES[pt] && (
                  <span key={pt} style={{...styles.modalBadge, background: PET_TYPE_BADGES[pt].bg, color: PET_TYPE_BADGES[pt].color}}>
                    {PET_TYPE_BADGES[pt].label}
                  </span>
                ))}
                <span style={styles.modalBadge}>{selectedProduct.type}</span>
              </div>
              <h2 style={styles.modalTitle}>{selectedProduct.name}</h2>
              <p style={styles.modalBrand}>{selectedProduct.brand} · {selectedProduct.origin}</p>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>營養成分（每100g）</h3>
              <div style={styles.nutritionGrid}>
                <NutritionCard label="熱量" value={selectedProduct.caloriesPer100g} unit="kcal" />
                <NutritionCard label="蛋白質" value={selectedProduct.proteinPer100g} unit="g" />
                <NutritionCard label="脂肪" value={selectedProduct.fatPer100g} unit="g" />
                <NutritionCard label="碳水" value={selectedProduct.carbsPer100g} unit="g" />
                <NutritionCard label="磷" value={selectedProduct.phosphorusPer100g} unit="g" />
              </div>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>主要成分</h3>
              <p>{selectedProduct.mainIngredients.join('、')}</p>
            </div>

            {selectedProduct.allergens.length > 0 && (
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>⚠️ 過敏原</h3>
                <div style={styles.allergenList}>
                  {selectedProduct.allergens.map(a => (
                    <span key={a} style={styles.allergenTagLarge}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct.specialTags.length > 0 && (
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}>特殊標籤</h3>
                <div style={styles.tagRow}>
                  {selectedProduct.specialTags.map(t => (
                    <span key={t} style={styles.specialTagLarge}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>使用方法</h3>
              <p>{selectedProduct.usageMethod}</p>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>保存方式</h3>
              <p>{selectedProduct.storageMethod}</p>
            </div>
          </div>
        </div>
      )}
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
    <div style={rangeStyles.container}>
      <div style={rangeStyles.header}>
        <span style={rangeStyles.label}>{label}</span>
        <span style={rangeStyles.value}>{value[0]} - {value[1]} {unit}</span>
      </div>
      <div style={rangeStyles.sliderRow}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          style={rangeStyles.slider}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          style={rangeStyles.slider}
        />
      </div>
    </div>
  )
}

function NutritionCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={nutritionStyles.card}>
      <span style={nutritionStyles.value}>{value}</span>
      <span style={nutritionStyles.unit}>{unit}</span>
      <span style={nutritionStyles.label}>{label}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', backgroundColor: '#F5F5F5', paddingBottom: '24px' },
  header: { background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)', color: 'white', padding: '16px' },
  title: { fontSize: '18px', fontWeight: '600', marginBottom: '12px' },
  searchRow: { display: 'flex', gap: '8px' },
  searchInput: { flex: 1, padding: '12px 14px', border: 'none', borderRadius: '10px', fontSize: '15px' },
  filterBtn: { padding: '12px 16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  filterBtnActive: { background: 'white', color: '#FF6B35' },
  filterBadge: { background: '#FF6B35', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '11px' },
  
  filterPanel: { background: 'white', padding: '16px', borderBottom: '1px solid #E0E0E0' },
  filterSection: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F0F0F0' },
  filterLabel: { fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px', display: 'block' },
  
  petTypeRow: { display: 'flex', gap: '8px' },
  petTypeBtn: { flex: 1, padding: '10px', background: '#F5F5F5', border: '2px solid transparent', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  petTypeBtnActive: { background: '#FFF3ED', borderColor: '#FF6B35', color: '#FF6B35' },
  
  ageRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  ageBtn: { padding: '8px 12px', background: '#F5F5F5', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' },
  ageBtnActive: { background: '#FF6B35', color: 'white' },
  
  allergenGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  allergenBtn: { padding: '8px 14px', background: '#F5F5F5', border: '2px solid transparent', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  allergenBtnActive: { background: '#FFEBEE', borderColor: '#F44336', color: '#F44336', textDecoration: 'line-through' },
  
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tagBtn: { padding: '8px 14px', background: '#F5F5F5', border: '2px solid transparent', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  tagBtnActive: { background: '#E8F5E9', borderColor: '#4CAF50', color: '#4CAF50' },
  
  sectionToggle: { width: '100%', padding: '12px', background: '#F5F5F5', border: 'none', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px' },
  nutritionRanges: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' },
  
  sortSelect: { width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', background: 'white' },
  clearBtn: { width: '100%', padding: '12px', background: '#F5F5F5', border: 'none', borderRadius: '10px', fontSize: '14px', color: '#666', cursor: 'pointer' },
  
  activeFilters: { padding: '12px 16px', background: 'white', display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E0E0E0' },
  activeChip: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#FFF3ED', color: '#FF6B35', borderRadius: '16px', fontSize: '12px' },
  activeChipExcluded: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#FFEBEE', color: '#F44336', borderRadius: '16px', fontSize: '12px' },
  
  resultsHeader: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resultsCount: { fontSize: '13px', color: '#666' },
  
  productList: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  productCard: { background: 'white', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  productHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  productBadges: { display: 'flex', gap: '4px' },
  petBadge: { padding: '2px 6px', borderRadius: '6px', fontSize: '12px' },
  productType: { fontSize: '11px', color: '#999' },
  productName: { fontSize: '15px', fontWeight: '600', marginBottom: '4px' },
  productBrand: { fontSize: '12px', color: '#666', marginBottom: '10px' },
  
  nutritionRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
  nutritionChip: { flex: 1, background: '#FAFAFA', borderRadius: '8px', padding: '8px 4px', textAlign: 'center' },
  nutritionValue: { fontSize: '14px', fontWeight: '600', color: '#FF6B35', display: 'block' },
  nutritionUnit: { fontSize: '10px', color: '#999' },
  
  allergenRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  allergenLabel: { fontSize: '11px', color: '#F44336' },
  allergenTag: { padding: '2px 8px', background: '#FFEBEE', color: '#F44336', borderRadius: '4px', fontSize: '11px' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  specialTag: { padding: '2px 8px', background: '#E8F5E9', color: '#388E3C', borderRadius: '4px', fontSize: '11px' },
  
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modal: { background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
  modalHandle: { width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px', margin: '12px auto' },
  closeBtn: { position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', background: '#F5F5F5', border: 'none', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' },
  modalHeader: { padding: '0 20px 16px', borderBottom: '1px solid #E0E0E0' },
  modalBadges: { display: 'flex', gap: '6px', marginBottom: '10px' },
  modalBadge: { padding: '4px 10px', background: '#F5F5F5', borderRadius: '6px', fontSize: '12px' },
  modalTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  modalBrand: { fontSize: '13px', color: '#666' },
  modalSection: { padding: '16px 20px', borderBottom: '1px solid #E0E0E0' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px' },
  nutritionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  allergenList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  allergenTagLarge: { padding: '6px 14px', background: '#FFEBEE', color: '#F44336', borderRadius: '20px', fontSize: '14px' },
  specialTagLarge: { padding: '6px 14px', background: '#E8F5E9', color: '#388E3C', borderRadius: '20px', fontSize: '14px' }
}

const rangeStyles: Record<string, React.CSSProperties> = {
  container: { marginBottom: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  label: { fontSize: '13px', color: '#333' },
  value: { fontSize: '12px', color: '#FF6B35', fontWeight: '500' },
  sliderRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  slider: { width: '100%', accentColor: '#FF6B35' }
}

const nutritionStyles: Record<string, React.CSSProperties> = {
  card: { background: '#FAFAFA', borderRadius: '10px', padding: '12px', textAlign: 'center' },
  value: { fontSize: '18px', fontWeight: '700', color: '#FF6B35', display: 'block' },
  unit: { fontSize: '11px', color: '#999' },
  label: { fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }
}
