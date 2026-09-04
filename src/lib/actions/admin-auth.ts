"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import { checkRateLimit, resetRateLimit, getClientIp, waitMessage } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/newsletter";

// Anmeldung: bewusst streng. Fünf Fehlversuche pro Viertelstunde und
// IP-Adresse reichen für jeden, der sein Passwort kennt.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAdmin(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Bitte E-Mail und Passwort eingeben." };
  }

  const ip = await getClientIp();
  const limitKey = `login:${ip}`;
  const limit = checkRateLimit(limitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return { ok: false, message: waitMessage(limit.retryAfterSeconds) };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { ok: false, message: "E-Mail oder Passwort ist falsch." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return { ok: false, message: "E-Mail oder Passwort ist falsch." };
  }

  // Erfolgreiche Anmeldung setzt den Zähler zurück, damit legitime Nutzer
  // nach ein paar Tippfehlern nicht ausgesperrt bleiben.
  resetRateLimit(limitKey);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/admin/login");
}
