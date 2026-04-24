import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";

export const streamTimeout = 5000;

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
) {
  const __agentReqT0 = Date.now();
  // #region agent log
  fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H4',location:'entry.server.jsx:handleRequest:begin',message:'SSR handleRequest begin',data:{url:String(request?.url||''),nodeVersion:process.version},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    const __u = new URL(request.url);
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
        hypothesisId: "H2",
        location: "entry.server.jsx:handleRequest:start",
        message: "SSR handleRequest started",
        data: { pathname: __u.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  } catch {
    /* ignore */
  }

  // Add document response headers (Shopify-specific).
  // This must be resilient in misconfigured deploys (e.g. missing env vars),
  // otherwise Vercel may report "Serverless Function has crashed".
  try {
    const { addDocumentResponseHeaders } = await import("./shopify.server.js");
    addDocumentResponseHeaders(request, responseHeaders);
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H1',location:'entry.server.jsx:shopifyHeaders:catch',message:'Failed to add Shopify document headers',data:{errName:err?.name||'',errMsg:String(err?.message||err).slice(0,200)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.warn(
      "WARN entry.server: skipping Shopify document headers:",
      String(err),
    );
  }

  // --- DIAGNOSTIC LOGGING (safe, no secret values printed) ---
  try {
    const url = new URL(request.url);
    const host = url.host;
    const headerKeys = Array.from(request.headers.keys()).sort();
    const hasCookie = !!request.headers.get("cookie");
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || request.headers.get("referrer") || "";

    console.log("DEBUG entry.server: request url:", request.url);
    console.log("DEBUG entry.server: host:", host);
    console.log("DEBUG entry.server: header keys:", headerKeys);
    console.log("DEBUG entry.server: hasCookie:", hasCookie);
    console.log("DEBUG entry.server: user-agent present:", !!userAgent);
    if (referer) console.log("DEBUG entry.server: referer:", referer);
  } catch (err) {
    console.warn("DEBUG entry.server: unable to log request metadata:", String(err));
  }
  // --- end diagnostics ---

  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        [callbackName]: () => {
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
              hypothesisId: "H2",
              location: "entry.server.jsx:onShellReady",
              message: "SSR shell ready",
              data: {
                callbackName,
                msSinceStart: Date.now() - __agentReqT0,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error) {
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
              hypothesisId: "H5",
              location: "entry.server.jsx:onShellError",
              message: "SSR shell error",
              data: {
                name: error?.name,
                msg: String(error?.message || error).slice(0, 200),
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          // #region agent log
          fetch('http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2b802f'},body:JSON.stringify({sessionId:'2b802f',runId:'pre-fix',hypothesisId:'H5',location:'entry.server.jsx:onError',message:'React SSR onError',data:{name:error?.name||'',msg:String(error?.message||error).slice(0,200)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          console.error(error);
        },
      },
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}
