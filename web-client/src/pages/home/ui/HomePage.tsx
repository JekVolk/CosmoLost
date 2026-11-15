import { ContainerSlot, useContainerStore } from '@/entities/container';
import { useAuthStore } from '@/entities/user';
import { useMatchmaking } from '@/features/matchmaking';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CalendarCheck, Compass, Gift, Play, Shield, Sparkles, Trophy } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { slots, next_fill_at, fetchSlots, claimDaily, isLoading } = useContainerStore();
  const { startMatchmaking } = useMatchmaking();

  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleClaimDaily = async () => {
    setIsClaiming(true);
    setClaimMessage(null);
    try {
      const result = await claimDaily();
      if (result?.status === 'claimed') {
        setClaimMessage('Daily supply pod retrieved successfully!');
      } else if (result?.status === 'already_claimed') {
        setClaimMessage('Daily pod already retrieved for this cycle.');
      } else {
        setClaimMessage('Pod claim registered.');
      }
    } catch {
      setClaimMessage('Failed to claim daily supply pod.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handlePlayWithSlot = (slotIndex: number) => {
    startMatchmaking(slotIndex);
    navigate('/arena');
  };

  const handleQuickPlay = () => {
    // Find first available slot or fallback to slot 0
    const availableSlot = slots.find((s) => !s.is_reserved);
    const slotIdx = availableSlot ? availableSlot.slot_index : 0;
    handlePlayWithSlot(slotIdx);
  };

  return (
    <Box w="100%" minH="100vh" bg="#070A13" color="white" px={{ base: 4, md: 8 }} py={6}>
      <VStack gap={8} maxW="1200px" mx="auto" align="stretch">
        {/* Profile Summary Hero */}
        <Box
          p={{ base: 5, md: 8 }}
          borderRadius="2xl"
          bg="rgba(15, 23, 42, 0.75)"
          borderWidth="1px"
          borderColor="cyan.900"
          backdropFilter="blur(10px)"
          boxShadow="0 4px 30px rgba(0, 0, 0, 0.5)"
        >
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={6}
          >
            <VStack align="flex-start" gap={2}>
              <HStack gap={3}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg="cyan.950"
                  borderWidth="1px"
                  borderColor="cyan.500"
                  color="cyan.400"
                >
                  <Shield size={24} />
                </Box>
                <VStack align="flex-start" gap={0}>
                  <Text
                    fontSize="xs"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="widest"
                  >
                    Command Telemetry
                  </Text>
                  <Heading size="lg" color="white" fontWeight="black">
                    {user?.callsign ?? 'Commander'}
                  </Heading>
                </VStack>
              </HStack>

              <HStack gap={3} mt={2} wrap="wrap">
                <Badge colorPalette="cyan" size="md">
                  <HStack gap={1}>
                    <Trophy size={14} />
                    <Text>ELO {user?.elo_rating ?? 1000}</Text>
                  </HStack>
                </Badge>
                <Badge colorPalette="purple" size="md">
                  <HStack gap={1}>
                    <Sparkles size={14} />
                    <Text>Rank: Vanguard</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>

            {/* Quick Actions & Play CTA */}
            <HStack gap={4} wrap="wrap">
              <Button
                colorPalette="cyan"
                size="xl"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="black"
                boxShadow="0 0 25px rgba(0, 240, 255, 0.4)"
                onClick={handleQuickPlay}
              >
                <Play size={22} fill="currentColor" />
                ENTER ARENA
              </Button>

              <Button
                variant="outline"
                colorPalette="gray"
                size="lg"
                onClick={() => navigate(`/profile/${user?.callsign ?? 'Commander'}`)}
              >
                Profile & Showcase
              </Button>

              <Button
                variant="outline"
                colorPalette="cyan"
                size="lg"
                onClick={() => navigate('/portal')}
              >
                <Compass size={18} />
                3D Explorer
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Daily Pod Claim & Status */}
        <Box
          p={4}
          borderRadius="xl"
          bg="rgba(11, 15, 25, 0.6)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            direction={{ base: 'column', sm: 'row' }}
            gap={3}
          >
            <HStack gap={3}>
              <Box p={2} borderRadius="md" bg="purple.950" color="purple.400">
                <Gift size={20} />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Text fontSize="sm" fontWeight="bold">
                  Daily Supply Drop
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Retrieve daily research containers and engineering telemetry
                </Text>
              </VStack>
            </HStack>

            <HStack gap={3}>
              {claimMessage && (
                <Text fontSize="xs" color="cyan.300">
                  {claimMessage}
                </Text>
              )}
              <Button
                size="sm"
                colorPalette="purple"
                onClick={handleClaimDaily}
                loading={isClaiming}
              >
                <CalendarCheck size={16} />
                Claim Supply Pod
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Container Bays Section (Up to 10 slots) */}
        <VStack align="stretch" gap={4}>
          <Flex justify="space-between" align="center">
            <VStack align="flex-start" gap={0}>
              <HStack gap={2}>
                <Heading size="md" color="white">
                  Container Bays
                </Heading>
                <Badge colorPalette="cyan" variant="subtle">
                  {slots.length} / 10 Active
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.400">
                Seal integrity unlocks through competitive match telemetry. Click an active bay to
                initiate match.
              </Text>
            </VStack>

            {next_fill_at && (
              <Badge colorPalette="gray" size="sm">
                Next bay refill pending
              </Badge>
            )}
          </Flex>

          {isLoading && slots.length === 0 ? (
            <Box py={8} textAlign="center">
              <Text color="gray.400">Scanning container berths...</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} gap={4}>
              {slots.map((slot) => (
                <ContainerSlot
                  key={slot.slot_index}
                  slot={slot}
                  onPlay={() => handlePlayWithSlot(slot.slot_index)}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
