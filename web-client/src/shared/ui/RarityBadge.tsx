import { Badge, type BadgeProps } from '@chakra-ui/react';

export const RARITY_COLORS: Record<string, string> = {
  SCRAP: 'gray.500',
  STANDARD: 'gray.200',
  SPECIALIZED: 'green.500',
  PROTOTYPE: 'blue.500',
  AUTONOMOUS: 'purple.500',
  HISTORIC: 'yellow.500',
  ANOMALY: 'red.500',
};

export const RARITY_PALETTES: Record<string, string> = {
  SCRAP: 'gray',
  STANDARD: 'gray',
  SPECIALIZED: 'green',
  PROTOTYPE: 'blue',
  AUTONOMOUS: 'purple',
  HISTORIC: 'yellow',
  ANOMALY: 'red',
};

export interface RarityBadgeProps extends BadgeProps {
  rarity: string;
}

export function RarityBadge({ rarity, ...props }: RarityBadgeProps) {
  const normalized = rarity.toUpperCase();
  const palette = RARITY_PALETTES[normalized] ?? 'gray';
  const colorToken = RARITY_COLORS[normalized] ?? 'gray.500';

  return (
    <Badge colorPalette={palette} borderColor={colorToken} data-rarity={normalized} {...props}>
      {rarity}
    </Badge>
  );
}
