import { useMatchStore } from '@/entities/game';
import { AstroGuessr } from '@/features/astro-guessr';
import { ForensicSol } from '@/features/forensic-sol';
import { MissionHangar } from '@/features/mission-hangar';
import { StatGuesser } from '@/features/stat-guesser';
import { AssetPlaceholder } from '@/shared/ui';
import { Box, Card, Text, VStack } from '@chakra-ui/react';
import { Gamepad2 } from 'lucide-react';
import type React from 'react';

interface FallbackModeProps {
  title: string;
  description: string;
}

const FallbackMode: React.FC<FallbackModeProps> = ({ title, description }) => (
  <Box p={6} maxW="700px" mx="auto" textAlign="center">
    <Card.Root bg="gray.900" borderColor="cyan.800" borderWidth="1px" p={6}>
      <VStack gap={4} align="center">
        <Gamepad2 size={40} color="#00F0FF" />
        <Text fontSize="xl" fontWeight="bold" color="white">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.300">
          {description}
        </Text>
        <AssetPlaceholder label="Post-MVP game mode payload pending verification" height="120px" />
      </VStack>
    </Card.Root>
  </Box>
);

const MINI_GAME_MAP: Record<string, React.ComponentType> = {
  astro_guessr: AstroGuessr,
  astroguessr: AstroGuessr,
  forensic_sol: ForensicSol,
  forensicsol: ForensicSol,
  mission_hangar: MissionHangar,
  missionhangar: MissionHangar,
  stat_guesser: StatGuesser,
  statguesser: StatGuesser,
  shadow_projector: () => (
    <FallbackMode
      title="Shadow Projector"
      description="Estimate local planetary time and season from solar angle and terrain shadows."
    />
  ),
  scale_matcher: () => (
    <FallbackMode
      title="Scale Matcher"
      description="Compare hardware dimensions against familiar standard objects."
    />
  ),
  traverse_tracer: () => (
    <FallbackMode
      title="Traverse Tracer"
      description="Reconstruct rover exploration traverses based on odometry and elevation logs."
    />
  ),
  component_dissect: () => (
    <FallbackMode
      title="Component Dissect"
      description="Identify functional subsystems (science, telemetry, power, mobility) from technical imagery."
    />
  ),
  mission_stack: () => (
    <FallbackMode
      title="Mission Stack"
      description="Sort mission operational events in accurate chronological order."
    />
  ),
};

export const MiniGameRenderer: React.FC = () => {
  const currentRound = useMatchStore((s) => s.current_round);

  if (!currentRound) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.400">Waiting for round telemetry...</Text>
      </Box>
    );
  }

  const rawKey = currentRound.round_type.toLowerCase().replace(/-/g, '_');
  const Component = MINI_GAME_MAP[rawKey] ?? AstroGuessr;

  return (
    <Box w="100%" flex="1" position="relative">
      <Component />
    </Box>
  );
};
