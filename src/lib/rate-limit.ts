import "server-only";
import { headers } from "next/headers";

/**
 * Einfache Zugriffsbegrenzung gegen Formular-Spam und Passwort-Raten.
 *
 * WICHTIGE EINSCHRÄNKUNG: Die Zähler liegen im Arbeitsspeicher. Auf Vercel
 * laufen mehrere Server-Instanzen parallel und werden regelmäßig neu
 * gestartet, das heißt die Grenze gilt pro Instanz und wird nach einer Weile
 * zurückgesetzt. Das stoppt zuverlässig einfache Bots und Massen-Einträge,
 * aber keinen entschlossenen, verteilten Angriff.
 *
 * Wenn das irgendwann nicht mehr reicht, ist der nächste Schritt ein
 * gemeinsamer Zähler-Speicher (z.B. Upstash Redis oder eine Tabelle in der
 * vorhandenen Datenbank).
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/** Verhindert, dass die Map bei viel Verkehr unbegrenzt wächst. */
function cleanup(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Ermittelt die aufrufende IP-Adresse aus den Proxy-Headern.
 * Auf Vercel steht die echte Client-IP in x-forwarded-for.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unbekannt";
}

/**
 * Prüft und erhöht den Zähler für einen Vorgang.
 * Gibt `true` zurück, wenn die Aktion erlaubt ist.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanup(now);

  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Setzt den Zähler zurück - z.B. nach erfolgreicher Anmeldung. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Formuliert eine verständliche Wartemeldung für Besucher. */
export function waitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return minutes <= 1
    ? "Zu viele Versuche. Bitte warte eine Minute und versuch es dann erneut."
    : `Zu viele Versuche. Bitte warte etwa ${minutes} Minuten und versuch es dann erneut.`;
}
