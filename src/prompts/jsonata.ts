export function buildJsonataPrompt(schema: unknown, naturalQuery: string) {
  return `
You generate STRICT, executable JSONata expressions.

Input:
- You are given ONLY a JSON structure (no values).
- The structure defines all valid fields and nesting.
- The root of the document is the input context ($).

JSON structure:
${JSON.stringify(schema, null, 2)}

User request:
"${naturalQuery}"

Rules:
- Output ONLY a single-line JSONata expression
- Do not include quotes, markdown, JSON, or explanations
- Use ONLY fields present in the JSON structure (case-sensitive)
- Do NOT invent, rename, or add fields
- Start with "$." only when required
- For arrays, use correct JSONata mapping/filtering syntax
- If a field is an array, return it unless explicitly asked to flatten
- If the request asks for specific field(s), return ONLY those field(s)
- If a single field is requested, return the field directly (not wrapped)

Output:
Return ONLY the JSONata expression.
`;
}
