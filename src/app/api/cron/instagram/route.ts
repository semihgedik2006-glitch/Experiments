import { NextRequest, NextResponse } from "next/server";
import { schluesselErneuern, zugangsstand } from "@/lib/instagram";

/**
 * Der Instagram-Schlüssel, täglich verlängert.
 *
 * Instagram gibt Schlüssel mit 60 Tagen Gültigkeit aus. Sie lassen sich
 * verlängern - aber nur, solange sie noch gültig sind. Ein abgelaufener
 * Schlüssel ist endgültig weg, und das Studio muss von Hand einen neuen
 * erzeugen.
 *
 * Deshalb täglich statt alle zwei Monate: Ein monatlicher Lauf, der
 * einmal ausfällt, verliert den Zugang. Ein täglicher Lauf darf
 * neunundfünfzig Mal ausfallen.
 *
 * Ist kein Zugang hinterlegt, tut der Lauf nichts und meldet das auch so -
 * ein Fehler wäre es nicht, Instagram ist freiwillig.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const stand = await zugangsstand();
  if (!stand.verbunden) {
    return NextResponse.json({ ok: true, hinweis: "Kein Instagram-Zugang hinterlegt." });
  }

  const ergebnis = await schluesselErneuern();
  return NextResponse.json({
    ok: ergebnis.ok,
    meldung: ergebnis.meldung,
    tageBisAblauf: (await zugangsstand()).tageBisAblauf,
  });
}
