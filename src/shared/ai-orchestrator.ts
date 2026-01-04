import { Env } from "../env";
import { callWorkersAI } from "./workers-ai";
import { callAIViaGateway } from "./gateway-ai";

export async function generateJsonata(
  prompt: string,
  options: {
    env: Env;
    googleApiKey?: string;
  }
): Promise<{
  jsonata: string;
  provider: "workers-ai" | "ai-gateway";
  modelUsed: string;
  fallbackUsed: boolean;
  retries: number;
}> {
  const { env, googleApiKey } = options;

  try {
    const jsonata = await callWorkersAI(prompt, env);

    return {
      jsonata,
      provider: "workers-ai",
      modelUsed: "@cf/meta/llama-3.1-8b-instruct",
      fallbackUsed: false,
      retries: 0,
    };
  } catch (err) {
    console.log("Workers AI failed, falling back:", err);
  }

  const result = await callAIViaGateway(prompt, {
    env,
    googleApiKey,
  });

  return {
    jsonata: result.jsonata,
    provider: "ai-gateway",
    modelUsed: result.modelUsed,
    fallbackUsed: true,
    retries: result.retries,
  };
}
