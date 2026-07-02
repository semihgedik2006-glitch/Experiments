import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact-form";
import { getStudio } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktiere Körperformen bei Fragen rund um EMS-Training, Preise oder deinen Probetermin.",
};

export default async function KontaktPage() {
  const studio = await getStudio();

  return (
    <section className="py-20">
      <Container className="grid gap-14 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Kontakt <span className="text-lime">aufnehmen</span>
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Fragen zu EMS-Training, unseren Preisen oder deinem Probetermin?
            Wir freuen uns auf deine Nachricht.
          </p>

          {studio && (
            <ul className="mt-10 space-y-4 text-sm">
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
                <Mail size={18} className="mt-0.5 shrink-0 text-lime" />
                <a href={`mailto:${studio.email}`} className="hover:underline">
                  {studio.email}
                </a>
              </li>
            </ul>
          )}
        </div>

        <ContactForm />
      </Container>
    </section>
  );
}
