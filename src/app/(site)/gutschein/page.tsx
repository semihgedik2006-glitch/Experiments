import { GutscheinSeite, gutscheinMetadaten } from "@/components/seiten/gutschein";

export function generateMetadata() {
  return gutscheinMetadaten("de");
}

export default function VoucherPage() {
  return <GutscheinSeite sprache="de" />;
}
