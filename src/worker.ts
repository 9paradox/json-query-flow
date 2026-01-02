import { match } from "./routes/router";
import { health } from "./routes/health";
import { getQuery } from "./routes/get-query";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import { handleError } from "./shared/error";

const routes = {
  "GET:/api/health": health,
  "POST:/api/query": getQuery,
};

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    try {
      const handler = match(request, routes);

      if (handler) {
        return await handler(request, env, ctx);
      }

      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (err) {
      return handleError(err);
    }
  },
};
