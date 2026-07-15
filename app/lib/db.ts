import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 — driver adapter obrigatório.
// Singleton: em produção uma instância, em dev o global persiste entre rebuilds.
// O Pool do pg também é guardado no global para evitar leak de conexões no
// hot reload — sem isso cada rebuild cria um Pool novo sem fechar o anterior.

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
  __pgPool?: Pool;
};

function getPool(): Pool {
  if (!globalForPrisma.__pgPool) {
    globalForPrisma.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // LP de baixo tráfego — pool pequeno para não esgotar conexões
    });
  }
  return globalForPrisma.__pgPool;
}

function createPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
