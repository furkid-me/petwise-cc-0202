import Link from 'next/link';
import { Home, Users, CreditCard, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/admin', label: '總覽', icon: Home },
  { href: '/admin/users', label: '用戶', icon: Users },
  { href: '/admin/subscriptions', label: '訂閱', icon: CreditCard },
  { href: '/admin/analytics', label: '分析', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold">PetWise Admin</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
