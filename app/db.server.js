import { PrismaClient } from "@prisma/client";

function createPrisma() {
  return new PrismaClient();
}

export function getPrisma() {
  // Avoid instantiating Prisma when DATABASE_URL is missing (common in misconfigured deploys).
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL env var. Configure it in your deployment environment.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    if (!global.prismaGlobal) {
      global.prismaGlobal = createPrisma();
    }
    return global.prismaGlobal;
  }

  return createPrisma();
}

// Backwards-compatible exports for existing routes.
const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      return getPrisma()[prop];
    },
  },
);

export default prisma;
export { prisma };
