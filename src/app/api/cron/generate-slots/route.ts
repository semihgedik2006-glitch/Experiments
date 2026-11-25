import { NextRequest, NextResponse } from "next/server";
import { syncSlotsForAllTemplates } from "@/lib/slot-templates";
import { tageslistenVerschicken } from "@/lib/tagesliste";
import { sendTageslisteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { seitenAufwaermen } from "@/lib/aufwaermen";
import { siteConfig } from "@/lib/site-config";

export const maxDuration = 300;

// Called daily by Vercel Cron (see vercel.json) to keep the rolling
// window of auto-generated availability slots topped up for every
// active recurring template.
//
// Läuft morgens (05:30 UTC, also 06:30 bzw. 07:30 in Köln) und verschickt
// dabei auch die Tagesliste an die Studios (@/lib/tagesliste). Ein eigener
// Auslöser dafür wäre der vierte - der Tarif bei Vercel erlaubt nicht
// beliebig viele.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const result = await syncSlotsForAllTemplates();
  // Die Tagesliste darf das Nachfüllen der Termine nicht verhindern - und
  // umgekehrt. Fehler hier landen in der Antwort, nicht im Abbruch.
  const tagesliste = await tageslistenVerschicken(sendTageslisteEmail).catch((error) => ({
    fehler: error instanceof Error ? error.message : String(error),
  }));
  // Einmal am Tag alle Seiten erneuern, in einem Rutsch (siehe
  // app/layout.tsx und @/lib/aufwaermen). Nur im Betrieb: Eine Vorschau
  // soll nicht die echte Seite aufrufen.
  let seiten: unknown = "übersprungen";
  if (process.env.VERCEL_ENV === "production") {
    revalidatePath("/", "layout");
    seiten = await seitenAufwaermen(siteConfig.url).catch((error) => ({
      fehler: error instanceof Error ? error.message : String(error),
    }));
  }
  return NextResponse.json({ ok: true, ...result, tagesliste, seiten });
}
