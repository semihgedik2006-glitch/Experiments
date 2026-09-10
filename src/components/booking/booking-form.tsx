"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { createBooking } from "@/lib/actions/booking";
import { ERREICHBARKEITEN } from "@/lib/erreichbarkeit";
import { ZIELE } from "@/lib/ziel";
import { herkunftAusBrowser, type Herkunft } from "@/lib/herkunft";
import type { TerminTag as DayGroup } from "@/lib/termin-tage";
import type { ActionResult } from "@/lib/actions/newsletter";

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
  // "Wir kommen zu zweit" steht außerhalb von `felder`, weil es kein Text
  // ist - ein Kontrollkästchen kennt nur an und aus.
  const [zuZweit, setZuZweit] = useState(false);
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
    erreichbarkeit: "",
    ziel: "",
    aktionsCode: "",
  });

  /**
   * Woher der Besucher kam - Seite, Kampagnenkennung und die verweisende
   * Seite.
   *
   * Einmal beim Aufbau festgehalten und nicht erst beim Absenden: Bis
   * dahin kann jemand längst auf eine andere Seite geblättert haben, und
   * dann stünde die falsche Herkunft an der Anfrage.
   *
   * Erst nach dem Aufbau im Browser, nicht schon beim Rendern auf dem
   * Server: Dort gibt es weder Adresszeile noch Verweis. Würde die
   * Startbelegung daraus abgeleitet, käme im Browser etwas anderes heraus
   * als auf dem Server und React verwürfe die gelieferte Seite.
   */
  const herkunft = useRef<Herkunft>({ seite: null, kampagne: null, quelle: null });
  useEffect(() => {
    herkunft.current = herkunftAusBrowser();
  }, []);

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
    // Die Herkunft steht in keinem sichtbaren Feld - sie kommt aus dem,
    // was der Browser ohnehin weiß, und wird hier angehängt.
    daten.set("herkunftSeite", herkunft.current.seite ?? "");
    daten.set("herkunftKampagne", herkunft.current.kampagne ?? "");
    daten.set("herkunftQuelle", herkunft.current.quelle ?? "");
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
                  {activeDay.slots.map((slot) => {
                    // Belegte Zeiten verschwinden nicht mehr, sondern sind
                    // anwählbar und führen auf die Warteliste. Wer genau um
                    // 18 Uhr kann und nur die 19 Uhr sieht, geht sonst
                    // wieder - und wir erfahren nie, dass er da war.
                    const reicht = slot.frei >= (zuZweit ? 2 : 1);
                    const gewaehlt = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(gewaehlt ? null : slot.id)}
                        aria-pressed={gewaehlt}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          gewaehlt
                            ? "border-lime bg-lime text-on-lime"
                            : reicht
                              ? "border-border hover:border-lime"
                              : "border-dashed border-border text-muted hover:border-lime"
                        }`}
                      >
                        {slot.startTime}
                        {!reicht && (
                          <span className={`ml-1.5 text-xs ${gewaehlt ? "" : "text-muted"}`}>
                            belegt
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Der Hinweis erscheint erst, wenn eine belegte Zeit
                    tatsächlich angeklickt ist - vorher wäre er eine Warnung
                    vor etwas, das noch niemand vorhat. */}
                {activeDay.slots.some(
                  (slot) => slot.id === selectedSlotId && slot.frei < (zuZweit ? 2 : 1),
                ) && (
                  <p className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted">
                    Diese Zeit ist schon vergeben. Schick die Anfrage trotzdem ab -
                    dann stehst du auf der Warteliste und wir melden uns sofort,
                    wenn dort ein Platz frei wird.
                  </p>
                )}
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

        {/* Hier stand ein Feld "Deine Wunschzeit". Es ist entfallen: Die
            festen Zeiten stehen darüber zur Auswahl, wann jemand
            telefonisch erreichbar ist, wird weiter unten gefragt - und wann
            es tatsächlich passt, klärt sich im Rückruf in zwanzig
            Sekunden. Übrig blieb ein Feld, das Text sammelte, den niemand
            auswertete. */}

        {/* Zu zweit ist keine Nebensache, sondern eine Frage der Plätze:
            Zwei Personen brauchen zwei Geräte und zwei Westen. Steht es
            nicht im Formular, erfährt es das Studio erst an der Tür - und
            muss dann jemanden wieder wegschicken. */}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
          <input
            type="checkbox"
            name="zuZweit"
            checked={zuZweit}
            onChange={(event) => setZuZweit(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-lime"
          />
          <span className="text-sm">
            Wir kommen zu zweit
            <span className="mt-0.5 block text-xs text-muted">
              Probetraining zusammen mit Partner, Freundin oder Freund. Wir
              reservieren dann zwei Plätze.
            </span>
          </span>
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
          {/* Der Platzhalter war "Nachricht (optional)" - und entsprechend
              kam meist nichts oder "Bitte um Rückruf" zurück. Ein Feld
              bekommt die Antworten, nach denen es fragt: Hier steht jetzt,
              was im Studio tatsächlich etwas ändert.

              Bewusst NICHT nach Beschwerden oder Vorerkrankungen gefragt -
              das sind besonders geschützte Gesundheitsdaten und gehören in
              die Anamnese vor Ort, nicht in ein Webformular. Begründung in
              src/lib/ziel.ts. */}
          <label className="sm:col-span-2">
            <span className="text-sm">Noch etwas, das wir vorher wissen sollten?</span>
            <textarea
              name="message"
              rows={3}
              maxLength={1000}
              value={felder.message}
              onChange={aendern("message")}
              placeholder="Freiwillig - z.B. ob du schon EMS-Erfahrung hast, oder worauf wir bei dir achten sollen."
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-lime"
            />
          </label>
        </div>

        {/* Freiwillig, aber die nützlichste Angabe im ganzen Formular: Wer
            abnehmen will, bekommt ein anderes erstes Gespräch als jemand,
            der seinen Rücken stärken möchte. Über alle Anfragen zusammen
            zeigt die Verteilung außerdem, womit geworben werden sollte. */}
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Was möchtest du erreichen?</legend>
          <p className="mt-1 text-xs text-muted">
            Freiwillig - hilft uns, das erste Gespräch auf dich abzustimmen.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ZIELE.map((option) => (
              <label key={option.wert} className="cursor-pointer">
                <input
                  type="radio"
                  name="ziel"
                  value={option.wert}
                  checked={felder.ziel === option.wert}
                  onChange={aendern("ziel")}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-border px-4 py-2 text-sm transition-colors peer-hover:border-lime peer-checked:border-lime peer-checked:bg-lime peer-checked:text-on-lime peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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

      {/* Freiwillig und deshalb schmal: Wer keinen Code hat, soll nicht
          das Gefühl bekommen, ihm fehle etwas. Ein falscher Code wird beim
          Absenden benannt statt stillschweigend verworfen - sonst käme
          jemand mit einer Erwartung ins Studio, von der dort niemand
          weiß. */}
      <label className="block max-w-xs">
        <span className="text-sm">Aktionscode</span>
        <span className="mt-0.5 block text-xs text-muted">
          Nur, wenn du einen aus einer Anzeige oder von einem Flyer hast.
        </span>
        <input
          type="text"
          name="aktionsCode"
          maxLength={40}
          autoComplete="off"
          autoCapitalize="characters"
          value={felder.aktionsCode}
          onChange={aendern("aktionsCode")}
          placeholder="z.B. SOMMER26"
          className="mt-2 w-full rounded-lg border border-border bg-transparent px-4 py-3 text-sm uppercase outline-none placeholder:normal-case focus:border-lime"
        />
      </label>

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
