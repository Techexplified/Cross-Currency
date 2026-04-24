export async function loader() {
  const envKeys = [
    "NODE_ENV",
    "SHOPIFY_API_KEY",
    "SHOPIFY_API_SECRET",
    "SCOPES",
    "SHOPIFY_APP_URL",
    "DATABASE_URL",
  ];

  const envPresence = Object.fromEntries(
    envKeys.map((k) => [k, Boolean(process.env[k])]),
  );

  let shopifyInit = { ok: false, error: "not attempted" };
  try {
    const { getShopify } = await import("../shopify.server.js");
    getShopify();
    shopifyInit = { ok: true };
  } catch (e) {
    shopifyInit = {
      ok: false,
      error: String(e?.message || e).slice(0, 300),
      name: e?.name || "",
    };
  }

  let prismaInit = { ok: false, error: "not attempted" };
  try {
    const { getPrisma } = await import("../db.server.js");
    getPrisma();
    prismaInit = { ok: true };
  } catch (e) {
    prismaInit = {
      ok: false,
      error: String(e?.message || e).slice(0, 300),
      name: e?.name || "",
    };
  }

  return new Response(
    JSON.stringify(
      {
        ok: true,
        node: { version: process.version, platform: process.platform },
        envPresence,
        prismaInit,
        shopifyInit,
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/json" } },
  );
}

