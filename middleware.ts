import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const { pathname } = request.nextUrl;

  // Try to read user cookie to extract role (fallback when token might be missing temporarily)
  let hasValidUser = false;
  let userRole: string | null = null;
  const userCookie = request.cookies.get("user")?.value;

  if (userCookie) {
    try {
      const decoded = decodeURIComponent(userCookie);
      const parsed = JSON.parse(decoded);
      // If user cookie has an id and role, consider it valid
      if (parsed && parsed.id && parsed.role) {
        hasValidUser = true;
        userRole = String(parsed.role).toLowerCase().trim();
        // Normalize: member -> customer
        if (userRole === "member") {
          userRole = "customer";
        }
      }
    } catch {
      // Invalid user cookie, ignore
    }
  }

  // ✅ SỬA: Protected routes - chỉ dashboard routes cần auth
  const protectedRoutes = [
    "/admin",
    "/staff",
    "/technician",
    "/member",
    "/bookings",
    "/inventorys",
    "/schedules",
    "/workflows",
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes
  // Allow if either token exists OR valid user cookie exists (covers the timing gap)
  if (isProtectedRoute && !token && !hasValidUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Role-based access control
  if (isProtectedRoute && userRole) {
    // Admin routes - only admin can access
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Staff routes - only staff can access
    if (pathname.startsWith("/staff") && userRole !== "staff") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Technician routes - only technician can access
    if (pathname.startsWith("/technician") && userRole !== "technician") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Member routes - only customer/member can access
    if (pathname.startsWith("/member") && userRole !== "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ✅ SỬA: Auth pages - redirect authenticated users to homepage
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  if (authPages.includes(pathname) && token) {
    // ✅ Tất cả roles sau khi login thành công đều về homepage
    // Từ đó họ sẽ navigate manually đến dashboard
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
