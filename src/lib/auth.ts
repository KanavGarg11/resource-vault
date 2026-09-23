import { cookies } from "next/headers";
import crypto from "crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "vault_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "default-vault-admin-secret-2026";
const ADMIN_PIN = process.env.ADMIN_PIN || "1106";

function createSignature(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function generateAdminSessionToken(): string {
  const payload = JSON.stringify({ role: "admin", timestamp: Date.now() });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = createSignature(base64Payload);
  return `${base64Payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [base64Payload, signature] = parts;
  const expectedSignature = createSignature(base64Payload);
  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString());
    // Session is valid for 30 days
    const isExpired = Date.now() - payload.timestamp > 30 * 24 * 60 * 60 * 1000;
    return !isExpired && payload.role === "admin";
  } catch {
    return false;
  }
}

export function verifyAdminPin(pin: string): boolean {
  const currentPin = process.env.ADMIN_PIN || "1106";
  return pin.trim() === currentPin.trim();
}

export async function checkServerAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export function checkRequestAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export { COOKIE_NAME };
