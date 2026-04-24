import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { getPrisma } from "./db.server";

class MissingShopifyEnvError extends Error {
  constructor(missing) {
    super(
      `Missing required env vars for Shopify app: ${missing.join(", ")}. ` +
        "Configure these in your deployment environment.",
    );
    this.name = "MissingShopifyEnvError";
    this.missing = missing;
  }
}

function requiredEnv() {
  return ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SCOPES", "SHOPIFY_APP_URL"];
}

function assertShopifyEnv() {
  const missing = requiredEnv().filter((k) => !process.env[k]);
  if (missing.length) throw new MissingShopifyEnvError(missing);
}

let _shopify;
export function getShopify() {
  if (_shopify) return _shopify;

  assertShopifyEnv();

  const prisma = getPrisma();
  _shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.October25,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: new PrismaSessionStorage(prisma),
    distribution: AppDistribution.AppStore,

    webhooks: {
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/app.uninstalled",
      },
      APP_SCOPES_UPDATE: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/app.scopes_update",
      },
      CUSTOMERS_DATA_REQUEST: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/customers.data_request",
      },
      CUSTOMERS_REDACT: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/customers.redact",
      },
      SHOP_REDACT: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/webhooks/shop.redact",
      },
    },

    ...(process.env.SHOP_CUSTOM_DOMAIN
      ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
      : {}),
  });

  return _shopify;
}

// Backwards-compatible default export: keep `import shopify from "../shopify.server"`
const shopify = new Proxy(
  {},
  {
    get(_target, prop) {
      return getShopify()[prop];
    },
  },
);

export default shopify;
export const apiVersion = ApiVersion.October25;

export const addDocumentResponseHeaders = (...args) =>
  getShopify().addDocumentResponseHeaders(...args);
export const authenticate = new Proxy(
  {},
  {
    get(_target, prop) {
      return getShopify().authenticate[prop];
    },
  },
);
export const unauthenticated = new Proxy(
  {},
  {
    get(_target, prop) {
      return getShopify().unauthenticated[prop];
    },
  },
);
export const login = (...args) => getShopify().login(...args);
export const registerWebhooks = (...args) =>
  getShopify().registerWebhooks(...args);
export const sessionStorage = new Proxy(
  {},
  {
    get(_target, prop) {
      return getShopify().sessionStorage[prop];
    },
  },
);
