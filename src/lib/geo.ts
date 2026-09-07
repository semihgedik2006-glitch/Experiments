export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

type Located = { id: string; latitude: number | null; longitude: number | null };

/** Hat wenigstens ein Studio Koordinaten? Dann lohnt die Standortabfrage. */
export function anyStudioLocatable(studios: Located[]): boolean {
  return studios.some((studio) => studio.latitude !== null && studio.longitude !== null);
}

/**
 * Sind für alle Studios Koordinaten hinterlegt?
 *
 * Davon hängt allein die Auszeichnung "Am nächsten" ab. Fehlt sie bei einem
 * einzigen Studio, könnte genau dieses das nächste sein - die Auszeichnung
 * wäre dann eine falsche Aussage über die anderen.
 *
 * Sortiert wird trotzdem: Die Studios mit Koordinaten stehen nach
 * Entfernung, die ohne hängen hinten an. Vorher schaltete eine einzige
 * Lücke die gesamte Sortierung ab - ein vergessenes Zahlenpaar machte die
 * Funktion damit für alle vierzehn Standorte unbrauchbar, ohne dass man den
 * Grund sah.
 */
export function allStudiosLocatable(studios: Located[]): boolean {
  return (
    studios.length > 0 &&
    studios.every((studio) => studio.latitude !== null && studio.longitude !== null)
  );
}

/**
 * Studios nach Entfernung sortiert, das nächste zuerst.
 *
 * Studios ohne Koordinaten behalten ihre ursprüngliche Reihenfolge und
 * landen hinten - sie werden nie als "am nächsten" ausgegeben.
 */
export function sortStudiosByDistance<T extends Located>(
  studios: T[],
  userLat: number,
  userLon: number,
): T[] {
  return studios
    .map((studio, index) => ({
      studio,
      index,
      distance:
        studio.latitude === null || studio.longitude === null
          ? Infinity
          : haversineDistanceKm(userLat, userLon, studio.latitude, studio.longitude),
    }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map((entry) => entry.studio);
}

export function findNearestStudioId<T extends Located>(
  studios: T[],
  userLat: number,
  userLon: number,
): string | null {
  let nearestId: string | null = null;
  let nearestDistance = Infinity;

  for (const studio of studios) {
    if (studio.latitude === null || studio.longitude === null) continue;
    const distance = haversineDistanceKm(userLat, userLon, studio.latitude, studio.longitude);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestId = studio.id;
    }
  }

  return nearestId;
}
