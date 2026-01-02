import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "json-query-flow",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/api/run" && request.method === "POST") {
      const body = await request.json();

      return new Response(
        JSON.stringify({
          received: body,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    return getAssetFromKV(
      {
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
      }
    );
  },
};
