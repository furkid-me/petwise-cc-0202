'use client'

import { useState, useEffect } from 'react'

// 示範資料
const DEMO_PRODUCTS = [
  {
    id: '1',
    name: '雞肉乾',
    brand: '【個人】楊甯喬',
    type: '零食',
    petType: ['dog_cat'],
    origin: '台灣',
    caloriesPer100g: '164.5',
    proteinPer100g: '12.8',
    fatPer100g: '3.0',
    carbsPer100g: '0.8',
    fiberPer100g: '0.5',
    moisturePer100g: '15.0',
    allergens: ['蛋'],
    mainIngredients: ['雞肉'],
    usageMethod: '請將零食撥開或剪成小塊',
    storageMethod: '冷藏保存'
  },
  {
    id: '2',
    name: '羊奶荷包蛋',
    brand: '【個人】楊甯喬',
    type: '零食',
    petType: ['dog_cat'],
    origin: '台灣',
    caloriesPer100g: '46.2',
    proteinPer100g: '8.5',
    fatPer100g: '9.6',
    carbsPer100g: '1.2',
    fiberPer100g: '0.3',
    moisturePer100g: '75.0',
    allergens: ['蛋'],
    mainIngredients: ['羊肉', '雞蛋'],
    usageMethod: '適量給予',
    storageMethod: '冷藏保存'
  },
  {
    id: '3',
    name: '鴨氣管',
    brand: '【個人】黃如盈',
    type: '零食',
    petType: ['dog'],
    origin: '台灣',
    caloriesPer100g: '200.0',
    proteinPer100g: '15.0',
    fatPer100g: '8.0',
    carbsPer100g: '0.5',
    fiberPer100g: '0.2',
    moisturePer100g: '10.0',
    allergens: [],
    mainIngredients: ['鴨肉'],
    usageMethod: '作為零食適量給予',
    storageMethod: '陰涼乾燥處'
  },
  {
    id: '4',
    name: '頂級無穀貓糧',
    brand: '皇家寵物食品',
    type: '乾飼糧',
    petType: ['cat'],
    origin: '法國',
    caloriesPer100g: '380.0',
    proteinPer100g: '40.0',
    fatPer100g: '18.0',
    carbsPer100g: '25.0',
    fiberPer100g: '3.0',
    moisturePer100g: '8.0',
    allergens: [],
    mainIngredients: ['雞肉', '火雞肉'],
    usageMethod: '每日適量',
    storageMethod: '陰涼乾燥處'
  },
  {
    id: '5',
    name: '天然狗罐頭',
    brand: '希爾思寵物食品',
    type: '罐頭',
    petType: ['dog'],
    origin: '美國',
    caloriesPer100g: '120.0',
    proteinPer100g: '10.0',
    fatPer100g: '7.0',
    carbsPer100g: '5.0',
    fiberPer100g: '1.0',
    moisturePer100g: '78.0',
    allergens: ['玉米', '大豆'],
    mainIngredients: ['牛肉', '胡蘿蔔'],
    usageMethod: '直接餵食或搭配乾糧',
    storageMethod: '開封後冷藏'
  },
  {
    id: '6',
    name: '貓咪化毛膏',
    brand: '喵喵星球',
    type: '補助食品',
    petType: ['cat'],
    origin: '台灣',
    caloriesPer100g: '250.0',
    proteinPer100g: '5.0',
    fatPer100g: '15.0',
    carbsPer100g: '20.0',
    fiberPer100g: '2.0',
    moisturePer100g: '10.0',
    allergens: ['魚'],
    mainIngredients: ['魚油', '麥芽糊精'],
    usageMethod: '每日擠出約5cm供貓舔食',
    storageMethod: '陰涼乾燥處，避免陽光直射'
  },
  {
    id: '7',
    name: '狗狗潔牙骨',
    brand: 'Greenies',
    type: '潔牙骨',
    petType: ['dog'],
    origin: '美國',
    caloriesPer100g: '290.0',
    proteinPer100g: '28.0',
    fatPer100g: '8.0',
    carbsPer100g: '35.0',
    fiberPer100g: '5.0',
    moisturePer100g: '12.0',
    allergens: [],
    mainIngredients: ['玉米澱粉', '小麥蛋白'],
    usageMethod: '每日一根，幫助清潔牙齒',
    storageMethod: '室溫保存'
  },
  {
    id: '8',
    name: '鮮食生鮮包',
    brand: '鮮食家',
    type: '生鮮、冷凍',
    petType: ['dog_cat'],
    origin: '台灣',
    caloriesPer100g: '180.0',
    proteinPer100g: '15.0',
    fatPer100g: '12.0',
    carbsPer100g: '3.0',
    fiberPer100g: '1.0',
    moisturePer100g: '68.0',
    allergens: [],
    mainIngredients: ['雞胸肉', '南瓜', '胡蘿蔔'],
    usageMethod: '退冰後直接食用或搭配乾糧',
    storageMethod: '冷凍保存，開封後冷藏'
  }
]

const PET_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  dog: { label: '🐕 狗', color: '#1976D2', bg: '#E3F2FD' },
  cat: { label: '🐱 貓', color: '#C2185B', bg: '#FCE4EC' },
  dog_cat: { label: '🐾 狗貓', color: '#F57C00', bg: '#FFF3E0' },
  other_small_animal: { label: '🐹 小動物', color: '#388E3C', bg: '#E8F5E9' }
}

const CATEGORIES = ['全部', '零食', '罐頭', '乾飼糧', '補助食品', '生鮮、冷凍', '潔牙骨']

export default function PetFoodDB() {
  const [search, setSearch] = useState('')
  const [petType, setPetType] = useState('')
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [selectedProduct, setSelectedProduct] = useState<typeof DEMO_PRODUCTS[0] | null>(null)

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

    if (petType) {
      filtered = filtered.filter(p => p.petType.includes(petType))
    }

    if (category && category !== '全部') {
      filtered = filtered.filter(p => p.type === category)
    }

    setProducts(filtered)
  }, [search, petType, category])

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🐾 Petwise 寵物食品庫</h1>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="搜尋食品名稱、品牌..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Pet Type Filters */}
      <div style={styles.filters}>
        {[
          { value: '', label: '全部' },
          { value: 'dog', label: '🐕 狗' },
          { value: 'cat', label: '🐱 貓' },
          { value: 'dog_cat', label: '🐾 狗貓' }
        ].map(ft => (
          <button
            key={ft.value}
            onClick={() => setPetType(ft.value)}
            style={{
              ...styles.filterChip,
              ...(petType === ft.value ? styles.filterChipActive : {})
            }}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div style={styles.categoryPills}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              ...styles.categoryPill,
              ...(category === cat || (category === '' && cat === '全部') ? styles.categoryPillActive : {})
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>共 {products.length} 項產品</span>
      </div>

      {/* Product List */}
      <div style={styles.productList}>
        {products.map(product => (
          <div
            key={product.id}
            style={styles.productCard}
            onClick={() => setSelectedProduct(product)}
          >
            <div style={styles.productHeader}>
              <span style={styles.productName}>{product.name}</span>
              {PET_TYPE_LABELS[product.petType[0]] && (
                <span style={{
                  ...styles.productBadge,
                  backgroundColor: PET_TYPE_LABELS[product.petType[0]].bg,
                  color: PET_TYPE_LABELS[product.petType[0]].color
                }}>
                  {PET_TYPE_LABELS[product.petType[0]].label}
                </span>
              )}
            </div>
            <div style={styles.productBrand}>{product.brand}</div>
            <div style={styles.productMeta}>
              <span style={styles.metaTag}>{product.type}</span>
              <span style={styles.metaTag}>📍 {product.origin}</span>
              {product.mainIngredients[0] && (
                <span style={styles.metaTag}>🥩 {product.mainIngredients[0]}</span>
              )}
            </div>
            <div style={styles.nutritionGrid}>
              <div style={styles.nutritionItem}>
                <span style={styles.nutritionValue}>{product.caloriesPer100g}</span>
                <span style={styles.nutritionLabel}>kcal</span>
              </div>
              <div style={styles.nutritionItem}>
                <span style={styles.nutritionValue}>{product.proteinPer100g}</span>
                <span style={styles.nutritionLabel}>蛋白質</span>
              </div>
              <div style={styles.nutritionItem}>
                <span style={styles.nutritionValue}>{product.fatPer100g}</span>
                <span style={styles.nutritionLabel}>脂肪</span>
              </div>
              <div style={styles.nutritionItem}>
                <span style={styles.nutritionValue}>{product.carbsPer100g}</span>
                <span style={styles.nutritionLabel}>碳水</span>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>找不到符合的產品</h3>
            <p>試試不同的關鍵字或篩選條件</p>
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
              <h2 style={styles.modalTitle}>{selectedProduct.name}</h2>
              <p style={styles.modalBrand}>{selectedProduct.brand}</p>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>營養成分（每100g）</h3>
              <div style={styles.nutritionGridModal}>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.caloriesPer100g}</span>
                  <span style={styles.nutritionCardUnit}>kcal</span>
                  <span style={styles.nutritionCardLabel}>熱量</span>
                </div>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.proteinPer100g}</span>
                  <span style={styles.nutritionCardUnit}>g</span>
                  <span style={styles.nutritionCardLabel}>蛋白質</span>
                </div>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.fatPer100g}</span>
                  <span style={styles.nutritionCardUnit}>g</span>
                  <span style={styles.nutritionCardLabel}>脂肪</span>
                </div>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.carbsPer100g}</span>
                  <span style={styles.nutritionCardUnit}>g</span>
                  <span style={styles.nutritionCardLabel}>碳水</span>
                </div>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.fiberPer100g}</span>
                  <span style={styles.nutritionCardUnit}>g</span>
                  <span style={styles.nutritionCardLabel}>纖維</span>
                </div>
                <div style={styles.nutritionCard}>
                  <span style={styles.nutritionCardValue}>{selectedProduct.moisturePer100g}</span>
                  <span style={styles.nutritionCardUnit}>g</span>
                  <span style={styles.nutritionCardLabel}>水分</span>
                </div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>過敏原</h3>
              <div style={styles.allergenList}>
                {selectedProduct.allergens.length > 0 ? (
                  selectedProduct.allergens.map(a => (
                    <span key={a} style={styles.allergenTag}>{a}</span>
                  ))
                ) : (
                  <span style={{...styles.allergenTag, background: '#E8F5E9', color: '#388E3C'}}>✅ 無常見過敏原</span>
                )}
              </div>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>主要成分</h3>
              <p>{selectedProduct.mainIngredients.join('、')}</p>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>原產地</h3>
              <p>{selectedProduct.origin}</p>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.sectionTitle}>使用方式</h3>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    paddingBottom: '80px'
  },
  header: {
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
    color: 'white',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  searchBox: {
    display: 'flex',
    gap: '8px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    background: 'rgba(255,255,255,0.95)'
  },
  filters: {
    padding: '12px 16px',
    background: 'white',
    borderBottom: '1px solid #E5E5E5',
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  },
  filterChip: {
    padding: '8px 14px',
    background: '#F8F9FA',
    border: '1.5px solid #E5E5E5',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  filterChipActive: {
    background: '#FF6B35',
    borderColor: '#FF6B35',
    color: 'white'
  },
  categoryPills: {
    padding: '10px 16px',
    background: 'white',
    borderBottom: '1px solid #E5E5E5',
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  },
  categoryPill: {
    padding: '6px 12px',
    background: '#F8F9FA',
    border: 'none',
    borderRadius: '16px',
    fontSize: '13px',
    color: '#666',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  categoryPillActive: {
    background: '#FFF3ED',
    color: '#FF6B35',
    fontWeight: '500'
  },
  resultsHeader: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultsCount: {
    fontSize: '14px',
    color: '#666'
  },
  productList: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  productCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer'
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    flex: 1,
    marginRight: '10px'
  },
  productBadge: {
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  productBrand: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  },
  productMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px'
  },
  metaTag: {
    padding: '4px 10px',
    background: '#F8F9FA',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#666'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E5E5'
  },
  nutritionItem: {
    textAlign: 'center'
  },
  nutritionValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FF6B35'
  },
  nutritionLabel: {
    fontSize: '11px',
    color: '#666',
    display: 'block'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  modal: {
    background: 'white',
    borderRadius: '24px 24px 0 0',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHandle: {
    width: '40px',
    height: '4px',
    background: '#E5E5E5',
    borderRadius: '2px',
    margin: '12px auto'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    background: '#F8F9FA',
    border: 'none',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer'
  },
  modalHeader: {
    padding: '0 20px 16px',
    borderBottom: '1px solid #E5E5E5'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  modalBrand: {
    fontSize: '14px',
    color: '#666'
  },
  modalSection: {
    padding: '16px 20px',
    borderBottom: '1px solid #E5E5E5'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '10px'
  },
  nutritionGridModal: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  nutritionCard: {
    background: '#F8F9FA',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center'
  },
  nutritionCardValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FF6B35'
  },
  nutritionCardUnit: {
    fontSize: '12px',
    color: '#666'
  },
  nutritionCardLabel: {
    fontSize: '12px',
    color: '#666',
    display: 'block',
    marginTop: '4px'
  },
  allergenList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  allergenTag: {
    padding: '6px 12px',
    background: '#FFF3E0',
    color: '#E65100',
    borderRadius: '16px',
    fontSize: '13px'
  }
}
