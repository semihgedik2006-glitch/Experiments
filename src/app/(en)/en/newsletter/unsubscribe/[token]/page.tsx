import { abmeldenMetadaten, NewsletterAbmeldenSeite } from "@/components/seiten/newsletter-abmelden";

export const metadata = abmeldenMetadaten("en");

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <NewsletterAbmeldenSeite sprache="en" token={token} />;
}
