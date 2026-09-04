import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MapEmbed } from "@/components/map-embed";
import { getStudios } from "@/lib/data";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Studios finden",
  description:
    "Finde dein Körperformen EMS-Studio in deiner Nähe - Adressen, Öffnungszeiten und Anfahrt aller Standorte.",
};

export default async function StudioPage() {
  const studios = await getStudios();
  if (studios.length === 0) return notFound();

  return (
    <>
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

      {studios.map((studio, index) => (
        <section
          key={studio.id}
          className={`py-24 ${index > 0 ? "border-t border-border" : ""} ${index % 2 === 1 ? "bg-surface" : ""}`}
        >
          <Container className="grid gap-10 md:grid-cols-2">
            <Reveal className="overflow-hidden rounded-2xl border border-border">
              <MapEmbed
                src={studio.mapEmbedUrl}
                title={`${studio.name} auf Google Maps`}
                className="h-96 w-full"
              />
            </Reveal>

            <Reveal delay={0.15} className="card p-8">
              <h2 className="text-xl font-semibold">{studio.name}</h2>

              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    {studio.street}
                    <br />
                    {studio.postalCode} {studio.city}
                  </span>
                </li>
                {studio.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`tel:${studio.phone}`} className="hover:underline">
                      {studio.phone}
                    </a>
                  </li>
                )}
                {studio.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
                    <a href={`mailto:${studio.email}`} className="hover:underline">
                      {studio.email}
                    </a>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-accent" />
                  <span className="whitespace-pre-line">{studio.openingHours}</span>
                </li>
              </ul>

              <Button href="/probetermin" className="mt-8 w-full">
                Probetermin in {studio.city} buchen
              </Button>
            </Reveal>
          </Container>
        </section>
      ))}
    </>
  );
}
