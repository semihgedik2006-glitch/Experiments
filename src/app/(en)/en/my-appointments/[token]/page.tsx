import { meineTermineListeMetadaten, MeineTermineListe } from "@/components/seiten/meine-termine-liste";

export const metadata = meineTermineListeMetadaten("en");

export default async function MyAppointmentsListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <MeineTermineListe sprache="en" token={token} />;
}
