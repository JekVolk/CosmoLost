import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import type React from 'react';

interface AnswerOptionsProps {
  options?: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options = ['Curiosity', 'Opportunity', 'Spirit', 'Perseverance'],
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} w="100%">
      {options.map((option, idx) => {
        const isSelected = selected === option;
        const letter = String.fromCharCode(65 + idx); // A, B, C, D

        return (
          <Box
            key={option}
            as="button"
            type="button"
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            display="flex"
            alignItems="center"
            gap={3}
            p={4}
            borderRadius="xl"
            bg={isSelected ? 'blue.950' : 'gray.900'}
            border="2px solid"
            borderColor={isSelected ? 'blue.400' : 'gray.800'}
            boxShadow={isSelected ? '0 0 16px rgba(66, 153, 225, 0.35)' : 'none'}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            opacity={disabled && !isSelected ? 0.6 : 1}
            transition="all 0.2s ease"
            _hover={
              !disabled
                ? {
                    borderColor: isSelected ? 'blue.400' : 'gray.600',
                    bg: isSelected ? 'blue.950' : 'gray.850',
                  }
                : undefined
            }
            textAlign="left"
          >
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg={isSelected ? 'blue.500' : 'gray.800'}
              color={isSelected ? 'white' : 'gray.300'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              fontSize="sm"
              flexShrink={0}
            >
              {letter}
            </Box>

            <Text fontSize="md" fontWeight="medium" color={isSelected ? 'white' : 'gray.200'}>
              {option}
            </Text>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
