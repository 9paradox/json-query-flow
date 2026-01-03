export function isQuotaOrRateLimitError(message: string): boolean {
  return (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Quota exceeded") ||
    message.includes("429")
  );
}
