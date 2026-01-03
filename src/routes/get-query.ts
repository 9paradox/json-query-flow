import type { RouteHandler } from "./index";
import { buildJsonataPrompt } from "../prompts/jsonata";
import { callAIViaGateway } from "../shared/llm";
import { checkOrigin } from "../shared/origin";
import { parseJsonBody } from "../shared/body";
import { getGoogleAIKey } from "../shared/headers";

interface GetQueryRequest {
  schema: unknown;
  query: string;
}

function isGetQueryRequest(body: unknown): body is GetQueryRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "schema" in body &&
    "query" in body &&
    typeof (body as any).query === "string"
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

  const { schema, query } = body;

  const prompt = buildJsonataPrompt(schema, query);

  const googleApiKey = getGoogleAIKey(request);
  const { jsonata, modelUsed, fallbackUsed, retries } = await callAIViaGateway(
    prompt,
    {
      env,
      googleApiKey,
    }
  );

  const message = fallbackUsed
    ? `Query generated using fallback model (${modelUsed}) after ${retries} retry attempt(s). Confidence is lower; please review carefully as AI-generated queries may contain errors.`
    : `Query generated using ${modelUsed}. Please review the output; AI-generated queries may contain errors.`;

  return new Response(
    JSON.stringify({
      jsonata,
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
