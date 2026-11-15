import { Badge, Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useForensicSol } from '../model/useForensicSol';
import { AnswerOptions } from './AnswerOptions';
import { TelemetryChart } from './TelemetryChart';

export const ForensicSol: React.FC = () => {
  const { selected, select, isSubmitted, submit, payload } = useForensicSol();

  const question = payload.question || 'Which mission left this telemetry signature?';
  const options =
    payload.options && payload.options.length > 0
      ? payload.options
      : ['Curiosity', 'Opportunity', 'Spirit', 'Perseverance'];

  return (
    <VStack gap={5} w="100%" maxW="860px" mx="auto" p={4}>
      {/* Round Header & Sol Question */}
      <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
        <VStack align="start" gap={1}>
          <HStack gap={2}>
            <Heading size="md" color="white">
              ForensicSol: Data Detective
            </Heading>
            <Badge colorPalette="purple">TELEMETRY</Badge>
          </HStack>
          <Text fontSize="md" color="blue.200" fontWeight="medium">
            {question}
          </Text>
        </VStack>

        {isSubmitted && (
          <Badge colorPalette="green" size="lg">
            ✓ ANSWER SUBMITTED
          </Badge>
        )}
      </HStack>

      {/* Telemetry Chart */}
      <TelemetryChart data={payload.telemetry} />

      {/* Answer Options */}
      <VStack align="start" gap={2} w="100%">
        <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          Select an answer:
        </Text>
        <AnswerOptions
          options={options}
          selected={selected}
          onSelect={select}
          disabled={isSubmitted}
        />
      </VStack>

      {/* Submit buzzer CTA */}
      <HStack justify="space-between" w="100%" pt={2} flexWrap="wrap" gap={3}>
        <Box>
          {selected ? (
            <Text fontSize="sm" color="gray.300">
              Your choice:{' '}
              <Text as="span" fontWeight="bold" color="blue.300">
                {selected}
              </Text>
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              Select one of the options above
            </Text>
          )}
        </Box>

        <Button
          colorPalette="purple"
          size="lg"
          onClick={submit}
          disabled={!selected || isSubmitted}
          loading={isSubmitted}
          cursor={!selected || isSubmitted ? 'not-allowed' : 'pointer'}
        >
          {isSubmitted ? 'Answer Recorded' : 'Submit Answer (Buzzer)'}
        </Button>
      </HStack>
    </VStack>
  );
};
