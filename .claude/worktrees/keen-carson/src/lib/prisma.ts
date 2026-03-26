import { PrismaClient } from '@prisma/client';

// In serverless environments (Vercel) with Supabase PgBouncer, inject:
// - connection_limit=1: only 1 connection per instance (prevents pool exhaustion)
// - pool_timeout=10: fail after 10s instead of hanging forever
const getDbUrl = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '10');
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

const prismaClientSingleton = () => {
  const dbUrl = getDbUrl();
  // Use datasourceUrl (Prisma 5 API); fall back to env var if url is not available at build time
  return dbUrl
    ? new PrismaClient({ datasourceUrl: dbUrl })
    : new PrismaClient();
};

declare global { var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>; }
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
export default prisma;
