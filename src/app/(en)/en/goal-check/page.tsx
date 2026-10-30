import { ZielCheckSeite, zielCheckMetadaten } from "@/components/seiten/ziel-check";

export const metadata = zielCheckMetadaten("en");

export default function GoalCheckPage() {
  return <ZielCheckSeite sprache="en" />;
}
