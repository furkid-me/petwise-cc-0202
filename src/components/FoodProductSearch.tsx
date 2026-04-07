'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    const url = new URL('/api/food-products', window.location.origin);
    url.searchParams.set('q', debouncedQuery);
    url.searchParams.set('limit', '10');
    if (petType) url.searchParams.set('petType', petType);

    fetch(url.toString(), { signal: abortRef.current.signal })
      .then((res) => res.json())
      .then((data) => {
        const rawProducts = data?.data?.products ?? [];
        const mapped: FoodProduct[] = rawProducts.map((p: {
          id: string;
          name: string;
          brand: string;
          type: string;
          petType?: string[];
          origin?: string;
          caloriesPer100g?: string | number | null;
          proteinPer100g?: string | number | null;
          fatPer100g?: string | number | null;
          carbsPer100g?: string | number | null;
          allergens?: string[];
          mainIngredients?: string[];
          imageUrl?: string;
        }) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          type: p.type,
          petType: p.petType,
          origin: p.origin,
          kcalPer100g: p.caloriesPer100g != null ? Number(p.caloriesPer100g) : 0,
          proteinPer100g: p.proteinPer100g != null ? Number(p.proteinPer100g) : undefined,
          fatPer100g: p.fatPer100g != null ? Number(p.fatPer100g) : undefined,
          carbsPer100g: p.carbsPer100g != null ? Number(p.carbsPer100g) : undefined,
          allergens: p.allergens,
          mainIngredients: p.mainIngredients,
          imageURL: p.imageUrl ?? '',
        }));
        setResults(mapped);
        setShowDropdown(true);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') {
          setResults([]);
          setShowDropdown(true);
        }
      })
      .finally(() => setLoading(false));
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
