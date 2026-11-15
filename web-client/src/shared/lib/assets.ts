/**
 * Asset paths and resolver utilities for CosmoLost UI icons and badges.
 */

export const CONTAINER_ICONS = {
  locked: '/assets/icons/containers/container_slot_locked.png',
  standard: '/assets/icons/containers/container_standard.png',
  scientific: '/assets/icons/containers/container_scientific.png',
  deep_space: '/assets/icons/containers/container_deep_space.png',
  alien_anomaly: '/assets/icons/containers/container_alien_anomaly.png',
} as const;

export const RARITY_BADGE_ICONS: Record<string, string> = {
  SCRAP: '/assets/icons/rarities/badge_scrap.svg',
  STANDARD: '/assets/icons/rarities/badge_standard.svg',
  SPECIALIZED: '/assets/icons/rarities/badge_specialized.svg',
  PROTOTYPE: '/assets/icons/rarities/badge_prototype.svg',
  AUTONOMOUS: '/assets/icons/rarities/badge_autonomous.svg',
  HISTORIC: '/assets/icons/rarities/badge_historic.svg',
  ANOMALY: '/assets/icons/rarities/badge_anomaly.svg',
};

export const EQUIPMENT_ICONS: Record<string, string> = {
  power: '/assets/icons/equipment/eq_power.svg',
  optics: '/assets/icons/equipment/eq_optics.svg',
  chassis: '/assets/icons/equipment/eq_chassis.svg',
  sensors: '/assets/icons/equipment/eq_sensors.svg',
  comms: '/assets/icons/equipment/eq_comms.svg',
  manipulators: '/assets/icons/equipment/eq_manipulators.svg',
};

export const RP_TOKEN_ICON_URL = '/assets/icons/currency/rp_token_small.png';
export const ELO_RANK_CADET_ICON_URL = '/assets/icons/currency/elo_rank_cadet.svg';

/**
 * Resolves container icon path based on container type name or locked status.
 */
export function getContainerIconUrl(containerType?: string | null, isLocked = false): string {
  if (isLocked || !containerType) {
    return CONTAINER_ICONS.locked;
  }

  const normalized = containerType.toLowerCase();
  if (normalized.includes('alien') || normalized.includes('anomaly')) {
    return CONTAINER_ICONS.alien_anomaly;
  }
  if (normalized.includes('deep') || normalized.includes('historic')) {
    return CONTAINER_ICONS.deep_space;
  }
  if (normalized.includes('scient') || normalized.includes('special')) {
    return CONTAINER_ICONS.scientific;
  }

  return CONTAINER_ICONS.standard;
}

/**
 * Resolves rarity badge SVG icon URL.
 */
export function getRarityBadgeIconUrl(rarity: string): string {
  const norm = (rarity || 'standard').toUpperCase();
  return RARITY_BADGE_ICONS[norm] || RARITY_BADGE_ICONS.STANDARD;
}

/**
 * Resolves equipment class SVG icon URL.
 */
export function getEquipmentIconUrl(equipmentClass: string): string {
  const norm = (equipmentClass || '').toLowerCase();
  for (const [key, path] of Object.entries(EQUIPMENT_ICONS)) {
    if (norm.includes(key)) {
      return path;
    }
  }
  return EQUIPMENT_ICONS.power;
}
