import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "kf_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET ist nicht gesetzt. Bitte in der .env-Datei konfigurieren.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createToken(adminId: string) {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expiresStr, signature] = parts;
  const payload = `${adminId}.${expiresStr}`;
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const expires = Number(expiresStr);
  if (Number.isNaN(expires) || Date.now() > expires) return null;

  return adminId;
}
