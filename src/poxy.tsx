import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // 1. This function only runs if the user is successfully logged in
  function middleware(req) {
    const token = req.nextauth.token;

    const path = req.nextUrl.pathname;

    // Check if the user is trying to access an admin page
    if (path.startsWith("/admin")) {
      // If they are logged in but NOT staff, redirect them to the normal dashboard
      if (!token?.isStaff) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      // 2. This runs FIRST. It checks if there is a valid token at all.
      // If this returns false, NextAuth automatically kicks them to the signIn page.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/account/login",
    }, 
  },
);

export const config = {
  matcher: [
    // 3. We uncommented the admin matcher so middleware runs on these routes
    "/admin/:path*",
    "/dashboard/:path*",
    "/invest/:path*",
  ],
};
