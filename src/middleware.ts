import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const VISITOR_COOKIE_NAME = "abr_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set visitor cookie if not present
  if (!request.cookies.get(VISITOR_COOKIE_NAME)) {
    response.cookies.set(VISITOR_COOKIE_NAME, uuidv4(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
