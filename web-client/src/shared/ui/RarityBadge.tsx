import { Badge, type BadgeProps, HStack, Image } from '@chakra-ui/react';
import { getRarityBadgeIconUrl } from '../lib/assets';

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
  showIcon?: boolean;
}

export function RarityBadge({ rarity, showIcon = true, ...props }: RarityBadgeProps) {
  const normalized = rarity.toUpperCase();
  const palette = RARITY_PALETTES[normalized] ?? 'gray';
  const colorToken = RARITY_COLORS[normalized] ?? 'gray.500';
  const iconUrl = getRarityBadgeIconUrl(normalized);

  return (
    <Badge colorPalette={palette} borderColor={colorToken} data-rarity={normalized} {...props}>
      <HStack gap={1.5} display="inline-flex" alignItems="center">
        {showIcon && (
          <Image
            src={iconUrl}
            alt=""
            width="12px"
            height="12px"
            objectFit="contain"
            aria-hidden="true"
          />
        )}
        <span>{rarity}</span>
      </HStack>
    </Badge>
  );
}
