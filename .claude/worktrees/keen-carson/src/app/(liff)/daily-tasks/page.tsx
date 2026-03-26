'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

interface TaskExecution {
  id: string; taskId: string; executionDate: string;
  isCompleted: boolean; notes: string | null; createdAt: string;
}

interface DailyTask {
  id: string; petId: string; userId: string; taskName: string;
  frequency: string; startDate: string; endDate: string | null;
  isActive: boolean; notes: string | null; createdAt: string;
  executions?: TaskExecution[];
}

export default function DailyTasksPage() {
  const router = useRouter();
  const { user, activePetId, pets } = useUserStore();
  const activePet = useMemo(() => pets.find(p => p.id === activePetId), [pets, activePetId]);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTaskCompletedToday = (task: DailyTask) => {
    return task.executions?.some(
      (exec) => {
        const execDate = exec.executionDate.includes('T')
          ? exec.executionDate.split('T')[0]
          : exec.executionDate;
        return execDate === today && exec.isCompleted;
      }
    ) ?? false;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user || !activePet) { setLoading(false); return; }
      setLoading(true); setError(null);
      const token = localStorage.getItem('petwise_jwt');
      if (!token) { setError('用戶未認證，請重新登入。'); setLoading(false); return; }
      try {
        const tasksUrl = new URL('/api/daily-tasks', window.location.origin);
        tasksUrl.searchParams.append('petId', activePet.id);
        const tasksResponse = await fetch(tasksUrl.toString(), {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (tasksResponse.ok) {
          const res = await tasksResponse.json();
          const tasksData: DailyTask[] = Array.isArray(res) ? res : (res.data ?? []);
          setDailyTasks(tasksData);
        } else {
          const errorData = await tasksResponse.json();
          setError(errorData.error || '載入日常任務失敗。');
        }
      } catch (err) {
        console.error('Fetch daily tasks error:', err);
        setError('載入任務時發生未知錯誤。');
      } finally { setLoading(false); }
    };
    fetchTasks();
  }, [user, activePet]);

  const handleMarkTaskComplete = async (taskId: string) => {
    const token = localStorage.getItem('petwise_jwt');
    if (!token || !user?.id) { setError('用戶未認證，請重新登入。'); return; }
    try {
      const response = await fetch(`/api/daily-tasks/${taskId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ executionDate: today, isCompleted: true }),
      });
      if (response.ok) {
        const res = await response.json();
        const newExecution: TaskExecution = res.data ?? res;
        setDailyTasks(prev =>
          prev.map(task =>
            task.id === taskId
              ? { ...task, executions: [...(task.executions ?? []), newExecution] }
              : task
          )
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || '標記完成失敗。');
      }
    } catch (err) {
      console.error('Mark task complete error:', err);
      setError('標記完成時發生未知錯誤。');
    }
  };

  if (!user || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中或用戶/寵物未選定...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{activePet.name} 的日常任務</h1>
        <button
          onClick={() => router.push('/daily-tasks/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
        >
          + 新增
        </button>
      </div>
      {loading ? (
        <p className="text-gray-500 text-center">載入日常任務...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : dailyTasks.length === 0 ? (
        <p className="text-gray-600 text-center">目前沒有 {activePet.name} 的日常任務。</p>
      ) : (
        <div className="space-y-4">
          {dailyTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{task.taskName}</h3>
                <p className="text-sm text-gray-600">頻率：{task.frequency === 'daily' ? '每日' : '每週'}</p>
                {task.notes && <p className="text-sm text-gray-600 mt-1">備註：{task.notes}</p>}
              </div>
              <div>
                {isTaskCompletedToday(task) ? (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">已完成 ✅</span>
                ) : (
                  <button
                    onClick={() => handleMarkTaskComplete(task.id)}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    標記完成
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 max-w-md mx-auto">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 text-xs">🏠<span>首頁</span></button>
        <button onClick={() => router.push('/diet')} className="flex flex-col items-center text-gray-500 text-xs">🍽️<span>飲食</span></button>
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center text-gray-500 text-xs">⚖️<span>照護</span></button>
        <button onClick={() => router.push('/reminders')} className="flex flex-col items-center text-gray-500 text-xs">🔔<span>提醒</span></button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 text-xs">👤<span>我的</span></button>
      </nav>
    </div>
  );
}
