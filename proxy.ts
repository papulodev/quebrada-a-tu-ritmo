import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

// Resolved per request: the proxy module is imported during `next build` to
// collect its config, and that step must not require runtime secrets. The
// auth instance is memoized, so this only builds a thin closure.
export function proxy(request: NextRequest) {
  return getAuth().middleware({ loginUrl: "/auth/sign-in" })(request);
}

// Only the protected pages are matched: JS/CSS and the sign-in route stay reachable.
export const config = {
  matcher: ["/notes/:path*"],
};
