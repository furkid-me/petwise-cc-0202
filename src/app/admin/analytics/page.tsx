import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">數據分析</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>用戶成長</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              連接資料庫後將顯示用戶成長趨勢圖表
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>日記記錄趨勢</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              連接資料庫後將顯示記錄數量趨勢圖表
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>記錄分類分布</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              連接資料庫後將顯示分類分布圓餅圖
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>活躍用戶</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              連接資料庫後將顯示活躍用戶統計
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AI 使用統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">總解析次數</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">今日解析</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均準確率</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API 費用估算</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
