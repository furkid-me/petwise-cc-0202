'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// 從食品資料庫 Demo 資料
const DEMO_PRODUCTS: FoodProduct[] = [
  { id: '1', name: '雞肉乾', brand: '皇家寵物食品', type: '零食', petType: ['dog_cat'], origin: '台灣', caloriesPer100g: 164.5, proteinPer100g: 12.8, fatPer100g: 3.0, carbsPer100g: 0.8, allergens: ['蛋'], mainIngredients: ['雞肉'], imageURL: '', kcalPer100g: 164.5 },
  { id: '2', name: '頂級無穀貓糧', brand: '皇家寵物食品', type: '乾飼糧', petType: ['cat'], origin: '法國', caloriesPer100g: 380.0, proteinPer100g: 40.0, fatPer100g: 18.0, carbsPer100g: 25.0, allergens: [], mainIngredients: ['雞肉', '火雞肉'], imageURL: '', kcalPer100g: 380.0 },
  { id: '3', name: '天然狗罐頭', brand: '希爾思寵物食品', type: '罐頭', petType: ['dog'], origin: '美國', caloriesPer100g: 120.0, proteinPer100g: 10.0, fatPer100g: 7.0, carbsPer100g: 5.0, allergens: ['玉米', '大豆'], mainIngredients: ['牛肉', '胡蘿蔔'], imageURL: '', kcalPer100g: 120.0 },
  { id: '4', name: '貓咪化毛膏', brand: '荒野饗宴', type: '補助食品', petType: ['cat'], origin: '台灣', caloriesPer100g: 250.0, proteinPer100g: 5.0, fatPer100g: 15.0, carbsPer100g: 20.0, allergens: ['魚'], mainIngredients: ['魚油', '麥芽糊精'], imageURL: '', kcalPer100g: 250.0 },
  { id: '5', name: '低敏無穀狗糧', brand: '本能', type: '乾飼糧', petType: ['dog'], origin: '加拿大', caloriesPer100g: 360.0, proteinPer100g: 38.0, fatPer100g: 16.0, carbsPer100g: 28.0, allergens: [], mainIngredients: ['野豬肉', '鹿肉', '地瓜'], imageURL: '', kcalPer100g: 360.0 },
  { id: '6', name: '老貓腎臟配方罐頭', brand: '希爾思寵物食品', type: '罐頭', petType: ['cat'], origin: '美國', caloriesPer100g: 100.0, proteinPer100g: 8.0, fatPer100g: 4.0, carbsPer100g: 8.0, allergens: [], mainIngredients: ['豬肉', '雞肝', '雞肉'], imageURL: '', kcalPer100g: 100.0 },
  { id: '7', name: '幼犬專用飼料', brand: '冠能寵物食品', type: '乾飼糧', petType: ['dog'], origin: '法國', caloriesPer100g: 350.0, proteinPer100g: 30.0, fatPer100g: 20.0, carbsPer100g: 30.0, allergens: ['玉米', '大豆', '小麥'], mainIngredients: ['雞肉粉', '小麥', '玉米', '米'], imageURL: '', kcalPer100g: 350.0 },
  { id: '8', name: '鮮食生鮮包', brand: '愛肯拿', type: '生鮮、冷凍', petType: ['dog_cat'], origin: '台灣', caloriesPer100g: 180.0, proteinPer100g: 15.0, fatPer100g: 12.0, carbsPer100g: 3.0, allergens: [], mainIngredients: ['雞胸肉', '南瓜', '胡蘿蔔'], imageURL: '', kcalPer100g: 180.0 },
]

interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  kcalPer100g: number;
  imageURL: string;
  type: string;
  petType?: string[];
  origin?: string;
  proteinPer100g?: number;
  fatPer100g?: number;
  carbsPer100g?: number;
  allergens?: string[];
  mainIngredients?: string[];
}

interface FoodProductSearchProps {
  onSelect: (product: FoodProduct) => void;
  initialQuery?: string;
  petType?: string;
}

const DESIGN = {
  colors: {
    primary: '#FB9966',
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

export default function FoodProductSearch({ onSelect, initialQuery = '', petType }: FoodProductSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    const s = debouncedQuery.toLowerCase();
    
    // 從 DEMO_PRODUCTS 搜尋
    const filtered = DEMO_PRODUCTS.filter(p => {
      // 寵物類型篩選
      if (petType && p.petType && !p.petType.includes(petType) && !p.petType.includes('dog_cat')) {
        return false;
      }
      
      // 關鍵字搜尋
      return (
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.mainIngredients?.some(i => i.toLowerCase().includes(s))
      );
    });
    
    setResults(filtered);
    setShowDropdown(true);
    setLoading(false);
  }, [debouncedQuery, petType]);

  const handleSelect = (product: FoodProduct) => {
    onSelect(product);
    setQuery(product.name);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="搜尋食品名稱、品牌、成分..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: '44px',
            border: `1px solid ${showDropdown ? DESIGN.colors.primary : DESIGN.colors.border}`,
            borderRadius: DESIGN.radius.md,
            fontSize: '15px',
            background: DESIGN.colors.surface,
            color: DESIGN.colors.text,
            outline: 'none',
            transition: DESIGN.transition,
          }}
        />
        <svg 
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: DESIGN.colors.textMuted }} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      
      {loading && (
        <div style={{ padding: DESIGN.spacing.sm, textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: DESIGN.colors.textMuted }}>搜尋中...</span>
        </div>
      )}
      
      {showDropdown && !loading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: DESIGN.colors.surface,
          border: `1px solid ${DESIGN.colors.border}`,
          borderRadius: DESIGN.radius.md,
          boxShadow: '0 4px 12px rgba(85,66,54,0.1)',
          maxHeight: '320px',
          overflowY: 'auto',
          zIndex: 50,
        }}>
          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                style={{
                  padding: DESIGN.spacing.md,
                  borderBottom: `1px solid ${DESIGN.colors.border}`,
                  cursor: 'pointer',
                  transition: DESIGN.transition,
                  background: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = DESIGN.colors.bg}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: DESIGN.colors.text, marginBottom: '2px' }}>{product.name}</p>
                    <p style={{ fontSize: '13px', color: DESIGN.colors.textSecondary }}>
                      {product.brand} · {product.type}
                      {product.origin && ` · ${product.origin}`}
                    </p>
                    {product.mainIngredients && product.mainIngredients.length > 0 && (
                      <p style={{ fontSize: '12px', color: DESIGN.colors.textMuted, marginTop: '4px' }}>
                        🥩 {product.mainIngredients.slice(0, 3).join('、')}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: DESIGN.colors.primary }}>
                      {product.kcalPer100g}
                    </div>
                    <div style={{ fontSize: '11px', color: DESIGN.colors.textMuted }}>kcal/100g</div>
                  </div>
                </div>
                {product.allergens && product.allergens.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {product.allergens.map(a => (
                      <span key={a} style={{ padding: '2px 6px', background: DESIGN.colors.secondary + '15', color: DESIGN.colors.secondary, borderRadius: '4px', fontSize: '11px' }}>
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: DESIGN.spacing.lg, textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: DESIGN.colors.textMuted, marginBottom: DESIGN.spacing.sm }}>找不到相關食品</p>
              <p style={{ fontSize: '12px', color: DESIGN.colors.textMuted }}>嘗試不同的關鍵字</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
