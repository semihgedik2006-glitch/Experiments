import { NextRequest, NextResponse } from "next/server";
import { cronPruefen } from "@/lib/cron-auth";
import { syncSlotsForAllTemplates } from "@/lib/slot-templates";
import { tageslistenVerschicken } from "@/lib/tagesliste";
import { sendTageslisteEmail } from "@/lib/email";

// Called daily by Vercel Cron (see vercel.json) to keep the rolling
// window of auto-generated availability slots topped up for every
// active recurring template.
//
// Läuft morgens (05:30 UTC, also 06:30 bzw. 07:30 in Köln) und verschickt
// dabei auch die Tagesliste an die Studios (@/lib/tagesliste). Ein eigener
// Auslöser dafür wäre der vierte - der Tarif bei Vercel erlaubt nicht
// beliebig viele.
export async function GET(request: NextRequest) {
  const abgelehnt = cronPruefen(request);
  if (abgelehnt) return abgelehnt;

  const result = await syncSlotsForAllTemplates();
  // Die Tagesliste darf das Nachfüllen der Termine nicht verhindern - und
  // umgekehrt. Fehler hier landen in der Antwort, nicht im Abbruch.
  const tagesliste = await tageslistenVerschicken(sendTageslisteEmail).catch((error) => ({
    fehler: error instanceof Error ? error.message : String(error),
  }));
  return NextResponse.json({ ok: true, ...result, tagesliste });
}
