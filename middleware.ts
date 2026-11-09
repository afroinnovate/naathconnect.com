import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "./lib/config";
import { updateSession } from "./lib/supabase-middleware";

// Amplify Hosting compute supports middleware on Node. It does not support
// Edge middleware. Next.js 15.5 reads this export and keeps the file off the edge bundle.
export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  if (isDemoMode()) return NextResponse.next();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand|images|favicon.ico|robots.txt|icon.png).*)"],
};
