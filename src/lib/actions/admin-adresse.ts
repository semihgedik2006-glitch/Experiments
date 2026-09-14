"use server";

import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { siteConfig } from "@/lib/site-config";
import { VORGESEHENE_ADRESSE } from "@/lib/basisadresse";

/**
 * Die eigene Adresse einmal wirklich aufrufen.
 *
 * Der Anlass ist konkret: ems-training.koeln leitet derzeit auf die
 * Körperformen-Zentrale weiter. Trägt jemand diese Adresse als
 * Basisadresse ein, sieht im Adminbereich alles richtig aus - jede
 * kanonische Angabe der Website zeigt dann aber auf eine Seite, die
 * woanders hin weiterleitet. Google folgt der Weiterleitung und schreibt
 * unsere Inhalte der Zentrale zu.
 *
 * Genau das ist von innen nicht zu sehen. Deshalb dieser Knopf: Er ruft
 * die Adresse von außen auf und sagt, was tatsächlich zurückkommt.
 */

export type AdressPruefung = {
  ok: boolean;
  titel: string;
  text: string;
  /** Die Kette der Weiterleitungen, falls es welche gab. */
  wegpunkte?: string[];
};

const MAX_SPRUENGE = 5;
const ZEITLIMIT_MS = 8000;

export async function adresseTesten(ziel: "basis" | "vorgesehen"): Promise<AdressPruefung> {
  await verlangeLeitungAktion();

  const start = ziel === "basis" ? siteConfig.url : VORGESEHENE_ADRESSE;
  const wegpunkte: string[] = [start];
  let aktuell = start;

  const abbruch = AbortSignal.timeout(ZEITLIMIT_MS);

  try {
    for (let sprung = 0; sprung <= MAX_SPRUENGE; sprung++) {
      const antwort = await fetch(aktuell, {
        // manual: Wir wollen die Weiterleitung sehen, nicht ihr folgen -
        // sie ist ja der eigentliche Befund.
        redirect: "manual",
        cache: "no-store",
        signal: abbruch,
        headers: { "user-agent": "Koerperformen-Adresspruefung" },
      });

      const weiter = antwort.headers.get("location");
      if (antwort.status >= 300 && antwort.status < 400 && weiter) {
        const naechste = new URL(weiter, aktuell).toString();
        wegpunkte.push(naechste);
        aktuell = naechste;
        continue;
      }

      if (antwort.status >= 400) {
        return {
          ok: false,
          titel: `Die Adresse antwortet mit ${antwort.status}`,
          text:
            wegpunkte.length > 1
              ? "Nach der Weiterleitung steht dort keine Seite."
              : "Unter dieser Adresse ist nichts erreichbar. Zeigt die Domain schon auf das Projekt?",
          wegpunkte: wegpunkte.length > 1 ? wegpunkte : undefined,
        };
      }

      // Angekommen. Bleibt die Frage, ob wir da angekommen sind, wo wir
      // losgelaufen sind.
      if (wegpunkte.length === 1) {
        return {
          ok: true,
          titel: "Die Adresse antwortet direkt",
          text: `${start} liefert die Seite aus, ohne Umweg. Das ist der Zustand, den die kanonischen Angaben brauchen.`,
        };
      }

      const angekommen = new URL(aktuell);
      const losgelaufen = new URL(start);
      // www.beispiel.de statt beispiel.de ist ein Umweg, aber ein
      // harmloser - dieselbe Seite, dieselbe Marke. Eine Weiterleitung auf
      // eine fremde Domain ist etwas völlig anderes.
      const gleicheMarke =
        angekommen.hostname.replace(/^www\./, "") ===
        losgelaufen.hostname.replace(/^www\./, "");

      return {
        ok: false,
        titel: gleicheMarke
          ? "Die Adresse leitet weiter - innerhalb derselben Domain"
          : "Die Adresse leitet auf eine fremde Seite weiter",
        text: gleicheMarke
          ? `Der Umweg führt nach ${angekommen.origin}. Trag genau diese Fassung als Basisadresse ein, dann entfällt er.`
          : `Wer ${start} aufruft, landet auf ${angekommen.origin}. Solange das so ist, darf diese Adresse nicht als Basisadresse eingetragen sein - sonst schreibt jede Seite ihre Inhalte dieser fremden Adresse zu.`,
        wegpunkte,
      };
    }

    return {
      ok: false,
      titel: "Zu viele Weiterleitungen",
      text: `Nach ${MAX_SPRUENGE} Sprüngen war immer noch kein Ende erreicht.`,
      wegpunkte,
    };
  } catch (fehler) {
    const grund = fehler instanceof Error ? fehler.message : String(fehler);
    return {
      ok: false,
      titel: "Die Adresse war nicht erreichbar",
      text:
        `${start} hat nicht geantwortet (${grund}). Das kann an der Domain liegen, ` +
        "die noch nicht auf das Projekt zeigt - oder daran, dass die Prüfung von hier " +
        "aus nicht nach draußen darf.",
    };
  }
}
