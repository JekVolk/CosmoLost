import { type InventoryItem, ItemCard, inventoryRepository } from '@/entities/inventory';
import {
  type PublicGameProfile,
  type UserProfile,
  useAuthStore,
  userRepository,
} from '@/entities/user';
import { CuratorShowcase } from '@/widgets/curator-showcase';
import { PlanetaryTerrarium } from '@/widgets/planetary-terrarium';
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
import { Archive, ArrowLeft, Flame, Globe, Package, User } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { callsign = 'Commander' } = useParams<{ callsign: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const isOwner =
    Boolean(currentUser?.callsign) &&
    currentUser?.callsign.toLowerCase() === callsign.toLowerCase();

  const [profile, setProfile] = useState<PublicGameProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        if (isOwner) {
          const [meData, invData] = await Promise.all([
            userRepository.getMe().catch(() => null),
            inventoryRepository.getInventory().catch(() => []),
          ]);
          if (active) {
            setOwnerProfile(meData);
            setInventory(invData);
          }
        }

        const pubData = await userRepository.getProfile(callsign).catch(() => null);
        if (active) {
          setProfile(pubData);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [callsign, isOwner]);

  const displayCallsign = profile?.callsign ?? ownerProfile?.callsign ?? callsign;
  const rank = profile?.rank ?? ownerProfile?.rank ?? 'Explorer';
  const collectionCount =
    profile?.collection_count ?? ownerProfile?.inventory_count ?? inventory.length;

  const filteredInventory =
    selectedRarity === 'ALL'
      ? inventory
      : inventory.filter((item) => item.rarity?.toUpperCase() === selectedRarity);

  const rarities = [
    'ALL',
    'HISTORIC',
    'AUTONOMOUS',
    'PROTOTYPE',
    'SPECIALIZED',
    'STANDARD',
    'SCRAP',
  ];

  return (
    <Box w="100%" minH="100vh" bg="#070A13" color="white" px={{ base: 4, md: 8 }} py={6}>
      <VStack gap={8} maxW="1200px" mx="auto" align="stretch">
        {/* Navigation back */}
        <Button
          variant="ghost"
          size="sm"
          color="gray.400"
          alignSelf="flex-start"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} /> Back to Command Center
        </Button>

        {/* Header Profile Section */}
        <Box
          p={{ base: 5, md: 8 }}
          borderRadius="2xl"
          bg="rgba(15, 23, 42, 0.75)"
          borderWidth="1px"
          borderColor="cyan.900"
          backdropFilter="blur(10px)"
        >
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={6}
          >
            <HStack gap={4} align="center">
              <Box
                p={4}
                borderRadius="full"
                bg="blue.950"
                borderWidth="2px"
                borderColor="cyan.400"
                color="cyan.300"
                boxShadow="0 0 20px rgba(0, 240, 255, 0.3)"
              >
                <User size={32} />
              </Box>

              <VStack align="flex-start" gap={1}>
                <HStack gap={2}>
                  <Heading size="xl" fontWeight="black" color="white">
                    {displayCallsign}
                  </Heading>
                  {isOwner && (
                    <Badge colorPalette="cyan" size="sm">
                      COMMANDER (YOU)
                    </Badge>
                  )}
                </HStack>
                <HStack gap={2} wrap="wrap">
                  <Badge colorPalette="purple" variant="subtle">
                    Rank: {rank}
                  </Badge>
                  <Badge colorPalette="cyan" variant="subtle">
                    <HStack gap={1}>
                      <Archive size={12} />
                      <Text>{collectionCount} Artifacts in Collection</Text>
                    </HStack>
                  </Badge>
                </HStack>
              </VStack>
            </HStack>

            {/* Owner Stats (Only visible to owner per FE-12.3) */}
            {isOwner && (
              <HStack
                gap={4}
                bg="blackAlpha.400"
                p={4}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                wrap="wrap"
              >
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                    Rating
                  </Text>
                  <Text fontSize="lg" fontWeight="black" color="cyan.300" fontFamily="mono">
                    {ownerProfile?.elo_rating ?? currentUser?.elo_rating ?? 1000} ELO
                  </Text>
                </VStack>

                <Box h="30px" w="1px" bg="whiteAlpha.200" />

                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                    Research Points
                  </Text>
                  <Text fontSize="lg" fontWeight="black" color="purple.300" fontFamily="mono">
                    {ownerProfile?.research_points ?? 0} RP
                  </Text>
                </VStack>

                <Box h="30px" w="1px" bg="whiteAlpha.200" />

                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                    Win Streak
                  </Text>
                  <HStack gap={1} color="orange.400">
                    <Flame size={14} />
                    <Text fontSize="lg" fontWeight="black" fontFamily="mono">
                      {ownerProfile?.current_win_streak ?? 0}
                    </Text>
                  </HStack>
                </VStack>

                <Box h="30px" w="1px" bg="whiteAlpha.200" />

                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="gray.400" textTransform="uppercase">
                    Record
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="gray.200" fontFamily="mono">
                    {ownerProfile?.matches_won ?? 0}W /{' '}
                    {(ownerProfile?.matches_played ?? 0) - (ownerProfile?.matches_won ?? 0)}L
                  </Text>
                </VStack>
              </HStack>
            )}
          </Flex>
        </Box>

        {/* Section 2: Planetary Terrarium */}
        <VStack align="stretch" gap={3}>
          <HStack gap={2}>
            <Globe size={20} color="#00F0FF" />
            <Heading size="md" color="white">
              Planetary Terrarium
            </Heading>
          </HStack>
          <PlanetaryTerrarium height="520px" />
        </VStack>

        {/* Section 3: Curator Showcase */}
        <CuratorShowcase callsign={callsign} isOwner={isOwner} />

        {/* Section 4: Inventory Grid (Owner Only per FE-12.3) */}
        {isOwner && (
          <VStack align="stretch" gap={4} pt={4}>
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
            >
              <HStack gap={2}>
                <Package size={20} color="#00F0FF" />
                <Heading size="md" color="white">
                  Field Inventory Archive
                </Heading>
                <Badge colorPalette="gray" size="sm">
                  {inventory.length} Items Total
                </Badge>
              </HStack>

              {/* Rarity filter pills */}
              <HStack gap={1} wrap="wrap">
                {rarities.map((r) => (
                  <Button
                    key={r}
                    size="xs"
                    variant={selectedRarity === r ? 'solid' : 'outline'}
                    colorPalette={selectedRarity === r ? 'cyan' : 'gray'}
                    onClick={() => setSelectedRarity(r)}
                  >
                    {r}
                  </Button>
                ))}
              </HStack>
            </Flex>

            {filteredInventory.length === 0 ? (
              <Box
                py={12}
                textAlign="center"
                borderRadius="xl"
                bg="whiteAlpha.050"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
              >
                <Text color="gray.400" fontSize="sm">
                  No artifacts match the selected archive filter.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
                {filteredInventory.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
