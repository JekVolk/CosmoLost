import { useSettingsStore } from '@/entities/settings';
import { tauriCommands, tauriWindowApi } from '@/shared/api';
import { useDiagnosticsStore } from '@/shared/lib/diagnostics/diagnostics-store';
import { desktopMcpBridge } from '@/shared/lib/mcp';
import { Box, Flex, Heading, Text, VStack } from '@/shared/ui';
import { Loader2, Sparkles } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydrated = useSettingsStore((state) => state.isHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Eagerly register MCP Desktop bridge
    if (typeof window !== 'undefined' && !window.__COSMOLOST_MCP__) {
      window.__COSMOLOST_MCP__ = desktopMcpBridge;
    }

    // 2. Global unhandled promise rejection interceptor
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      useDiagnosticsStore.getState().addError('Unhandled Rejection', message, stack);
    };

    // 3. Global uncaught window error interceptor
    const handleGlobalError = (event: ErrorEvent) => {
      useDiagnosticsStore.getState().addError('Window Error', event.message, event.error?.stack);
    };

    // 4. Network status listeners
    const handleOnline = () => {
      useDiagnosticsStore
        .getState()
        .addError('Network', 'Application is back online', undefined, { online: true });
    };

    const handleOffline = () => {
      useDiagnosticsStore
        .getState()
        .addError('Network', 'Application has gone offline', undefined, { online: false });
    };

    // 5. Intelligent reload & hotkey policy
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDev = import.meta.env.DEV || useSettingsStore.getState().settings.developerMode;
      // Prevent accidental browser reload only in production mode when developerMode is disabled
      if (!isDev && (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r'))) {
        e.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleKeyDown);

    // 6. Asynchronous IPC health ping on boot
    tauriCommands.ping('bootstrap-ping').catch((err) => {
      // Non-blocking: record warning if native core is unavailable
      useDiagnosticsStore.getState().addError('Boot IPC', 'Initial native ping failed', undefined, {
        error: String(err),
      });
    });

    // Mark ready
    setIsReady(true);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Reveal native window smoothly once stores are hydrated and UI is mounted
  useEffect(() => {
    if (isHydrated || isReady) {
      tauriWindowApi.show();
    }
  }, [isHydrated, isReady]);

  // Sleek desktop splash screen during initial storage rehydration
  if (!isHydrated && !isReady) {
    return (
      <Flex h="100vh" w="100vw" align="center" justify="center" bg="#090d16" color="white" p="6">
        <VStack gap="4">
          <Flex
            w="56px"
            h="56px"
            borderRadius="xl"
            bg="linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)"
            align="center"
            justify="center"
            boxShadow="0 8px 32px rgba(56, 189, 248, 0.3)"
          >
            <Sparkles size={28} color="#ffffff" />
          </Flex>
          <VStack gap="1">
            <Heading size="lg" fontWeight="semibold" letterSpacing="tight">
              CosmoLost Desktop
            </Heading>
            <Text fontSize="xs" color="gray.400">
              Initializing application environment...
            </Text>
          </VStack>
          <Box animation="spin 1s linear infinite" mt="2">
            <Loader2 size={20} color="#38bdf8" />
          </Box>
        </VStack>
      </Flex>
    );
  }

  return <>{children}</>;
};
