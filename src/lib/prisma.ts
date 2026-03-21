import { PrismaClient } from '@prisma/client';

// In serverless environments (Vercel) with Supabase PgBouncer, we must set:
// - connection_limit=1: Prisma creates only 1 connection per instance (prevents pool exhaustion)
// - pool_timeout=10: Throw after 10s wait instead of hanging forever
const getDbUrl = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
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
  return new PrismaClient({
    datasources: { db: { url: getDbUrl() } },
  });
};

declare global { var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>; }
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
export default prisma;
