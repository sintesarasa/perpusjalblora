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
      cache: 'no-store',
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

    if (!json || typeof json !== 'object') {
      return { data: json as T };
    }

    // Envelope with meta (e.g. paginated lists { data: [...], meta: {...} })
    if ('data' in json && 'meta' in json) {
      return { data: json as T };
    }

    // Standard envelope { data: inner, ... }
    if ('data' in json) {
      const inner = json.data;
      if (inner && typeof inner === 'object') {
        try {
          if (!('data' in inner)) {
            Object.defineProperty(inner, 'data', {
              value: inner,
              enumerable: false,
              writable: true,
              configurable: true,
            });
          }
          if ('message' in json && !('message' in inner)) {
            Object.defineProperty(inner, 'message', {
              value: (json as Record<string, unknown>).message,
              enumerable: false,
              writable: true,
              configurable: true,
            });
          }
        } catch {
          // Ignore sealed/frozen objects
        }
        return { data: inner as T };
      }
    }

    return { data: json as T };
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
