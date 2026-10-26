/**
 * Kurze Videos (Reels) aus den eigenen Studios.
 *
 * Quelle: die Reels von Instagram/TikTok, vom Betreiber bereitgestellt
 * (Oktober 2026). Für die Website auf 720 px Breite neu kodiert, je
 * 1-3 MB, als WebM und MP4; liegen in public/videos samt Standbild.
 *
 * Bewusst NICHT verwendet:
 * - "EMS vs Gym": Vergleiche mit Fitnessstudios ziehen wir nicht mehr.
 * - "Fakt oder Fake": enthält Gesundheitsaussagen ("EMS mit Vorerkrankung
 *   geht"), die die Website sonst nirgends macht - erst nach Prüfung.
 *
 * Die Untertitel sind ins Bild gebrannt: Die Videos laufen stumm und
 * verständlich, Ton gibt es auf Antippen.
 */

export type Reel = {
  id: string;
  titel: string;
  /** Eine Zeile darunter - was man im Video sieht. */
  text: string;
  /** Dasselbe für die englische Seite. Das Video selbst bleibt deutsch. */
  titelEn: string;
  textEn: string;
  /** Ohne Endung: Es gibt /videos/x.webm (VP9, kleiner) und /videos/x.mp4
      (H.264, für Safari) - der Browser nimmt, was er kann. */
  src: string;
  poster: string;
};

export const REELS = {
  weste: {
    id: "weste",
    titel: "Was macht diese Weste?",
    text: "Eine Trainerin zeigt Weste, Impulse und Gerät.",
    titelEn: "What does this vest do?",
    textEn: "A trainer shows the vest, the impulses and the device.",
    src: "/videos/weste",
    poster: "/videos/weste.jpg",
  },
  emsErklaert: {
    id: "ems-erklaert",
    titel: "EMS in 15 Sekunden",
    text: "Was beim Training passiert - kurz erklärt.",
    titelEn: "EMS in 15 seconds",
    textEn: "What happens during training - explained briefly.",
    src: "/videos/ems-erklaert",
    poster: "/videos/ems-erklaert.jpg",
  },
  mitglieder: {
    id: "mitglieder",
    titel: "Wir kennen unsere Mitglieder",
    text: "Ankommen, begrüßt werden, loslegen.",
    titelEn: "We know our members",
    textEn: "Arrive, get a warm welcome, get started.",
    src: "/videos/mitglieder",
    poster: "/videos/mitglieder.jpg",
  },
  keineZeit: {
    id: "keine-zeit",
    titel: "Keine Zeit für Sport?",
    text: "Ein Trainer über Training, wenn der Kalender voll ist.",
    titelEn: "No time for exercise?",
    textEn: "A trainer on training when your calendar is full.",
    src: "/videos/keine-zeit",
    poster: "/videos/keine-zeit.jpg",
  },
  ruecken: {
    id: "ruecken",
    titel: "Mit 20 schon Rücken?",
    text: "Ein Trainer über Sitzen, Haltung und Rumpf.",
    titelEn: "Back trouble at 20?",
    textEn: "A trainer on sitting, posture and your core.",
    src: "/videos/ruecken",
    poster: "/videos/ruecken.jpg",
  },
} satisfies Record<string, Reel>;

/** Die Reihe auf der Startseite. */
export const REELS_START: Reel[] = [REELS.weste, REELS.mitglieder, REELS.emsErklaert, REELS.keineZeit];
