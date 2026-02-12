'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SubscriptionPlan } from '@/types';

interface RedemptionCode {
  id: string;
  code: string;
  plan: SubscriptionPlan;
  durationDays: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  redemptionLogs: {
    id: string;
    redeemedAt: string;
    user: {
      displayName: string | null;
      realName: string | null;
      email: string | null;
    };
  }[];
}

export default function AdminCodesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 創建表單狀態
  const [newCode, setNewCode] = useState({
    plan: 'STANDARD' as SubscriptionPlan,
    durationDays: 30,
    maxUses: 1,
    validUntil: '',
    description: '',
  });

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/codes', {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCodes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/admin/codes', {
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });
    if (res.ok) {
      setIsAuthenticated(true);
      fetchCodes();
    } else {
      alert('密碼錯誤');
    }
  };

  const handleCreateCode = async () => {
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(newCode),
      });
      const data = await res.json();
      if (data.success) {
        setCodes([data.data, ...codes]);
        setIsCreateOpen(false);
        setNewCode({
          plan: 'STANDARD',
          durationDays: 30,
          maxUses: 1,
          validUntil: '',
          description: '',
        });
      }
    } catch (error) {
      console.error('Failed to create code:', error);
    }
  };

  const handleDeactivate = async (codeId: string) => {
    if (!confirm('確定要停用此兌換碼？')) return;

    try {
      const res = await fetch(`/api/admin/codes?id=${codeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });
      if (res.ok) {
        setCodes(codes.map((c) => (c.id === codeId ? { ...c, isActive: false } : c)));
      }
    } catch (error) {
      console.error('Failed to deactivate code:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPlanLabel = (plan: SubscriptionPlan) => {
    const labels = {
      FREE: '免費版',
      STANDARD: '標準版',
      PREMIUM: '專業版',
    };
    return labels[plan];
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>管理員登入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="請輸入管理員密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button className="w-full" onClick={handleLogin}>
              登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">兌換碼管理</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                建立兌換碼
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>建立新兌換碼</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">方案</label>
                  <Select
                    value={newCode.plan}
                    onValueChange={(value) =>
                      setNewCode({ ...newCode, plan: value as SubscriptionPlan })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">標準版</SelectItem>
                      <SelectItem value="PREMIUM">專業版</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">天數</label>
                  <Input
                    type="number"
                    value={newCode.durationDays}
                    onChange={(e) =>
                      setNewCode({ ...newCode, durationDays: parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">使用次數上限</label>
                  <Input
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) =>
                      setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">有效期限（選填）</label>
                  <Input
                    type="date"
                    value={newCode.validUntil}
                    onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">備註（選填）</label>
                  <Input
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    placeholder="例如：測試用、KOL 合作"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateCode}>建立</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>兌換碼</TableHead>
                  <TableHead>方案</TableHead>
                  <TableHead>天數</TableHead>
                  <TableHead>使用次數</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>建立時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      載入中...
                    </TableCell>
                  </TableRow>
                ) : codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      尚無兌換碼
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {code.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{code.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={code.plan === 'PREMIUM' ? 'default' : 'secondary'}
                        >
                          {getPlanLabel(code.plan)}
                        </Badge>
                      </TableCell>
                      <TableCell>{code.durationDays} 天</TableCell>
                      <TableCell>
                        {code.currentUses} / {code.maxUses}
                      </TableCell>
                      <TableCell>
                        {code.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            啟用
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500">
                            停用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(code.createdAt).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell>
                        {code.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeactivate(code.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 使用紀錄 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>兌換紀錄</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>兌換碼</TableHead>
                  <TableHead>用戶</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>兌換時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.flatMap((code) =>
                  code.redemptionLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <code className="text-sm font-mono">{code.code}</code>
                      </TableCell>
                      <TableCell>{log.user.realName || log.user.displayName || '-'}</TableCell>
                      <TableCell>{log.user.email || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.redeemedAt).toLocaleString('zh-TW')}
                      </TableCell>
                    </TableRow>
                  ))
                ).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      尚無兌換紀錄
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.flatMap((code) =>
                    code.redemptionLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <code className="text-sm font-mono">{code.code}</code>
                        </TableCell>
                        <TableCell>{log.user.realName || log.user.displayName || '-'}</TableCell>
                        <TableCell>{log.user.email || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.redeemedAt).toLocaleString('zh-TW')}
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
