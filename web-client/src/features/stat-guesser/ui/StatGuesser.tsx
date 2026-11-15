import { Badge, Box, Button, HStack, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useStatGuesser } from '../model/useStatGuesser';

export const StatGuesser: React.FC = () => {
  const {
    selectedObjectIds,
    referenceObjects,
    currentTotalMassKg,
    feedback,
    attempts,
    isChecking,
    canEdit,
    isRoundOver,
    spacecraftName,
    toggleObject,
    removeObject,
    check,
    continueAttempt,
    stopAttempt,
  } = useStatGuesser();

  const selectedSet = new Set(selectedObjectIds);
  const objectMap = new Map(referenceObjects.map((o) => [o.id, o]));

  // Calculate visual tilt of balance scale based on private feedback
  let scaleRotationDeg = 0;
  if (feedback === 'spacecraft_heavier') {
    scaleRotationDeg = -8; // Spacecraft on left goes down
  } else if (feedback === 'objects_heavier') {
    scaleRotationDeg = 8; // Objects on right go down
  }

  return (
    <VStack gap={5} w="100%" maxW="920px" mx="auto" p={4}>
      {/* Header */}
      <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <Heading size="md" color="white">
              StatGuesser: Astro Balance
            </Heading>
            <Badge colorPalette="yellow">MASS BALANCE</Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Balance the scales: choose reference objects to match the spacecraft's mass.
          </Text>
        </VStack>

        <HStack gap={2}>
          <Badge colorPalette="gray" size="sm">
            Attempt: {attempts}
          </Badge>
          {feedback === 'balanced' && (
            <Badge colorPalette="green" size="lg">
              ✓ PERFECT BALANCE (+100)
            </Badge>
          )}
        </HStack>
      </HStack>

      {/* Visual Balance Scale */}
      <Box
        w="100%"
        p={6}
        bg="gray.950"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.800"
        position="relative"
        overflow="hidden"
      >
        <Text
          fontSize="2xs"
          color="gray.500"
          textAlign="center"
          mb={4}
          textTransform="uppercase"
          letterSpacing="wider"
        >
          TARGET SPACECRAFT VS. SELECTED OBJECTS
        </Text>

        {/* Central Balance Beam Visual with dynamic tilt */}
        <Box
          position="relative"
          h="140px"
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Fulcrum (Central Pivot) */}
          <Box
            position="absolute"
            bottom="0"
            left="50%"
            transform="translateX(-50%)"
            w="0"
            h="0"
            borderLeft="24px solid transparent"
            borderRight="24px solid transparent"
            borderBottom="50px solid #4A5568"
            zIndex={1}
          />

          {/* Tilting Beam */}
          <Box
            position="absolute"
            w="80%"
            maxW="600px"
            h="8px"
            bg="gray.600"
            borderRadius="full"
            transform={`rotate(${scaleRotationDeg}deg)`}
            transition="transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Left Pan (Spacecraft - hidden mass) */}
            <Box
              position="absolute"
              left="-20px"
              top="8px"
              w="140px"
              p={3}
              bg="gray.900"
              borderRadius="xl"
              border="2px solid"
              borderColor="blue.500"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
              textAlign="center"
            >
              <Text fontSize="2xl" mb={1} aria-hidden="true">
                🛰️
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="white" isTruncated>
                {spacecraftName}
              </Text>
              <Text fontSize="2xs" color="gray.400">
                Mass Classified
              </Text>
            </Box>

            {/* Right Pan (Selected Objects - known sum) */}
            <Box
              position="absolute"
              right="-20px"
              top="8px"
              w="140px"
              p={3}
              bg="gray.900"
              borderRadius="xl"
              border="2px solid"
              borderColor="yellow.500"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
              textAlign="center"
            >
              <Text fontSize="2xl" mb={1} aria-hidden="true">
                ⚖️
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="yellow.300">
                {currentTotalMassKg.toLocaleString()} kg
              </Text>
              <Text fontSize="2xs" color="gray.400">
                Objects: {selectedObjectIds.length}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Private Feedback Message Panel */}
        {feedback && (
          <Box
            mt={8}
            p={4}
            borderRadius="xl"
            textAlign="center"
            bg={
              feedback === 'balanced'
                ? 'green.950'
                : feedback === 'spacecraft_heavier'
                  ? 'blue.950'
                  : 'yellow.950'
            }
            border="1px solid"
            borderColor={
              feedback === 'balanced'
                ? 'green.600'
                : feedback === 'spacecraft_heavier'
                  ? 'blue.600'
                  : 'yellow.600'
            }
          >
            <Heading size="sm" color={feedback === 'balanced' ? 'green.300' : 'white'} mb={1}>
              {feedback === 'balanced' && '✓ THE SCALES ARE PERFECTLY BALANCED!'}
              {feedback === 'spacecraft_heavier' && '◄ The spacecraft is heavier (<)'}
              {feedback === 'objects_heavier' && '► The selected objects are heavier (>)'}
            </Heading>
            <Text fontSize="xs" color="gray.300">
              {feedback === 'balanced'
                ? 'Congratulations! You balanced the scales within a 1% margin.'
                : 'Try adjusting the objects on the scale.'}
            </Text>

            {/* If not balanced and round not over: Prompt continue / stop */}
            {!isRoundOver && feedback !== 'balanced' && (
              <HStack gap={3} justify="center" mt={3}>
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={continueAttempt}
                  loading={isChecking}
                >
                  Continue Weighing
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="gray.600"
                  color="gray.300"
                  onClick={stopAttempt}
                >
                  End Attempt (Stop)
                </Button>
              </HStack>
            )}
          </Box>
        )}
      </Box>

      {/* Selected Items on Scale */}
      {selectedObjectIds.length > 0 && (
        <Box w="100%">
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="xs"
              color="gray.400"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              OBJECTS ON THE RIGHT SCALE PAN
            </Text>
            <Text fontSize="xs" color="yellow.400" fontWeight="bold">
              Total: {currentTotalMassKg.toLocaleString()} kg
            </Text>
          </HStack>
          <HStack gap={2} flexWrap="wrap">
            {selectedObjectIds.map((id) => {
              const obj = objectMap.get(id);
              if (!obj) return null;
              return (
                <Badge
                  key={id}
                  colorPalette="yellow"
                  variant="subtle"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  cursor={canEdit && !isChecking && !isRoundOver ? 'pointer' : 'default'}
                  onClick={() => canEdit && !isChecking && !isRoundOver && removeObject(id)}
                  title="Click to remove from the scale"
                >
                  {obj.icon} {obj.name} ({obj.mass_kg.toLocaleString()} kg) ✕
                </Badge>
              );
            })}
          </HStack>
        </Box>
      )}

      {/* Reference Objects Selection Grid */}
      <VStack align="start" gap={2} w="100%">
        <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          AVAILABLE REFERENCE OBJECTS (CLICK TO ADD OR REMOVE):
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={2.5} w="100%">
          {referenceObjects.map((obj) => {
            const isSelected = selectedSet.has(obj.id);
            return (
              <Box
                key={obj.id}
                as="button"
                type="button"
                onClick={() => toggleObject(obj.id)}
                disabled={!canEdit || isChecking || isRoundOver}
                p={3}
                borderRadius="lg"
                bg={isSelected ? 'yellow.950' : 'gray.900'}
                border="1px solid"
                borderColor={isSelected ? 'yellow.400' : 'gray.800'}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                cursor={!canEdit || isChecking || isRoundOver ? 'not-allowed' : 'pointer'}
                opacity={!canEdit || isChecking || isRoundOver ? 0.6 : 1}
                transition="all 0.15s ease"
                _hover={
                  canEdit && !isChecking && !isRoundOver
                    ? { borderColor: 'yellow.400', bg: 'gray.850' }
                    : undefined
                }
              >
                <HStack gap={2}>
                  <Text fontSize="lg" aria-hidden="true">
                    {obj.icon || '📦'}
                  </Text>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="white" fontWeight="medium">
                      {obj.name}
                    </Text>
                    <Text fontSize="3xs" color="gray.400">
                      {obj.mass_kg.toLocaleString()} kg
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="xs" color={isSelected ? 'yellow.300' : 'gray.600'}>
                  {isSelected ? '✓' : '+'}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>

      {/* Main Check Action Button */}
      <HStack justify="space-between" w="100%" pt={2} flexWrap="wrap" gap={3}>
        <Text fontSize="xs" color="gray.400">
          {selectedObjectIds.length === 0
            ? 'Add objects to the scale to weigh them'
            : `Current mass: ${currentTotalMassKg.toLocaleString()} kg`}
        </Text>

        <Button
          colorPalette="yellow"
          size="lg"
          onClick={check}
          disabled={!canEdit || isChecking || isRoundOver || selectedObjectIds.length === 0}
          loading={isChecking}
          cursor={
            !canEdit || isChecking || isRoundOver || selectedObjectIds.length === 0
              ? 'not-allowed'
              : 'pointer'
          }
        >
          {isChecking ? 'Weighing...' : 'Check Weight'}
        </Button>
      </HStack>
    </VStack>
  );
};
