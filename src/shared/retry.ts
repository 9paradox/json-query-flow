export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number;
    delayMs?: number;
  }
): Promise<T> {
  const retries = options?.retries ?? 2;
  const delayMs = options?.delayMs ?? 300;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === retries) break;

      await new Promise((res) => setTimeout(res, delayMs * (attempt + 1)));
    }
  }

  throw lastError;
}
