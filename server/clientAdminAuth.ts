import { timingSafeEqual } from "crypto";
import { parse as parseCookie } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import type { User } from "../drizzle/schema";

export const CLIENT_ADMIN_COOKIE = "bundy_client_admin";
export const CLIENT_ADMIN_SESSION_SECONDS = 60 * 60 * 8;

function config() {
  const email = process.env.CLIENT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.CLIENT_ADMIN_PASSWORD;
  const signingSecret = process.env.JWT_SECRET;
  return { email, password, signingSecret };
}

function secretKey() {
  const { signingSecret } = config();
  if (!signingSecret) throw new Error("The admin session secret is not configured.");
  return new TextEncoder().encode(signingSecret);
}

function matches(left: string, right: string) {
  const first = Buffer.from(left);
  const second = Buffer.from(right);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function hasClientAdminCredentials() {
  const { email, password, signingSecret } = config();
  return Boolean(email && password && signingSecret);
}

export function validateClientAdminCredentials(email: string, password: string) {
  const saved = config();
  if (!saved.email || !saved.password) return false;
  return matches(email.trim().toLowerCase(), saved.email) && matches(password, saved.password);
}

function clientAdminUser(email: string): User {
  const now = new Date();
  return {
    id: 0,
    openId: `client-admin:${email}`,
    name: "Store administrator",
    email,
    loginMethod: "client-password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function createClientAdminSession(email: string) {
  return new SignJWT({ email: email.trim().toLowerCase(), scope: "catalog-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CLIENT_ADMIN_SESSION_SECONDS}s`)
    .sign(secretKey());
}

export async function getClientAdminUser(req: Request): Promise<User | null> {
  if (!hasClientAdminCredentials()) return null;
  const token = parseCookie(req.headers.cookie ?? "")[CLIENT_ADMIN_COOKIE];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const scope = payload.scope;
    const { email: configuredEmail } = config();
    if (!configuredEmail || scope !== "catalog-admin" || !matches(email, configuredEmail)) return null;
    return clientAdminUser(configuredEmail);
  } catch {
    return null;
  }
}
