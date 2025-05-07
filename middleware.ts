import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Helper functions
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
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Add debugging
  console.log(`Middleware processing path: ${path}`);
  
  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/login/doctor",
    "/login/rep",
    "/login/client",
    "/login/admin",
    "/api/auth",
  ];
  
  // Check if the path is public or starts with public paths
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  console.log(`Token for ${path}:`, token ? `Found for user: ${token.email}` : "Not found");
  
  // If the path requires authentication and the user is not authenticated
  if (!isPublicPath && !token) {
    console.log(`Redirecting from ${path} to /login (not authenticated)`);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Important fix: Don't check for role-based access if it's a public path
  if (token && !isPublicPath) {
    const role = token.role as string;
    
    // Doctor routes access
    if (path.startsWith("/doctor") && role !== "doctor") {
      console.log(`Redirecting non-doctor (${role}) from ${path} to appropriate dashboard`);
      return NextResponse.redirect(new URL(getRoleRedirectPath(role), request.url));
    }
    
    // Other role checks...
  }

  // Fix for login page redirect issue - specifically check for /login paths
  if (token && (path === "/login" || path.startsWith("/login/"))) {
    console.log(`Redirecting authenticated user from ${path} to dashboard`);
    const redirectPath = getRoleRedirectPath(token.role as string);
    console.log(`Redirect path: ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|public).*)",
  ],
};