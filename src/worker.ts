import { match } from "./routes/router";
import { health } from "./routes/health";
import { jsonata } from "./routes/jsonata";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const routes = {
  "GET:/api/health": health,
  "POST:/api/run": jsonata,
};

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const handler = match(request, routes);

    if (handler) {
      return handler(request, env, ctx);
    }

    return getAssetFromKV(
      { request, waitUntil: ctx.waitUntil.bind(ctx) },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
      }
    );
  },
};
