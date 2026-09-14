import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { istProduktion } from "@/lib/basisadresse";

export default function robots(): MetadataRoute.Robots {
  // Eine Vorschau-Bereitstellung trägt denselben Text wie die echte Seite,
  // nur unter anderer Adresse. Findet ein Suchdienst sie, steht derselbe
  // Inhalt zweimal im Netz - und welche Fassung er für das Original hält,
  // entscheidet dann er. Vorschauen bleiben deshalb komplett draußen, und
  // zwar ohne Sitemap: Eine Sitemap ist eine Einladung.
  if (!istProduktion()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /termin/... gehört jeweils genau einer Person: Name, Telefonnummer
      // und Termin stehen dort. Der Schlüssel im Link ist nicht zu erraten,
      // aber gelangt er einmal in eine Verweisliste oder in ein Formular,
      // soll ihn wenigstens kein Suchdienst einsammeln.
      // /meine-termine/... ist derselbe Fall.
      disallow: ["/admin", "/termin", "/meine-termine/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
