import { meineTermineMetadaten, MeineTermineSeite } from "@/components/seiten/meine-termine";

export const metadata = meineTermineMetadaten("de");

export default function MeineTerminePage() {
  return <MeineTermineSeite sprache="de" />;
}
