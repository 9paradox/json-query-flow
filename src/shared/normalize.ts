export function normalizeJsonataOutput(raw: string): string {
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "");
    text = text.replace(/```$/, "");
  }

  const lines = text.split("\n").map((l) => l.trim());

  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]) {
      return lines[i];
    }
  }

  return text;
}
