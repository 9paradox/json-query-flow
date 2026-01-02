export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function handleError(err: unknown): Response {
  // Known HTTP errors
  if (err instanceof HttpError) {
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Unknown / unexpected errors
  console.error("Unhandled worker error:", err);

  return new Response(
    JSON.stringify({
      error: "Internal Server Error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
