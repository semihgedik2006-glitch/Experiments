/**
 * Der Standort, wie man ihn nennt: "Köln Longerich", "Brühl", "Rösrath".
 *
 * Nicht die Stadt allein - acht der vierzehn Studios liegen in Köln, und
 * achtmal "Köln" untereinander sagt niemandem, welches gemeint ist. Der
 * Studioname trägt den Stadtteil schon; davor steht nur die Marke.
 */
export function ortsname(name: string, city: string): string {
  const ohneMarke = name.replace(/^\s*Körperformen\s+/i, "").trim();
  return ohneMarke || city;
}
