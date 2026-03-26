import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data - in production, fetch from API
const subscriptionStats = {
  free: 0,
  standard: 0,
  premium: 0,
  totalRevenue: 0,
  mrr: 0,
};

const recentPayments: Array<{
  id: string;
  user: string;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}> = [];

const statusColors = {
  completed: 'default' as const,
  pending: 'secondary' as const,
  failed: 'destructive' as const,
};

const statusLabels = {
  completed: '已完成',
  pending: '處理中',
  failed: '失敗',
};

export default function AdminSubscriptionsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">訂閱管理</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">免費用戶</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.free}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">標準版用戶</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.standard}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">專業版用戶</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.premium}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>月經常性收入 (MRR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              NT$ {subscriptionStats.mrr.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              總收入: NT$ {subscriptionStats.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近付款</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                尚無付款記錄
              </p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{payment.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.plan} · {payment.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        NT$ {payment.amount.toLocaleString()}
                      </p>
                      <Badge variant={statusColors[payment.status]}>
                        {statusLabels[payment.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
