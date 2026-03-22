import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const DIRECT_URL = process.env.DIRECT_URL;

// Fail fast at startup if DIRECT_URL is missing
if (!DIRECT_URL) {
  throw new Error("DIRECT_URL environment variable is required");
}

const adapter = new PrismaPg({
  connectionString: DIRECT_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
