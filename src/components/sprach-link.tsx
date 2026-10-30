"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import type { Sprache } from "@/lib/sprache";
import { pfad } from "@/lib/i18n/pfade";
import { useSprache } from "@/lib/i18n/use-sprache";

/**
 * next/link, nur dass ein Verweis in der Sprache bleibt, in der man liest.
 *
 * Auf einer englischen Seite wird aus href="/preise" von selbst
 * "/en/prices" - die Komponenten schreiben überall die deutsche Adresse
 * und müssen nicht wissen, auf welcher Fassung sie stehen. Verweise nach
 * außen, in den Adminbereich oder auf Dateien bleiben unverändert.
 *
 * `sprache` erzwingt eine Zielsprache - für den Sprachumschalter.
 */
export default function Link({
  href,
  sprache,
  ...rest
}: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; sprache?: Sprache }) {
  const aktuell = useSprache();
  return <NextLink href={pfad(sprache ?? aktuell, href)} {...rest} />;
}
