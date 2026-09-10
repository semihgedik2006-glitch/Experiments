import { Play } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { InstagramIcon } from "@/components/icons/social-icons";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/site-config";
import type { Beitrag } from "@/lib/instagram";

/**
 * Die Instagram-Wand.
 *
 * Bilder und Beiträge kommen über den eigenen Server (siehe
 * src/lib/instagram.ts) - der Browser des Besuchers spricht nie mit
 * Instagram. Deshalb steht die Wand offen da und nicht hinter einem
 * Einwilligungsfenster.
 *
 * Erst der Klick führt zu Instagram, und das ist ein gewöhnlicher Link:
 * Wer ihn nicht anklickt, hinterlässt dort keine Spur.
 */
export function InstagramWand({ beitraege }: { beitraege: Beitrag[] }) {
  // Ohne Beiträge kein Abschnitt. Eine Überschrift über einer leeren
  // Fläche sähe aus, als wäre die Seite kaputt - und "kein Zugang
  // hinterlegt" geht den Besucher nichts an.
  if (beitraege.length === 0) return null;

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeader
          kicker="Instagram"
          title="So sieht es bei uns aus"
          action={
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-lime"
            >
              <InstagramIcon className="h-4 w-4" aria-hidden />
              Folgen
            </a>
          }
        />

        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {beitraege.map((beitrag) => (
            <StaggerItem key={beitrag.id}>
              {/* Der Name der Verknüpfung sitzt am Link, nicht am Bild.
                  Zuerst stand der Text als Bildbeschreibung da - bei einem
                  Beitrag ohne Text war der Link damit namenlos, und ein
                  Vorleseprogramm meldete nur "Link". Gemessen als Verstoß
                  link-name. */}
              <a
                href={beitrag.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  beitrag.text
                    ? `${beitrag.text} - bei Instagram ansehen`
                    : "Beitrag bei Instagram ansehen"
                }
                className="karte-hebt group relative block aspect-square overflow-hidden rounded-xl border border-border bg-surface"
              >
                {/* Ein einfaches img-Element: Die Adresse zeigt auf den
                    eigenen Server, nicht auf einen Bilderdienst, der
                    vorab eingetragen werden müsste. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/instagram/${beitrag.id}`}
                  // Leer: Der Name steht am Link darum herum, und zweimal
                  // derselbe Text wäre für ein Vorleseprogramm eine
                  // Dopplung.
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {beitrag.video && (
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <Play size={13} fill="currentColor" />
                  </span>
                )}
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
