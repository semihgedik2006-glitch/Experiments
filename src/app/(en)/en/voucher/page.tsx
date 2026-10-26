import { GutscheinSeite, gutscheinMetadaten } from "@/components/seiten/gutschein";

export function generateMetadata() {
  return gutscheinMetadaten("en");
}

export default function VoucherPage() {
  return <GutscheinSeite sprache="en" />;
}
