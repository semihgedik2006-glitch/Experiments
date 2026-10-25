import { ErsterBesuchSeite, ersterBesuchMetadaten } from "@/components/seiten/erster-besuch";

export const metadata = ersterBesuchMetadaten("de");

export default function FirstVisitPage() {
  return <ErsterBesuchSeite sprache="de" />;
}
