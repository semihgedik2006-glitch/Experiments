import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /termin/... gehört jeweils genau einer Person: Name, Telefonnummer
      // und Termin stehen dort. Der Schlüssel im Link ist nicht zu erraten,
      // aber gelangt er einmal in eine Verweisliste oder in ein Formular,
      // soll ihn wenigstens kein Suchdienst einsammeln.
      disallow: ["/admin", "/termin"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
