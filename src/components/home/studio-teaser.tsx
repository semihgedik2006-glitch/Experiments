import { MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { getStudios } from "@/lib/data";

export async function StudioTeaser() {
  const studios = await getStudios();
  if (studios.length === 0) return null;

  // Single location: the classic two-column layout with the map.
  if (studios.length === 1) {
    const studio = studios[0];
    return (
      <section className="py-24">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
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
          </Reveal>

          <Reveal delay={0.15} className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={studio.mapEmbedUrl}
              title="Studio Standort auf Google Maps"
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </Container>
      </section>
    );
  }

  // Multiple locations: compact card per studio.
  return (
    <section className="py-24">
      <Container>
        <Reveal className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {studios.length} Studios in deiner Nähe
          </h2>
          <p className="mt-4 text-muted">
            Modern ausgestattet, zentral gelegen - such dir den Standort aus,
            der am besten in deinen Alltag passt.
          </p>
        </Reveal>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <StaggerItem key={studio.id} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-6">
                <h3 className="text-lg font-semibold">{studio.name}</h3>
                <ul className="mt-4 flex-1 space-y-3 text-sm text-muted">
                  <li className="flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-lime" />
                    {studio.street}, {studio.postalCode} {studio.city}
                  </li>
                  {studio.phone && (
                    <li className="flex items-start gap-2.5">
                      <Phone size={16} className="mt-0.5 shrink-0 text-lime" />
                      {studio.phone}
                    </li>
                  )}
                </ul>
                <Button href="/studio" variant="secondary" className="mt-6 w-full">
                  Details &amp; Anfahrt
                </Button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
