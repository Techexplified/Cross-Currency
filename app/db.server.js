import { PrismaClient } from "@prisma/client";

function createPrisma() {
  return new PrismaClient();
}

export function getPrisma() {
  // Avoid instantiating Prisma when DATABASE_URL is missing (common in misconfigured deploys).
  if (!process.env.DATABASE_URL) {
    // #region agent log
    fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H1',location:'db.server.js:getPrisma:missing-db-url',message:'DATABASE_URL missing',data:{nodeEnv:process.env.NODE_ENV||'',hasDatabaseUrl:false},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error(
      "Missing DATABASE_URL env var. Configure it in your deployment environment.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    if (!global.prismaGlobal) {
      // #region agent log
      fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H2',location:'db.server.js:getPrisma:dev-create',message:'Creating PrismaClient (dev singleton)',data:{nodeVersion:process.version,hasDatabaseUrl:true},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      global.prismaGlobal = createPrisma();
    }
    return global.prismaGlobal;
  }

  // #region agent log
  fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H2',location:'db.server.js:getPrisma:prod-create',message:'Creating PrismaClient (prod)',data:{nodeVersion:process.version,hasDatabaseUrl:true},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
