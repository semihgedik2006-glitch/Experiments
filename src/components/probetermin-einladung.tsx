"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, CalendarClock, ArrowRight, Zap } from "lucide-react";
import { ImpulsSzene } from "@/components/ui/impuls-szene";
import { createBooking } from "@/lib/actions/booking";
import { ERREICHBARKEITEN } from "@/lib/erreichbarkeit";
import type { ActionResult } from "@/lib/actions/newsletter";
import {
  darfErscheinen,
  erledigt,
  gebuchtMerken,
  MINDEST_SEKUNDEN,
  MITTE_ANTEIL,
} from "@/lib/einladung";

/**
 * Die beiden Einladungen zum Probetraining.
 *
 * WANN sie erscheinen, steht in @/lib/einladung. Hier steht, worauf sie
 * reagieren und wie sie aussehen.
 *
 * Beide stehen in einer Datei, weil sie voneinander wissen müssen: Ist
 * der große Kasten offen, fährt die Karte nicht herein - zwei Einladungen
 * übereinander wären keine Einladung mehr, sondern Belagerung.
 *
 * Beide dunkel, in jedem Thema. Die dunklen Bänder mit dem leuchtenden
 * Grün sind die Stellen der Seite, an denen etwas passiert - dieselbe
 * Sprache gilt hier.
 */

type StudioWahl = { id: string; name: string };

export function ProbeterminEinladung({
  naechsterTermin,
  freieDieseWoche,
  studios,
}: {
  naechsterTermin: string | null;
  freieDieseWoche: number | null;
  studios: StudioWahl[];
}) {
  const pfad = usePathname();
  const [ausstiegOffen, setAusstiegOffen] = useState(false);

  return (
    <>
      <AusstiegEinladung
        pfad={pfad}
        naechsterTermin={naechsterTermin}
        freieDieseWoche={freieDieseWoche}
        onOffen={setAusstiegOffen}
      />
      <MitteEinladung pfad={pfad} studios={studios} gesperrt={ausstiegOffen} />
    </>
  );
}

/** Kurzschreibweise für die Stufe einer gestaffelten Einblendung. */
const stufe = (n: number) => ({ "--stufe": n }) as React.CSSProperties;

/* ================================================================== */
/*  1. Der große Kasten beim Gehen                                     */
/* ================================================================== */

/** Ab welcher Geschwindigkeit ein Hochwischen als "ich will weg" gilt (px je Ereignis). */
const WISCH_SCHWELLE = 55;

function AusstiegEinladung({
  pfad,
  naechsterTermin,
  freieDieseWoche,
  onOffen,
}: {
  pfad: string;
  naechsterTermin: string | null;
  freieDieseWoche: number | null;
  onOffen: (offen: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState(false);
  const bereit = useRef(false);
  const fertig = useRef(false);

  const schliessen = useCallback(() => {
    fertig.current = true;
    dialog.current?.close();
  }, []);

  const zeigen = useCallback(() => {
    if (fertig.current || !bereit.current) return;
    fertig.current = true;
    erledigt("ausstieg");
    setOffen(true);
    onOffen(true);
    dialog.current?.showModal();
  }, [onOffen]);

  /* Reifezeit: ein paar Sekunden auf der Seite. */
  useEffect(() => {
    fertig.current = false;
    bereit.current = false;
    if (!darfErscheinen("ausstieg", pfad)) return;
    const uhr = window.setTimeout(() => {
      bereit.current = true;
    }, MINDEST_SEKUNDEN * 1000);
    return () => window.clearTimeout(uhr);
  }, [pfad]);

  /* Am Rechner: Maus verlässt das Fenster nach oben. */
  useEffect(() => {
    const beimVerlassen = (e: MouseEvent) => {
      // relatedTarget null: raus aus dem Fenster, nicht bloß in ein
      // anderes Element. clientY <= 0: nach oben, nicht zur Seite.
      if (e.relatedTarget === null && e.clientY <= 0) zeigen();
    };
    document.addEventListener("mouseout", beimVerlassen);
    return () => document.removeEventListener("mouseout", beimVerlassen);
  }, [zeigen]);

  /* Auf dem Handy: schnelles Hochwischen weit oben auf der Seite. */
  useEffect(() => {
    let letzte = window.scrollY;
    const beimScrollen = () => {
      const jetzt = window.scrollY;
      const weg = letzte - jetzt;
      letzte = jetzt;
      // Nur weit oben: Ein Sprung nach oben mitten im Text ist jemand,
      // der etwas nachliest.
      if (weg > WISCH_SCHWELLE && jetzt < 400) zeigen();
    };
    window.addEventListener("scroll", beimScrollen, { passive: true });
    return () => window.removeEventListener("scroll", beimScrollen);
  }, [zeigen]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="einladung-titel"
      // Klick auf den abgedunkelten Hintergrund schließt - aber nur dort.
      onClick={(e) => {
        if (e.target === dialog.current) schliessen();
      }}
      // Escape schließt ohne unser Zutun; hier holt React den Stand nach.
      onClose={() => {
        setOffen(false);
        onOffen(false);
      }}
      className="einladung on-ink"
    >
      {offen && (
        <div className="einladung-inhalt">
          {/* Die Impulslinie läuft einmal quer über den Kopf der Karte -
              dasselbe Signal, das auf der ganzen Seite für "hier passiert
              etwas" steht. */}
          <svg className="einladung-impuls" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
            <path d="M0 34 H150 l12-22 14 44 12-22 H400" />
          </svg>

          <button
            type="button"
            onClick={schliessen}
            aria-label="Einladung schließen"
            className="tastflaeche absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X size={18} aria-hidden />
          </button>

          <div className="einladung-orb" aria-hidden />
          <ImpulsSzene name="termin" className="relative mx-auto w-full max-w-[132px]" />

          <p className="einladung-stufe mt-1 text-center text-xs font-semibold uppercase tracking-[0.22em] text-accent" style={stufe(1)}>
            Bevor du gehst
          </p>
          {/* Beim Öffnen landet der Fokus auf der Überschrift - nicht auf
              dem Buchungsknopf (Enter darf niemanden aus Versehen auf eine
              andere Seite schicken) und nicht auf "Schließen" (dort lag
              vorher ein Fokusring quer über der Impulslinie). Vorlese-
              programme lesen so zuerst, worum es geht; Tab führt weiter
              zu den Knöpfen. */}
          <h2
            id="einladung-titel"
            tabIndex={-1}
            autoFocus
            className="mt-3 text-balance text-center font-display text-3xl font-black leading-[1.05] tracking-tight outline-none sm:text-4xl"
          >
            <span className="einladung-stufe block" style={stufe(2)}>
              20 Minuten.
            </span>
            <span className="einladung-stufe einladung-leuchten block text-accent" style={stufe(3)}>
              Einmal spüren?
            </span>
          </h2>

          {/* Der nächste echte Termin aus dem Kalender. Keine erfundene
              Dringlichkeit, kein Countdown - die Zahl stimmt, und genau
              das ist ihre Wirkung. */}
          {naechsterTermin && (
            <p
              className="einladung-stufe mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              style={stufe(4)}
            >
              <span className="einladung-live" aria-hidden />
              <CalendarClock size={16} className="shrink-0 text-accent" aria-hidden />
              <span className="text-muted">Nächster freier Termin:</span>
              <span className="text-balance text-center font-semibold">{naechsterTermin}</span>
            </p>
          )}

          <Link
            href="/probetermin"
            onClick={schliessen}
            className="einladung-stufe einladung-knopf mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-4 text-sm font-bold text-on-lime"
            style={stufe(5)}
          >
            <span className="relative">Kostenlosen Probetermin sichern</span>
            <ArrowRight size={17} className="einladung-pfeil relative" aria-hidden />
          </Link>

          <p className="einladung-stufe mt-3 text-center text-xs text-muted" style={stufe(6)}>
            Kostenlos und unverbindlich
            {freieDieseWoche ? ` · ${freieDieseWoche} freie Termine diese Woche` : ""}
          </p>

          <button
            type="button"
            onClick={schliessen}
            className="einladung-stufe tastflaeche mx-auto mt-1 block rounded-full px-3 py-2 text-xs text-muted underline underline-offset-4 hover:text-foreground"
            style={stufe(6)}
          >
            Gerade nicht
          </button>
        </div>
      )}
    </dialog>
  );
}

/* ================================================================== */
/*  2. Die Karte in der Mitte - mit Anmeldung                          */
/* ================================================================== */

const leer: ActionResult = { ok: false, message: "" };

/**
 * Fährt unten herein, sobald jemand die Hälfte einer Seite gelesen hat.
 *
 * Bewusst KEIN Kasten, der die Seite sperrt: Die Karte liegt am Rand, man
 * kann weiterlesen und sie einfach ignorieren. Zuerst ist sie klein - nur
 * eine Zeile und ein Knopf. Das Formular klappt erst auf, wenn jemand es
 * will. Wer nicht will, hat eine Zeile am Rand gesehen und sonst nichts.
 *
 * Die Anmeldung darin läuft über dieselbe Serveraktion wie die
 * Buchungsseite: Sie landet im Adminbereich, geht per Mail ans gewählte
 * Studio und bekommt die Eingangsbestätigung. Gefragt wird nur, was das
 * Studio für den Rückruf braucht; der feste Termin wird am Telefon
 * ausgemacht.
 */
function MitteEinladung({
  pfad,
  studios,
  gesperrt,
}: {
  pfad: string;
  studios: StudioWahl[];
  gesperrt: boolean;
}) {
  const [sichtbar, setSichtbar] = useState(false);
  const [aufgeklappt, setAufgeklappt] = useState(false);
  const [state, formAction, pending] = useActionState(createBooking, leer);
  const fertig = useRef(false);

  // Nach dem Absenden: für diesen Besuch keine weitere Einladung.
  useEffect(() => {
    if (state.ok) gebuchtMerken();
  }, [state.ok]);

  useEffect(() => {
    fertig.current = false;
    setSichtbar(false);
    setAufgeklappt(false);
    if (!darfErscheinen("mitte", pfad)) return;

    const beimScrollen = () => {
      if (fertig.current) return;
      const hoehe = document.documentElement.scrollHeight - window.innerHeight;
      if (hoehe < 400) return; // Sehr kurze Seiten haben keine Mitte.
      if (window.scrollY / hoehe >= MITTE_ANTEIL) {
        fertig.current = true;
        erledigt("mitte");
        setSichtbar(true);
      }
    };
    window.addEventListener("scroll", beimScrollen, { passive: true });
    return () => window.removeEventListener("scroll", beimScrollen);
  }, [pfad]);

  if (!sichtbar || gesperrt) return null;

  function absenden(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const daten = new FormData(event.currentTarget);
    // Woher die Anfrage kam - im Adminbereich steht dann "Einladung
    // Mitte", und man sieht, ob sich die Karte lohnt.
    daten.set("herkunftSeite", pfad);
    daten.set("herkunftKampagne", "Einladung Mitte");
    daten.set("herkunftQuelle", "");
    daten.set("sprache", "de");
    startTransition(() => formAction(daten));
  }

  return (
    <aside aria-label="Probetraining anfragen" className={`einladung-karte on-ink ${aufgeklappt ? "ist-offen" : ""}`}>
      <svg className="einladung-karte-impuls" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden>
        <path d="M0 12 H170 l8-10 10 18 8-10 H400" />
      </svg>

      <button
        type="button"
        onClick={() => setSichtbar(false)}
        aria-label="Karte schließen"
        className="tastflaeche absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <X size={16} aria-hidden />
      </button>

      {state.ok ? (
        <div className="px-5 pb-5 pt-4 text-center" role="status">
          <ImpulsSzene name="bestaetigt" className="mx-auto w-full max-w-[110px]" />
          <p className="font-display text-xl font-black">Angefragt!</p>
          <p className="mt-1.5 text-sm text-muted">{state.message}</p>
        </div>
      ) : !aufgeklappt ? (
        <div className="flex items-center gap-3 py-3.5 pl-4 pr-12">
          <span className="einladung-blitz" aria-hidden>
            <Zap size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">Probetraining gratis</p>
            <p className="text-xs text-muted">In 30 Sekunden angefragt</p>
          </div>
          <button
            type="button"
            onClick={() => setAufgeklappt(true)}
            className="einladung-knopf shrink-0 rounded-full bg-lime px-4 py-2.5 text-xs font-bold text-on-lime"
          >
            <span className="relative">Los geht&apos;s</span>
          </button>
        </div>
      ) : (
        <form onSubmit={absenden} className="einladung-formular px-5 pb-5 pt-4">
          <p className="pr-8 font-display text-xl font-black leading-tight">
            Probetraining <span className="text-accent">anfragen</span>
          </p>
          <p className="mt-1 text-xs text-muted">Wir rufen dich an und machen den Termin fest.</p>

          {/* Bot-Falle wie im großen Formular. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <div className="mt-4 space-y-2.5">
            <input name="name" required autoComplete="name" placeholder="Vor- und Nachname" aria-label="Vor- und Nachname" className="einladung-feld" />
            <input name="phone" type="tel" required autoComplete="tel" placeholder="Telefonnummer" aria-label="Telefonnummer" className="einladung-feld" />
            <input name="email" type="email" required autoComplete="email" placeholder="E-Mail-Adresse" aria-label="E-Mail-Adresse" className="einladung-feld" />
            {studios.length > 0 && (
              <select name="studioId" required defaultValue="" aria-label="Studio" className="einladung-feld">
                <option value="" disabled>
                  Welches Studio?
                </option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <fieldset className="mt-3">
            <legend className="text-xs text-muted">Wann erreichen wir dich?</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ERREICHBARKEITEN.map((e, i) => (
                <label key={e.wert} className="einladung-chip">
                  <input type="radio" name="erreichbarkeit" value={e.wert} required={i === 0} className="sr-only" />
                  <span>{e.kurz}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {!state.ok && state.message && (
            <p role="alert" className="mt-3 text-xs text-[#ff9d90]">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="einladung-knopf mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-on-lime disabled:opacity-60"
          >
            <span className="relative">{pending ? "Wird gesendet …" : "Kostenlos anfragen"}</span>
            {!pending && <ArrowRight size={16} className="einladung-pfeil relative" aria-hidden />}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted">
            Unverbindlich &middot; keine Mitgliedschaft &middot;{" "}
            <Link href="/datenschutz" className="underline underline-offset-2 hover:text-foreground">
              Datenschutz
            </Link>
          </p>
        </form>
      )}
    </aside>
  );
}
