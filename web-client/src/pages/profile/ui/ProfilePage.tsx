import React from 'react';
import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import { PlanetaryTerrarium } from '@/widgets/planetary-terrarium';
import { CuratorShowcase } from '@/widgets/curator-showcase';
import { useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { callsign } = useParams<{ callsign: string }>();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading size="xl" color="cyan.400">Профіль Дослідника: {callsign || 'Cadet'}</Heading>
        <Text color="gray.400">Колекція артефактів на персональній 3D планеті</Text>

        <PlanetaryTerrarium />
        <CuratorShowcase />
      </VStack>
    </Container>
  );
};
