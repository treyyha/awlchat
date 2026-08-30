/**
 * NextAuth.js v5 — Auth Route Handler
 *
 * Uses the shared auth config from lib/auth.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { getRequestIp } from "@/lib/tracking/server";
import { allowMagicLinkRequest } from "@/lib/utils/rate-limiter";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const isMagicLinkRequest = request.nextUrl.pathname
    .replace(/\/$/, "")
    .endsWith("/signin/resend");

  if (isMagicLinkRequest) {
    const sourceIdentifier = getRequestIp(request) ?? "unknown";
    let allowed = false;
    try {
      allowed = await allowMagicLinkRequest(sourceIdentifier);
    } catch (error) {
      // Do not expose Redis details to callers. If the limiter is unavailable,
      // allow the authentication provider to handle the request.
      console.error("[Auth] Magic-link rate limiter failed:", error);
      allowed = true;
    }

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many sign-in requests. Try again later." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
  }

  return handlers.POST(request);
}
