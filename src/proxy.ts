import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is an auth URL
  const isAuthUrl = path.startsWith("/sign-in") || path.startsWith("/handler");

  if (isAuthUrl) {
    // Check if user is authenticated
    const user = await hexclaveServerApp.getUser();

    if (user) {
      // Redirect authenticated users to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in/:path*", "/handler/:path*"],
};
