'use client';

import { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data - in production, fetch from API
const mockUsers = [
  {
    id: '1',
    displayName: '測試用戶',
    lineUserId: 'U1234567890',
    subscriptionPlan: 'FREE',
    petCount: 1,
    diaryCount: 15,
    createdAt: '2024-01-15',
  },
];

const planLabels: Record<string, string> = {
  FREE: '免費版',
  STANDARD: '標準版',
  PREMIUM: '專業版',
};

const planColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  FREE: 'outline',
  STANDARD: 'secondary',
  PREMIUM: 'default',
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lineUserId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">用戶管理</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋用戶..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    用戶
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    方案
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    寵物數
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    記錄數
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    註冊日期
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.lineUserId}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant={planColors[user.subscriptionPlan]}>
                        {planLabels[user.subscriptionPlan]}
                      </Badge>
                    </td>
                    <td className="py-4">{user.petCount}</td>
                    <td className="py-4">{user.diaryCount}</td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {user.createdAt}
                    </td>
                    <td className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看詳情</DropdownMenuItem>
                          <DropdownMenuItem>編輯用戶</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            停用帳號
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                沒有找到符合條件的用戶
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
