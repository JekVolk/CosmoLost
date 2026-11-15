import { Badge, Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import type React from 'react';

export const ShadowProjector: React.FC = () => {
  return (
    <VStack gap={5} w="100%" maxW="860px" mx="auto" p={4}>
      <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <Heading size="md" color="white">
              Shadow Projector: Sundial
            </Heading>
            <Badge colorPalette="gray">POST-MVP SKELETON</Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Determine the time of day and season on a planet from the shadow length and sunlight angle.
          </Text>
        </VStack>
      </HStack>

      <Box
        w="100%"
        h="280px"
        bg="gray.950"
        borderRadius="xl"
        border="1px dashed"
        borderColor="gray.800"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={6}
        textAlign="center"
      >
        <Text fontSize="4xl" mb={2} aria-hidden="true">
          ☀️
        </Text>
        <Text fontSize="sm" color="gray.300" fontWeight="medium">
          Interactive 3D/2D spacecraft shadow projection
        </Text>
        <Text fontSize="xs" color="gray.500" maxW="460px" mt={1}>
          This mode is being prepared with verified NASA NAIF SPICE ephemerides.
        </Text>
      </Box>

      <HStack justify="flex-end" w="100%">
        <Button colorPalette="blue" disabled cursor="not-allowed">
          In Development
        </Button>
      </HStack>
    </VStack>
  );
};
