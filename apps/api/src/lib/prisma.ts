import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

/**
 * Mendeteksi apakah error database disebabkan oleh cold start / auto-suspend Neon yang sedang bangun.
 */
export function isTransientWakeupError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as Record<string, unknown>;
  const message = typeof anyErr.message === 'string' ? anyErr.message : '';
  const code = typeof anyErr.code === 'string' ? anyErr.code : '';

  if (code === 'P1001' || code === 'P1002' || code === 'P1008' || code === 'P1017') {
    return true;
  }
  if (
    message.includes('kind: Closed') ||
    message.includes("Can't reach database server") ||
    message.includes('Connection terminated unexpectedly') ||
    message.includes('server closed the connection unexpectedly') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('terminating connection due to administrator command') ||
    message.includes('57P01')
  ) {
    return true;
  }
  return false;
}

/**
 * Eksekusi query dengan retry bertahap (Exponential Backoff) untuk toleransi wake-up Neon (auto-suspend).
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 350
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries || !isTransientWakeupError(err)) {
        throw err;
      }
      const backoff = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[Neon DB Wake-up] Koneksi tertunda (percobaan ${attempt}/${maxRetries}), mencoba lagi dalam ${backoff}ms...`
      );
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}

function optimizeConnectionString(raw: string): string {
  if (!raw || (!raw.startsWith('postgresql://') && !raw.startsWith('postgres://'))) {
    return raw;
  }
  try {
    const url = new URL(raw);
    // Enforce safe connection limit (5) and pool timeout (10s) on Free Tier if not explicitly set
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.DB_CONNECTION_LIMIT || '5');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.DB_POOL_TIMEOUT || '10');
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const rawConnectionString =
    process.env.DATABASE_POOLED_URL || process.env.DATABASE_URL || '';
  const connectionString = optimizeConnectionString(rawConnectionString);

  const isNeon =
    connectionString.includes('neon.tech') ||
    process.env.USE_NEON_ADAPTER === 'true';

  const logConfig = [
    { emit: 'event' as const, level: 'error' as const },
    { emit: 'event' as const, level: 'warn' as const },
    ...(process.env.DEBUG_PRISMA === 'true'
      ? [{ emit: 'event' as const, level: 'query' as const }]
      : []),
  ];

  let baseClient: PrismaClient;

  if (isNeon && connectionString) {
    const adapter = new PrismaNeon({ connectionString });
    baseClient = new PrismaClient({
      adapter,
      log: logConfig,
    });
  } else {
    baseClient = new PrismaClient({
      log: logConfig,
    });
  }

  // Handle error events gracefully
  (baseClient as any).$on('error', (e: { message: string; target?: string }) => {
    // Suppress benign TCP socket close messages caused by Neon PgBouncer idle connection drops
    if (e.message && e.message.includes('kind: Closed, cause: None')) {
      return;
    }
    console.error(`prisma:error [${e.target || 'postgres'}]:`, e.message);
  });

  // Handle warn events
  (baseClient as any).$on('warn', (e: { message: string; target?: string }) => {
    console.warn(`prisma:warn [${e.target || 'postgres'}]:`, e.message);
  });

  if (process.env.DEBUG_PRISMA === 'true') {
    (baseClient as any).$on('query', (e: { query: string; duration: number }) => {
      console.log(`prisma:query (${e.duration}ms): ${e.query.slice(0, 100)}`);
    });
  }

  // Bungkus operasi model dengan toleransi auto-retry saat database Neon sedang wake-up
  const client = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ query, args }) {
          return withDbRetry(() => query(args));
        },
      },
    },
  });

  return client;
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = global as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
