import * as THREE from 'three';

export interface LatLon {
  lat: number;
  lon: number;
}

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export function normalizeLongitude(lon: number): number {
  return (((lon % 360) + 540) % 360) - 180;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm = 3389.5,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const nLon1 = normalizeLongitude(lon1);
  const nLon2 = normalizeLongitude(lon2);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(nLon2 - nLon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

export function calculateAstroGuessrScore(distanceKm: number): number {
  return Math.max(0, Math.round(100 * Math.exp(-distanceKm / 50)));
}
