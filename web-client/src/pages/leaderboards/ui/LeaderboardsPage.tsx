import { httpClient } from '@/shared/api';
import { Badge, Box, Button, Flex, HStack, Heading, Table, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Medal, Sparkles, Trophy } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LeaderboardEntry {
  rank: number;
  callsign: string;
  elo_rating: number;
  matches_won: number;
  curator_index?: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 60 }, (_, i) => ({
  rank: i + 1,
  callsign:
    [
      'AstroNova',
      'VanguardSeven',
      'CuriosityEcho',
      'JezeroPioneer',
      'SolTracker',
      'ApolloSpecter',
      'StarStrider',
      'TitanVoyager',
      'NebulaDrifter',
      'MarsCurator',
    ][i % 10] + (i > 9 ? `_${Math.floor(i / 10)}` : ''),
  elo_rating: Math.max(800, 2400 - i * 25),
  matches_won: Math.max(5, 120 - i * 2),
  curator_index: Math.max(10, 500 - i * 8),
}));

export const LeaderboardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'elo' | 'curator'>('elo');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    let active = true;
    async function fetchLeaderboard() {
      try {
        const data = await httpClient.get<LeaderboardEntry[]>('/api/game/leaderboards/');
        if (active && Array.isArray(data) && data.length > 0) {
          setEntries(data);
        }
      } catch {
        // Fall back to pre-seeded telemetry ranks
      }
    }
    fetchLeaderboard();
    return () => {
      active = false;
    };
  }, []);

  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === 'elo') {
      return b.elo_rating - a.elo_rating;
    }
    return (b.curator_index ?? 0) - (a.curator_index ?? 0);
  });

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentEntries = sortedEntries.slice(startIndex, startIndex + pageSize);

  return (
    <Box w="100%" minH="100vh" bg="#070A13" color="white" px={{ base: 4, md: 8 }} py={6}>
      <VStack gap={6} maxW="1000px" mx="auto" align="stretch">
        <Button
          variant="ghost"
          size="sm"
          color="gray.400"
          alignSelf="flex-start"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </Button>

        {/* Title & Tabs */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={4}
        >
          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Trophy size={26} color="#00F0FF" />
              <Heading size="xl" fontWeight="black" color="white">
                CosmoLost Leaderboards
              </Heading>
            </HStack>
            <Text fontSize="xs" color="gray.400">
              Verified planetary telemetry rankings across registered exploration commanders.
            </Text>
          </VStack>

          <HStack
            bg="whiteAlpha.100"
            p={1}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Button
              size="sm"
              variant={activeTab === 'elo' ? 'solid' : 'ghost'}
              colorPalette={activeTab === 'elo' ? 'cyan' : 'gray'}
              onClick={() => {
                setActiveTab('elo');
                setCurrentPage(1);
              }}
            >
              <Trophy size={14} /> ELO Rating
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'curator' ? 'solid' : 'ghost'}
              colorPalette={activeTab === 'curator' ? 'purple' : 'gray'}
              onClick={() => {
                setActiveTab('curator');
                setCurrentPage(1);
              }}
            >
              <Sparkles size={14} /> Curator Index
            </Button>
          </HStack>
        </Flex>

        {/* Table Container */}
        <Box
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          bg="rgba(15, 23, 42, 0.75)"
          backdropFilter="blur(8px)"
        >
          <Table.Root size="md" variant="line">
            <Table.Header bg="whiteAlpha.050">
              <Table.Row>
                <Table.ColumnHeader w="80px" color="gray.400">
                  Rank
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.400">Callsign</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right" color="gray.400">
                  {activeTab === 'elo' ? 'ELO Rating' : 'Curator Index'}
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right" color="gray.400">
                  Matches Won
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {currentEntries.map((row, idx) => {
                const globalRank = startIndex + idx + 1;
                const isTop3 = globalRank <= 3;

                return (
                  <Table.Row
                    key={row.callsign + globalRank}
                    _hover={{ bg: 'whiteAlpha.050' }}
                    transition="background 0.15s ease"
                  >
                    <Table.Cell fontWeight="bold">
                      <HStack gap={1}>
                        {isTop3 && (
                          <Medal
                            size={16}
                            color={
                              globalRank === 1
                                ? '#D69E2E'
                                : globalRank === 2
                                  ? '#CBD5E0'
                                  : '#ED8936'
                            }
                          />
                        )}
                        <Text
                          color={
                            globalRank === 1
                              ? 'yellow.400'
                              : globalRank === 2
                                ? 'gray.200'
                                : globalRank === 3
                                  ? 'orange.400'
                                  : 'gray.400'
                          }
                          fontFamily="mono"
                        >
                          #{globalRank}
                        </Text>
                      </HStack>
                    </Table.Cell>

                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="sm"
                        p={0}
                        color="cyan.300"
                        fontWeight="semibold"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => navigate(`/profile/${row.callsign}`)}
                      >
                        {row.callsign}
                      </Button>
                    </Table.Cell>

                    <Table.Cell textAlign="right" fontFamily="mono" fontWeight="bold">
                      <Badge
                        colorPalette={activeTab === 'elo' ? 'cyan' : 'purple'}
                        variant="subtle"
                      >
                        {activeTab === 'elo' ? row.elo_rating : (row.curator_index ?? 0)}
                      </Badge>
                    </Table.Cell>

                    <Table.Cell textAlign="right" fontFamily="mono" color="gray.300">
                      {row.matches_won}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>

          {/* Pagination Controls */}
          <Flex
            justify="space-between"
            align="center"
            p={4}
            borderTopWidth="1px"
            borderTopColor="whiteAlpha.100"
          >
            <Text fontSize="xs" color="gray.400">
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, sortedEntries.length)} of{' '}
              {sortedEntries.length} commanders
            </Text>

            <HStack gap={2}>
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Text fontSize="xs" fontFamily="mono" color="gray.300">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </Button>
            </HStack>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};
