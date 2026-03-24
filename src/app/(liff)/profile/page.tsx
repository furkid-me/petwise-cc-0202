'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

const PLAN_LABELS: Record<string, string> = {
  FREE: '免費版',
  STANDARD: '標準版',
  PREMIUM: '高級版',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, pets } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* 頂部標題 */}
      <div className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">我的</h1>
      </div>

      {user ? (
        <div className="flex flex-col items-center mt-6 px-4 gap-4">
          {/* 頭像與名稱 */}
          <div className="flex flex-col items-center gap-2">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.displayName ?? '使用者'}
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {user.displayName?.[0] ?? '?'}
              </div>
            )}
            <p className="text-lg font-semibold text-gray-800">
              {user.displayName ?? '未設定名稱'}
            </p>
            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
              {PLAN_LABELS[user.subscriptionPlan] ?? user.subscriptionPlan}
            </span>
          </div>

          {/* 基本資訊卡片 */}
          <div className="w-full bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">基本資料</h2>
            <InfoRow label="LINE 名稱" value={user.displayName} />
            <InfoRow label="真實姓名" value={user.realName} />
            <InfoRow label="電子郵件" value={user.email} />
            <InfoRow label="手機號碼" value={user.phone} />
            <InfoRow label="居住城市" value={user.city ? `${user.city}${user.district ?? ''}` : null} />
          </div>

          {/* 寵物資訊卡片 */}
          <div className="w-full bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              我的寵物（{pets.length} 隻）
            </h2>
            {pets.length === 0 ? (
              <p className="text-sm text-gray-400">尚未新增寵物</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pets.map(pet => (
                  <li key={pet.id} className="py-2 flex items-center gap-3">
                    {pet.photoUrl ? (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        🐾
                      </div>
                    )}
                    <span className="text-sm text-gray-800">{pet.name}</span>
                    {pet.isDefault && (
                      <span className="ml-auto text-xs text-indigo-500">預設</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 快速連結 */}
          <div className="w-full bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            <NavItem label="我的寵物" onClick={() => router.push('/pets')} />
            <NavItem label="設定" onClick={() => router.push('/settings')} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 mt-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
            👤
          </div>
          <p className="text-gray-500">尚未登入，請稍候…</p>
        </div>
      )}

      {/* 底部導覽列 */}
      <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center shadow-lg fixed bottom-0 left-0 right-0">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">首頁</span>
        </button>
        <button onClick={() => router.push('/diary/new')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">飲食</span>
        </button>
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">照護</span>
        </button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs">提醒</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">我的</span>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 text-sm border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800">{value ?? '—'}</span>
    </div>
  );
}

function NavItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
    >
      <span>{label}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
