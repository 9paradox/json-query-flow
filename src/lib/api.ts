export interface GenerateJsonataRequest {
  schema: unknown;
  query: string;
  googleApiKey?: string;
}

export interface GenerateJsonataResponse {
  jsonata: string;
}

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
};

function extractErrorMessage(body: unknown): string | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as any).error === "string"
  ) {
    return (body as any).error;
  }
  return null;
}
export async function generateJsonata(
  input: GenerateJsonataRequest
): Promise<ApiResponse<GenerateJsonataResponse>> {
  const { schema, query, googleApiKey } = input;

  if (!schema || !query) {
    return {
      ok: false,
      error: "Schema and query are required",
      status: 400,
    };
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (googleApiKey) {
    headers["x-goog-api-key"] = googleApiKey;
  }

  let res: Response;

  try {
    res = await fetch("/api/query", {
      method: "POST",
      headers,
      body: JSON.stringify({ schema, query }),
    });
  } catch (e) {
    return {
      ok: false,
      error: "Network error",
      status: 0,
    };
  }

  if (!res.ok) {
    let message = "Request failed";

    try {
      const body = await res.json();
      const extracted = extractErrorMessage(body);
      if (extracted) message = extracted;
    } catch {
      // ignore JSON parse errors
    }

    return {
      ok: false,
      error: message,
      status: res.status,
    };
  }

  const data = (await res.json()) as unknown;

  if (
    typeof data !== "object" ||
    data === null ||
    !("jsonata" in data) ||
    typeof (data as any).jsonata !== "string"
  ) {
    return {
      ok: false,
      error: "Invalid API response",
      status: 500,
    };
  }

  return {
    ok: true,
    data: { jsonata: (data as any).jsonata },
    status: 200,
  };
}
