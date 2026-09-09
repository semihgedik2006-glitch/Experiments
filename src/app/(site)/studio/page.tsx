import type { Metadata } from "next";
import { isVisible } from "@/lib/site-toggles";
import { PageHeader } from "@/components/ui/page-header";
import { getStudios } from "@/lib/data";
import { StudioJsonLd } from "@/components/structured-data";
import { StudioList } from "@/components/studio/studio-list";
import { StandortUebersicht } from "@/components/studio/standort-uebersicht";
import { Container } from "@/components/ui/container";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  // Kanonische Adresse: Sonst kann Google dieselbe Seite unter mehreren
  // Adressen als mehrere Seiten werten und die Bewertung aufteilen.
  alternates: { canonical: "/studio" },
  title: "Studios finden",
  description:
    "Finde dein Körperformen EMS-Studio in deiner Nähe - Adressen, Öffnungszeiten und Anfahrt aller Standorte.",
};

export default async function StudioPage() {
  // Im Adminbereich ausgeblendet: Die Seite bleibt bestehen, ist aber
  // nicht mehr erreichbar.
  if (!(await isVisible("studio"))) return notFound();

  const studios = await getStudios();
  if (studios.length === 0) return notFound();

  return (
    <>
      <StudioJsonLd />
      <PageHeader
        kicker={studios.length > 1 ? "Standorte" : "Standort"}
        title={
          <>
            {studios.length > 1 ? "Unsere " : ""}Studio{studios.length > 1 ? "s" : ""}{" "}
            <span className="text-accent">finden</span>
          </>
        }
        intro={
          studios.length > 1
            ? "Wähle den Standort in deiner Nähe - alle Studios mit Adresse, Öffnungszeiten und Anfahrt."
            : `Zentral in ${studios[0].city} gelegen - erreichbar aus Köln, Brühl und der gesamten Region.`
        }
      />

      {studios.length > 1 && (
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
    </>
  );
}
