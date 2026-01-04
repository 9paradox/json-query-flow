import type { RouteHandler } from "./index";
import { buildJsonataPrompt } from "../prompts/jsonata";
import { checkOrigin } from "../shared/origin";
import { parseJsonBody } from "../shared/body";
import { getGoogleAIKey } from "../shared/headers";
import { generateJsonata } from "../shared/ai-orchestrator";
import { callAIViaGateway } from "../shared/gateway-ai";

interface GetQueryRequest {
  schema: unknown;
  query: string;
  useWorkerAI?: boolean;
}

function isGetQueryRequest(body: unknown): body is GetQueryRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "schema" in body &&
    "query" in body &&
    typeof (body as any).query === "string" &&
    (typeof (body as any).useWorkerAI === "boolean" ||
      (body as any).useWorkerAI === undefined)
  );
}

export const getQuery: RouteHandler = async (request, env) => {
  const originError = checkOrigin(request, env);
  if (originError) return originError;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await parseJsonBody(request);
  if (!body || !isGetQueryRequest(body)) {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { schema, query, useWorkerAI } = body;

  const prompt = buildJsonataPrompt(schema, query);
  const googleApiKey = getGoogleAIKey(request);

  const result = useWorkerAI
    ? await generateJsonata(prompt, {
        env,
        googleApiKey,
      })
    : await callAIViaGateway(prompt, {
        env,
        googleApiKey,
      });

  const {
    jsonata,
    provider = "ai-gateway",
    modelUsed,
    fallbackUsed = false,
    retries = 0,
  } = result as any;

  const message =
    provider === "workers-ai"
      ? `Query generated using Cloudflare Workers AI (${modelUsed}). Please review the output; AI-generated queries may contain errors.`
      : `Query generated using ${modelUsed}. Please review the output; AI-generated queries may contain errors.`;

  return new Response(
    JSON.stringify({
      jsonata,
      provider,
      modelUsed,
      fallbackUsed,
      retries,
      message,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
