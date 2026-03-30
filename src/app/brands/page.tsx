'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 品牌資料（從 petfood_brands.json 整理）
const BRANDS_DATA = [
  { name: '皇家寵物食品', origin: '法國', productCount: 156, category: '國際知名品牌' },
  { name: '希爾思寵物食品', origin: '美國', productCount: 142, category: '國際知名品牌' },
  { name: '荒野饗宴', origin: '美國', productCount: 89, category: '國際知名品牌' },
  { name: '冠能寵物食品', origin: '美國', productCount: 78, category: '國際知名品牌' },
  { name: '本能', origin: '加拿大', productCount: 65, category: '國際知名品牌' },
  { name: '美士', origin: '美國', productCount: 58, category: '國際知名品牌' },
  { name: '愛肯拿', origin: '加拿大', productCount: 52, category: '國際知名品牌' },
  { name: '渴望', origin: '加拿大', productCount: 48, category: '國際知名品牌' },
  { name: '優格', origin: '美國', productCount: 45, category: '國際知名品牌' },
  { name: '紐頓', origin: '英國', productCount: 42, category: '國際知名品牌' },
  { name: '原點', origin: '美國', productCount: 38, category: '國際知名品牌' },
  { name: '活力滋', origin: '美國', productCount: 35, category: '國際知名品牌' },
  { name: '莫比', origin: '美國', productCount: 32, category: '國際知名品牌' },
  { name: '維吉', origin: '加拿大', productCount: 30, category: '國際知名品牌' },
  { name: 'go!', origin: '加拿大', productCount: 28, category: '國際知名品牌' },
  { name: '耐吉斯', origin: '紐西蘭', productCount: 25, category: '國際知名品牌' },
  { name: ' Halo', origin: '美國', productCount: 24, category: '國際知名品牌' },
  { name: 'now', origin: '加拿大', productCount: 22, category: '國際知名品牌' },
  { name: '【個人】楊甯喬', origin: '台灣', productCount: 18, category: '個人工作室' },
  { name: '【個人】黃如盈', origin: '台灣', productCount: 15, category: '個人工作室' },
  { name: '【個人】余慧婷', origin: '台灣', productCount: 14, category: '個人工作室' },
  { name: '【個人】張珉瑄', origin: '台灣', productCount: 12, category: '個人工作室' },
  { name: '【個人】李芷薰', origin: '台灣', productCount: 11, category: '個人工作室' },
  { name: '【個人】王筠如', origin: '台灣', productCount: 10, category: '個人工作室' },
  { name: '【個人】陳國嘉', origin: '台灣', productCount: 9, category: '個人工作室' },
  { name: '【個人】張曉', origin: '台灣', productCount: 8, category: '個人工作室' },
  { name: '【個人】劉依萍', origin: '台灣', productCount: 7, category: '個人工作室' },
  { name: '【公司】逸寶國際股份有限公司', origin: '荷蘭', productCount: 6, category: '台灣公司' },
  { name: '【公司】爪子星球', origin: '台灣', productCount: 5, category: '台灣公司' },
  { name: '【公司】寵物好事', origin: '台灣', productCount: 4, category: '台灣公司' },
]

const ORIGIN_FLAGS: Record<string, string> = {
  '法國': '🇫🇷',
  '美國': '🇺🇸',
  '加拿大': '🇨🇦',
  '英國': '🇬🇧',
  '紐西蘭': '🇳🇿',
  '荷蘭': '🇳🇱',
  '台灣': '🇹🇼',
  '日本': '🇯🇵',
  '德國': '🇩🇪',
  '韓國': '🇰🇷',
}

const ORIGIN_COLORS: Record<string, string> = {
  '法國': 'bg-blue-100 text-blue-700',
  '美國': 'bg-red-100 text-red-700',
  '加拿大': 'bg-red-100 text-red-700',
  '英國': 'bg-blue-100 text-blue-700',
  '紐西蘭': 'bg-green-100 text-green-700',
  '荷蘭': 'bg-orange-100 text-orange-700',
  '台灣': 'bg-green-100 text-green-700',
  '日本': 'bg-red-100 text-red-700',
  '德國': 'bg-yellow-100 text-yellow-700',
  '韓國': 'bg-blue-100 text-blue-700',
}

export default function BrandsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 取得所有來源國
  const origins = Array.from(new Set(BRANDS_DATA.map(b => b.origin)))
  const categories = Array.from(new Set(BRANDS_DATA.map(b => b.category)))

  // 過濾
  let filtered = BRANDS_DATA
  if (search) {
    filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
  }
  if (selectedOrigin) {
    filtered = filtered.filter(b => b.origin === selectedOrigin)
  }
  if (selectedCategory) {
    filtered = filtered.filter(b => b.category === selectedCategory)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏪 品牌總覽</h1>
        <p style={styles.subtitle}>共 {BRANDS_DATA.length} 個品牌</p>
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="搜尋品牌..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Origin Filter */}
      <div style={styles.filterSection}>
        <div style={styles.filterScroll}>
          <button
            style={{...styles.filterChip, ...(selectedOrigin === null ? styles.filterChipActive : {})}}
            onClick={() => setSelectedOrigin(null)}
          >
            全部
          </button>
          {origins.map(origin => (
            <button
              key={origin}
              style={{...styles.filterChip, ...(selectedOrigin === origin ? styles.filterChipActive : {})}}
              onClick={() => setSelectedOrigin(origin === selectedOrigin ? null : origin)}
            >
              {ORIGIN_FLAGS[origin] || '🌍'} {origin}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={styles.filterSection}>
        <div style={styles.filterScroll}>
          <button
            style={{...styles.categoryChip, ...(selectedCategory === null ? styles.categoryChipActive : {})}}
            onClick={() => setSelectedCategory(null)}
          >
            所有類型
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              style={{...styles.categoryChip, ...(selectedCategory === cat ? styles.categoryChipActive : {})}}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>共 {filtered.length} 個品牌</span>
      </div>

      {/* Brand List */}
      <div style={styles.brandList}>
        {filtered.map((brand, index) => (
          <div key={index} style={styles.brandCard}>
            <div style={styles.brandMain}>
              <div style={styles.brandAvatar}>
                {brand.name.charAt(0)}
              </div>
              <div style={styles.brandInfo}>
                <div style={styles.brandName}>{brand.name}</div>
                <div style={styles.brandMeta}>
                  <span style={{...styles.originBadge, ...(ORIGIN_COLORS[brand.origin] ? {} : {})}}>
                    {ORIGIN_FLAGS[brand.origin] || '🌍'} {brand.origin}
                  </span>
                  <span style={styles.categoryTag}>{brand.category}</span>
                </div>
              </div>
            </div>
            <div style={styles.brandRight}>
              <div style={styles.productCount}>{brand.productCount}</div>
              <div style={styles.productLabel}>項產品</div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p>找不到符合的品牌</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <button style={styles.navBtn} onClick={() => router.push('/')}>
          <span style={styles.navIcon}>🏠</span>
          <span style={styles.navLabel}>首頁</span>
        </button>
        <button style={{...styles.navBtn, ...styles.navBtnActive}}>
          <span style={styles.navIcon}>🏪</span>
          <span style={{...styles.navLabel, color: '#FF6B35'}}>品牌</span>
        </button>
        <button style={styles.navBtn} onClick={() => router.push('/pet-food-db')}>
          <span style={styles.navIcon}>🔍</span>
          <span style={styles.navLabel}>食品庫</span>
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
    color: 'white',
    padding: '20px 16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    opacity: 0.9,
  },
  searchSection: {
    padding: '12px 16px',
    background: 'white',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
  },
  filterSection: {
    padding: '10px 16px',
    background: 'white',
    borderBottom: '1px solid #F0F0F0',
  },
  filterScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterChip: {
    padding: '8px 14px',
    background: '#F5F5F5',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    background: '#FF6B35',
    color: 'white',
  },
  categoryChip: {
    padding: '6px 12px',
    background: '#F5F5F5',
    border: 'none',
    borderRadius: '16px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  categoryChipActive: {
    background: '#E3F2FD',
    color: '#1976D2',
    fontWeight: '500',
  },
  resultsHeader: {
    padding: '12px 16px',
  },
  resultsCount: {
    fontSize: '13px',
    color: '#666',
  },
  brandList: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  brandCard: {
    background: 'white',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  brandMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandAvatar: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  brandInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A1A2E',
  },
  brandMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  originBadge: {
    padding: '2px 8px',
    background: '#F5F5F5',
    borderRadius: '6px',
    fontSize: '11px',
  },
  categoryTag: {
    padding: '2px 8px',
    background: '#FFF3ED',
    color: '#FF6B35',
    borderRadius: '6px',
    fontSize: '11px',
  },
  brandRight: {
    textAlign: 'right',
  },
  productCount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FF6B35',
  },
  productLabel: {
    fontSize: '10px',
    color: '#999',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    borderTop: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 100,
  },
  navBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navBtnActive: {
    color: '#FF6B35',
  },
  navIcon: {
    fontSize: '24px',
  },
  navLabel: {
    fontSize: '11px',
    color: '#999',
  },
}
