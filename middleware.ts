import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Helper functions from auth.ts
const isDoctor = (role: string): boolean => role === "doctor";
const isRep = (role: string): boolean => role === "representative";
const isClient = (role: string): boolean => role === "client";
const isAdmin = (role: string): boolean => role === "admin";

const getRoleRedirectPath = (role: string): string => {
  if (isDoctor(role)) return "/doctor";
  if (isRep(role)) return "/rep";
  if (isClient(role)) return "/client";
  if (isAdmin(role)) return "/admin";
  return "/";
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/login/doctor",
    "/login/rep",
    "/login/client",
    "/login/admin",
    "/api/auth/signin",
    "/api/auth/signout",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/csrf"
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith("/api/auth/callback")
  );

  // Get the token
  const token = await getToken({ req: request });
  
  // If the path requires authentication and the user is not authenticated
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Role-based access control for protected routes
  if (token && !isPublicPath) {
    const role = token.role as string;
    
    // Doctor routes access
    if (path.startsWith("/doctor") && role !== "doctor") {
      return NextResponse.redirect(new URL(getRoleRedirectPath(role), request.url));
    }
    
    // Representative routes access
    if (path.startsWith("/rep") && role !== "representative") {
      return NextResponse.redirect(new URL(getRoleRedirectPath(role), request.url));
    }
    
    // Client routes access
    if (path.startsWith("/client") && role !== "client" && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleRedirectPath(role), request.url));
    }
    
    // Admin routes access
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleRedirectPath(role), request.url));
    }
    
    // API routes protection
    if (path.startsWith("/api/doctors") && role !== "doctor" && role !== "representative" && role !== "client" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    if (path.startsWith("/api/representatives") && role !== "representative" && role !== "client" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    if (path.startsWith("/api/clients") && role !== "client" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    if (path.startsWith("/api/surveys") && role !== "doctor" && role !== "client" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    if (path.startsWith("/api/redemptions") && role !== "doctor" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  // Redirect authenticated users away from login pages
  if (token && (path === "/login" || path.startsWith("/login/"))) {
    return NextResponse.redirect(new URL(getRoleRedirectPath(token.role as string), request.url));
  }
  
  // Redirecting root to appropriate dashboard for logged in users
  if (token && path === "/") {
    return NextResponse.redirect(new URL(getRoleRedirectPath(token.role as string), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/signin (NextAuth signin page)
     * 2. /api/auth/signout (NextAuth signout page)
     * 3. /api/auth/session (NextAuth session endpoint)
     * 4. /api/auth/providers (NextAuth providers endpoint)
     * 5. /api/auth/csrf (NextAuth CSRF endpoint)
     * 6. /api/auth/callback/* (NextAuth callback endpoints)
     * 7. /_next (Next.js internals)
     * 8. /favicon.ico (favicon file)
     * 9. /public (static files)
     */
    "/((?!api/auth/callback|_next|favicon.ico|public).*)",
  ],
};
