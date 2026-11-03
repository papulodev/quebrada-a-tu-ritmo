import { getAuth } from "@/lib/auth/server";

// Handlers are resolved per request so that `next build` can collect this route
// without the Neon Auth environment variables.
const handlers = () => getAuth().handler();

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) {
  return handlers().GET(request, context);
}

export async function POST(request: Request, context: Context) {
  return handlers().POST(request, context);
}

export async function PUT(request: Request, context: Context) {
  return handlers().PUT(request, context);
}

export async function DELETE(request: Request, context: Context) {
  return handlers().DELETE(request, context);
}

export async function PATCH(request: Request, context: Context) {
  return handlers().PATCH(request, context);
}
