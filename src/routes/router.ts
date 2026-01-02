import type { RouteHandler } from "./index";

export function match(request: Request, routes: Record<string, RouteHandler>) {
  const key = `${request.method}:${new URL(request.url).pathname}`;
  return routes[key];
}
