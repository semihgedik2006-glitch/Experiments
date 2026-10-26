import { meineTermineListeMetadaten, MeineTermineListe } from "@/components/seiten/meine-termine-liste";

export const metadata = meineTermineListeMetadaten("de");

export default async function MeineTermineSeite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <MeineTermineListe sprache="de" token={token} />;
}
