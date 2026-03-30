'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 品牌資料
const ALL_BRANDS = [
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
  { name: 'Halo', origin: '美國', productCount: 24, category: '國際知名品牌' },
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

const VISIBLE_BRANDS = ALL_BRANDS.filter(b => b.category !== '個人工作室')

const ORIGIN_FLAGS: Record<string, string> = {
  '法國': '🇫🇷', '美國': '🇺🇸', '加拿大': '🇨🇦', '英國': '🇬🇧',
  '紐西蘭': '🇳🇿', '荷蘭': '🇳🇱', '台灣': '🇹🇼', '日本': '🇯🇵', '德國': '🇩🇪',
}

const DESIGN = {
  colors: {
    primary: '#FB9966',
    primaryDark: '#A36B4A',
    secondary: '#B5495B',
    text: '#554236',
    textSecondary: '#7D6559',
    textMuted: '#A8958C',
    bg: '#FDFCFB',
    surface: '#FFFFFF',
    border: '#EDE6E1',
  },
  radius: { sm: '6px', md: '12px', lg: '16px', full: '9999px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  transition: '200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

export default function BrandsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const origins = Array.from(new Set(VISIBLE_BRANDS.map(b => b.origin)))
  const categories = Array.from(new Set(VISIBLE_BRANDS.map(b => b.category)))

  let filtered = VISIBLE_BRANDS
  if (search) {
    filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
  }
  if (selectedOrigin) {
    filtered = filtered.filter(b => b.origin === selectedOrigin)
  }
  if (selectedCategory) {
    filtered = filtered.filter(b => b.category === selectedCategory)
  }

  const handleBrandClick = (brand: typeof ALL_BRANDS[0]) => {
    router.push(`/pet-food-db?brand=${encodeURIComponent(brand.name)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: DESIGN.colors.bg, paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${DESIGN.colors.primary} 0%, ${DESIGN.colors.secondary} 100%)`, padding: `${DESIGN.spacing.lg} ${DESIGN.spacing.md}`, paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: DESIGN.spacing.md, letterSpacing: '-0.02em' }}>🏪 品牌總覽</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: DESIGN.spacing.md }}>共 {VISIBLE_BRANDS.length} 個精選品牌</p>
        
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="搜尋品牌..."
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
            }}
          />
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: DESIGN.colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </header>

      {/* Origin Filter */}
      <div style={{ padding: `${DESIGN.spacing.md} ${DESIGN.spacing.md} ${DESIGN.spacing.sm}`, borderBottom: `1px solid ${DESIGN.colors.border}`, background: DESIGN.colors.surface, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: DESIGN.spacing.sm, minWidth: 'max-content' }}>
          <button
            onClick={() => setSelectedOrigin(null)}
            style={{
              padding: '8px 14px',
              background: selectedOrigin === null ? DESIGN.colors.primary : DESIGN.colors.bg,
              color: selectedOrigin === null ? 'white' : DESIGN.colors.text,
              border: 'none',
              borderRadius: DESIGN.radius.full,
              fontSize: '13px',
              cursor: 'pointer',
              transition: DESIGN.transition,
            }}
          >
            全部
          </button>
          {origins.map(origin => (
            <button
              key={origin}
              onClick={() => setSelectedOrigin(origin === selectedOrigin ? null : origin)}
              style={{
                padding: '8px 14px',
                background: selectedOrigin === origin ? DESIGN.colors.primary : DESIGN.colors.bg,
                color: selectedOrigin === origin ? 'white' : DESIGN.colors.text,
                border: 'none',
                borderRadius: DESIGN.radius.full,
                fontSize: '13px',
                cursor: 'pointer',
                transition: DESIGN.transition,
              }}
            >
              {ORIGIN_FLAGS[origin] || '🌍'} {origin}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ padding: `${DESIGN.spacing.sm} ${DESIGN.spacing.md}`, borderBottom: `1px solid ${DESIGN.colors.border}`, background: DESIGN.colors.surface, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: DESIGN.spacing.sm, minWidth: 'max-content' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '6px 12px',
              background: selectedCategory === null ? DESIGN.colors.secondary : DESIGN.colors.bg,
              color: selectedCategory === null ? 'white' : DESIGN.colors.textSecondary,
              border: 'none',
              borderRadius: DESIGN.radius.full,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            所有類型
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              style={{
                padding: '6px 12px',
                background: selectedCategory === cat ? DESIGN.colors.secondary : DESIGN.colors.bg,
                color: selectedCategory === cat ? 'white' : DESIGN.colors.textSecondary,
                border: 'none',
                borderRadius: DESIGN.radius.full,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ padding: DESIGN.spacing.md }}>
        <p style={{ fontSize: '13px', color: DESIGN.colors.textMuted }}>
          共 <strong style={{ color: DESIGN.colors.text }}>{filtered.length}</strong> 個品牌
        </p>
      </div>

      {/* Brand List */}
      <div style={{ padding: `0 ${DESIGN.spacing.md}`, display: 'flex', flexDirection: 'column', gap: DESIGN.spacing.sm }}>
        {filtered.map((brand, index) => (
          <div
            key={index}
            onClick={() => handleBrandClick(brand)}
            style={{
              background: DESIGN.colors.surface,
              borderRadius: DESIGN.radius.lg,
              padding: DESIGN.spacing.md,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(85,66,54,0.06)',
              cursor: 'pointer',
              transition: DESIGN.transition,
              border: `1px solid ${DESIGN.colors.border}`,
              animation: `fadeIn 200ms ease-out ${index * 30}ms both`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN.spacing.md }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${DESIGN.colors.primary} 0%, ${DESIGN.colors.secondary} 100%)`,
                borderRadius: DESIGN.radius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
              }}>
                {brand.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: DESIGN.colors.text, marginBottom: '2px' }}>{brand.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN.spacing.sm }}>
                  <span style={{ fontSize: '12px', color: DESIGN.colors.textMuted }}>{ORIGIN_FLAGS[brand.origin] || '🌍'} {brand.origin}</span>
                  <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>·</span>
                  <span style={{ fontSize: '12px', color: DESIGN.colors.primary, fontWeight: '500' }}>{brand.category}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN.spacing.md }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: DESIGN.colors.primary }}>{brand.productCount}</div>
                <div style={{ fontSize: '10px', color: DESIGN.colors.textMuted }}>項產品</div>
              </div>
              <svg style={{ width: '16px', height: '16px', color: DESIGN.colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: DESIGN.spacing.lg * 2 }}>
            <div style={{ fontSize: '48px', marginBottom: DESIGN.spacing.md }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: DESIGN.colors.text, marginBottom: '4px' }}>找不到符合的品牌</h3>
            <p style={{ fontSize: '14px', color: DESIGN.colors.textMuted }}>試試不同的搜尋條件</p>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: DESIGN.colors.surface, borderTop: `1px solid ${DESIGN.colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🏠</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>首頁</span>
        </button>
        <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🏪</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.primary, fontWeight: '600' }}>品牌</span>
        </button>
        <button onClick={() => router.push('/pet-food-db')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <span style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>食品庫</span>
        </button>
      </nav>
    </div>
  )
}
