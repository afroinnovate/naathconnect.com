import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirectUrl, isDemoMode, robotsTag } from "./lib/config";
import { updateSession } from "./lib/supabase-middleware";

// Amplify Hosting compute supports middleware on Node. It does not support
// Edge middleware. Next.js 15.5 reads this export and keeps the file off the edge bundle.
export const runtime = "nodejs";

function withRobots(response: NextResponse): NextResponse {
  const tag = robotsTag();
  if (tag) response.headers.set("X-Robots-Tag", tag);
  return response;
}

export async function middleware(request: NextRequest) {
  const redirectTo = canonicalRedirectUrl(request.headers.get("host"), request.nextUrl.pathname, request.nextUrl.search);
  if (redirectTo) return withRobots(NextResponse.redirect(redirectTo, 308));
  if (isDemoMode()) return withRobots(NextResponse.next());
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return withRobots(NextResponse.next());
  }
  return withRobots(await updateSession(request));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand|images|favicon.ico|icon.png).*)"],
};
