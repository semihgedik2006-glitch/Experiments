import { PreiseSeite, preiseMetadaten } from "@/components/seiten/preise";

export const metadata = preiseMetadaten("de");

export default function PreisePage() {
  return <PreiseSeite sprache="de" />;
}
