import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WegLeiste } from "@/components/weg-leiste";
import { isVisible } from "@/lib/site-toggles";
import { PageHeader } from "@/components/ui/page-header";
import { getStudios } from "@/lib/data";
import { StudioJsonLd } from "@/components/structured-data";
import { StudioList } from "@/components/studio/studio-list";
import { Netzwerk } from "@/components/home/netzwerk";
import { siteConfig } from "@/lib/site-config";
import { StandortUebersicht } from "@/components/studio/standort-uebersicht";
import { Container } from "@/components/ui/container";
import { StudioProblem } from "@/components/problem/unterseiten";
import { seitenMetadaten } from "@/lib/i18n/metadaten";
import type { Sprache } from "@/lib/sprache";

export function studiosMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(
    sprache,
    "/studio",
    sprache === "en"
      ? {
          title: "Find a studio",
          description:
            "Find your Körperformen EMS studio nearby - addresses, opening hours and directions for all locations in and around Cologne.",
        }
      : {
          title: "Studios finden",
          description:
            "Finde dein Körperformen EMS-Studio in deiner Nähe - Adressen, Öffnungszeiten und Anfahrt aller Standorte.",
        },
  );
}

export async function StudiosSeite({ sprache }: { sprache: Sprache }) {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("studio"))) return notFound();

  const studios = await getStudios();
  if (studios.length === 0) return notFound();
  const en = sprache === "en";
  const mehrere = studios.length > 1;

  return (
    <>
      <StudioJsonLd />
      <PageHeader
        kicker={en ? (mehrere ? "Locations" : "Location") : mehrere ? "Standorte" : "Standort"}
        title={
          en ? (
            <>
              <span className="text-accent">Find</span> {mehrere ? "our studios" : "our studio"}
            </>
          ) : (
            <>
              {mehrere ? "Unsere " : ""}Studio{mehrere ? "s" : ""} <span className="text-accent">finden</span>
            </>
          )
        }
        intro={
          mehrere
            ? // Was auf einer Standortkarte steht, muss man nicht aufzählen -
              // Adresse, Öffnungszeiten und Anfahrt stehen ja sichtbar drauf.
              en
              ? "All locations at a glance - pick the one that fits into your day."
              : "Alle Standorte auf einen Blick - such dir den aus, der in deinen Tag passt."
            : en
              ? `Centrally located in ${studios[0].city} - easy to reach from Cologne, Brühl and the whole region.`
              : `Zentral in ${studios[0].city} gelegen - erreichbar aus Köln, Brühl und der gesamten Region.`
        }
      />

      {mehrere && (
        <Container className="pt-4">
          <StandortUebersicht
            studios={studios.map((studio) => ({
              id: studio.id,
              name: studio.name,
              city: studio.city,
              street: studio.street,
              postalCode: studio.postalCode,
              latitude: studio.latitude,
              longitude: studio.longitude,
            }))}
          />
        </Container>
      )}

      <StudioList studios={studios} />

      {/* Das Körperformen-Netz - stand früher auf der Startseite. Hier
          gehört es hin: Wer Standorte sucht, fragt auch, wie groß das Netz
          dahinter ist. */}
      {mehrere && <Netzwerk gesamt={siteConfig.netzwerk.studiosGesamt} eigene={studios.length} />}

      <StudioProblem
        studios={studios.flatMap((s) =>
          s.latitude != null && s.longitude != null
            ? [{ name: s.name.replace(/^Körperformen\s+/, ""), lat: s.latitude, lng: s.longitude }]
            : [],
        )}
      />

      <WegLeiste aktuell="entscheiden" />
    </>
  );
}
