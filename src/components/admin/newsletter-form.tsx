"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { adminInput } from "@/components/admin/ui";
import { BETREFF_MAX, TEXT_MAX } from "@/lib/newsletter";
import type { ActionResult } from "@/lib/actions/newsletter";

const initialState: ActionResult = { ok: false, message: "" };

/**
 * Der Entwurf einer Ausgabe.
 *
 * Reiner Text, kein Formatierungswerkzeug. Drei Gründe: Eine
 * Nur-Text-Mail landet seltener im Spam als eine bunte, sie sieht auf
 * jedem Gerät gleich aus, und ein halbfertiger Editor verleitet zu
 * Gestaltung, die im Postfach dann doch auseinanderfällt.
 *
 * Der Zähler unter dem Betreff zählt nicht bis zur Obergrenze, sondern bis
 * zu der Länge, ab der Postfächer abschneiden - das ist die Zahl, die
 * beim Schreiben hilft.
 */
const BETREFF_SICHTBAR = 60;

export function NewsletterForm({
  action,
  entwurf,
  submitLabel,
  fussVorschau,
}: {
  action: (prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  entwurf?: { id: string; betreff: string; text: string };
  submitLabel: string;
  /** Der Fuß, der automatisch angehängt wird - zum Mitlesen. */
  fussVorschau: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [betreff, setBetreff] = useState(entwurf?.betreff ?? "");
  const [text, setText] = useState(entwurf?.text ?? "");

  const zuLang = betreff.length > BETREFF_SICHTBAR;

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {entwurf && <input type="hidden" name="id" value={entwurf.id} />}

      <div>
        <label htmlFor="nl-betreff" className="mb-1 block text-xs text-muted">
          Betreff
        </label>
        <input
          id="nl-betreff"
          type="text"
          name="betreff"
          required
          maxLength={BETREFF_MAX}
          value={betreff}
          onChange={(e) => setBetreff(e.target.value)}
          placeholder="Neue Zeiten im Studio Hürth"
          className={adminInput}
        />
        <p className={`mt-1.5 text-xs ${zuLang ? "text-danger" : "text-muted"}`}>
          {zuLang
            ? `${betreff.length} Zeichen - ab etwa ${BETREFF_SICHTBAR} schneiden die meisten Postfächer ab.`
            : `${betreff.length} von etwa ${BETREFF_SICHTBAR} Zeichen, die im Postfach zu sehen sind.`}
        </p>
      </div>

      <div>
        <label htmlFor="nl-text" className="mb-1 block text-xs text-muted">
          Text
        </label>
        <textarea
          id="nl-text"
          name="text"
          required
          rows={16}
          maxLength={TEXT_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Hallo,\n\nab nächster Woche gibt es bei uns ..."}
          className={`${adminInput} font-mono text-[13px] leading-relaxed`}
        />
        <p className="mt-1.5 text-xs text-muted">
          Reiner Text - Absätze durch Leerzeilen. Links einfach als volle
          Adresse hineinschreiben, Postfächer machen daraus von selbst einen
          Link.
        </p>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted">
          Das hängen wir automatisch an (nicht änderbar)
        </p>
        {/* Bewusst sichtbar und ausdrücklich nicht bearbeitbar: Der
            Abmeldelink ist Pflicht, und wer ihn hier stehen sieht, kommt
            nicht auf die Idee, ihn selbst in den Text zu schreiben.

            tabIndex und aria-label sind kein Beiwerk: Der Abmeldelink ist
            länger als der Kasten, der Kasten lässt sich also seitwärts
            schieben - und was sich schieben lässt, muss auch mit der
            Tastatur erreichbar sein, sonst kommt man an das Ende der Zeile
            nie heran. */}
        <pre
          tabIndex={0}
          role="region"
          aria-label="Fester Textabschluss jeder Ausgabe"
          className="overflow-x-auto rounded-lg border border-dashed border-border bg-surface p-3 font-mono text-[12px] leading-relaxed text-muted"
        >
          {fussVorschau}
        </pre>
      </div>

      {state?.message && (
        <p className={`text-sm ${state.ok ? "text-accent" : "text-danger"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-on-lime disabled:cursor-progress disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" aria-hidden />}
        {pending ? "Wird gespeichert..." : submitLabel}
      </button>
    </form>
  );
}
