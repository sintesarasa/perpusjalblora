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
  const internal = sanitizeUrl(process.env.INTERNAL_API_URL) || sanitizeUrl(process.env.API_URL);
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

export interface ApiFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  timeoutMs?: number;
  retryOnColdStart?: boolean;
}

export function isServerColdStart(error: ApiError | undefined): boolean {
  if (!error) return false;
  return (
    error.code === 'SERVER_COLD_START' ||
    error.code === 'HTTP_504' ||
    error.code === 'HTTP_502' ||
    error.message.includes('504') ||
    error.message.includes('502') ||
    error.message.includes('cold start')
  );
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

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

    const { next, cache, headers, timeoutMs, retryOnColdStart, ...restOptions } = options;
    const fetchInit: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...restOptions,
    };

    const method = (options.method || 'GET').toUpperCase();
    const isPublicGet =
      method === 'GET' &&
      !endpoint.includes('/me') &&
      !endpoint.includes('/admin') &&
      !endpoint.includes('/dashboard') &&
      !endpoint.includes('/auth/');

    // Cache strategy: Public GET requests can leverage Vercel Edge Cache and browser caching,
    // while mutations and private routes always stay no-store.
    if (next) {
      fetchInit.next = next;
    } else if (cache) {
      fetchInit.cache = cache;
    } else if (isPublicGet) {
      if (typeof window === 'undefined') {
        fetchInit.next = { revalidate: 120 };
      } else {
        fetchInit.cache = 'default';
      }
    } else {
      fetchInit.cache = 'no-store';
    }

    // AbortController timeout to prevent hanging on Render cold starts (default 9s for public, 15s for mutations)
    const effectiveTimeoutMs = timeoutMs ?? (isPublicGet ? 9000 : 15000);
    const controller = new AbortController();

    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort(options.signal.reason);
      } else {
        options.signal.addEventListener('abort', () => controller.abort(options.signal?.reason));
      }
    }

    timeoutId = setTimeout(() => {
      controller.abort(new Error('TIMEOUT_COLD_START'));
    }, effectiveTimeoutMs);

    fetchInit.signal = controller.signal;

    let res: Response;
    try {
      res = await fetch(targetUrl, fetchInit);
    } catch (fetchErr: unknown) {
      if (timeoutId) clearTimeout(timeoutId);
      const isAbortOrTimeout =
        (fetchErr instanceof Error &&
          (fetchErr.name === 'AbortError' || fetchErr.message.includes('TIMEOUT_COLD_START'))) ||
        controller.signal.aborted;

      // 1-time automatic retry for public GET if initial call was caught in a Render spin-up
      if (isPublicGet && isAbortOrTimeout && retryOnColdStart !== false) {
        try {
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 12000);
          fetchInit.signal = retryController.signal;
          const retryRes = await fetch(targetUrl, fetchInit);
          clearTimeout(retryTimeoutId);
          res = retryRes;
        } catch {
          return {
            error: {
              code: 'SERVER_COLD_START',
              message: 'Server sedang bersiap (cold start). Silakan coba lagi dalam beberapa saat.',
            },
          };
        }
      } else if (isAbortOrTimeout) {
        return {
          error: {
            code: 'SERVER_COLD_START',
            message: 'Server sedang bersiap (cold start). Silakan coba lagi dalam beberapa saat.',
          },
        };
      } else {
        throw fetchErr;
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (res.status === 204) {
      return { data: undefined as unknown as T };
    }

    if (res.status === 504 || res.status === 502) {
      return {
        error: {
          code: 'SERVER_COLD_START',
          message: 'Server sedang bersiap (cold start). Membuka koneksi ulang...',
        },
      };
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
    if (timeoutId) clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Tidak dapat terhubung ke server perpusjal.';
    return {
      error: {
        code: 'NETWORK_ERROR',
        message,
      },
    };
  }
}
