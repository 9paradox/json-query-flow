export type RouteHandler = (
  request: Request,
  env: any,
  ctx: ExecutionContext
) => Promise<Response>;
