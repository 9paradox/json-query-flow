function parseAllowedOrigins(value?: string): Set<string> {
  if (!value) return new Set();

  return new Set(
    value
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  );
}

export function checkOrigin(
  request: Request,
  env: { ALLOWED_ORIGINS?: string }
): Response | null {
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);

  if (allowedOrigins.size === 0) {
    return null;
  }

  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");

  if (!origin && !referer) {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  const value = origin ?? referer;

  try {
    const url = new URL(value);
    const normalized = `${url.protocol}//${url.host}`;

    if (!allowedOrigins.has(normalized)) {
      return new Response("Forbidden", {
        status: 403,
      });
    }
  } catch {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  return null;
}
