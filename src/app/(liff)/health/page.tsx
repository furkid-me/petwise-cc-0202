'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';

export default function HealthPage() {
  const router = useRouter();
  const pets = useUserStore((state) => state.pets) || [];
  const currentPetId = useUserStore((state) => state.currentPetId);
  const pet = pets.find((p) => p.id === currentPetId) || pets[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部區塊 */}
      <div className="bg-indigo-600 text-white p-4 pb-16">
        <p className="text-sm opacity-80">健康照護</p>
        <h1 className="text-xl font-bold mt-1">🐾 {pet?.name || '寵物'}的健康</h1>
        {pet?.photoUrl && (
          <img src={pet.photoUrl} alt={pet.name} className="w-12 h-12 rounded-full object-cover mt-2" />
        )}
      </div>

      {/* 健康功能卡片 */}
      <div className="-mt-8 mx-4 space-y-3 flex-1 mb-20">
        {/* 體重記錄 */}
        <button
          onClick={() => router.push('/weight')}
          className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">體重記錄</h3>
              <p className="text-sm text-gray-500">追蹤體重變化</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* 用藥記錄 */}
        <button
          onClick={() => router.push('/medication-records')}
          className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              💊
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">用藥記錄</h3>
              <p className="text-sm text-gray-500">藥物劑量與時間</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* 驅蟲記錄 */}
        <button
          onClick={() => router.push('/deworming')}
          className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              🐛
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">驅蟲記錄</h3>
              <p className="text-sm text-gray-500">體內外驅蟲追蹤</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* 營養品記錄 */}
        <button
          onClick={() => router.push('/supplements')}
          className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
              🥩
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">營養品記錄</h3>
              <p className="text-sm text-gray-500">保健品與補充品</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {/* 醫療記錄 */}
        <button
          onClick={() => router.push('/medical-records')}
          className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
              🏥
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">醫療記錄</h3>
              <p className="text-sm text-gray-500">就診與檢查</p>
            </div>
          </div>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* 底部導覽列 */}
      <div className="h-16 bg-white ring-1 ring-inset ring-gray-950/[0.08] flex justify-around items-center fixed bottom-0 left-0 right-0">
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
        <button onClick={() => router.push('/health')} className="flex flex-col items-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs">健康</span>
        </button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs">提醒</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">我的</span>
        </button>
      </div>
    </div>
  );
}
