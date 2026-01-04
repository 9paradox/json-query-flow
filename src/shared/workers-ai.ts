import { Env } from "../env";
import { normalizeJsonataOutput } from "./normalize";

export async function callWorkersAI(prompt: string, env: Env): Promise<string> {
  const result = await env.WORKER_AI.run(
    "@cf/meta/llama-3.1-8b-instruct",
    {
      messages: [
        {
          role: "system",
          content:
            "Convert the user request into a valid JSONata expression. " +
            "Output only JSONata. No explanation. Use only fields from the given JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 256,
    },
    {
      gateway: {
        id: "json-query-flow",
      },
    }
  );

  const raw = result?.response ?? result?.choices?.[0]?.message?.content;

  if (!raw || typeof raw !== "string") {
    throw new Error("Workers AI returned empty response");
  }

  return normalizeJsonataOutput(raw);
}
