import { Env } from "../env";
import type { GeminiResponse } from "./gemini.types";
import { normalizeJsonataOutput } from "./normalize";
import { withRetry } from "./retry";

export async function callAIViaGateway(
  prompt: string,
  options: {
    env: Env;
    googleApiKey?: string;
    model?: string;
  }
): Promise<string> {
  const { env, googleApiKey, model } = options;

  return withRetry(async () => {
    const url =
      `https://gateway.ai.cloudflare.com/v1/` +
      `${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY}` +
      `/google-ai-studio/v1/models/${
        model ?? env.DEFAULT_MODEL ?? "gemini-2.5-flash-lite"
      }:generateContent`;

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
      const err = await res.text();
      throw new Error(`AI Gateway error: ${err}`);
    }

    const data = (await res.json()) as GeminiResponse;

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Gemini returned empty response");
    }

    return normalizeJsonataOutput(raw);
  });
}
