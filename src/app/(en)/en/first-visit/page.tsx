import { ErsterBesuchSeite, ersterBesuchMetadaten } from "@/components/seiten/erster-besuch";

export const metadata = ersterBesuchMetadaten("en");

export default function FirstVisitPage() {
  return <ErsterBesuchSeite sprache="en" />;
}
