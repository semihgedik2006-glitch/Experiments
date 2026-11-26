"use client";

import { Printer } from "lucide-react";

/** Druckt die Seite. Im Ausdruck selbst ist der Knopf ausgeblendet. */
export function DruckKnopf() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-on-lime print:hidden"
    >
      <Printer size={15} aria-hidden /> Drucken
    </button>
  );
}
