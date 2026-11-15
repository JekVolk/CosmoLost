import { getEquipmentIconUrl, getRarityBadgeIconUrl } from '@/shared/lib';
import { RarityBadge } from '@/shared/ui';
import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react';
import type { InventoryItem } from '../api/inventory-repository';

export interface ItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const rarityIcon = getRarityBadgeIconUrl(item.rarity);
  const equipmentIcon = getEquipmentIconUrl(item.equipment_class);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.700"
      bg="gray.900"
      overflow="hidden"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { borderColor: 'cyan.500', transform: 'translateY(-2px)' } : undefined}
      transition="all 0.2s ease"
      p={3}
      data-item-id={item.id}
    >
      <Box
        mb={3}
        width="100%"
        height="140px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="rgba(0, 0, 0, 0.3)"
        borderRadius="md"
        p={2}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            maxH="140px"
            maxW="100%"
            objectFit="contain"
          />
        ) : (
          <VStack gap={2} align="center">
            <Image
              src={rarityIcon}
              alt={item.rarity}
              width="64px"
              height="64px"
              objectFit="contain"
            />
            <Text fontSize="2xs" color="gray.500" letterSpacing="wider" textTransform="uppercase">
              {item.equipment_class}
            </Text>
          </VStack>
        )}
      </Box>

      <VStack align="start" gap={1}>
        <HStack justify="space-between" width="100%" align="center">
          <RarityBadge rarity={item.rarity} size="xs" />
          <Image
            src={equipmentIcon}
            alt={item.equipment_class}
            width="14px"
            height="14px"
            opacity={0.7}
          />
        </HStack>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.100"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width="100%"
        >
          {item.name}
        </Text>
        <Text
          fontSize="xs"
          color="gray.400"
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          css={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.description}
        </Text>
      </VStack>
    </Box>
  );
}
