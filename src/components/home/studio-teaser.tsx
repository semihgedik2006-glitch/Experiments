import { MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getStudio } from "@/lib/data";

export async function StudioTeaser() {
  const studio = await getStudio();
  if (!studio) return null;

  return (
    <section className="py-24">
      <Container className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Dein Studio in {studio.city}
          </h2>
          <p className="mt-4 text-muted">
            Modern ausgestattet, zentral gelegen und mit einem Team, das dich
            auf deinem Weg begleitet.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-lime" />
              <span>
                {studio.street}, {studio.postalCode} {studio.city}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-lime" />
              <a href={`tel:${studio.phone}`} className="hover:underline">
                {studio.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-lime" />
              <span className="whitespace-pre-line">{studio.openingHours}</span>
            </li>
          </ul>

          <Button href="/studio" variant="secondary" className="mt-8">
            Studio &amp; Anfahrt ansehen
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            src={studio.mapEmbedUrl}
            title="Studio Standort auf Google Maps"
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </section>
  );
}
