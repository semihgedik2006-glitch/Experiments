import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getStudio } from "@/lib/data";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Studio finden",
  description:
    "Finde dein Körperformen EMS-Studio in Hürth bei Köln und Brühl - Adresse, Öffnungszeiten und Anfahrt.",
};

export default async function StudioPage() {
  const studio = await getStudio();
  if (!studio) return notFound();

  return (
    <>
      <section className="border-b border-border py-20">
        <Container>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Studio <span className="text-lime">finden</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Zentral in {studio.city} gelegen - erreichbar aus Köln, Brühl und der
            gesamten Region.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={studio.mapEmbedUrl}
              title="Studio Standort auf Google Maps"
              className="h-96 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="text-xl font-semibold">{studio.name}</h2>

            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-lime" />
                <span>
                  {studio.street}
                  <br />
                  {studio.postalCode} {studio.city}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-lime" />
                <a href={`tel:${studio.phone}`} className="hover:underline">
                  {studio.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-lime" />
                <a href={`mailto:${studio.email}`} className="hover:underline">
                  {studio.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-lime" />
                <span className="whitespace-pre-line">{studio.openingHours}</span>
              </li>
            </ul>

            <Button href="/probetermin" className="mt-8 w-full">
              Probetermin in {studio.city} buchen
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
