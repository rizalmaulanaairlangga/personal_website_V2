import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/");
  const isAuthRoute = path.startsWith("/api/auth/");
  const isAuthPage = path === "/login";

  // API routes answer with a status code rather than a redirect, so a
  // fetch() call receives 401 instead of a login page.
  if (isApi) {
    if (isAuthRoute) {
      return response;
    }
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return response;
  }

  if (!session && !isAuthPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals and static files. API routes are
     * included on purpose: they must never answer an unauthenticated caller.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};
