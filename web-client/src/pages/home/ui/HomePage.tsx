import { ContainerSlotView } from '@/entities/container';
import { McpPromoBanner, PlatformUpdateBanner } from '@/features/mcp-promo';
import { CuratorShowcase } from '@/widgets/curator-showcase';
import { Box, Button, Container, Grid, Heading, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <PlatformUpdateBanner onConnect={() => navigate('/connect')} />

        <Box textAlign="center" py={4}>
          <Heading size="2xl" color="cyan.400">
            CosmoLost Hangar
          </Heading>
          <Text color="gray.400">Дедуктивна космічна станція та орбітальні контейнери NASA</Text>
        </Box>

        <McpPromoBanner onConnect={() => navigate('/connect')} />

        <Box p={6} bg="#111622" borderRadius="lg" border="1px solid #1F293D">
          <Heading size="md" mb={4}>
            Орбітальні Контейнери (Слоти 1–10)
          </Heading>
          <Grid templateColumns="repeat(5, 1fr)" gap={3}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ContainerSlotView
                key={i}
                slot={{ slot_index: i, filled_at: '', is_opened: i >= 3 }}
              />
            ))}
          </Grid>
          <Button colorPalette="cyan" size="lg" mt={6} w="full" onClick={() => navigate('/arena')}>
            Перейти в Арену (Відкрити бій)
          </Button>
        </Box>

        <CuratorShowcase />
      </VStack>
    </Container>
  );
};
