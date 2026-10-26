import { PreiseSeite, preiseMetadaten } from "@/components/seiten/preise";

export const metadata = preiseMetadaten("en");

export default function PricesPage() {
  return <PreiseSeite sprache="en" />;
}
