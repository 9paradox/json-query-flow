export type SchemaLite =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | SchemaLite[]
  | { [key: string]: SchemaLite };

export function jsonToSchemaLite(input: unknown): SchemaLite {
  if (input === null) return "null";

  if (Array.isArray(input)) {
    return input.length > 0 ? [jsonToSchemaLite(input[0])] : ["any"];
  }

  if (typeof input === "object") {
    const result: Record<string, SchemaLite> = {};
    for (const key in input as Record<string, unknown>) {
      result[key] = jsonToSchemaLite((input as Record<string, unknown>)[key]);
    }
    return result;
  }

  return typeof input as SchemaLite;
}
