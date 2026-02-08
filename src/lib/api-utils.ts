import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

// API Response Types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Success response helper
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

// Error response helper
export function errorResponse(
  error: string,
  status = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
    { status }
  );
}

// Common error responses
export const errors = {
  unauthorized: () =>
    errorResponse('請先登入', 401, 'UNAUTHORIZED'),

  forbidden: (message = '沒有權限執行此操作') =>
    errorResponse(message, 403, 'FORBIDDEN'),

  notFound: (resource = '資源') =>
    errorResponse(`${resource}不存在`, 404, 'NOT_FOUND'),

  badRequest: (message: string) =>
    errorResponse(message, 400, 'BAD_REQUEST'),

  validation: (message: string, details?: unknown) =>
    errorResponse(message, 400, 'VALIDATION_ERROR', details),

  internal: (message = '伺服器錯誤，請稍後再試') =>
    errorResponse(message, 500, 'INTERNAL_ERROR'),

  limitExceeded: (resource: string, limit: number) =>
    errorResponse(
      `已達到${resource}上限 (${limit})，請升級方案以增加額度`,
      403,
      'LIMIT_EXCEEDED'
    ),

  premiumRequired: (feature: string) =>
    errorResponse(
      `${feature}為專業版功能，請升級方案以使用`,
      403,
      'PREMIUM_REQUIRED'
    ),
};

// Request body parser with validation
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return {
        success: false,
        response: errors.validation(
          firstError?.message || '資料格式錯誤',
          result.error.errors
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: errors.badRequest('無效的 JSON 格式'),
      };
    }
    return {
      success: false,
      response: errors.internal(),
    };
  }
}

// Query params parser with validation
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = schema.safeParse(params);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return {
        success: false,
        response: errors.validation(
          firstError?.message || '查詢參數格式錯誤',
          result.error.errors
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: errors.internal(),
    };
  }
}

// Error handler wrapper for API routes
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return errors.validation(
        firstError?.message || '資料驗證失敗',
        error.errors
      );
    }

    if (error instanceof Error) {
      // Don't expose internal error messages in production
      const message =
        process.env.NODE_ENV === 'development'
          ? error.message
          : '伺服器錯誤，請稍後再試';
      return errors.internal(message);
    }

    return errors.internal();
  });
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): ApiSuccessResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    success: true,
    data: {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasMore: params.page < totalPages,
      },
    },
  };
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}
