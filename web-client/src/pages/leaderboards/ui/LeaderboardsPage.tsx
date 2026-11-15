import React from 'react';
import { Container, Heading, Text, VStack } from '@chakra-ui/react';

export const LeaderboardsPage: React.FC = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        <Heading size="xl" textAlign="center" color="cyan.400">Галактичний Табель Рангів</Heading>
        <Text textAlign="center" color="gray.400">Топ кураторів за рейтингом ELO та рідкісними знахідками</Text>
      </VStack>
    </Container>
  );
};
