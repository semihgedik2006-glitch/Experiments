import { MessageCircle } from "lucide-react";

/**
 * WhatsApp als Kontaktweg.
 *
 * Für viele ist das die niedrigste Hürde - besonders auf dem Handy, wo ein
 * Anruf eine Hemmschwelle ist und ein Formular eine Fleißaufgabe.
 *
 * Datenschutz: Das hier ist ein gewöhnlicher Link, kein eingebetteter
 * Dienst. Vor dem Klick geht nichts an WhatsApp - keine IP-Adresse, kein
 * Skript, kein Zählpixel. Deshalb braucht der Knopf auch keine
 * Einwilligung, anders als die Kartendarstellung.
 *
 * Der Text ist vorbereitet, damit das Gespräch nicht mit einem "Hallo?"
 * beginnt, auf das jemand antworten muss, bevor es losgeht.
 */

/**
 * Bringt eine Telefonnummer in die Form, die wa.me verlangt: nur Ziffern,
 * mit Ländervorwahl, ohne Plus und ohne führende Null.
 *
 * "0157 85090199" wird zu "4915785090199".
 */
export function whatsappNummer(roh: string): string | null {
  const ziffern = roh.replace(/[^\d+]/g, "");
  if (!ziffern) return null;

  if (ziffern.startsWith("+")) return ziffern.slice(1);
  if (ziffern.startsWith("00")) return ziffern.slice(2);
  // Eine deutsche Nummer beginnt mit der Null der Ortsvorwahl; wa.me will
  // stattdessen die Ländervorwahl.
  if (ziffern.startsWith("0")) return `49${ziffern.slice(1)}`;
  return ziffern;
}

export function WhatsappKnopf({
  nummer,
  text,
  className = "",
  variante = "voll",
}: {
  /** Die Nummer, wie sie im Adminbereich steht. */
  nummer: string;
  /** Vorbereiteter erster Satz. */
  text: string;
  className?: string;
  variante?: "voll" | "schlicht";
}) {
  const ziel = whatsappNummer(nummer);
  if (!ziel) return null;

  const url = `https://wa.me/${ziel}?text=${encodeURIComponent(text)}`;

  const stil =
    variante === "voll"
      ? "inline-flex items-center justify-center gap-2 rounded-full bg-lime px-7 py-3 text-sm font-semibold text-on-lime transition-opacity hover:opacity-90"
      : "inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime hover:text-accent";

  return (
    <a
      href={url}
      target="_blank"
      // noreferrer zusätzlich zu noopener: Ohne das bekäme WhatsApp die
      // Adresse der Seite mitgeteilt, von der aus geklickt wurde.
      rel="noopener noreferrer"
      className={`${stil} ${className}`}
    >
      <MessageCircle size={16} aria-hidden />
      Per WhatsApp schreiben
    </a>
  );
}
