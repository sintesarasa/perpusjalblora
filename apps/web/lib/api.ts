function sanitizeUrl(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === 'false' ||
    trimmed === 'true'
  ) {
    return null;
  }
  return trimmed;
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const raw = sanitizeUrl(process.env.NEXT_PUBLIC_API_URL);
    // If not configured, or if running in browser on HTTPS while env points to insecure http://localhost,
    // fallback to relative '/api/v1' to prevent Mixed Content block.
    if (!raw || (window.location.protocol === 'https:' && raw.startsWith('http://localhost'))) {
      return '/api/v1';
    }
    let url = raw.replace(/\/+$/, '');
    // If backend URL was supplied without /api/v1, ensure path is included
    if (url.startsWith('http') && !url.includes('/api/v1')) {
      url = `${url}/api/v1`;
    }
    // If it's a relative path without leading slash, ensure leading slash
    if (!url.startsWith('http') && !url.startsWith('/')) {
      url = `/${url}`;
    }
    return url;
  }

  // Server-side
  const internal = sanitizeUrl(process.env.INTERNAL_API_URL);
  if (internal) {
    let url = internal.replace(/\/+$/, '');
    if (!url.includes('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
  }

  const raw = sanitizeUrl(process.env.NEXT_PUBLIC_API_URL);
  if (raw && raw.startsWith('http')) {
    let url = raw.replace(/\/+$/, '');
    if (!url.includes('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
  }

  return 'http://localhost:4000/api/v1';
}

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
    let apiUrl = getApiUrl();
    if (!apiUrl || apiUrl === 'undefined' || apiUrl === 'null') {
      apiUrl = '/api/v1';
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Avoid double /api/v1 if both apiUrl ends with /api/v1 and cleanEndpoint starts with /api/v1
    const targetUrl =
      apiUrl.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')
        ? `${apiUrl.slice(0, -7)}${cleanEndpoint}`
        : `${apiUrl}${cleanEndpoint}`;

    const res = await fetch(targetUrl, {
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
