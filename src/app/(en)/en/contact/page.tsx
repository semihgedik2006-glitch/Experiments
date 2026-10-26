import { KontaktSeite, kontaktMetadaten } from "@/components/seiten/kontakt";

export const metadata = kontaktMetadaten("en");

export default function ContactPage() {
  return <KontaktSeite sprache="en" />;
}
