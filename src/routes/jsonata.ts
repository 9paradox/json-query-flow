import { checkOrigin } from "../shared/origin";
import type { RouteHandler } from "./index";

export const jsonata: RouteHandler = async (request, env) => {
  const originError = checkOrigin(request, env);
  if (originError) return originError;

  const body = await request.json();

  return new Response(
    JSON.stringify({
      received: body,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
