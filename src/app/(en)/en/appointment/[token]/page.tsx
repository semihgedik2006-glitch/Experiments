import { terminMetadaten, TerminSeite } from "@/components/seiten/termin";

export const metadata = terminMetadaten("en");

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TerminSeite sprache="en" token={token} />;
}
