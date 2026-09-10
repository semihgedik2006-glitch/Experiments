"use client";

import { startTransition, useActionState, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { createBooking } from "@/lib/actions/booking";
import { ERREICHBARKEITEN } from "@/lib/erreichbarkeit";
import type { ActionResult } from "@/lib/actions/newsletter";

type DayGroup = {
  dateKey: string;
  dateLabel: string;
  slots: { id: string; startTime: string; endTime: string }[];
};

const initialState: ActionResult = { ok: false, message: "" };

export function BookingForm({
  days,
  studioId,
  studioName,
}: {
  days: DayGroup[];
  /** Der oben gewählte Standort. Er wird mitgeschickt, damit die Anfrage
      auch dann bei einem Studio landet, wenn keine feste Zeit dabei ist. */
  studioId: string;
  studioName: string;
}) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  // Die Eingaben liegen in React und nicht nur im Formular.
  //
  // Grund: Nach einer Serveraktion setzt React das Formular zurück - wie
  // beim gewöhnlichen Absenden einer Seite. Weist der Server die Anfrage
  // ab ("Bitte fülle alle Pflichtfelder aus"), stand der Besucher bisher
  // vor einem leeren Formular und durfte Name, E-Mail, Telefonnummer und
  // Nachricht noch einmal eintippen. Wer das erlebt, schickt kein zweites
  // Mal ab.
  const [felder, setFelder] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    terminWunsch: "",
    erreichbarkeit: "",
  });

  const aendern =
    (feld: keyof typeof felder) =>
    (event: { target: { value: string } }) =>
      setFelder((bisher) => ({ ...bisher, [feld]: event.target.value }));

  /**
   * Absenden von Hand statt über action={formAction}.
   *
   * Wird die Aktion direkt an das Formular gehängt, setzt React es nach
   * jedem Durchlauf zurück - auch nach einem abgelehnten. Bei den
   * Textfeldern fällt das nicht auf, weil ihr Wert aus React kommt; die
   * Auswahlknöpfe standen danach aber tatsächlich wieder leer da, und
   * beim zweiten Versuch wäre die Erreichbarkeit gar nicht mitgegangen.
   *
   * Über onSubmit entfällt das Zurücksetzen. Die Prüfung des Browsers
   * läuft vorher wie gewohnt: Ein unvollständiges Formular löst dieses
   * Ereignis erst gar nicht aus.
   */
  function absenden(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const daten = new FormData(event.currentTarget);
    startTransition(() => formAction(daten));
  }

  const activeDay = days.find((d) => d.dateKey === selectedDay);

  if (state.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-lime bg-surface p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/15 text-accent"
        >
          <CheckCircle2 size={30} />
        </motion.div>
        <h3 className="mt-5 text-xl font-semibold text-accent">Anfrage gesendet!</h3>
        <p className="mt-3 text-muted">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={absenden} className="space-y-8">
      {/* Bot-Falle: für echte Besucher unsichtbar, Bots füllen sie oft aus. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="space-y-6">
        <p className="text-sm font-semibold">
          {days.length > 0 ? "1. Wann passt es dir?" : "Wann passt es dir?"}
        </p>

        {days.length > 0 ? (
          <>
            <div>
              <p className="mb-3 text-xs text-muted">
                Such dir einen Tag aus - oder lass die Auswahl leer und schreib
                unten, wann du kannst.
              </p>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDay(selectedDay === day.dateKey ? "" : day.dateKey);
                      setSelectedSlotId(null);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      selectedDay === day.dateKey
                        ? "border-lime bg-lime text-on-lime"
                        : "border-border hover:border-lime"
                    }`}
                  >
                    {day.dateLabel}
                  </button>
                ))}
              </div>
            </div>

            {activeDay && (
              <div>
                <p className="mb-3 text-xs text-muted">Uhrzeit am {activeDay.dateLabel}:</p>
                <div className="flex flex-wrap gap-2">
                  {activeDay.slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(selectedSlotId === slot.id ? null : slot.id)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        selectedSlotId === slot.id
                          ? "border-lime bg-lime text-on-lime"
                          : "border-border hover:border-lime"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            {studioName
              ? `Für ${studioName} sind aktuell keine festen Termine hinterlegt`
              : "Aktuell sind keine festen Termine hinterlegt"}{" "}
            - schreib uns einfach, wann es dir passt.
          </p>
        )}

        {/* Der freie Wunsch steht bewusst im selben Schritt wie die festen
            Zeiten und nicht als Nachsatz weiter unten: Wer keine der
            angebotenen Zeiten kann, soll nicht das Gefühl haben, hier falsch
            zu sein. Vorher landete so ein Hinweis im Nachrichtenfeld - oder
            der Besucher brach ab. */}
        <label className="block">
          <span className="text-sm">
            {days.length > 0 ? "Passt nichts davon? Schreib deine Wunschzeit:" : "Deine Wunschzeit"}
          </span>
          <input
            type="text"
            name="terminWunsch"
            maxLength={200}
            value={felder.terminWunsch}
            onChange={aendern("terminWunsch")}
            placeholder="z.B. abends ab 18 Uhr oder samstags vormittags"
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
        </label>
      </div>

      <input type="hidden" name="slotId" value={selectedSlotId ?? ""} />
      {/* Der oben gewählte Standort. Bisher stand er nur auf dem Bildschirm
          und wurde nie mitgeschickt - wer kein festes Zeitfenster anklickte,
          dessen Anfrage kam ohne Standort an und musste von Hand zugeordnet
          werden. */}
      <input type="hidden" name="studioId" value={studioId} />

      <div>
        <p className="mb-3 text-sm font-semibold">
          {days.length > 0 ? "2. Deine Daten" : "Deine Daten"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={felder.name}
            onChange={aendern("name")}
            placeholder="Vor- und Nachname"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
          />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={felder.email}
            onChange={aendern("email")}
            placeholder="E-Mail-Adresse"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            value={felder.phone}
            onChange={aendern("phone")}
            placeholder="Telefonnummer"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
          />
          <textarea
            name="message"
            rows={3}
            value={felder.message}
            onChange={aendern("message")}
            placeholder="Nachricht (optional)"
            className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime sm:col-span-2"
          />
        </div>
      </div>

      {/* Pflichtangabe - als einzige neben Name, E-Mail und Telefon.
          Begründung: Aus einer Anfrage wird kein Termin durch das Formular,
          sondern durch den Rückruf. Wer dreimal zur falschen Zeit angerufen
          wird, wird irgendwann nicht mehr angerufen.

          Als echte Auswahlknöpfe in einer Gruppe mit Beschriftung, nur
          optisch als Schaltflächen: Mit der Tastatur wechselt man wie
          gewohnt mit den Pfeiltasten, und Vorleseprogramme sagen an, dass
          es eine Auswahl ist und wie viele Möglichkeiten es gibt. */}
      <fieldset>
        <legend className="text-sm font-semibold">
          {days.length > 0 ? "3. Wann erreichen wir dich am besten?" : "Wann erreichen wir dich am besten?"}
        </legend>
        <p className="mt-1.5 text-xs text-muted">
          Wir rufen dich zur Bestätigung an. Sag uns, wann es dir passt - dann
          landen wir nicht dreimal auf der Mailbox.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ERREICHBARKEITEN.map((option) => (
            <label key={option.wert} className="cursor-pointer">
              <input
                type="radio"
                name="erreichbarkeit"
                value={option.wert}
                required
                checked={felder.erreichbarkeit === option.wert}
                onChange={aendern("erreichbarkeit")}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-border px-4 py-2 text-sm transition-colors peer-hover:border-lime peer-checked:border-lime peer-checked:bg-lime peer-checked:text-on-lime peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime">
                {option.kurz}
                {option.spanne && <span className="ml-1.5 text-xs">{option.spanne}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.message && !state.ok && (
        <motion.p
          key={state.message}
          animate={{ x: [0, -8, 8, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          role="alert"
          className="text-sm text-danger"
        >
          {state.message}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Probetermin anfragen"}
      </button>
    </form>
  );
}
