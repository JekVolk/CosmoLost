import React from 'react';
import { Badge } from '@chakra-ui/react';

export type RarityType =
  | 'SCRAP'
  | 'STANDARD'
  | 'SPECIALIZED'
  | 'PROTOTYPE'
  | 'AUTONOMOUS'
  | 'HISTORIC'
  | 'ANOMALY';

const RARITY_MAP: Record<RarityType, { label: string; colorScheme: string }> = {
  SCRAP: { label: 'Scrap', colorScheme: 'gray' },
  STANDARD: { label: 'Standard', colorScheme: 'slate' },
  SPECIALIZED: { label: 'Specialized', colorScheme: 'green' },
  PROTOTYPE: { label: 'Prototype', colorScheme: 'blue' },
  AUTONOMOUS: { label: 'Autonomous', colorScheme: 'purple' },
  HISTORIC: { label: 'Historic', colorScheme: 'yellow' },
  ANOMALY: { label: 'Anomaly', colorScheme: 'red' },
};

export const RarityBadge: React.FC<{ rarity: RarityType }> = ({ rarity }) => {
  const info = RARITY_MAP[rarity] || { label: rarity, colorScheme: 'gray' };
  return (
    <Badge colorPalette={info.colorScheme} variant="subtle" size="sm">
      {info.label}
    </Badge>
  );
};
