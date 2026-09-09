/**
 * Rechnen mit Kartenkacheln (Web-Mercator).
 *
 * Kartendienste teilen die Welt in quadratische Kacheln zu 256 Pixeln auf.
 * Bei Zoomstufe z gibt es 2^z Kacheln je Richtung. Diese Funktionen
 * übersetzen zwischen Längen-/Breitengrad und Kachelkoordinaten - mit
 * Nachkommastellen, damit sich ein Punkt auch innerhalb einer Kachel
 * genau setzen lässt.
 */

export const KACHEL_PIXEL = 256;

/** Kleinste und größte Zoomstufe, die ausgeliefert wird. */
export const ZOOM_MIN = 9;
export const ZOOM_MAX = 15;

export function kachelX(laenge: number, zoom: number): number {
  return ((laenge + 180) / 360) * 2 ** zoom;
}

export function kachelY(breite: number, zoom: number): number {
  const r = (breite * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** zoom;
}

export type Punkt = { latitude: number; longitude: number };

export type KartenAusschnitt = {
  zoom: number;
  /** Ganze Kacheln, die geladen werden müssen. */
  vonX: number;
  bisX: number;
  vonY: number;
  bisY: number;
  spalten: number;
  zeilen: number;
  /** Der tatsächlich gezeigte Ausschnitt, in Kacheleinheiten. */
  fensterBreite: number;
  fensterHoehe: number;
  /**
   * Verschiebung des Kachelrasters gegenüber dem Fenster, in Prozent der
   * Fensterbreite bzw. -höhe. Negativ, weil das Raster über den sichtbaren
   * Bereich hinausragt.
   */
  versatzX: number;
  versatzY: number;
  /** Breite des Kachelrasters in Prozent der Fensterbreite. */
  rasterBreite: number;
  rasterHoehe: number;
  /** Position eines Punktes im Fenster, in Prozent. */
  position: (punkt: Punkt) => { x: number; y: number };
};

/**
 * Wählt Zoomstufe und Ausschnitt.
 *
 * Zwei Schritte, die man leicht verwechselt: Welche ganzen Kacheln muss der
 * Browser laden, und welchen Teil davon soll man sehen? Ohne die
 * Unterscheidung richtet sich der sichtbare Bereich nach der Kachelgröße -
 * bei vierzehn Studios rund um Köln hieße das eine Karte, die bis in den
 * Westerwald reicht, weil die Kacheln nun einmal so fallen. Deshalb wird
 * auf den Bereich der Standorte zugeschnitten und das Raster darunter
 * entsprechend verschoben.
 *
 * Gesucht wird die feinste Stufe, bei der die Standorte noch in ein Fenster
 * von etwa drei Kachelbreiten passen - je feiner, desto mehr Straßen und
 * Ortsnamen sind beschriftet.
 */
export function ausschnittFuer(punkte: Punkt[], maxFenster = 3): KartenAusschnitt {
  for (let zoom = ZOOM_MAX; zoom >= ZOOM_MIN; zoom--) {
    const xs = punkte.map((p) => kachelX(p.longitude, zoom));
    const ys = punkte.map((p) => kachelY(p.latitude, zoom));

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Rand, damit die äußersten Markierungen nicht am Bildrand kleben -
    // ein Achtel der Ausdehnung, mindestens ein Sechstel einer Kachel.
    const randX = Math.max((maxX - minX) * 0.12, 1 / 6);
    const randY = Math.max((maxY - minY) * 0.12, 1 / 6);

    const fensterVonX = minX - randX;
    const fensterBisX = maxX + randX;
    const fensterVonY = minY - randY;
    const fensterBisY = maxY + randY;

    const fensterBreite = fensterBisX - fensterVonX;
    const fensterHoehe = fensterBisY - fensterVonY;
    if (Math.max(fensterBreite, fensterHoehe) > maxFenster) continue;

    const vonX = Math.floor(fensterVonX);
    const bisX = Math.floor(fensterBisX);
    const vonY = Math.floor(fensterVonY);
    const bisY = Math.floor(fensterBisY);
    const spalten = bisX - vonX + 1;
    const zeilen = bisY - vonY + 1;

    return {
      zoom,
      vonX,
      bisX,
      vonY,
      bisY,
      spalten,
      zeilen,
      fensterBreite,
      fensterHoehe,
      versatzX: ((vonX - fensterVonX) / fensterBreite) * 100,
      versatzY: ((vonY - fensterVonY) / fensterHoehe) * 100,
      rasterBreite: (spalten / fensterBreite) * 100,
      rasterHoehe: (zeilen / fensterHoehe) * 100,
      position: (punkt) => ({
        x: ((kachelX(punkt.longitude, zoom) - fensterVonX) / fensterBreite) * 100,
        y: ((kachelY(punkt.latitude, zoom) - fensterVonY) / fensterHoehe) * 100,
      }),
    };
  }

  // Liegen die Punkte so weit auseinander, dass selbst die gröbste Stufe
  // nicht reicht, wird das Fenster größer zugelassen - lieber ein weiter
  // Ausschnitt als gar keine Karte.
  return ausschnittFuer(punkte, maxFenster * 2);
}
