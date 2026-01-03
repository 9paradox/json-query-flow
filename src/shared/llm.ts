import { Env } from "../env";
import type { GeminiResponse } from "./gemini.types";
import { normalizeJsonataOutput } from "./normalize";
import { withRetry } from "./retry";
import { isQuotaOrRateLimitError } from "./gemini-error";

const FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

async function callSingleModel(
  prompt: string,
  options: {
    env: Env;
    googleApiKey?: string;
    model: string;
  }
): Promise<string> {
  const { env, googleApiKey, model } = options;

  const url =
    `https://gateway.ai.cloudflare.com/v1/` +
    `${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY}` +
    `/google-ai-studio/v1/models/${model}:generateContent`;

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
  };

  if (googleApiKey) {
    headers["x-goog-api-key"] = googleApiKey;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }

  const data = (await res.json()) as GeminiResponse;
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    throw new Error("Gemini returned empty response");
  }

  return normalizeJsonataOutput(raw);
}
export async function callAIViaGateway(
  prompt: string,
  options: {
    env: Env;
    googleApiKey?: string;
    model?: string;
  }
): Promise<{
  jsonata: string;
  modelUsed: string;
  fallbackUsed: boolean;
  retries: number;
}> {
  const { env, googleApiKey, model } = options;

  if (model) {
    const jsonata = await withRetry(() =>
      callSingleModel(prompt, { env, googleApiKey, model })
    );

    return {
      jsonata,
      modelUsed: model,
      fallbackUsed: false,
      retries: 0,
    };
  }

  const orderedModels: string[] = [];

  if (env.DEFAULT_MODEL) {
    orderedModels.push(env.DEFAULT_MODEL);
  }

  for (const m of FALLBACK_MODELS) {
    if (!orderedModels.includes(m)) {
      orderedModels.push(m);
    }
  }

  let lastError: unknown;
  let retries = 0;

  for (const candidate of orderedModels) {
    try {
      const jsonata = await withRetry(() =>
        callSingleModel(prompt, {
          env,
          googleApiKey,
          model: candidate,
        })
      );

      return {
        jsonata,
        modelUsed: candidate,
        fallbackUsed: candidate !== env.DEFAULT_MODEL,
        retries,
      };
    } catch (err: any) {
      lastError = err;
      retries++;

      const msg = String(err?.message ?? err);

      if (!isQuotaOrRateLimitError(msg)) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
