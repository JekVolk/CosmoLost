import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const ChestOpeningModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen }) => {
  if (!isOpen) return null;
  return (
    <Box p={6} bg="#111622" border="1px solid #FFD700" borderRadius="lg" textAlign="center">
      <Text fontSize="2xl">📦 Розпаковка Контейнера</Text>
      <Text color="gray.400">Сяйво рідкості та нарахування Research Points</Text>
    </Box>
  );
};
