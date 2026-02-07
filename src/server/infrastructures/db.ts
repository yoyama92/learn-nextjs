import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { envStore } from "../../lib/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const schema = new URL(envStore.DATABASE_URL).searchParams.get("schema");
const adapter = new PrismaPg(
  {
    connectionString: envStore.DATABASE_URL,
  },
  {
    schema: schema ?? undefined,
  },
);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (envStore.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
