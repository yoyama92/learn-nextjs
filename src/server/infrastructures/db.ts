import { PrismaClient } from "../../generated/prisma";
import { envStore } from "../../lib/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (envStore.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
