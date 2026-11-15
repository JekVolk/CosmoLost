import { useAuthStore } from '@/entities/user';
import { httpClient } from '@/shared/api/http-client';
import { getCsrfToken } from '@/shared/lib';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { ArrowLeft, Rocket, ShieldAlert } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [csrfToken, setCsrfToken] = useState<string | null>(() => getCsrfToken());
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCsrfToken(getCsrfToken());
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err === 'google_not_configured') {
      setErrorMessage(
        'Google OAuth credentials are not configured on this server. You can instantly enter with "Play as Guest Cadet" below!',
      );
    } else if (err) {
      setErrorMessage(`Authentication error: ${err}`);
    }
  }, [location.search]);

  useEffect(() => {
    if (token) {
      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/game';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const handleGuestLogin = async () => {
    setIsLoadingGuest(true);
    setErrorMessage(null);
    try {
      const data = await httpClient.post<{
        access: string;
        refresh: string;
        callsign: string;
        user: { callsign: string; elo_rating: number };
      }>('/api/game/auth/demo/', {});

      if (data?.access) {
        setToken(data.access);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser({ callsign: data.callsign, elo_rating: 1000 });
        }
        navigate('/game', { replace: true });
      } else {
        throw new Error('Failed to obtain guest session');
      }
    } catch (err: any) {
      console.error('Guest login failed', err);
      // Fallback local guest session if backend is completely offline
      const guestCallsign = `Cadet-${Math.floor(1000 + Math.random() * 9000)}`;
      setToken(`demo-guest-token-${Date.now()}`);
      setUser({ callsign: guestCallsign, elo_rating: 1000 });
      navigate('/game', { replace: true });
    } finally {
      setIsLoadingGuest(false);
    }
  };

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
        gap={6}
        p={8}
        bg="gray.900"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.800"
        maxW="440px"
        w="100%"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
        textAlign="center"
      >
        <VStack gap={2}>
          <Heading size="xl" color="white" fontWeight="bold">
            CosmoLost Game Hub
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Solar System exploration gaming module & Arena competitions
          </Text>
        </VStack>

        {errorMessage && (
          <Box
            w="100%"
            p={3}
            borderRadius="md"
            bg="rgba(239, 68, 68, 0.12)"
            border="1px solid rgba(239, 68, 68, 0.4)"
            display="flex"
            alignItems="center"
            gap={2}
            textAlign="left"
          >
            <ShieldAlert size={18} color="#f87171" style={{ flexShrink: 0 }} />
            <Text color="red.200" fontSize="xs">
              {errorMessage}
            </Text>
          </Box>
        )}

        <Box
          w="100%"
          p={4}
          borderRadius="md"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
        >
          <Text color="cyan.300" fontSize="xs" fontWeight="semibold" mb={1}>
            Sign-in required for gaming features only:
          </Text>
          <Text color="gray.300" fontSize="xs">
            Authentication is needed to track your ELO rating, unlock artifacts, and participate in duels.
            The 3D Map and Catalog can be freely explored without signing in.
          </Text>
        </Box>

        <VStack w="100%" gap={3}>
          {/* Guest Cadet 1-Click Access */}
          <Button
            type="button"
            w="100%"
            size="lg"
            colorPalette="cyan"
            variant="solid"
            cursor="pointer"
            onClick={handleGuestLogin}
            loading={isLoadingGuest}
            style={{ fontWeight: 700, gap: '8px' }}
          >
            <Rocket size={18} />
            <span>Play as Guest Cadet</span>
          </Button>

          {/* Google OAuth Button */}
          <form method="POST" action="/auth/login/google-oauth2/" style={{ width: '100%' }}>
            {csrfToken ? <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} /> : null}
            <Button
              type="submit"
              w="100%"
              size="md"
              colorPalette="blue"
              variant="outline"
              cursor="pointer"
            >
              {/* Inline SVG for Google logo */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: 8 }}
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        </VStack>

        <Button
          w="100%"
          variant="ghost"
          colorPalette="gray"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} style={{ marginRight: 6 }} /> Back to 3D Orbit Map
        </Button>
      </VStack>
    </Box>
  );
};
