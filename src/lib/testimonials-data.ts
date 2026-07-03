// ⚠️ Platzhalter-Testimonials zur Veranschaulichung des Layouts.
// Vor dem Livegang unbedingt durch echte Kundenstimmen (mit Einverständnis!)
// ersetzen - erfundene Bewertungen sind wettbewerbsrechtlich unzulässig.

export type Testimonial = {
  name: string;
  age: number;
  goal: string;
  quote: string;
  rating: number;
  months: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sandra K.",
    age: 42,
    goal: "Rückengesundheit",
    quote:
      "Nach Jahren mit Rückenschmerzen vom Bürojob habe ich EMS ausprobiert. Schon nach wenigen Wochen saß ich spürbar aufrechter - und die 20 Minuten passen sogar in meine Mittagspause.",
    rating: 5,
    months: 8,
  },
  {
    name: "Michael B.",
    age: 55,
    goal: "Muskelaufbau",
    quote:
      "Ich dachte, für richtiges Krafttraining wäre ich zu spät dran. Falsch gedacht. Die Trainer holen mich genau da ab, wo ich stehe, und die Betreuung ist wirklich 1:1.",
    rating: 5,
    months: 14,
  },
  {
    name: "Julia W.",
    age: 34,
    goal: "Abnehmen & Straffung",
    quote:
      "Zwei Kinder, Vollzeitjob - klassisches Fitnessstudio war unmöglich. Einmal pro Woche Körperformen ist machbar, und die Ergebnisse sieht man. Meine Jeans von vor fünf Jahren passt wieder.",
    rating: 5,
    months: 10,
  },
  {
    name: "Thomas R.",
    age: 61,
    goal: "Fit bleiben",
    quote:
      "Gelenkschonend war für mich das entscheidende Argument. Kein Gewichte-Schleppen, kein Knie-Ärger - trotzdem fühle ich mich kräftiger als vor zehn Jahren.",
    rating: 5,
    months: 22,
  },
  {
    name: "Aylin D.",
    age: 29,
    goal: "Haltung & Kraft",
    quote:
      "Die erste Einheit war ein komisches Kribbeln, danach wurde es mein Termin der Woche. Man wird persönlich begrüßt, nichts ist anonym - das gibt es in keinem normalen Studio.",
    rating: 5,
    months: 6,
  },
  {
    name: "Frank L.",
    age: 48,
    goal: "Stressausgleich",
    quote:
      "20 Minuten, komplett ausgepowert, Kopf frei. Effizienter kann Training nicht sein. Und der Muskelkater nach der ersten Woche hat mir gezeigt, dass da wirklich was passiert.",
    rating: 5,
    months: 12,
  },
];
