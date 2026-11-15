import { Badge, Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useAstroGuessr } from '../model/useAstroGuessr';
import { LocationHint } from './LocationHint';
import { SurfaceMap } from './SurfaceMap';

export const AstroGuessr: React.FC = () => {
  const { pin, setPin, isSubmitted, submit, payload } = useAstroGuessr();

  const planet = payload.planet || 'MARS';

  return (
    <VStack gap={4} w="100%" maxW="860px" mx="auto" p={4}>
      {/* Header with round prompt & planet info */}
      <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <Heading size="md" color="white">
              AstroGuessr: Find the Coordinates
            </Heading>
            <Badge colorPalette={planet.toUpperCase() === 'MARS' ? 'orange' : 'blue'}>
              {planet.toUpperCase()}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Place a pin on the surface map where the target spacecraft is located.
          </Text>
        </VStack>

        {isSubmitted && (
          <Badge colorPalette="green" size="lg">
            ✓ ANSWER SUBMITTED
          </Badge>
        )}
      </HStack>

      {/* Visual / Text Hint */}
      <LocationHint mediaUrl={payload.media_url} hintText={payload.hint} planet={planet} />

      {/* 2D Interactive Map */}
      <SurfaceMap
        mapUrl={payload.map_url}
        planet={planet}
        pin={pin}
        onPinChange={setPin}
        disabled={isSubmitted}
      />

      {/* Footer controls: pin coordinate status & submit CTA */}
      <HStack justify="space-between" w="100%" pt={2} flexWrap="wrap" gap={3}>
        <Box>
          {pin ? (
            <Text fontSize="sm" color="gray.300">
              Selected coordinates:{' '}
              <Text as="span" fontWeight="bold" color="blue.300">
                {pin.lat.toFixed(3)}° Lat, {pin.lon.toFixed(3)}° Lon
              </Text>
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              Place a pin on the map before submitting
            </Text>
          )}
        </Box>

        <Button
          colorPalette="blue"
          size="lg"
          onClick={submit}
          disabled={!pin || isSubmitted}
          loading={isSubmitted}
          cursor={!pin || isSubmitted ? 'not-allowed' : 'pointer'}
        >
          {isSubmitted ? 'Answer Recorded' : 'Submit Coordinates'}
        </Button>
      </HStack>
    </VStack>
  );
};
