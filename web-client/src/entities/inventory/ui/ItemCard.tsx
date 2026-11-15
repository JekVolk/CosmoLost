import { AssetPlaceholder, RarityBadge } from '@/shared/ui';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import type { InventoryItem } from '../api/inventory-repository';

export interface ItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
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
          <AssetPlaceholder label="Artifact asset pending" height="140px" />
        )}
      </Box>

      <VStack align="start" gap={1}>
        <RarityBadge rarity={item.rarity} size="xs" />
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
