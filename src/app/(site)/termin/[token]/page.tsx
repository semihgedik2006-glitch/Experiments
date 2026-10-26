import { terminMetadaten, TerminSeite } from "@/components/seiten/termin";

export const metadata = terminMetadaten("de");

export default async function TerminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TerminSeite sprache="de" token={token} />;
}
