import type { DeliveryPoint } from '../../../shared/delivery'

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Approximate distance in km (haversine). */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const r = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(a))
}

export function sortPointsNearest(
  points: DeliveryPoint[],
  lat?: number | null,
  lon?: number | null,
): DeliveryPoint[] {
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return [...points]
  }

  return [...points].sort((a, b) => {
    const da =
      a.lat != null && a.lon != null
        ? distanceKm(lat, lon, a.lat, a.lon)
        : Number.POSITIVE_INFINITY
    const db =
      b.lat != null && b.lon != null
        ? distanceKm(lat, lon, b.lat, b.lon)
        : Number.POSITIVE_INFINITY
    return da - db
  })
}
