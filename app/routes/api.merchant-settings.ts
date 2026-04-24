import { prisma } from "../db.server";
import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

/* -----------------------------
   GET → loader
------------------------------ */
export async function loader({ request }: LoaderFunctionArgs) {
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

  const settings = await prisma.merchantSettings.findUnique({
    where: { shop },
  });

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
