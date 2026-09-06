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

/**
 * Sind für alle Studios Koordinaten hinterlegt?
 *
 * Nur dann lässt sich überhaupt sagen, welches das nächste ist. Fehlen sie
 * bei einem einzigen, wäre jede Aussage dazu falsch: Das Studio ohne
 * Koordinaten kann nicht gewinnen, egal wie nah es tatsächlich liegt.
 * Genau das ist vorher passiert - ein neu angelegtes Studio ohne
 * Koordinaten wurde stillschweigend übergangen, und ein weiter entferntes
 * bekam die Auszeichnung "Am nächsten".
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
