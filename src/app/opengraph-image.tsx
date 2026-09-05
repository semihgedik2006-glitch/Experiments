import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/site-config";

/**
 * Vorschaubild für geteilte Links.
 *
 * Bisher war zwar eine Karte vom Typ "summary_large_image" angemeldet, aber
 * kein Bild hinterlegt - beim Teilen in WhatsApp, Instagram oder Facebook
 * erschien deshalb nur ein grauer Kasten. Das Bild wird beim Bauen einmal
 * erzeugt, es entsteht also keine Last im Betrieb.
 */

export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const archivo = await readFile(join(process.cwd(), "src/app/_assets/archivo-800.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Dieselbe dunkle Grundfläche wie die dunklen Abschnitte der Seite.
          backgroundColor: "#161a14",
          padding: "72px 80px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#c3f53c",
            }}
          >
            EMS-Studio in Hürth
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 92,
              lineHeight: 1.05,
              color: "#f4f2ea",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>20 Minuten Training.</span>
            <span style={{ color: "#c3f53c" }}>Ein sichtbarer Unterschied.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #333a2e",
            paddingTop: 34,
            fontSize: 30,
            color: "#a3a89b",
          }}
        >
          <span style={{ color: "#f4f2ea" }}>{siteConfig.name}</span>
          <span>Kostenloses Probetraining</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Archivo", data: archivo, style: "normal", weight: 800 }],
    },
  );
}
