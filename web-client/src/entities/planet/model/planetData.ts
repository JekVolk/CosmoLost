import type { PlanetConfig } from './types';
import { MARS_ARTIFACTS } from './artifactsMars';
import { MOON_ARTIFACTS } from './artifactsMoon';

export { MARS_ARTIFACTS } from './artifactsMars';
export { MOON_ARTIFACTS } from './artifactsMoon';

export const PLANETS: Record<'mars' | 'moon', PlanetConfig> = {
  mars: {
    id: 'mars',
    name: 'Mars',
    nameEn: 'Mars',
    title: 'The Red Planet',
    symbol: '♂',
    tagline: 'A desert world carved by ancient rivers, harboring humanity\'s legendary rovers, landers, and discarded exploration hardware.',
    colorMap: '/textures/mars_color.jpg',
    bumpMap: '/textures/mars_bump.jpg',
    bumpScale: 1.2,
    roughness: 0.82,
    metalness: 0.03,
    radius: 2.2,
    rotationSpeed: 0.0015,
    axialTiltDeg: 25.19,
    atmosphere: {
      color: '#c85a32',
      glowColor: '#e07046',
      intensity: 0.38,
    },
    telemetry: {
      designation: 'SOL-IV',
      type: 'Terrestrial Planet',
      radiusKm: 3389.5,
      surfaceGravity: '3.72 m/s² (0.38 g)',
      mass: '6.417 × 10²³ kg (0.107 Earths)',
      dayLength: '24h 37m 22s (1 sol)',
      orbitPeriod: '687 Earth days',
      avgTemperature: '-63 °C',
      tempRange: '-140 °C to +20 °C',
      atmosphere: '95.3% CO₂, 2.6% N₂, 1.9% Ar',
      distanceFromEarth: '~225 million km',
    },
    artifacts: MARS_ARTIFACTS,
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    nameEn: 'Moon',
    title: 'Earth\'s Natural Satellite',
    symbol: '☾',
    tagline: 'A half-century archive of human daring: Apollo descent stages, pioneering Soviet Lunokhods, and robotic precursors.',
    colorMap: '/textures/moon_color.jpg',
    bumpMap: '/textures/moon_bump.jpg',
    bumpScale: 2.1,
    roughness: 0.90,
    metalness: 0.02,
    radius: 2.0,
    rotationSpeed: 0.001,
    axialTiltDeg: 1.54,
    telemetry: {
      designation: 'LUNA-I',
      type: 'Natural Satellite',
      radiusKm: 1737.4,
      surfaceGravity: '1.62 m/s² (0.166 g)',
      mass: '7.342 × 10²² kg (0.0123 Earths)',
      dayLength: '27.3 Earth days (tidally locked)',
      orbitPeriod: '27.32 days',
      avgTemperature: '-20 °C',
      tempRange: '-173 °C (night) to +127 °C (day)',
      atmosphere: 'Surface-bound exosphere (vacuum)',
      distanceFromEarth: '~384,400 km',
    },
    artifacts: MOON_ARTIFACTS,
  },
};
