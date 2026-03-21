'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  kcalPer100g: number;
  imageURL: string;
  type: string;
}

interface FoodProductSearchProps {
  onSelect: (product: FoodProduct) => void;
  initialQuery?: string;
  petType?: string;
}

export default function FoodProductSearch({ onSelect, initialQuery = '', petType }: FoodProductSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const searchFoodProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('petwise_jwt');
        const params = new URLSearchParams({ query: debouncedQuery });
        if (petType) params.append('petType', petType);

        const response = await fetch(`/api/food-products?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('搜尋失敗');
        const data = await response.json();
        setResults(data.foodProducts || []);
      } catch (err) {
        setError('搜尋時發生錯誤');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchFoodProducts();
  }, [debouncedQuery, petType]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="搜尋飼料或罐頭名稱..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
      {loading && <p className="text-sm text-gray-500">搜尋中...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
        {results.length > 0 ? (
          results.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className="flex items-center p-2 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50"
            >
              {product.imageURL && (
                <img src={product.imageURL} alt={product.name} className="w-10 h-10 object-cover rounded mr-2" />
              )}
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-500">{product.brand} · {product.type}</p>
                {product.kcalPer100g && (
                  <p className="text-xs text-gray-400">{product.kcalPer100g} kcal/100g</p>
                )}
              </div>
            </div>
          ))
        ) : (
          !loading && debouncedQuery && <p className="text-sm text-gray-500 p-2">找不到相關食品</p>
        )}
      </div>
    </div>
  );
}
