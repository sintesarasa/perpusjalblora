const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 204) {
      return { data: undefined as unknown as T };
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        error: json?.error || {
          code: 'HTTP_ERROR',
          message: `Permintaan gagal dengan status ${res.status}.`,
        },
      };
    }

    return { data: json?.data ?? json };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tidak dapat terhubung ke server perpusjal.';
    return {
      error: {
        code: 'NETWORK_ERROR',
        message,
      },
    };
  }
}
