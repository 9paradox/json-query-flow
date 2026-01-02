import { checkOrigin } from "../shared/origin";
import type { RouteHandler } from "./index";

export const health: RouteHandler = async (request, env) => {
  const originError = checkOrigin(request, env);
  if (originError) return originError;
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "json-query-flow",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
