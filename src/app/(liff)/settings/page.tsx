'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Bell, CreditCard, LogOut, ChevronRight, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/user-store';
import { logout as liffLogout } from '@/lib/liff';
import { api } from '@/hooks/use-api';

const planLabels: Record<string, string> = {
  FREE: '免費版',
  STANDARD: '標準版',
  PREMIUM: '專業版',
};

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const [notifyEnabled, setNotifyEnabled] = useState(user?.notifyEnabled ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleNotify = async () => {
    if (!user) return;

    setIsUpdating(true);
    const newValue = !notifyEnabled;

    const result = await api.users.updateMe({ notifyEnabled: newValue });
    if (result.success) {
      setNotifyEnabled(newValue);
    }

    setIsUpdating(false);
  };

  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      liffLogout();
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-xl font-bold">設定</h1>

      {/* Profile */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            {user?.pictureUrl && (
              <AvatarImage src={user.pictureUrl} alt={user.displayName || ''} />
            )}
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{user?.displayName || '用戶'}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {planLabels[user?.subscriptionPlan || 'FREE']}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="mb-4">
        <Link href="/subscription">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">訂閱方案</p>
                <p className="text-sm text-muted-foreground">
                  {planLabels[user?.subscriptionPlan || 'FREE']}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Link>
      </Card>

      {/* Notifications */}
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">推播通知</p>
              <p className="text-sm text-muted-foreground">
                接收提醒和重要通知
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleNotify}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifyEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifyEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">使用說明</p>
              <p className="text-sm text-muted-foreground">
                了解如何使用 PetWise
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        登出
      </Button>

      {/* Version */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        PetWise v1.0.0
      </p>
    </div>
  );
}
