import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import './global.css'

export default function App() {
  useEffect(() => {
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
        hypothesisId: "H4",
        location: "root.jsx:useEffect",
        message: "client root mounted",
        data: { pathname: window.location?.pathname || "" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
