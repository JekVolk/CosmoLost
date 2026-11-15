import { useAuthStore, userRepository } from '@/entities/user';
import { httpClient } from '@/shared/api/http-client';
import { Box, Button, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OAuthResponse {
  access?: string;
  refresh?: string;
  token?: string;
  callsign?: string;
  user?: {
    callsign: string;
    elo_rating: number;
  };
}

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      try {
        // Exchange session/cookie for JWT via secure endpoint (never from URL query params)
        const data = await httpClient.get<OAuthResponse>('/api/game/auth/google/done/');
        if (!active) return;

        const token = data.access || data.token;
        if (token) {
          setToken(token);
        }

        if (data.user) {
          setUser(data.user);
        } else if (data.callsign) {
          setUser({ callsign: data.callsign, elo_rating: 1000 });
        }

        if (token) {
          try {
            const me = await userRepository.getMe();
            if (active && me) {
              setUser({ callsign: me.callsign, elo_rating: me.elo_rating });
            }
          } catch {
            // Profile may be initialized later
          }
        }

        navigate('/game', { replace: true });
      } catch (err) {
        if (!active) return;
        console.error('OAuth exchange error:', err);
        setError('Не вдалося завершити авторизацію через Google. Спробуйте ще раз.');
      }
    }

    completeAuth();

    return () => {
      active = false;
    };
  }, [navigate, setToken, setUser]);

  if (error) {
    return (
      <Box
        display="flex"
        minH="100vh"
        alignItems="center"
        justifyContent="center"
        bg="gray.950"
        p={4}
      >
        <VStack
          gap={4}
          p={8}
          bg="gray.900"
          borderRadius="lg"
          border="1px solid"
          borderColor="red.800"
          maxW="400px"
          textAlign="center"
        >
          <Heading size="md" color="red.400">
            Помилка авторизації
          </Heading>
          <Text color="gray.300" fontSize="sm">
            {error}
          </Text>
          <Button colorPalette="blue" onClick={() => navigate('/login', { replace: true })}>
            Повернутися до входу
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg="gray.950"
      p={4}
    >
      <VStack
        gap={4}
        p={8}
        bg="gray.900"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.800"
        textAlign="center"
      >
        <Spinner size="xl" color="blue.400" />
        <Heading size="md" color="white">
          Завершення входу...
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Підключення до сесії CosmoLost
        </Text>
      </VStack>
    </Box>
  );
};
