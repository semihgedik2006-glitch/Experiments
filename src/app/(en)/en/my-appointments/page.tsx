import { meineTermineMetadaten, MeineTermineSeite } from "@/components/seiten/meine-termine";

export const metadata = meineTermineMetadaten("en");

export default function MyAppointmentsPage() {
  return <MeineTermineSeite sprache="en" />;
}
