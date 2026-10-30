import type { AbschnittKey, ZielWert } from "@/lib/ziel-inhalte";

/**
 * Die Ziele auf Englisch - für /en.
 *
 * Dieselben Ziele und dieselbe Haltung wie in @/lib/ziel-inhalte: Es wird
 * beschrieben, wie trainiert wird, nicht was dabei herauskommt. Die
 * Bezeichnungen ("kurz") sind dieselben wie im englischen Formular
 * (@/lib/sprache), damit oben und unten dasselbe Wort steht.
 */

export type GoalContent = {
  wert: ZielWert;
  titel: [string, string];
  knopf: string;
  seite: { titel: string; beschreibung: string };
  /** Englische Stichworte - die Fragen und Artikel auf /en sind englisch. */
  stichworte: string[];
  /** Nur wenn sie von der deutschen abweichen soll - sonst dieselbe. */
  reihenfolge?: AbschnittKey[];
  kurz: string;
  antwort: string;
  erkennst: string[];
  soArbeiten: { titel: string; text: string }[];
  hinweis: string;
};

export const GOALS_EN: readonly GoalContent[] = [
  {
    wert: "ruecken",
    titel: ["A back that keeps up", "with your day."],
    knopf: "Trial session for your back",
    seite: {
      titel: "EMS training for a strong back in Cologne",
      beschreibung:
        "Strengthen your back with EMS training: 20 minutes a week, a personal trainer, focus on back and core. {studios} in and around Cologne - free trial session.",
    },
    stichworte: ["back", "joint", "complaint", "safe", "suitable"],
    kurz: "Strengthen my back",
    antwort: "Your trainer puts the focus on your back and core – at an intensity that suits your back.",
    erkennst: [
      "You sit most of the day – at a desk, in the car, on the sofa.",
      "You notice your back more in the evening than in the morning.",
      "You want to do something, but you are not sure what is right for you.",
    ],
    soArbeiten: [
      { titel: "Back and core first", text: "The impulses also reach deep muscles that are hard to target with ordinary exercises." },
      { titel: "No heavy weights", text: "No extra load on your spine – just your own movement plus the impulse." },
      { titel: "Careful where it matters", text: "Your lower back starts gently. Your trainer only increases the intensity when it feels right." },
    ],
    hinweis: "Acute pain? We check with you before your first session whether EMS is right for you.",
  },
  {
    wert: "straffen",
    titel: ["More shape. More tone.", "More you."],
    knopf: "Trial session for more shape",
    seite: {
      titel: "EMS training to tone and shape in Cologne",
      beschreibung:
        "Tone and shape with EMS training: your trainer sets tummy, glutes, legs and arms individually. 20 minutes a week at {studios} in and around Cologne.",
    },
    stichworte: ["result", "tone", "defin", "muscle", "shape"],
    kurz: "Tone and shape",
    antwort: "Your trainer turns up the intensity where you want more tone – tummy, glutes, legs or arms.",
    erkennst: [
      "You do not quite feel at home in your body anymore.",
      "Certain areas bother you – and you know exactly which ones.",
      "You want a more defined look without turning your life upside down.",
    ],
    soArbeiten: [
      { titel: "Your zones first", text: "You tell us what bothers you. Your trainer sets exactly those muscle groups stronger." },
      { titel: "Lots of muscle, little time", text: "Many muscle groups work at once – in 20 minutes of training a week." },
      { titel: "Grows with you", text: "As it gets easier, it gets more intense. Your trainer adjusts the settings every session." },
    ],
    hinweis: "How fast you see changes also depends on nutrition and everyday life. Your trainer talks both through with you.",
  },
  {
    wert: "abnehmen",
    titel: ["Sticking with it has never", "been this easy."],
    knopf: "Trial session to lose weight",
    seite: {
      titel: "Lose weight with EMS training in Cologne",
      beschreibung:
        "Lose weight with EMS training: one fixed appointment a week, a trainer who keeps you on track, nutrition advice on request. {studios} in and around Cologne.",
    },
    stichworte: ["weight", "nutrition", "result", "cost"],
    kurz: "Lose weight",
    antwort: "A fixed appointment, a trainer who expects you – and nutrition advice if you want it.",
    erkennst: [
      "You have tried a lot and never stuck with it for long.",
      "You do not lack willpower – you lack time and someone who keeps you on track.",
      "You want to feel good again – in your clothes and on the move.",
    ],
    soArbeiten: [
      { titel: "Sticking with it, made easy", text: "One fixed appointment a week and a trainer who knows you. People who are expected show up." },
      { titel: "Big muscle groups at work", text: "Legs, glutes, back and core all work at the same time." },
      { titel: "Nutrition on request", text: "Weight loss is also decided in the kitchen. If you want, we advise you there too." },
    ],
    hinweis: "We do not promise kilos. We promise you will not have to stick with it alone.",
  },
  {
    wert: "muskelaufbau",
    titel: ["Getting stronger,", "week by week."],
    knopf: "Trial session for more strength",
    seite: {
      titel: "Build muscle with EMS training in Cologne",
      beschreibung:
        "Build muscle with EMS training: every muscle group set individually, clean technique with a trainer, 20 minutes a week. {studios} in and around Cologne.",
    },
    stichworte: ["muscle", "often", "result", "beginner"],
    kurz: "Build muscle",
    antwort: "Your trainer sets each muscle group individually and raises the intensity with you – week by week.",
    erkennst: [
      "You want to get stronger but have little experience with strength training.",
      "You want to do it properly, not just by feel.",
      "You want strength for everyday life – carrying, lifting, stairs, kids.",
    ],
    soArbeiten: [
      { titel: "Every muscle group on its own", text: "Eight zones, eight settings. Your trainer pushes where you want to get stronger." },
      { titel: "Clean technique", text: "Your trainer stands next to you and watches every movement – from the very first session." },
      { titel: "Progress with a plan", text: "Settings are adjusted every session, so your muscles keep getting a new stimulus." },
    ],
    hinweis: "Muscles grow during recovery – so your trainer plans enough rest between sessions.",
  },
  {
    wert: "fitness",
    titel: ["Stairs, shopping, kids –", "easy again."],
    knopf: "Trial session for more fitness",
    seite: {
      titel: "Fitter in everyday life with EMS training in Cologne",
      beschreibung:
        "Fitter in everyday life with EMS training: 20 minutes a week, whole body, your trainer plans everything. {studios} in and around Cologne - try it free now.",
    },
    stichworte: ["often", "beginner", "time", "work", "bring"],
    kurz: "Fitter in everyday life",
    antwort: "20 minutes once a week, set up by your trainer – so everyday life feels easier again.",
    erkennst: [
      "Stairs, shopping, carrying kids – everything feels harder than it used to.",
      "You want to do something for yourself, but your calendar is full.",
      "You are looking for something you will actually stick with.",
    ],
    soArbeiten: [
      { titel: "Whole body, one session", text: "All eight zones work at the same time – balanced for your everyday life." },
      { titel: "Fits any week", text: "20 minutes of training, one fixed appointment, studios all around Cologne." },
      { titel: "Nothing to plan", text: "Your trainer knows where you are and sets everything up. You come and train." },
    ],
    hinweis: "Not sure what your goal is? Your trainer works it out with you at the trial session.",

  },
  {
    wert: "gelenke",
    titel: ["Get stronger without", "loading your joints."],
    knopf: "Joint-friendly trial session",
    seite: {
      titel: "Joint-friendly EMS training in Cologne",
      beschreibung:
        "Joint-friendly training with EMS: no heavy weights, no jumping, a personal trainer and 20 minutes a week. {studios} in and around Cologne - try it free now.",
    },
    stichworte: ["joint", "knee", "hip", "safe", "suitable", "complaint", "weight"],
    kurz: "Go easy on my joints",
    antwort: "No weights, no jumping: your trainer strengthens the muscles around your joints – with movements that feel right for you.",
    erkennst: [
      "Your knees or hips complain when you think of dumbbells or jogging.",
      "You want to get stronger without putting extra load on your joints.",
      "You are over 40 and looking for training that suits your body.",
    ],
    soArbeiten: [
      { titel: "No extra load", text: "No dumbbells, no jumping. Your muscles work through the impulse – your joints carry no extra weight." },
      { titel: "Muscles that support", text: "Legs, glutes and core are targeted – the muscles that guide your joints in everyday life." },
      { titel: "Built up slowly", text: "Your trainer starts gently and only increases once it feels right for you." },
    ],
    hinweis: "Do you have arthritis, an artificial joint or acute complaints? Please clear the training with your doctor first – your trainer asks about this in the health check anyway.",
  },
];

/**
 * Die englischen Kennungen der Zielseiten (/en/goal/back statt
 * /en/goal/ruecken). Dieselben stehen in @/lib/i18n/pfade.
 */
export const ZIEL_SLUG_EN: Record<ZielWert, string> = {
  ruecken: "back",
  straffen: "toning",
  abnehmen: "weight-loss",
  muskelaufbau: "muscle",
  fitness: "fitness",
  gelenke: "joints",
};

export function zielAusSlugEn(slug: string): ZielWert | undefined {
  return (Object.keys(ZIEL_SLUG_EN) as ZielWert[]).find((wert) => ZIEL_SLUG_EN[wert] === slug);
}
