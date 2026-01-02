export function normalizeJsonataOutput(raw: string): string {
  let text = raw.trim();

  // Remove triple-backtick code fences
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "");
    text = text.replace(/```$/, "");
  }

  // Remove leading explanations (very common)
  const lines = text.split("\n").map((l) => l.trim());

  // Keep the last non-empty line (JSONata is usually last)
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]) {
      return lines[i];
    }
  }

  return text;
}
