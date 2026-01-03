export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
};

export interface GenerateJsonataRequest {
  schema: unknown;
  query: string;
  googleApiKey?: string;
}

export interface GenerateJsonataResponse {
  jsonata: string;
  modelUsed: string;
  fallbackUsed: boolean;
  retries: number;
  message: string;
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
  } catch {
    return {
      ok: false,
      error: "Network error",
      status: 0,
    };
  }

  let body: unknown;

  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      error: "Invalid server response",
      status: res.status,
    };
  }

  if (!res.ok) {
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as any).error === "string"
    ) {
      return {
        ok: false,
        error: (body as any).error,
        status: res.status,
      };
    }

    return {
      ok: false,
      error: "Request failed",
      status: res.status,
    };
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as any).jsonata !== "string" ||
    typeof (body as any).modelUsed !== "string" ||
    typeof (body as any).fallbackUsed !== "boolean" ||
    typeof (body as any).retries !== "number" ||
    typeof (body as any).message !== "string"
  ) {
    return {
      ok: false,
      error: "Malformed API response",
      status: 500,
    };
  }

  return {
    ok: true,
    data: body as GenerateJsonataResponse,
    status: res.status,
  };
}
