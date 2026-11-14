import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { AlertTriangle, Copy, Home, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isCopied: boolean;
}

export class DesktopErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isCopied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[DesktopErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/overview';
  };

  handleCopyDetails = async (): Promise<void> => {
    const errorLog = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    try {
      await navigator.clipboard.writeText(errorLog);
      this.setState({ isCopied: true });
      setTimeout(() => this.setState({ isCopied: false }), 2000);
    } catch {
      // ignore
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          p="6"
          bg="bg.canvas"
          color="fg"
        >
          <Card.Root
            maxW="600px"
            w="100%"
            p="6"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="red.800"
            borderRadius="xl"
            boxShadow="lg"
          >
            <Card.Header p="0" mb="4">
              <HStack justify="space-between" align="center">
                <HStack gap="2">
                  <AlertTriangle size={24} color="#ef4444" />
                  <Heading size="md" color="fg">
                    Desktop Viewport Crash Handler
                  </Heading>
                </HStack>
                <Badge colorPalette="red" variant="solid" size="sm">
                  Fault Isolated
                </Badge>
              </HStack>
            </Card.Header>

            <Card.Body p="0">
              <VStack align="stretch" gap="4">
                <Text fontSize="sm" color="fg.muted">
                  An unhandled runtime error occurred in the current component tree. The desktop
                  window was protected from crashing.
                </Text>

                <Box
                  p="3"
                  borderRadius="md"
                  bg="red.950"
                  borderWidth="1px"
                  borderColor="red.900"
                  fontSize="xs"
                  fontFamily="mono"
                  color="red.200"
                  maxH="160px"
                  overflowY="auto"
                >
                  <Text fontWeight="bold" mb="1">
                    {this.state.error?.name}: {this.state.error?.message}
                  </Text>
                  <Text color="red.300" fontSize="2xs">
                    {this.state.errorInfo?.componentStack}
                  </Text>
                </Box>

                <HStack gap="3" justify="flex-end" pt="2">
                  <Button size="sm" variant="outline" onClick={this.handleCopyDetails}>
                    <Copy size={14} />
                    {this.state.isCopied ? 'Copied!' : 'Copy Error Details'}
                  </Button>
                  <Button size="sm" variant="subtle" onClick={this.handleGoHome}>
                    <Home size={14} />
                    Return Home
                  </Button>
                  <Button size="sm" variant="solid" colorPalette="red" onClick={this.handleReload}>
                    <RotateCcw size={14} />
                    Reload Application
                  </Button>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Flex>
      );
    }

    return this.props.children;
  }
}
