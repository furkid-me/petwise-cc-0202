'use client';

import { useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/liff';
import type { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data ?? data,
    };
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// API methods
export const api = {
  // Auth
  auth: {
    login: (lineAccessToken: string) =>
      fetchApi<{ user: unknown; token: string }>('/api/auth/line', {
        method: 'POST',
        body: JSON.stringify({ accessToken: lineAccessToken }),
      }),
  },

  // Users
  users: {
    getMe: () => fetchApi('/api/users/me'),
    updateMe: (data: unknown) =>
      fetchApi('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getSubscription: () => fetchApi('/api/users/me/subscription'),
  },

  // Pets
  pets: {
    list: () => fetchApi('/api/pets'),
    get: (id: string) => fetchApi(`/api/pets/${id}`),
    create: (data: unknown) =>
      fetchApi('/api/pets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      fetchApi(`/api/pets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/api/pets/${id}`, {
        method: 'DELETE',
      }),
  },

  // Diaries
  diaries: {
    list: (params?: { petId?: string; page?: number; limit?: number; category?: string; search?: string; startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.petId) searchParams.set('petId', params.petId);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      return fetchApi(`/api/diaries?${searchParams}`);
    },
    get: (id: string) => fetchApi(`/api/diaries/${id}`),
    create: (data: unknown) =>
      fetchApi('/api/diaries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      fetchApi(`/api/diaries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/api/diaries/${id}`, {
        method: 'DELETE',
      }),
  },

  // AI
  ai: {
    parse: (input: string, petName?: string) =>
      fetchApi('/api/ai/parse', {
        method: 'POST',
        body: JSON.stringify({ input, petName }),
      }),
    analyze: (petId: string) =>
      fetchApi('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ petId }),
      }),
  },

  // Reminders
  reminders: {
    list: () => fetchApi('/api/reminders'),
    create: (data: unknown) =>
      fetchApi('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: unknown) =>
      fetchApi(`/api/reminders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/api/reminders/${id}`, {
        method: 'DELETE',
      }),
    complete: (id: string) =>
      fetchApi(`/api/reminders/${id}/complete`, {
        method: 'POST',
      }),
  },

  // Stats
  stats: {
    overview: (petId?: string) => {
      const params = petId ? `?petId=${petId}` : '';
      return fetchApi(`/api/stats/overview${params}`);
    },
  },

  // Upload
  upload: {
    image: async (file: File): Promise<ApiResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAccessToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });

        const data = await response.json();
        return {
          success: response.ok,
          data: data.data,
          error: data.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    },
  },
};

// Custom hook for API calls with loading state
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (promise: Promise<ApiResponse<T>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promise;
      if (result.success) {
        setData(result.data as T);
        return result.data as T;
      } else {
        setError(result.error || 'Unknown error');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, execute };
}
