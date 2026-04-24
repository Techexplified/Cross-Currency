import { prisma } from "../db.server";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

/* -----------------------------
   GET → loader
------------------------------ */
export async function loader({ request }: LoaderFunctionArgs) {
  const __t0 = Date.now();
  // #region agent log
  fetch("http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7ed33c",
    },
    body: JSON.stringify({
      sessionId: "7ed33c",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "api.merchant-settings.ts:loader:start",
      message: "merchant-settings loader start",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  let session;

  try {
    ({ session } = await authenticate.admin(request));
  } catch (err) {
    // 🔥 REQUIRED for Shopify OAuth redirect
    if (err instanceof Response) {
      return err;
    }
    throw err;
  }

  const shop = session.shop;

  // #region agent log
  fetch("http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7ed33c",
    },
    body: JSON.stringify({
      sessionId: "7ed33c",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "api.merchant-settings.ts:after-auth",
      message: "merchant-settings after authenticate",
      data: { ms: Date.now() - __t0, shopLen: shop?.length ?? 0 },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const settings = await prisma.merchantSettings.findUnique({
    where: { shop },
  });

  // #region agent log
  fetch("http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7ed33c",
    },
    body: JSON.stringify({
      sessionId: "7ed33c",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "api.merchant-settings.ts:after-prisma",
      message: "merchant-settings after prisma",
      data: { ms: Date.now() - __t0, hasRow: settings != null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return new Response(
    JSON.stringify({ data: settings }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/* -----------------------------
   POST → action
------------------------------ */
export async function action({ request }: ActionFunctionArgs) {
  let session;

  try {
    ({ session } = await authenticate.admin(request));
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const shop = session.shop;
  const body = await request.json();

  const {
    currencies,
    defaultCurrency,
    baseCurrency,
    placement,
    fixedCorner,
    distanceTop,
    distanceRight,
    distanceBottom,
    distanceLeft,
    inlineSide, // ✅ Already destructured
  } = body;

  // ✅ Build data conditionally
  const data: any = {
    selectedCurrencies: currencies,
    defaultCurrency,
    baseCurrency,
    placement,
  };

  if (placement === "fixed") {
    data.fixedCorner = fixedCorner;
    data.distanceTop = distanceTop;
    data.distanceRight = distanceRight;
    data.distanceBottom = distanceBottom;
    data.distanceLeft = distanceLeft;
  }

  if (placement === "inline") {
    // data.inlineSide = inlineSide; // ✅ Already storing inlineSide
  }

  await prisma.merchantSettings.upsert({
    where: { shop },
    update: data,
    create: {
      shop,
      ...data,
    },
  });

  return new Response(null, { status: 204 });
}
