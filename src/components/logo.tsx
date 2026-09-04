import Image from "next/image";

/**
 * Wortmarke in zwei Fassungen - je eine für hellen und dunklen Untergrund.
 *
 * Welche zu sehen ist, entscheidet allein CSS. Vorher hing das an
 * JavaScript: Der Server lieferte immer die dunkle Fassung aus, und erst
 * nach der Hydration wurde im hellen Modus auf die andere Datei gewechselt.
 * Das hatte zwei Folgen - im hellen Modus sah man kurz das falsche Logo,
 * und der Nachlade-Wechsel setzte die gemessene Ladezeit auf einem
 * langsamen Mobilgerät um rund zwei Sekunden nach hinten.
 *
 * Beide Dateien sind wenige Kilobyte groß; sie gemeinsam zu laden ist
 * deutlich günstiger als der spätere Austausch.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo-light.svg"
        alt="Körperformen"
        width={145}
        height={40}
        priority
        className={`${className} dark:hidden`}
      />
      <Image
        src="/logo-dark.svg"
        alt=""
        aria-hidden
        width={145}
        height={40}
        priority
        className={`hidden ${className} dark:block`}
      />
    </>
  );
}
