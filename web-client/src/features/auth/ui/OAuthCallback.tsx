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
      if (typeof window !== 'undefined' && window.location) {
        const searchParams = new URLSearchParams(window.location.search);
        const errorParam = searchParams.get('error') || searchParams.get('error_description');
        if (errorParam) {
          setError(
            errorParam === 'access_denied'
              ? 'Google sign-in was canceled by the user.'
              : `Authentication error: ${errorParam}`,
          );
          return;
        }
      }

      try {
        // Exchange session/cookie for JWT via secure endpoint (never from URL query params)
        const data = await httpClient.get<OAuthResponse>('/api/game/auth/google/done/');
        if (!active) return;

        const token = data.access || data.token;
        if (!token) {
          throw new Error('No authentication token was received from the server.');
        }

        setToken(token);

        if (data.user) {
          setUser(data.user);
        } else if (data.callsign) {
          setUser({ callsign: data.callsign, elo_rating: 1000 });
        }

        try {
          const me = await userRepository.getMe();
          if (active && me) {
            setUser({ callsign: me.callsign, elo_rating: me.elo_rating });
          }
        } catch {
          // Profile may be initialized later
        }

        navigate('/game', { replace: true });
      } catch (err) {
        if (!active) return;
        console.error('OAuth exchange error:', err);
        setError('Could not complete Google sign-in. Please try again.');
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
            Authentication Error
          </Heading>
          <Text color="gray.300" fontSize="sm">
            {error}
          </Text>
          <Button colorPalette="blue" onClick={() => navigate('/login', { replace: true })}>
            Back to Login
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
          Completing Sign-In...
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Connecting to your CosmoLost session
        </Text>
      </VStack>
    </Box>
  );
};
