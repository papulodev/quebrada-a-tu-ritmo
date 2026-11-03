import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

// Only the protected pages are matched: JS/CSS and the sign-in route stay reachable.
export const config = {
  matcher: ["/notes/:path*"],
};
