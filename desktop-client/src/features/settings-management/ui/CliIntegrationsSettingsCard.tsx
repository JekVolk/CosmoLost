import { useSettingsStore } from '@/entities/settings';
import { tauriCommands } from '@/shared/api';
import {
  imageGeneratorClient,
  multiLlmClient,
  musicGeneratorClient,
  videoGeneratorClient,
} from '@/shared/api/ai';
import { cliConfigGenerator, cliInterceptor } from '@/shared/lib/cli-bridge';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  Bot,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Music,
  Play,
  Radio,
  Server,
  Sparkles,
  Square,
  Terminal,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function CliIntegrationsSettingsCard() {
  const { settings, updateSettings } = useSettingsStore();

  // Tokens & Models State
  const [claudeApiKey, setClaudeApiKey] = useState(settings.claudeApiKey || '');
  const [claudeModel, setClaudeModel] = useState(
    settings.claudeModel || 'claude-3-5-sonnet-20241022',
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-4o');
  const [customLlmEndpoint, setCustomLlmEndpoint] = useState(settings.customLlmEndpoint || '');

  // Media AI Providers
  const [imageProvider, setImageProvider] = useState(settings.imageProvider || 'pollinations-free');
  const [videoProvider, setVideoProvider] = useState(
    settings.videoProvider || 'pollinations-motion',
  );
  const [musicProvider, setMusicProvider] = useState(
    settings.musicProvider || 'procedural-drone-synth',
  );
  const [runwayApiKey, setRunwayApiKey] = useState(settings.runwayApiKey || '');
  const [sunoApiKey, setSunoApiKey] = useState(settings.sunoApiKey || '');

  // Bridge State
  const [cliInterceptionEnabled, setCliInterceptionEnabled] = useState(
    settings.cliInterceptionEnabled ?? true,
  );
  const [cliBridgePort, setCliBridgePort] = useState(settings.cliBridgePort || 8089);

  // Security visibility toggles
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  // Interactive CLI Simulator
  const [simulatedCmd, setSimulatedCmd] = useState('cosmolost status');
  const [cliOutput, setCliOutput] = useState<string | null>(null);
  const [isExecutingCli, setIsExecutingCli] = useState(false);

  // Auto-config and detection state ("під капотом")
  const [detectedTools, setDetectedTools] = useState<
    Record<string, { installed: boolean; path?: string | null; version?: string | null }>
  >({});
  const [autoConfigStatus, setAutoConfigStatus] = useState<
    Record<string, { success: boolean; message: string; path?: string }>
  >({});
  const [isAutoConfiguring, setIsAutoConfiguring] = useState<Record<string, boolean>>({});

  // Media generation test results
  const [mediaResult, setMediaResult] = useState<{
    type: 'image' | 'video' | 'music';
    url: string;
    info: string;
  } | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Test Connection Feedback
  const [testStatus, setTestStatus] = useState<{
    id: string;
    success: boolean;
    msg: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check CLI presence on mount
  useEffect(() => {
    async function checkTools() {
      try {
        const [claudeTool, agyTool, nodeTool] = await Promise.all([
          tauriCommands.detectCliTool('claude'),
          tauriCommands.detectCliTool('agy'),
          tauriCommands.detectCliTool('node'),
        ]);
        setDetectedTools({
          claude: claudeTool,
          agy: agyTool,
          node: nodeTool,
        });
      } catch {
        // Fallback for non-Tauri browser preview
      }
    }
    void checkTools();
  }, []);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSettings = () => {
    updateSettings({
      claudeApiKey,
      claudeModel,
      openaiApiKey,
      openaiModel,
      customLlmEndpoint,
      imageProvider,
      videoProvider,
      musicProvider,
      runwayApiKey,
      sunoApiKey,
      cliInterceptionEnabled,
      cliBridgePort: Number(cliBridgePort),
    });

    // Update live clients in memory
    multiLlmClient.setCredentials({
      claudeApiKey,
      openaiApiKey,
      customLlmEndpoint,
      defaultClaudeModel: claudeModel,
      defaultOpenAiModel: openaiModel,
    });
    imageGeneratorClient.setCredentials({
      openaiApiKey,
      defaultProvider: imageProvider,
    });
    videoGeneratorClient.setCredentials({
      runwayApiKey,
      defaultProvider: videoProvider,
    });
    musicGeneratorClient.setCredentials({
      sunoApiKey,
      defaultProvider: musicProvider,
    });
    cliInterceptor.setInterceptionActive(cliInterceptionEnabled);
    cliInterceptor.setPort(Number(cliBridgePort));

    setTestStatus({
      id: 'general',
      success: true,
      msg: 'Всі налаштування CLI, API токенів та медіа-генераторів збережено в нативне сховище!',
    });
  };

  const handleAutoConfigure = async (clientName: 'claude' | 'agy') => {
    setIsAutoConfiguring((prev) => ({ ...prev, [clientName]: true }));
    try {
      const res = await tauriCommands.autoConfigureCliMcp(clientName);
      setAutoConfigStatus((prev) => ({
        ...prev,
        [clientName]: {
          success: res.success,
          message: res.message,
          path: res.config_file_path,
        },
      }));
    } catch (err) {
      setAutoConfigStatus((prev) => ({
        ...prev,
        [clientName]: {
          success: false,
          message: `Помилка авто-конфігурації: ${String(err)}`,
        },
      }));
    } finally {
      setIsAutoConfiguring((prev) => ({ ...prev, [clientName]: false }));
    }
  };

  const handleTestLlm = async (provider: 'claude' | 'openai') => {
    const key = provider === 'claude' ? claudeApiKey : openaiApiKey;
    if (!key.trim()) {
      setTestStatus({
        id: provider,
        success: false,
        msg: `Вкажіть ${provider.toUpperCase()} API токен перед тестуванням.`,
      });
      return;
    }

    setTestStatus({
      id: provider,
      success: true,
      msg: `Тестування з'єднання з ${provider.toUpperCase()}...`,
    });

    const res = await multiLlmClient.testConnection(provider, key);
    setTestStatus({
      id: provider,
      success: res.success,
      msg: res.message,
    });
  };

  const handleRunCliCommand = async (cmdToRun?: string) => {
    const command = cmdToRun || simulatedCmd;
    setIsExecutingCli(true);
    setCliOutput('Виконання команди...');

    const res = await cliInterceptor.execute(command);
    setIsExecutingCli(false);
    setCliOutput(
      `$ ${command}\nExit Code: ${res.exitCode}\nTimestamp: ${res.timestamp}\n\n${res.output}`,
    );
  };

  const handleGenerateImage = async () => {
    setTestStatus({
      id: 'media',
      success: true,
      msg: 'Генерація космічного фото (Mars Panorama)...',
    });

    const res = await imageGeneratorClient.generateImage({
      prompt: 'Mars Rover Opportunity sunset panorama, 8k realistic documentary',
      provider: imageProvider,
    });

    setMediaResult({
      type: 'image',
      url: res.imageUrl,
      info: `Фото згенеровано через [${res.provider}]`,
    });
    setTestStatus({
      id: 'media',
      success: true,
      msg: `Фото успішно згенеровано! [${res.provider}]`,
    });
  };

  const handleGenerateVideo = async () => {
    setTestStatus({
      id: 'media',
      success: true,
      msg: 'Генерація 5-секундного відео-фрагменту...',
    });

    const res = await videoGeneratorClient.generateVideo({
      prompt: 'Mars dust devil sweeping past rover solar panels',
      provider: videoProvider,
    });

    setMediaResult({
      type: 'video',
      url: res.videoUrl,
      info: `Відео-фрагмент [${res.provider}]: ${res.status}`,
    });
    setTestStatus({
      id: 'media',
      success: true,
      msg: `Відео згенеровано! ID: ${res.taskId} [${res.provider}]`,
    });
  };

  const handleGenerateMusic = async () => {
    setTestStatus({
      id: 'media',
      success: true,
      msg: 'Синтез космічного звукового ландшафту...',
    });

    const res = await musicGeneratorClient.generateMusic({
      prompt: 'Cosmic deep space ambient with solar wind resonances',
      provider: musicProvider,
      durationSec: 15,
    });

    setMediaResult({
      type: 'music',
      url: res.audioUrl,
      info: `${res.title} (${res.durationSec}s)`,
    });
    setTestStatus({
      id: 'media',
      success: true,
      msg: `Аудіо-трек готовий: ${res.title}`,
    });
  };

  const toggleMusicPlayback = () => {
    if (!mediaResult || mediaResult.type !== 'music') return;
    if (isPlayingMusic) {
      musicGeneratorClient.stopPreview();
      setIsPlayingMusic(false);
    } else {
      const ok = musicGeneratorClient.playPreview(mediaResult.url);
      setIsPlayingMusic(ok);
    }
  };

  const claudeCommand = cliConfigGenerator.getClaudeCliCommand();
  const agyCommand = cliConfigGenerator.getAgyCliCommand();
  const codexCommand = cliConfigGenerator.getCodexCliCommand(openaiApiKey);

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle" borderWidth="1px" borderRadius="xl">
      <Card.Header pb="2">
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Terminal size={20} color="#38bdf8" />
            <Heading size="md" color="fg">
              CLI Interception, Multi-LLM & Media Studio
            </Heading>
          </HStack>
          <HStack gap="2" wrap="wrap">
            <Badge colorPalette="purple" variant="subtle">
              Claude CLI
            </Badge>
            <Badge colorPalette="blue" variant="subtle">
              AGY CLI
            </Badge>
            <Badge colorPalette="green" variant="subtle">
              Codex / OpenAI
            </Badge>
            <Badge colorPalette="pink" variant="subtle">
              Відео • Фото • Музика
            </Badge>
            <Badge colorPalette={cliInterceptionEnabled ? 'teal' : 'gray'} variant="solid">
              Bridge: {cliInterceptionEnabled ? `Port ${cliBridgePort}` : 'Disabled'}
            </Badge>
          </HStack>
        </Flex>
        <Text color="fg.muted" fontSize="sm" mt="1">
          Автоматичне налаштування під капотом і ручні команди для Claude CLI, Antigravity CLI,
          Codex CLI, а також генерація відео, фото та космічної музики.
        </Text>
      </Card.Header>

      <Card.Body pt="3">
        <VStack align="stretch" gap="5">
          {/* General Save & Notification Alert */}
          {testStatus && (
            <Box
              p="3"
              borderRadius="md"
              bg={testStatus.success ? 'green.950' : 'red.950'}
              borderWidth="1px"
              borderColor={testStatus.success ? 'green.800' : 'red.800'}
            >
              <HStack gap="2">
                <CheckCircle2 size={16} color={testStatus.success ? '#22c55e' : '#ef4444'} />
                <Text fontSize="sm" color={testStatus.success ? 'green.200' : 'red.200'}>
                  {testStatus.msg}
                </Text>
              </HStack>
            </Box>
          )}

          {/* 1. CLAUDE CLI & ANTHROPIC TOKEN */}
          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4" bg="bg.subtle">
            <Flex justify="space-between" align="center" mb="3" wrap="wrap" gap="2">
              <HStack gap="2">
                <Bot size={18} color="#d97706" />
                <Heading size="sm" color="fg">
                  1. Claude CLI & Anthropic API Token
                </Heading>
              </HStack>
              <HStack gap="2">
                {detectedTools.claude?.installed && (
                  <Badge colorPalette="cyan" size="xs" variant="outline">
                    CLI DETECTED
                  </Badge>
                )}
                {claudeApiKey ? (
                  <Badge colorPalette="green" size="xs" variant="solid">
                    TOKEN CONFIGURED
                  </Badge>
                ) : (
                  <Badge colorPalette="gray" size="xs" variant="subtle">
                    NO TOKEN
                  </Badge>
                )}
              </HStack>
            </Flex>

            <VStack align="stretch" gap="3">
              <Text fontSize="xs" color="fg.muted">
                Введіть Anthropic API Token (формат <code>sk-ant-...</code>) або підключіть сервіс
                автоматично під капотом в 1 клік.
              </Text>

              {/* Claude API Key Input */}
              <HStack gap="2">
                <Input
                  type={showClaudeKey ? 'text' : 'password'}
                  placeholder="sk-ant-api03-..."
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  size="sm"
                  fontFamily="monospace"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                  aria-label="Toggle token visibility"
                >
                  {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  size="sm"
                  colorPalette="orange"
                  variant="surface"
                  onClick={() => handleTestLlm('claude')}
                >
                  Ping Claude
                </Button>
              </HStack>

              {/* Model Selector */}
              <HStack justify="space-between" fontSize="sm" wrap="wrap" gap="2">
                <Text color="fg.muted" fontSize="xs">
                  Claude Model:
                </Text>
                <HStack gap="2">
                  <Button
                    size="xs"
                    variant={claudeModel.includes('3-5-sonnet') ? 'solid' : 'outline'}
                    colorPalette="orange"
                    onClick={() => setClaudeModel('claude-3-5-sonnet-20241022')}
                  >
                    3.5 Sonnet
                  </Button>
                  <Button
                    size="xs"
                    variant={claudeModel.includes('3-7-sonnet') ? 'solid' : 'outline'}
                    colorPalette="orange"
                    onClick={() => setClaudeModel('claude-3-7-sonnet')}
                  >
                    3.7 Sonnet
                  </Button>
                  <Button
                    size="xs"
                    variant={claudeModel.includes('3-haiku') ? 'solid' : 'outline'}
                    colorPalette="orange"
                    onClick={() => setClaudeModel('claude-3-haiku-20240307')}
                  >
                    3 Haiku
                  </Button>
                </HStack>
              </HStack>

              {/* 1-Click Auto Configure Under The Hood */}
              <Flex
                justify="space-between"
                align="center"
                bg="bg.panel"
                p="2.5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.subtle"
                wrap="wrap"
                gap="2"
              >
                <HStack gap="2">
                  <Wrench size={16} color="#d97706" />
                  <Text fontSize="xs" fontWeight="medium">
                    Авто-налаштування під капотом (без терміналу):
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  colorPalette="orange"
                  variant="solid"
                  onClick={() => handleAutoConfigure('claude')}
                  loading={isAutoConfiguring.claude}
                >
                  <Download size={13} style={{ marginRight: '4px' }} />
                  Підключити до Claude Desktop/CLI
                </Button>
              </Flex>

              {autoConfigStatus.claude && (
                <Box
                  p="2"
                  borderRadius="md"
                  bg={autoConfigStatus.claude.success ? 'green.950' : 'red.950'}
                  borderWidth="1px"
                  borderColor={autoConfigStatus.claude.success ? 'green.800' : 'red.800'}
                >
                  <Text
                    fontSize="xs"
                    color={autoConfigStatus.claude.success ? 'green.300' : 'red.300'}
                  >
                    {autoConfigStatus.claude.message} ({autoConfigStatus.claude.path})
                  </Text>
                </Box>
              )}

              {/* Claude CLI Manual Command */}
              <Box
                bg="blackAlpha.600"
                p="2.5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" gap="2" wrap="wrap">
                  <Text fontSize="xs" fontFamily="monospace" color="yellow.300">
                    {claudeCommand}
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => copyToClipboard('claude-cli', claudeCommand)}
                  >
                    <Copy size={13} style={{ marginRight: '4px' }} />
                    {copiedId === 'claude-cli' ? 'Скопійовано!' : 'Копіювати'}
                  </Button>
                </Flex>
              </Box>
            </VStack>
          </Box>

          {/* 2. ANTIGRAVITY CLI (AGY) */}
          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4" bg="bg.subtle">
            <Flex justify="space-between" align="center" mb="3" wrap="wrap" gap="2">
              <HStack gap="2">
                <Cpu size={18} color="#38bdf8" />
                <Heading size="sm" color="fg">
                  2. Antigravity CLI (agy) Swarm Integration
                </Heading>
              </HStack>
              <HStack gap="2">
                {detectedTools.agy?.installed && (
                  <Badge colorPalette="cyan" size="xs" variant="outline">
                    AGY INSTALLED
                  </Badge>
                )}
                <Badge colorPalette="blue" size="xs" variant="solid">
                  AGY READY
                </Badge>
              </HStack>
            </Flex>

            <VStack align="stretch" gap="3">
              <Text fontSize="xs" color="fg.muted">
                Підключіть CosmoLost Desktop MCP до Google Antigravity CLI (agy) під капотом або
                вручну для запуску рою агентів для створення відео.
              </Text>

              {/* 1-Click Auto Configure Under The Hood for AGY */}
              <Flex
                justify="space-between"
                align="center"
                bg="bg.panel"
                p="2.5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.subtle"
                wrap="wrap"
                gap="2"
              >
                <HStack gap="2">
                  <Wrench size={16} color="#38bdf8" />
                  <Text fontSize="xs" fontWeight="medium">
                    Авто-налаштування під капотом в Antigravity CLI:
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  colorPalette="blue"
                  variant="solid"
                  onClick={() => handleAutoConfigure('agy')}
                  loading={isAutoConfiguring.agy}
                >
                  <Download size={13} style={{ marginRight: '4px' }} />
                  Зареєструвати в AGY MCP
                </Button>
              </Flex>

              {autoConfigStatus.agy && (
                <Box
                  p="2"
                  borderRadius="md"
                  bg={autoConfigStatus.agy.success ? 'green.950' : 'red.950'}
                  borderWidth="1px"
                  borderColor={autoConfigStatus.agy.success ? 'green.800' : 'red.800'}
                >
                  <Text
                    fontSize="xs"
                    color={autoConfigStatus.agy.success ? 'green.300' : 'red.300'}
                  >
                    {autoConfigStatus.agy.message} ({autoConfigStatus.agy.path})
                  </Text>
                </Box>
              )}

              {/* AGY CLI Command */}
              <Box
                bg="blackAlpha.600"
                p="2.5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" gap="2" wrap="wrap">
                  <Text fontSize="xs" fontFamily="monospace" color="cyan.300">
                    {agyCommand}
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => copyToClipboard('agy-cli', agyCommand)}
                  >
                    <Copy size={13} style={{ marginRight: '4px' }} />
                    {copiedId === 'agy-cli' ? 'Скопійовано!' : 'Копіювати'}
                  </Button>
                </Flex>
              </Box>
              <Text fontSize="xs" color="fg.muted">
                Правила та контракти для агентів: <code>.agents/rules/cli-integrations.md</code>
              </Text>
            </VStack>
          </Box>

          {/* 3. OPENAI / CODEX CLI & CUSTOM OPENAPI */}
          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4" bg="bg.subtle">
            <Flex justify="space-between" align="center" mb="3">
              <HStack gap="2">
                <Server size={18} color="#10b981" />
                <Heading size="sm" color="fg">
                  3. OpenAI / Codex CLI & Custom OpenAPI
                </Heading>
              </HStack>
              {openaiApiKey ? (
                <Badge colorPalette="green" size="xs" variant="solid">
                  TOKEN CONFIGURED
                </Badge>
              ) : (
                <Badge colorPalette="gray" size="xs" variant="subtle">
                  NO TOKEN
                </Badge>
              )}
            </Flex>

            <VStack align="stretch" gap="3">
              <Text fontSize="xs" color="fg.muted">
                OpenAI API Token (формат <code>sk-...</code>) або локальний OpenAPI endpoint
                (Ollama, LM Studio, vLLM).
              </Text>

              {/* OpenAI API Key Input */}
              <HStack gap="2">
                <Input
                  type={showOpenaiKey ? 'text' : 'password'}
                  placeholder="sk-proj-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  size="sm"
                  fontFamily="monospace"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  aria-label="Toggle token visibility"
                >
                  {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  size="sm"
                  colorPalette="green"
                  variant="surface"
                  onClick={() => handleTestLlm('openai')}
                >
                  Ping OpenAI
                </Button>
              </HStack>

              {/* Model Selector & Custom Endpoint */}
              <HStack justify="space-between" fontSize="sm" wrap="wrap" gap="2">
                <Text color="fg.muted" fontSize="xs">
                  OpenAI Model:
                </Text>
                <HStack gap="2">
                  <Button
                    size="xs"
                    variant={openaiModel === 'gpt-4o' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setOpenaiModel('gpt-4o')}
                  >
                    GPT-4o
                  </Button>
                  <Button
                    size="xs"
                    variant={openaiModel === 'gpt-4o-mini' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setOpenaiModel('gpt-4o-mini')}
                  >
                    4o-mini
                  </Button>
                  <Button
                    size="xs"
                    variant={openaiModel === 'o3-mini' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setOpenaiModel('o3-mini')}
                  >
                    o3-mini
                  </Button>
                </HStack>
              </HStack>

              <VStack align="stretch" gap="1">
                <Text fontSize="xs" color="fg.muted">
                  Custom Local Endpoint (Ollama / Local LLM):
                </Text>
                <Input
                  placeholder="http://localhost:11434/v1"
                  value={customLlmEndpoint}
                  onChange={(e) => setCustomLlmEndpoint(e.target.value)}
                  size="sm"
                  fontFamily="monospace"
                />
              </VStack>

              {/* Codex CLI command */}
              <Box
                bg="blackAlpha.600"
                p="2.5"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" gap="2" wrap="wrap">
                  <Text fontSize="xs" fontFamily="monospace" color="green.300">
                    {codexCommand}
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => copyToClipboard('codex-cli', codexCommand)}
                  >
                    <Copy size={13} style={{ marginRight: '4px' }} />
                    {copiedId === 'codex-cli' ? 'Скопійовано!' : 'Копіювати'}
                  </Button>
                </Flex>
              </Box>
            </VStack>
          </Box>

          {/* 4. MEDIA GENERATION STUDIO: ФОТО, ВІДЕО ТА МУЗИКА */}
          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4" bg="bg.subtle">
            <Flex justify="space-between" align="center" mb="3">
              <HStack gap="2">
                <Sparkles size={18} color="#ec4899" />
                <Heading size="sm" color="fg">
                  4. Media Generation Studio: Відео, Фото та Музика
                </Heading>
              </HStack>
              <Badge colorPalette="pink" size="xs" variant="solid">
                AI MULTIMEDIA SUITE
              </Badge>
            </Flex>

            <VStack align="stretch" gap="4">
              {/* SUB-SECTION: ФОТО */}
              <Box
                p="3"
                borderRadius="md"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" mb="2">
                  <HStack gap="2">
                    <ImageIcon size={16} color="#ec4899" />
                    <Text fontSize="xs" fontWeight="semibold">
                      Генерація фото (Image Synthesis):
                    </Text>
                  </HStack>
                  <Badge colorPalette="pink" size="xs">
                    {imageProvider}
                  </Badge>
                </Flex>
                <HStack gap="2" wrap="wrap" mb="2">
                  <Button
                    size="2xs"
                    variant={imageProvider === 'pollinations-free' ? 'solid' : 'outline'}
                    colorPalette="purple"
                    onClick={() => setImageProvider('pollinations-free')}
                  >
                    Pollinations AI (Безкоштовно)
                  </Button>
                  <Button
                    size="2xs"
                    variant={imageProvider === 'openai-dalle' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setImageProvider('openai-dalle')}
                  >
                    OpenAI DALL-E 3
                  </Button>
                  <Button
                    size="2xs"
                    variant={imageProvider === 'gemini-imagen' ? 'solid' : 'outline'}
                    colorPalette="blue"
                    onClick={() => setImageProvider('gemini-imagen')}
                  >
                    Gemini Imagen
                  </Button>
                </HStack>
                <Button
                  size="xs"
                  colorPalette="pink"
                  variant="surface"
                  onClick={handleGenerateImage}
                >
                  <Sparkles size={13} style={{ marginRight: '4px' }} />
                  Згенерувати тестове фото Марса
                </Button>
              </Box>

              {/* SUB-SECTION: ВІДЕО */}
              <Box
                p="3"
                borderRadius="md"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" mb="2">
                  <HStack gap="2">
                    <Film size={16} color="#8b5cf6" />
                    <Text fontSize="xs" fontWeight="semibold">
                      Генерація відео (Video Motion Synthesis):
                    </Text>
                  </HStack>
                  <Badge colorPalette="purple" size="xs">
                    {videoProvider}
                  </Badge>
                </Flex>
                <HStack gap="2" wrap="wrap" mb="2">
                  <Button
                    size="2xs"
                    variant={videoProvider === 'pollinations-motion' ? 'solid' : 'outline'}
                    colorPalette="purple"
                    onClick={() => setVideoProvider('pollinations-motion')}
                  >
                    Pollinations Motion (Безкоштовно)
                  </Button>
                  <Button
                    size="2xs"
                    variant={videoProvider === 'local-procedural' ? 'solid' : 'outline'}
                    colorPalette="teal"
                    onClick={() => setVideoProvider('local-procedural')}
                  >
                    Local Procedural 60fps
                  </Button>
                  <Button
                    size="2xs"
                    variant={videoProvider === 'runway-gen3' ? 'solid' : 'outline'}
                    colorPalette="orange"
                    onClick={() => setVideoProvider('runway-gen3')}
                  >
                    Runway Gen-3
                  </Button>
                  <Button
                    size="2xs"
                    variant={videoProvider === 'luma-dream' ? 'solid' : 'outline'}
                    colorPalette="cyan"
                    onClick={() => setVideoProvider('luma-dream')}
                  >
                    Luma Dream
                  </Button>
                </HStack>
                {videoProvider === 'runway-gen3' && (
                  <Input
                    size="xs"
                    placeholder="Введіть Runway API Key..."
                    value={runwayApiKey}
                    onChange={(e) => setRunwayApiKey(e.target.value)}
                    type="password"
                    mb="2"
                    fontFamily="monospace"
                  />
                )}
                <Button
                  size="xs"
                  colorPalette="purple"
                  variant="surface"
                  onClick={handleGenerateVideo}
                >
                  <Play size={13} style={{ marginRight: '4px' }} />
                  Згенерувати 5s відеофрагмент
                </Button>
              </Box>

              {/* SUB-SECTION: МУЗИКА */}
              <Box
                p="3"
                borderRadius="md"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                <Flex justify="space-between" align="center" mb="2">
                  <HStack gap="2">
                    <Music size={16} color="#06b6d4" />
                    <Text fontSize="xs" fontWeight="semibold">
                      Генерація космічної музики (Soundtrack & Synth):
                    </Text>
                  </HStack>
                  <Badge colorPalette="cyan" size="xs">
                    {musicProvider}
                  </Badge>
                </Flex>
                <HStack gap="2" wrap="wrap" mb="2">
                  <Button
                    size="2xs"
                    variant={musicProvider === 'procedural-drone-synth' ? 'solid' : 'outline'}
                    colorPalette="cyan"
                    onClick={() => setMusicProvider('procedural-drone-synth')}
                  >
                    Procedural Drone Synth (55Hz Offline)
                  </Button>
                  <Button
                    size="2xs"
                    variant={musicProvider === 'nasa-space-sounds' ? 'solid' : 'outline'}
                    colorPalette="blue"
                    onClick={() => setMusicProvider('nasa-space-sounds')}
                  >
                    NASA InSight / Voyager Audio
                  </Button>
                  <Button
                    size="2xs"
                    variant={musicProvider === 'suno-ai' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setMusicProvider('suno-ai')}
                  >
                    Suno AI API
                  </Button>
                </HStack>
                {musicProvider === 'suno-ai' && (
                  <Input
                    size="xs"
                    placeholder="Введіть Suno API Key..."
                    value={sunoApiKey}
                    onChange={(e) => setSunoApiKey(e.target.value)}
                    type="password"
                    mb="2"
                    fontFamily="monospace"
                  />
                )}
                <HStack gap="2">
                  <Button
                    size="xs"
                    colorPalette="cyan"
                    variant="surface"
                    onClick={handleGenerateMusic}
                  >
                    <Music size={13} style={{ marginRight: '4px' }} />
                    Синтезувати космічний трек
                  </Button>
                  {mediaResult?.type === 'music' && (
                    <Button
                      size="xs"
                      colorPalette={isPlayingMusic ? 'red' : 'green'}
                      variant="outline"
                      onClick={toggleMusicPlayback}
                    >
                      {isPlayingMusic ? (
                        <>
                          <Square size={12} style={{ marginRight: '4px' }} /> Зупинити
                        </>
                      ) : (
                        <>
                          <Play size={12} style={{ marginRight: '4px' }} /> Прослухати
                        </>
                      )}
                    </Button>
                  )}
                </HStack>
              </Box>

              {/* MEDIA PREVIEW BOX */}
              {mediaResult && (
                <Box p="3" borderRadius="md" bg="#090d16" borderWidth="1px" borderColor="#1e293b">
                  <Text fontSize="xs" color="yellow.300" fontWeight="medium" mb="1">
                    Результат генерації ({mediaResult.type.toUpperCase()}):
                  </Text>
                  <Text fontSize="xs" color="fg.muted" fontFamily="monospace">
                    {mediaResult.info}
                  </Text>
                  <Text
                    fontSize="2xs"
                    color="gray.400"
                    fontFamily="monospace"
                    mt="1"
                    wordBreak="break-all"
                  >
                    URL: {mediaResult.url}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* 5. CLI INTERCEPTOR BRIDGE ("ПЕРЕХВАТКА") & SIMULATOR */}
          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p="4" bg="bg.subtle">
            <Flex justify="space-between" align="center" mb="3">
              <HStack gap="2">
                <Radio size={18} color="#06b6d4" />
                <Heading size="sm" color="fg">
                  5. CLI Interceptor Bridge & Terminal Simulator ("Перехватка")
                </Heading>
              </HStack>
              <Badge
                colorPalette={cliInterceptionEnabled ? 'teal' : 'gray'}
                size="xs"
                variant="solid"
              >
                {cliInterceptionEnabled ? `PORT ${cliBridgePort} ONLINE` : 'DISABLED'}
              </Badge>
            </Flex>

            <VStack align="stretch" gap="3">
              <HStack justify="space-between" wrap="wrap" gap="2">
                <Button
                  size="xs"
                  variant={cliInterceptionEnabled ? 'solid' : 'outline'}
                  colorPalette="teal"
                  onClick={() => setCliInterceptionEnabled(!cliInterceptionEnabled)}
                >
                  {cliInterceptionEnabled ? 'Перехватка: УВІМКНЕНО' : 'Перехватка: ВИМКНЕНО'}
                </Button>
                <HStack gap="2">
                  <Text fontSize="xs" color="fg.muted">
                    Port:
                  </Text>
                  <Input
                    type="number"
                    size="xs"
                    width="80px"
                    value={cliBridgePort}
                    onChange={(e) => setCliBridgePort(Number(e.target.value))}
                    fontFamily="monospace"
                  />
                </HStack>
              </HStack>

              {/* Preset Quick Commands */}
              <HStack gap="1.5" wrap="wrap">
                <Text fontSize="xs" color="fg.muted">
                  Швидкі команди:
                </Text>
                <Button
                  size="2xs"
                  variant="outline"
                  onClick={() => {
                    setSimulatedCmd('cosmolost status');
                    handleRunCliCommand('cosmolost status');
                  }}
                >
                  cosmolost status
                </Button>
                <Button
                  size="2xs"
                  variant="outline"
                  onClick={() => {
                    setSimulatedCmd('cosmolost ping');
                    handleRunCliCommand('cosmolost ping');
                  }}
                >
                  cosmolost ping
                </Button>
                <Button
                  size="2xs"
                  variant="outline"
                  onClick={() => {
                    setSimulatedCmd('cosmolost generate --artifact opportunity-rover');
                    handleRunCliCommand('cosmolost generate --artifact opportunity-rover');
                  }}
                >
                  cosmolost generate
                </Button>
                <Button
                  size="2xs"
                  variant="outline"
                  onClick={() => {
                    setSimulatedCmd('cosmolost help');
                    handleRunCliCommand('cosmolost help');
                  }}
                >
                  cosmolost help
                </Button>
              </HStack>

              {/* Terminal Command Input & Runner */}
              <HStack gap="2">
                <Input
                  placeholder="Введіть CLI команду (e.g. cosmolost status)"
                  value={simulatedCmd}
                  onChange={(e) => setSimulatedCmd(e.target.value)}
                  size="sm"
                  fontFamily="monospace"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunCliCommand();
                  }}
                />
                <Button
                  size="sm"
                  colorPalette="teal"
                  onClick={() => handleRunCliCommand()}
                  loading={isExecutingCli}
                >
                  <Play size={14} style={{ marginRight: '6px' }} />
                  Виконати
                </Button>
              </HStack>

              {/* Terminal Monospace Output */}
              {cliOutput && (
                <Box
                  p="3"
                  borderRadius="md"
                  bg="#090d16"
                  borderWidth="1px"
                  borderColor="#1e293b"
                  fontFamily="monospace"
                  fontSize="xs"
                  color="#38bdf8"
                  maxH="200px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                >
                  {cliOutput}
                </Box>
              )}
            </VStack>
          </Box>

          {/* Master Save Button */}
          <Flex justify="flex-end" pt="2">
            <Button size="md" colorPalette="blue" onClick={handleSaveSettings}>
              <CheckCircle2 size={16} style={{ marginRight: '8px' }} />
              Зберегти налаштування CLI, Токенів та Медіа
            </Button>
          </Flex>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
