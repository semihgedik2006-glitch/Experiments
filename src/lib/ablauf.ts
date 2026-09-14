/**
 * Wie eine Einheit abläuft und wann wir auf EMS verzichten.
 *
 * Beides stand bisher nur auf /ems-training. Gebraucht wird es aber auch
 * dort, wo tatsächlich gebucht wird - wer einen Herzschrittmacher trägt,
 * soll das vor dem Absenden lesen und nicht zwei Seiten weiter.
 *
 * Deshalb hier und nicht zweimal im Quelltext: Zwei Fassungen desselben
 * Ablaufs laufen mit der Zeit auseinander, und dann stimmt eine von
 * beiden nicht mehr.
 */

export type Schritt = {
  step: string;
  text: string;
  duration: string;
};

export const ABLAUF_EINHEIT: Schritt[] = [
  {
    step: "Check-in & Gesundheitscheck",
    text: "Beim ersten Besuch klären wir deine Ziele und deinen Gesundheitszustand - damit das Training sicher zu dir passt.",
    duration: "5 Min",
  },
  {
    step: "Funktionswäsche & Weste anlegen",
    text: "Du bekommst Funktionsunterwäsche von uns. Die Trainerin legt dir die EMS-Weste an und verbindet sie mit dem Impulsgerät.",
    duration: "5 Min",
  },
  {
    step: "Impulse einstellen",
    text: "Jede Muskelgruppe wird einzeln angesteuert und individuell dosiert - du bestimmst mit, was sich gut anfühlt.",
    duration: "3 Min",
  },
  {
    step: "Das Training",
    text: "Einfache Übungen wie Kniebeugen oder Ausfallschritte - die Impulse kommen zu jeder Bewegung dazu.",
    duration: "20 Min",
  },
  {
    step: "Cool-down & Feedback",
    text: "Lockeres Ausklingen mit Entspannungsimpulsen, danach kurzes Feedback und Planung der nächsten Einheit.",
    duration: "5 Min",
  },
];

/**
 * Fälle, in denen grundsätzlich nicht trainiert wird.
 *
 * Das ist keine Werbung und keine Beratung, sondern eine Abgrenzung - sie
 * steht deshalb überall im selben Wortlaut. Abgefragt wird sie bewusst
 * nirgends über ein Formular: Angaben zur Gesundheit sind besonders
 * geschützte Daten nach Art. 9 DSGVO (siehe src/lib/ziel.ts). Das Gespräch
 * darüber führt das Studio vor Ort.
 */
export const GEGENANZEIGEN: string[] = [
  "Herzschrittmacher oder andere elektronische Implantate",
  "Schwangerschaft",
  "Akute Erkrankungen, Fieber oder Infekte",
  "Epilepsie",
  "Schwere neurologische Erkrankungen",
  "Akute Thrombose",
];
