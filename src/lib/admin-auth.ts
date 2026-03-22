import { createHmac, timingSafeEqual } from "crypto";

const adminPassword = process.env.ADMIN_PASSWORD;
const adminCookieSecret = process.env.ADMIN_COOKIE_SECRET;

if (!adminPassword) {
  throw new Error("ADMIN_PASSWORD no está definida");
}

if (!adminCookieSecret) {
  throw new Error("ADMIN_COOKIE_SECRET no está definida");
}

const ADMIN_PASSWORD = adminPassword;
const ADMIN_COOKIE_SECRET = adminCookieSecret;
const ADMIN_PAYLOAD = "admin-authenticated";

function signValue(value: string) {
  return createHmac("sha256", ADMIN_COOKIE_SECRET).update(value).digest("hex");
}

export function createAdminSessionToken() {
  const signature = signValue(ADMIN_PAYLOAD);
  return `${ADMIN_PAYLOAD}.${signature}`;
}

export function isValidAdminSessionToken(token?: string) {
  if (!token) return false;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) return false;
  if (payload !== ADMIN_PAYLOAD) return false;

  const expectedSignature = signValue(payload);

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function isValidAdminPassword(password: string) {
  const provided = Buffer.from(password, "utf8");
  const expected = Buffer.from(ADMIN_PASSWORD, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}