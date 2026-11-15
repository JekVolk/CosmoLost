import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useState } from 'react';

interface LocationHintProps {
  mediaUrl?: string;
  hintText?: string;
  planet?: string;
}

export const LocationHint: React.FC<LocationHintProps> = ({
  mediaUrl,
  hintText,
  planet = 'MARS',
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box w="100%" p={4} bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.800">
      <HStack gap={4} alignItems="center">
        {/* Photo preview or SVG fallback cue */}
        <Box
          w="80px"
          h="80px"
          borderRadius="lg"
          overflow="hidden"
          bg="gray.950"
          border="1px solid"
          borderColor="gray.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {mediaUrl && !imageError ? (
            <img
              src={mediaUrl}
              alt="Підказка місця"
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <VStack gap={1} p={1} textAlign="center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#63B3ED"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <Text fontSize="3xs" color="gray.500" textTransform="uppercase">
                PHOTO HINT
              </Text>
            </VStack>
          )}
        </Box>

        {/* Text information */}
        <VStack align="start" gap={1} flex={1}>
          <HStack gap={2}>
            <Text
              fontSize="2xs"
              color="blue.400"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              ПІДКАЗКА РОЗВІДКИ · {planet}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.200">
            {hintText ||
              'Визначте координати місця посадки або знаходження апарата на карті поверхні.'}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};
