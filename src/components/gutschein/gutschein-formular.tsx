"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Gift } from "lucide-react";
import { gutscheinAnfragen } from "@/lib/actions/gutschein";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

const feldKlasse =
  "w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime";

export type GutscheinOption = { wert: string; titel: string; zeile: string };

/**
 * Das Anfrageformular für einen Gutschein.
 *
 * Die Auswahl steht als große Karten oben und nicht als Klappliste: Der
 * Gutschein ist die Entscheidung, alles darunter nur die Lieferadresse.
 */
export function GutscheinFormular({
  optionen,
  studios,
  vorauswahlStudio,
}: {
  optionen: GutscheinOption[];
  studios: { id: string; name: string }[];
  vorauswahlStudio: string | null;
}) {
  const [state, formAction, pending] = useActionState(gutscheinAnfragen, initialState);
  // Wie im Kontaktformular: Eingaben in React halten, damit eine
  // abgewiesene Anfrage nicht alles Getippte löscht.
  const [felder, setFelder] = useState({
    auswahl: optionen[1]?.wert ?? optionen[0]?.wert ?? "",
    studioId: vorauswahlStudio ?? "",
    name: "",
    email: "",
    telefon: "",
    fuer: "",
    widmung: "",
  });
  const aendern =
    (feld: keyof typeof felder) =>
    (event: { target: { value: string } }) =>
      setFelder((bisher) => ({ ...bisher, [feld]: event.target.value }));

  if (state.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-lime bg-surface p-10 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/15 text-accent">
          <CheckCircle2 size={30} aria-hidden />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-accent">Anfrage angekommen!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">1. Welcher Gutschein?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {optionen.map((option) => (
            <label
              key={option.wert}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition-colors ${
                felder.auswahl === option.wert
                  ? "border-lime bg-lime/8"
                  : "border-border hover:border-lime/60"
              }`}
            >
              <input
                type="radio"
                name="auswahl"
                value={option.wert}
                checked={felder.auswahl === option.wert}
                onChange={aendern("auswahl")}
                className="mt-1 accent-lime"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <Gift size={16} className="text-accent" aria-hidden />
                  {option.titel}
                </span>
                <span className="mt-1 block text-sm text-muted">{option.zeile}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold">2. Für wen? (freiwillig)</legend>
        <input
          type="text"
          name="fuer"
          value={felder.fuer}
          onChange={aendern("fuer")}
          maxLength={60}
          placeholder="Name, der auf dem Gutschein stehen soll"
          className={feldKlasse}
        />
        <input
          type="text"
          name="widmung"
          value={felder.widmung}
          onChange={aendern("widmung")}
          maxLength={140}
          placeholder="Ein kurzer Satz für die Karte, z. B. „Frohe Weihnachten!“"
          className={feldKlasse}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold">3. Wo abholen und bezahlen?</legend>
        <select
          name="studioId"
          required
          value={felder.studioId}
          onChange={aendern("studioId")}
          className={`${feldKlasse} bg-surface`}
        >
          <option value="">Studio wählen</option>
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">4. Deine Kontaktdaten</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={felder.name}
            onChange={aendern("name")}
            placeholder="Vor- und Nachname"
            className={`${feldKlasse} sm:col-span-2`}
          />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={felder.email}
            onChange={aendern("email")}
            placeholder="E-Mail-Adresse"
            className={feldKlasse}
          />
          <input
            type="tel"
            name="telefon"
            required
            autoComplete="tel"
            value={felder.telefon}
            onChange={aendern("telefon")}
            placeholder="Telefonnummer"
            className={feldKlasse}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          Wir nutzen deine Angaben nur, um dich wegen des Gutscheins zu kontaktieren. Bezahlt
          wird im Studio - online zahlst du nichts.
        </p>
      </fieldset>

      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="knopf-glanz w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Wird gesendet..." : "Gutschein anfragen"}
      </button>
    </form>
  );
}
