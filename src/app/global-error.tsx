"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

/**
 * Das letzte Netz.
 *
 * error.tsx fängt die Seiten ab, aber ausdrücklich nicht das Layout
 * neben sich. Scheitert also das Wurzel-Layout, greift nur noch diese
 * Datei - und sie ersetzt dabei das gesamte Dokument, muss <html> und
 * <body> also selbst mitbringen.
 *
 * Daraus folgt der ungewöhnliche Teil: Die Farben stehen hier direkt im
 * Element und nicht in Klassen. Wenn das Layout nicht lädt, ist nicht
 * garantiert, dass das Stylesheet mitkommt - und eine Fehlerseite, die
 * ihrerseits kaputt aussieht, ist keine. Dieselben Werte wie in
 * globals.css, nur eben fest eingetragen.
 *
 * Hierher kommt man im Alltag praktisch nie. Genau deshalb muss es
 * stehen: Die eine Gelegenheit, bei der es zählt, ist keine, bei der
 * jemand danebensitzt.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Schwerer Fehler:", error);
  }, [error]);

  const telefon = siteConfig.contact.phone;

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#fcfbf8",
          color: "#171914",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          lineHeight: 1.6,
        }}
      >
        {/* Kein metadata-Export möglich - Fehlergrenzen sind
            Client-Komponenten. React setzt Titel und Angaben für
            Suchdienste über diese Elemente. noindex, damit eine Panne
            nicht als Inhalt der Seite im Suchindex landet. */}
        <title>Körperformen - kurz nicht erreichbar</title>
        <meta name="robots" content="noindex, nofollow" />

        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#527012",
            }}
          >
            Körperformen
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "1.75rem",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Die Seite lädt gerade nicht.
          </h1>
          <p style={{ margin: "1rem 0 0", color: "#61645a" }}>
            Das liegt an uns, nicht an dir. Ruf uns an &ndash; oder versuch es
            gleich noch einmal.
          </p>

          <div
            style={{
              margin: "2rem 0 0",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <a
              href={`tel:${telefon.replace(/\s/g, "")}`}
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                backgroundColor: "#8cb92c",
                color: "#12160b",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              {telefon}
            </a>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "1px solid #e7e4da",
                backgroundColor: "transparent",
                color: "inherit",
                font: "inherit",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Nochmal versuchen
            </button>
          </div>

          {error.digest && (
            <p style={{ margin: "2.5rem 0 0", fontSize: "0.75rem", color: "#61645a" }}>
              Kennung für Rückfragen:{" "}
              <span style={{ fontFamily: "ui-monospace, monospace" }}>{error.digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
