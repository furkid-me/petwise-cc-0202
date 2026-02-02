import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PawPrint, FileText, CreditCard } from 'lucide-react';

// Note: In production, fetch these stats from the database
const stats = [
  {
    title: '總用戶數',
    value: '0',
    description: '已註冊用戶',
    icon: Users,
  },
  {
    title: '寵物數',
    value: '0',
    description: '已建立的寵物檔案',
    icon: PawPrint,
  },
  {
    title: '日記記錄',
    value: '0',
    description: '總記錄數',
    icon: FileText,
  },
  {
    title: '付費用戶',
    value: '0',
    description: '活躍訂閱',
    icon: CreditCard,
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">總覽</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>近期活動</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              連接資料庫後將顯示近期用戶活動
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系統狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API</span>
                <span className="text-sm text-green-500">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">資料庫</span>
                <span className="text-sm text-yellow-500">未連接</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">LINE LIFF</span>
                <span className="text-sm text-yellow-500">需配置</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
