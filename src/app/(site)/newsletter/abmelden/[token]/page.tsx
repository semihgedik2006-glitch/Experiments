import { abmeldenMetadaten, NewsletterAbmeldenSeite } from "@/components/seiten/newsletter-abmelden";

export const metadata = abmeldenMetadaten("de");

export default async function AbmeldenSeite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <NewsletterAbmeldenSeite sprache="de" token={token} />;
}
