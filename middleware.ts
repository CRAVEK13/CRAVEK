import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response we can modify (needed for cookie refresh)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: must call getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Protect /admin routes ──────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check if user has an admin profile
    // Note: We can't use Prisma in middleware (Edge runtime), so we use
    // a custom header check instead — the admin login sets a cookie
    const isAdminCookie = request.cookies.get("cravek_admin")?.value;
    if (!isAdminCookie || isAdminCookie !== user.id) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── Protect /account routes ─────────────────────────────────────
  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=" + pathname, request.url));
    }
  }

  // ── Redirect logged-in users away from auth pages ──────────────
  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/checkout/:path*",
  ],
};
