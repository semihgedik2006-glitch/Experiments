import type { ZielWert } from "@/lib/ziel-inhalte";

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
  kurz: string;
  antwort: string;
  erkennst: string[];
  soArbeiten: { titel: string; text: string }[];
  hinweis: string;
};

export const GOALS_EN: readonly GoalContent[] = [
  {
    wert: "ruecken",
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
];
