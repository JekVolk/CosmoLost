import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const PlanetaryTerrarium: React.FC = () => {
  return (
    <Box h="400px" bg="radial-gradient(circle at center, #111A2E 0%, #080B10 100%)" borderRadius="lg" border="1px solid #1F293D" display="flex" alignItems="center" justifyContent="center">
      <Text color="cyan.400">🌍 Інтерактивна 3D Планета (Three.js WebGL Canvas)</Text>
    </Box>
  );
};
