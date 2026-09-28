"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, CalendarClock, ArrowRight } from "lucide-react";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import { antwortMerken, darfErscheinen, MINDEST_ANTEIL, MINDEST_SEKUNDEN } from "@/lib/einladung";

/**
 * Die Einladung zum Probetraining.
 *
 * WANN sie erscheint, steht in @/lib/einladung - dort und nicht hier,
 * weil das die Entscheidung ist, an der sich zeigt, ob so etwas nervt.
 * Hier steht nur, WORAUF sie reagiert und WIE sie aussieht.
 *
 * Zwei Auslöser, einer je Gerät:
 *
 * Am Rechner die Maus, die oben aus dem Fenster fährt. Das ist der Weg zu
 * Tab schließen, Adresszeile und Lesezeichen - wer dort hinfährt, ist im
 * Begriff zu gehen.
 *
 * Auf dem Handy gibt es keine Maus. Dort zählt eine schnelle Bewegung
 * nach oben: Wer zügig hochwischt, sucht meistens den Zurück-Knopf oder
 * die Adresszeile. Langsames Zurückscrollen löst nichts aus - das ist
 * jemand, der etwas noch einmal liest.
 *
 * NATIVES <dialog> und kein nachgebauter Kasten: Der Browser bringt die
 * Tastaturfalle mit (der Fokus kann nicht dahinter wandern), Escape zum
 * Schließen, den abdunkelnden Hintergrund und die richtige Ansage an
 * Vorleseprogramme. Alles Dinge, die man von Hand selten vollständig
 * hinbekommt.
 */

/** Ab welcher Geschwindigkeit ein Hochwischen als "ich will weg" gilt (px je Ereignis). */
const WISCH_SCHWELLE = 55;

export function ProbeterminEinladung({
  naechsterTermin,
  freieDieseWoche,
}: {
  /** "Mo., 14.09. um 09:00 Uhr · Körperformen Hürth" - oder null. */
  naechsterTermin: string | null;
  freieDieseWoche: number | null;
}) {
  const pfad = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState(false);
  // Erst wenn beide Bedingungen erfüllt sind, lauschen wir überhaupt.
  const bereit = useRef(false);
  const erledigt = useRef(false);

  const schliessen = useCallback((merken: boolean) => {
    erledigt.current = true;
    if (merken) antwortMerken();
    dialog.current?.close();
    setOffen(false);
  }, []);

  const zeigen = useCallback(() => {
    if (erledigt.current || !bereit.current) return;
    erledigt.current = true;
    setOffen(true);
    dialog.current?.showModal();
  }, []);

  /* ---- Reifezeit: ein paar Sekunden UND ein Stück gelesene Seite ---- */
  useEffect(() => {
    erledigt.current = false;
    bereit.current = false;
    if (!darfErscheinen(pfad)) return;

    let gescrollt = false;
    let zeitVorbei = false;
    const pruefen = () => {
      if (gescrollt && zeitVorbei) bereit.current = true;
    };

    const uhr = window.setTimeout(() => {
      zeitVorbei = true;
      pruefen();
    }, MINDEST_SEKUNDEN * 1000);

    const beimScrollen = () => {
      const hoehe = document.documentElement.scrollHeight - window.innerHeight;
      // Sehr kurze Seiten haben nichts zu scrollen - dort zählt die Zeit
      // allein, sonst erschiene die Einladung dort nie.
      if (hoehe < 200 || window.scrollY / hoehe >= MINDEST_ANTEIL) {
        gescrollt = true;
        pruefen();
      }
    };
    beimScrollen();
    window.addEventListener("scroll", beimScrollen, { passive: true });

    return () => {
      window.clearTimeout(uhr);
      window.removeEventListener("scroll", beimScrollen);
    };
  }, [pfad]);

  /* ---- Auslöser am Rechner: Maus verlässt das Fenster nach oben ---- */
  useEffect(() => {
    const beimVerlassen = (e: MouseEvent) => {
      // relatedTarget null heißt: raus aus dem Fenster, nicht bloß in ein
      // anderes Element. clientY <= 0: nach oben, nicht zur Seite.
      if (e.relatedTarget === null && e.clientY <= 0) zeigen();
    };
    document.addEventListener("mouseout", beimVerlassen);
    return () => document.removeEventListener("mouseout", beimVerlassen);
  }, [zeigen]);

  /* ---- Auslöser auf dem Handy: schnelles Hochwischen ---- */
  useEffect(() => {
    let letzte = window.scrollY;
    const beimScrollen = () => {
      const jetzt = window.scrollY;
      const weg = letzte - jetzt;
      letzte = jetzt;
      // Nur weit oben: Ein Sprung nach oben mitten im Text ist nichts
      // weiter als jemand, der etwas nachliest.
      if (weg > WISCH_SCHWELLE && jetzt < 400) zeigen();
    };
    window.addEventListener("scroll", beimScrollen, { passive: true });
    return () => window.removeEventListener("scroll", beimScrollen);
  }, [zeigen]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="einladung-titel"
      // Der Klick auf den abgedunkelten Hintergrund schließt - aber nur
      // dort. Ohne diese Prüfung schlösse auch ein Klick im Kasten selbst,
      // weil das Ereignis von innen nach außen läuft.
      onClick={(e) => {
        if (e.target === dialog.current) schliessen(true);
      }}
      // Escape löst close aus, ohne dass unser React davon wüsste - dann
      // stünde offen weiterhin auf true.
      onClose={() => {
        antwortMerken();
        setOffen(false);
      }}
      className="einladung"
    >
      {offen && (
        <div className="einladung-inhalt">
          {/* autoFocus: Der erste Tastendruck soll schließen können,
              nicht auf der Fläche ins Leere gehen. Und nicht auf dem
              Buchungsknopf - Enter darf niemanden aus Versehen auf eine
              andere Seite schicken. */}
          <button
            type="button"
            autoFocus
            onClick={() => schliessen(true)}
            aria-label="Einladung schließen"
            className="tastflaeche absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X size={18} aria-hidden />
          </button>

          <ImpulsSzene name="termin" className="mx-auto w-full max-w-[128px]" />

          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Bevor du gehst
          </p>
          <h2
            id="einladung-titel"
            className="mt-3 text-balance text-center font-display text-2xl font-black leading-tight tracking-tight sm:text-3xl"
          >
            20 Minuten.
            <br />
            <span className="text-accent">Einmal ausprobieren?</span>
          </h2>

          {/* Der nächste echte Termin aus dem Kalender - keine erfundene
              Dringlichkeit, kein Countdown, kein "nur noch heute". Die
              Zahl stimmt, und genau das ist ihre Wirkung. */}
          {naechsterTermin && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <CalendarClock size={16} className="shrink-0 text-accent" aria-hidden />
              <span className="text-muted">Nächster freier Termin:</span>
              <span className="text-balance text-center font-semibold">{naechsterTermin}</span>
            </p>
          )}

          <Link
            href="/probetermin"
            onClick={() => schliessen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-on-lime transition-transform hover:scale-[1.03] active:scale-95"
          >
            Kostenlosen Probetermin sichern
            <ArrowRight size={16} aria-hidden />
          </Link>

          <p className="mt-3 text-center text-xs text-muted">
            Kostenlos und unverbindlich
            {freieDieseWoche ? ` · ${freieDieseWoche} freie Termine diese Woche` : ""}
          </p>

          <button
            type="button"
            onClick={() => schliessen(true)}
            className="tastflaeche mx-auto mt-2 block rounded-full px-3 py-2 text-xs text-muted underline underline-offset-4 hover:text-foreground"
          >
            Gerade nicht
          </button>
        </div>
      )}
    </dialog>
  );
}
