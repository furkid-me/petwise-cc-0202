'use client';

import { useState } from 'react';
import { ChevronLeft, Check, Crown, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import type { SubscriptionPlan } from '@/types';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  highlighted?: boolean;
  dark?: boolean;
}

const plans: Plan[] = [
  {
    id: 'FREE',
    name: '免費版',
    price: 0,
    period: '永久免費',
    description: '適合初次使用的飼主',
    icon: <Zap className="h-5 w-5" />,
    features: [
      { text: '1 隻寵物', included: true },
      { text: '每日 5 則記錄', included: true },
      { text: '記錄保存 30 天', included: true },
      { text: '基本分類功能', included: true },
      { text: '每則 1 張照片', included: true },
      { text: '3 個提醒', included: true },
      { text: 'AI 智能分類', included: false },
      { text: 'AI 健康分析', included: false },
      { text: '匯出報告', included: false },
      { text: '家庭共享', included: false },
    ],
  },
  {
    id: 'STANDARD',
    name: '標準版',
    price: 79,
    period: '每月',
    description: '多寵物家庭的最佳選擇',
    icon: <Star className="h-5 w-5" />,
    highlighted: true,
    features: [
      { text: '3 隻寵物', included: true },
      { text: '無限則記錄', included: true },
      { text: '記錄保存 90 天', included: true },
      { text: 'AI 智能分類', included: true },
      { text: '每則 5 張照片', included: true },
      { text: '無限提醒', included: true },
      { text: '90 天統計報告', included: true },
      { text: 'PDF 匯出', included: true },
      { text: 'AI 健康分析', included: false },
      { text: '家庭共享', included: false },
    ],
  },
  {
    id: 'PREMIUM',
    name: '專業版',
    price: 149,
    period: '每月',
    description: '專業飼主的完整功能',
    icon: <Crown className="h-5 w-5" />,
    dark: true,
    features: [
      { text: '無限寵物', included: true },
      { text: '無限則記錄', included: true },
      { text: '記錄保存 365 天', included: true },
      { text: 'AI 智能分類', included: true },
      { text: '每則 10 張照片', included: true },
      { text: '無限 + 智能提醒', included: true },
      { text: '完整歷史統計', included: true },
      { text: 'PDF + Excel 匯出', included: true },
      { text: 'AI 健康分析', included: true },
      { text: '家庭共享 (最多 5 人)', included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const user = useUserStore((state) => state.user);
  const currentPlan = user?.subscriptionPlan || 'FREE';
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (selectedPlan === 'FREE' || selectedPlan === currentPlan) return;
    setIsProcessing(true);
    alert('付款功能開發中，敬請期待！');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">

        {/* 頂部導覽 */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/settings">
            <button className="h-9 w-9 rounded-full ring-1 ring-gray-950/10 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400">方案選擇</p>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">訂閱方案</h1>
          </div>
        </div>

        {/* 方案卡片 */}
        <div className="space-y-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isDark = plan.dark;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={[
                  'cursor-pointer rounded-2xl p-4 transition-all',
                  isDark
                    ? 'bg-gray-950 ring-1 ring-inset ring-white/10'
                    : plan.highlighted
                    ? 'bg-indigo-950/[0.03] ring-1 ring-inset ring-indigo-200/60'
                    : 'bg-gray-950/[0.025] ring-1 ring-inset ring-gray-950/5',
                  isSelected && !isDark ? 'ring-2 ring-indigo-600' : '',
                  isSelected && isDark ? 'ring-2 ring-white/40' : '',
                ].join(' ')}
              >
                {/* 卡片標題行 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={[
                      'rounded-full p-1.5',
                      isDark ? 'bg-white/10 text-white' : plan.highlighted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600',
                    ].join(' ')}>
                      {plan.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </span>
                        {plan.highlighted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-medium">
                            推薦
                          </span>
                        )}
                        {currentPlan === plan.id && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-500'}`}>
                            目前方案
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        {plan.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 價格 */}
                <div className={`mb-3 pb-3 border-b ${isDark ? 'border-white/10' : 'border-gray-950/[0.06]'}`}>
                  <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    NT$ {plan.price}
                  </span>
                  <span className={`text-sm ml-1 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
                    / {plan.period}
                  </span>
                </div>

                {/* 功能列表 */}
                <ul className="space-y-1.5">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className={[
                        'h-3.5 w-3.5 flex-shrink-0',
                        feature.included
                          ? isDark ? 'text-emerald-400' : 'text-emerald-500'
                          : isDark ? 'text-white/20' : 'text-gray-300',
                      ].join(' ')} />
                      <span className={[
                        feature.included
                          ? isDark ? 'text-white/90' : 'text-gray-700'
                          : isDark ? 'text-white/30' : 'text-gray-400',
                      ].join(' ')}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA 按鈕 */}
                {isSelected && plan.id !== currentPlan && plan.id !== 'FREE' && (
                  <div className="mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                      disabled={isProcessing}
                      className={[
                        'w-full h-9 rounded-full text-sm font-medium transition-colors',
                        isDark
                          ? 'bg-white text-gray-950 hover:bg-gray-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700',
                      ].join(' ')}
                    >
                      {isProcessing ? '處理中...' : `升級到${plan.name}`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 分隔線 */}
        <div className="my-5 border-t border-gray-950/[0.08]" />

        {/* 付款說明 */}
        <div className="bg-gray-950/[0.025] ring-1 ring-inset ring-gray-950/5 rounded-2xl p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-3">付款說明</p>
          <ul className="space-y-1.5 text-sm text-gray-500 leading-7">
            <li>· 支援 LINE Pay 付款</li>
            <li>· 隨時可以取消訂閱</li>
            <li>· 取消後仍可使用至週期結束</li>
            <li>· 降級方案時資料不會遺失</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
