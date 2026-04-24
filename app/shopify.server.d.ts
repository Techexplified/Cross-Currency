import type { shopifyApp } from "@shopify/shopify-app-react-router/server";

type ShopifyApp = ReturnType<typeof shopifyApp>;

export function getShopify(): ShopifyApp;

declare const shopify: ShopifyApp;
export default shopify;

export const apiVersion: ShopifyApp["config"]["apiVersion"];
export const addDocumentResponseHeaders: ShopifyApp["addDocumentResponseHeaders"];
export const authenticate: ShopifyApp["authenticate"];
export const unauthenticated: ShopifyApp["unauthenticated"];
export const login: ShopifyApp["login"];
export const registerWebhooks: ShopifyApp["registerWebhooks"];
export const sessionStorage: ShopifyApp["sessionStorage"];

