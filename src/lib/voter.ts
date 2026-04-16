import { createHash } from "crypto";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";
import { VISITOR_COOKIE_NAME, VISITOR_COOKIE_MAX_AGE } from "./constants";

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + env.IP_HASH_SALT)
    .digest("hex");
}

export async function getVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE_NAME);
  if (existing?.value) {
    return existing.value;
  }
  // Will be set by middleware on first visit
  return "";
}

export async function getOrCreateVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE_NAME);
  if (existing?.value) {
    return existing.value;
  }
  const newId = uuidv4();
  cookieStore.set(VISITOR_COOKIE_NAME, newId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: VISITOR_COOKIE_MAX_AGE,
    path: "/",
  });
  return newId;
}

export function getClientIp(headers: Headers): string {
  // Cloudflare tunnel provides the real IP
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
