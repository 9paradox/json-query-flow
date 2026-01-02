export async function parseJsonBody(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("Content-Type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    return null;
  }
}
