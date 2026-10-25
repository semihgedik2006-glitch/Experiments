import { KontaktSeite, kontaktMetadaten } from "@/components/seiten/kontakt";

export const metadata = kontaktMetadaten("de");

export default function ContactPage() {
  return <KontaktSeite sprache="de" />;
}
