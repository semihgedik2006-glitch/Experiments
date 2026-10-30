import { GutscheinSeite, gutscheinMetadaten } from "@/components/seiten/gutschein";

export function generateMetadata() {
  return gutscheinMetadaten("de");
}

export default async function VoucherPage({
  searchParams,
}: {
  searchParams: Promise<{ zahlung?: string }>;
}) {
  // ?zahlung=stripe|digistore: nur für angemeldete Admins, zum Vergleichen.
  const { zahlung } = await searchParams;
  return <GutscheinSeite sprache="de" zahlungVorschau={zahlung ?? null} />;
}
