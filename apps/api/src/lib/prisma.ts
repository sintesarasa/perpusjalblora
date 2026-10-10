import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      ...(process.env.DEBUG_PRISMA === 'true'
        ? [{ emit: 'event' as const, level: 'query' as const }]
        : []),
    ],
  });

  // Handle error events gracefully
  (client as any).$on('error', (e: { message: string; target?: string }) => {
    // Suppress benign TCP socket close messages caused by Neon PgBouncer idle connection drops
    if (e.message && e.message.includes('kind: Closed, cause: None')) {
      return;
    }
    console.error(`prisma:error [${e.target || 'postgres'}]:`, e.message);
  });

  // Handle warn events
  (client as any).$on('warn', (e: { message: string; target?: string }) => {
    console.warn(`prisma:warn [${e.target || 'postgres'}]:`, e.message);
  });

  if (process.env.DEBUG_PRISMA === 'true') {
    (client as any).$on('query', (e: { query: string; duration: number }) => {
      console.log(`prisma:query (${e.duration}ms): ${e.query.slice(0, 100)}`);
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

