'use client';

import { useState } from 'react';
import { ChevronLeft, Check, Crown, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
}

const plans: Plan[] = [
  {
    id: 'FREE',
    name: '免費版',
    price: 0,
    period: '永久免費',
    description: '適合初次使用的飼主',
    icon: <Zap className="h-6 w-6" />,
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
    icon: <Star className="h-6 w-6" />,
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
    icon: <Crown className="h-6 w-6" />,
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

    // In production, integrate with LINE Pay or other payment gateway
    // For demo, show alert
    alert('付款功能開發中，敬請期待！');

    setIsProcessing(false);
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">訂閱方案</h1>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${plan.highlighted ? 'border-primary' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-full p-2 ${
                    plan.highlighted ? 'bg-primary/10 text-primary' : 'bg-muted'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {plan.name}
                      {plan.highlighted && (
                        <Badge>推薦</Badge>
                      )}
                      {currentPlan === plan.id && (
                        <Badge variant="secondary">目前方案</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="mb-4">
                <span className="text-3xl font-bold tracking-tight">NT$ {plan.price}</span>
                <span className="text-muted-foreground"> / {plan.period}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 text-sm ${
                      feature.included ? '' : 'text-muted-foreground'
                    }`}
                  >
                    <Check className={`h-4 w-4 ${
                      feature.included ? 'text-primary' : 'opacity-30'
                    }`} />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </CardContent>
            {selectedPlan === plan.id && plan.id !== currentPlan && plan.id !== 'FREE' && (
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                >
                  {isProcessing ? '處理中...' : `升級到${plan.name}`}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-full bg-muted/50 p-4">
        <h3 className="mb-2 text-sm font-medium">付款說明</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• 支援 LINE Pay 付款</li>
          <li>• 隨時可以取消訂閱</li>
          <li>• 取消後仍可使用至週期結束</li>
          <li>• 降級方案時資料不會遺失</li>
        </ul>
      </div>
    </div>
  );
}
