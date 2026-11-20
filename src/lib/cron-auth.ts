import { NextResponse } from "next/server";

// Gemeinsame Prüfung für alle Cron-Routen. Ohne gesetztes CRON_SECRET wird
// abgelehnt (401), nicht durchgelassen: sonst könnte jeder die Adresse
// aufrufen und Mails oder Tageslisten auslösen.
export function cronPruefen(request: Request, env: NodeJS.ProcessEnv = process.env): NextResponse | null {
  const secret = env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  return null;
}
