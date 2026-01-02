export function getGoogleAIKey(request: Request): string | undefined {
  return (
    request.headers.get("x-goog-api-key") ??
    request.headers.get("X-Goog-Api-Key") ??
    request.headers.get("google-ai-key") ??
    undefined
  );
}
