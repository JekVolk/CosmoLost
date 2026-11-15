export type PlanetId = 'mars' | 'moon';

export type ArtifactStatus = 'silent' | 'lost' | 'historic' | 'operational' | 'crashed';

export type ArtifactType =
  | 'rover'
  | 'helicopter'
  | 'lander'
  | 'descent_stage'
  | 'retro_reflector'
  | 'instrument'
  | 'impact_stage'
  | 'sample_depot'
  | 'entry_debris';

export type OperationalStatus =
  | 'DORMANT'
  | 'PASSIVE_ACTIVE'
  | 'DESTROYED_FOR_SCIENCE'
  | 'HISTORIC'
  | 'SILENT'
  | 'LOST';

export interface TraverseWaypoint {
  solOrStep: number;
  lat: number;
  lon: number;
  elevationM?: number;
  odometryM?: number;
  title: string;
  storySnippet?: string;
}

export interface ScientificInstrument {
  acronym: string;
  fullName: string;
  purpose: string;
  discovery: string;
}

export interface LastTelemetryRecord {
  powerWh?: number;
  powerInitialWh?: number;
  dustTau?: number;
  tempC?: number;
  pitchDeg?: number;
  rollDeg?: number;
  finalSol?: number;
  finalSignalDate?: string;
  finalQuoteOrSignal?: string;
}

export interface SpaceArtifact {
  id: string;
  name: string;
  mission: string;
  nssdcaId?: string;
  agency: string;
  country: string;
  type: ArtifactType;
  status: ArtifactStatus;
  operationalStatus?: OperationalStatus;
  statusLabel: string;
  lat: number;
  lon: number;
  massKg?: number;
  powerSource?: 'SOLAR' | 'RTG' | 'BATTERY' | 'PASSIVE';
  landingDate: string;
  lastContactDate?: string;
  operationalDays?: number;
  distanceTraveledKm?: number;
  locationName: string;
  brief: string;
  description: string;
  whyAbandoned: string;

  firstPersonMonologue?: string;
  howItWorked?: string;
  scienceLegacy?: string;
  orbitalSpottedBy?: string;
  keyInstruments?: ScientificInstrument[];
  lastTelemetry?: LastTelemetryRecord;
  traversePath?: TraverseWaypoint[];

  keyFacts: string[];
  imageUrl?: string;
  orbitalImageUrl?: string;
  audioTitle?: string;
  audioDescription?: string;
  nasaPiaId?: string;
  badgeColor?: string;
  model3dName?: string;
  model3dUrl?: string;
}

export interface PlanetTelemetry {
  designation: string;
  type: string;
  radiusKm: number;
  surfaceGravity: string;
  mass: string;
  dayLength: string;
  orbitPeriod: string;
  avgTemperature: string;
  tempRange: string;
  atmosphere: string;
  distanceFromEarth: string;
}

export interface PlanetConfig {
  id: PlanetId;
  name: string;
  nameEn: string;
  title: string;
  symbol: string;
  tagline: string;
  colorMap: string;
  bumpMap: string;
  bumpScale: number;
  roughness: number;
  metalness: number;
  radius: number;
  rotationSpeed: number;
  axialTiltDeg: number;
  atmosphere?: {
    color: string;
    glowColor: string;
    intensity: number;
  };
  telemetry: PlanetTelemetry;
  artifacts: SpaceArtifact[];
}
