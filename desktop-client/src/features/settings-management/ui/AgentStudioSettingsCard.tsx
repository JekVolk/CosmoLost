import { type AgentProfile, DEFAULT_AGENT_PROFILES, useSettingsStore } from '@/entities/settings';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Input,
  Separator,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import {
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  FileCode,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { downloadAgent, downloadAllAgents } from '../api/agent-export-service';

const AVAILABLE_MODELS = [
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { id: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Google)' },
  { id: 'custom-local', label: 'Custom Local LLM (Ollama / LM Studio)' },
];

export function AgentStudioSettingsCard() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const agents: AgentProfile[] = settings.agentProfiles ?? DEFAULT_AGENT_PROFILES;

  const fallbackAgent: AgentProfile = DEFAULT_AGENT_PROFILES[0] as AgentProfile;
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id ?? 'scriptwriter');
  const activeAgent: AgentProfile =
    agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? fallbackAgent;

  // Local draft state for current agent
  const [draftName, setDraftName] = useState(activeAgent.name);
  const [draftRole, setDraftRole] = useState(activeAgent.role);
  const [draftModel, setDraftModel] = useState(activeAgent.model);
  const [draftTemperature, setDraftTemperature] = useState(activeAgent.temperature);
  const [draftPrompt, setDraftPrompt] = useState(activeAgent.systemPrompt);
  const [draftDescription, setDraftDescription] = useState(activeAgent.description);
  const [draftEnabled, setDraftEnabled] = useState(activeAgent.enabled);

  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    const target = agents.find((a) => a.id === agentId);
    if (target) {
      setDraftName(target.name);
      setDraftRole(target.role);
      setDraftModel(target.model);
      setDraftTemperature(target.temperature);
      setDraftPrompt(target.systemPrompt);
      setDraftDescription(target.description);
      setDraftEnabled(target.enabled);
    }
  };

  const handleSaveCurrentAgent = () => {
    const updatedAgents = agents.map((a) => {
      if (a.id === selectedAgentId) {
        return {
          ...a,
          name: draftName,
          role: draftRole,
          model: draftModel,
          temperature: draftTemperature,
          systemPrompt: draftPrompt,
          description: draftDescription,
          enabled: draftEnabled,
        };
      }
      return a;
    });

    updateSettings({ agentProfiles: updatedAgents });
    setNotification({
      type: 'success',
      message: `Профіль агента [${draftName}] успішно збережено в нативне сховище!`,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleResetToDefaults = () => {
    updateSettings({ agentProfiles: DEFAULT_AGENT_PROFILES });
    const target = DEFAULT_AGENT_PROFILES.find((a) => a.id === selectedAgentId) ?? fallbackAgent;
    setDraftName(target.name);
    setDraftRole(target.role);
    setDraftModel(target.model);
    setDraftTemperature(target.temperature);
    setDraftPrompt(target.systemPrompt);
    setDraftDescription(target.description);
    setDraftEnabled(target.enabled);
    setNotification({
      type: 'info',
      message: 'Всі профілі агентів скинуто до заводських налаштувань.',
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadMarkdown = () => {
    const current: AgentProfile = {
      id: activeAgent.id,
      name: draftName,
      role: draftRole,
      model: draftModel,
      temperature: draftTemperature,
      systemPrompt: draftPrompt,
      description: draftDescription,
      enabled: draftEnabled,
    };
    downloadAgent(current, 'markdown');
    setNotification({
      type: 'success',
      message: `Файл навичок ${current.id}-skill.md завантажено для Antigravity CLI / Claude CLI!`,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadJson = () => {
    const current: AgentProfile = {
      id: activeAgent.id,
      name: draftName,
      role: draftRole,
      model: draftModel,
      temperature: draftTemperature,
      systemPrompt: draftPrompt,
      description: draftDescription,
      enabled: draftEnabled,
    };
    downloadAgent(current, 'json');
    setNotification({
      type: 'success',
      message: `JSON-конфігурацію агента ${current.id}-agent.json завантажено!`,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadAllBundle = () => {
    downloadAllAgents(agents);
    setNotification({
      type: 'success',
      message: `Повний бандл з ${agents.length} агентів завантажено (cosmolost-agents-bundle.json)!`,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <Card.Root bg="bg.panel" borderColor="border.subtle" borderWidth="1px" borderRadius="xl">
      <Card.Header pb="2">
        <Flex justify="space-between" align="center" wrap="wrap" gap="2">
          <HStack gap="2">
            <Bot size={20} color="#38bdf8" />
            <Heading size="md" color="fg">
              Студія Агентів CosmoLost & Профілі ШІ
            </Heading>
          </HStack>
          <HStack gap="2" wrap="wrap">
            <Badge colorPalette="cyan" variant="solid">
              Multi-Agent Engine
            </Badge>
            <Badge colorPalette="purple" variant="subtle">
              {agents.filter((a) => a.enabled).length}/{agents.length} Активно
            </Badge>
            <Button
              size="xs"
              variant="outline"
              colorPalette="cyan"
              onClick={handleDownloadAllBundle}
            >
              <Download size={13} />
              Завантажити всіх агентів (.json)
            </Button>
            <Button size="xs" variant="ghost" colorPalette="gray" onClick={handleResetToDefaults}>
              <RotateCcw size={13} />
              Скинути до стандартних
            </Button>
          </HStack>
        </Flex>
        <Text color="fg.muted" fontSize="sm" mt="1">
          Налаштовуйте ролі агентів, прописуйте індивідуальні системні інструкції (System Prompt),
          обирайте моделі ШІ та завантажуйте готові скіли/профілі для Antigravity CLI, Claude CLI та
          OpenAI Codex.
        </Text>
      </Card.Header>

      <Card.Body pt="3">
        <VStack align="stretch" gap="5">
          {notification && (
            <Box
              p="3"
              borderRadius="md"
              bg={notification.type === 'success' ? 'green.950' : 'blue.950'}
              borderWidth="1px"
              borderColor={notification.type === 'success' ? 'green.800' : 'blue.800'}
            >
              <HStack gap="2">
                <CheckCircle2
                  size={16}
                  color={notification.type === 'success' ? '#22c55e' : '#38bdf8'}
                />
                <Text
                  fontSize="sm"
                  color={notification.type === 'success' ? 'green.200' : 'blue.200'}
                >
                  {notification.message}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Agent Selection Switcher */}
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb="2">
              Оберіть агента для редагування та завантаження:
            </Text>
            <Flex wrap="wrap" gap="2">
              {agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                return (
                  <Button
                    key={agent.id}
                    size="sm"
                    variant={isSelected ? 'solid' : 'outline'}
                    colorPalette={isSelected ? 'blue' : 'gray'}
                    onClick={() => handleSelectAgent(agent.id)}
                  >
                    <Sparkles size={14} />
                    {agent.name}
                    <Badge
                      size="xs"
                      ml="1"
                      colorPalette={agent.enabled ? 'green' : 'gray'}
                      variant="subtle"
                    >
                      {agent.role.split(' ')[0]}
                    </Badge>
                  </Button>
                );
              })}
            </Flex>
          </Box>

          <Separator borderColor="border.subtle" />

          {/* Active Agent Configuration Form */}
          <Box p="4" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
            <VStack align="stretch" gap="4">
              <Flex justify="space-between" align="center" wrap="wrap" gap="2">
                <HStack gap="2">
                  <Cpu size={18} color="#60a5fa" />
                  <Heading size="sm" color="fg">
                    Налаштування агента: {draftName}
                  </Heading>
                </HStack>
                <HStack gap="2">
                  <Button
                    size="xs"
                    variant={draftEnabled ? 'solid' : 'outline'}
                    colorPalette={draftEnabled ? 'green' : 'gray'}
                    onClick={() => setDraftEnabled(!draftEnabled)}
                  >
                    {draftEnabled ? '● Агент увімкнений' : '○ Агент вимкнений'}
                  </Button>
                </HStack>
              </Flex>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Box flex="1">
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
                    Назва агента:
                  </Text>
                  <Input
                    size="sm"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Наприклад: CosmoScriptwriter"
                  />
                </Box>
                <Box flex="1">
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
                    Роль / Спеціалізація:
                  </Text>
                  <Input
                    size="sm"
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    placeholder="Наприклад: Viral Space Scriptwriter"
                  />
                </Box>
              </Flex>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Box flex="2">
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
                    Призначена модель ШІ (Default Model):
                  </Text>
                  <HStack gap="2" wrap="wrap">
                    {AVAILABLE_MODELS.map((m) => (
                      <Button
                        key={m.id}
                        size="xs"
                        variant={draftModel === m.id ? 'solid' : 'outline'}
                        colorPalette={draftModel === m.id ? 'purple' : 'gray'}
                        onClick={() => setDraftModel(m.id)}
                      >
                        {m.label}
                      </Button>
                    ))}
                  </HStack>
                </Box>
                <Box flex="1">
                  <HStack justify="space-between" mb="1">
                    <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                      Температура генерації:
                    </Text>
                    <Badge size="xs" colorPalette="yellow">
                      {draftTemperature}
                    </Badge>
                  </HStack>
                  <HStack gap="2">
                    {[0.2, 0.5, 0.7, 0.8, 1.0].map((temp) => (
                      <Button
                        key={temp}
                        size="xs"
                        variant={draftTemperature === temp ? 'solid' : 'outline'}
                        colorPalette={draftTemperature === temp ? 'yellow' : 'gray'}
                        onClick={() => setDraftTemperature(temp)}
                      >
                        {temp}
                      </Button>
                    ))}
                  </HStack>
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb="1">
                  Короткий опис компетенцій агента:
                </Text>
                <Input
                  size="sm"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Опис завдань агента"
                />
              </Box>

              {/* System Prompt Textarea */}
              <Box>
                <HStack justify="space-between" align="center" mb="1">
                  <HStack gap="1.5">
                    <FileCode size={14} color="#a78bfa" />
                    <Text fontSize="xs" fontWeight="semibold" color="fg">
                      Системні інструкції (System Prompt / Persona):
                    </Text>
                  </HStack>
                  <Badge size="xs" colorPalette="purple" variant="outline">
                    {draftPrompt.length} символів
                  </Badge>
                </HStack>
                <Textarea
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  rows={8}
                  fontFamily="monospace"
                  fontSize="xs"
                  bg="bg.surface"
                  borderColor="border.subtle"
                  placeholder="Введіть системні інструкції для агента..."
                />
                <Text fontSize="2xs" color="fg.muted" mt="1">
                  Цей системний промпт передається в LLM або експортується в навик Antigravity CLI /
                  Claude CLI для автономного виконання завдань.
                </Text>
              </Box>

              {/* Action Buttons for Active Agent */}
              <Flex justify="space-between" align="center" wrap="wrap" gap="2" pt="2">
                <HStack gap="2">
                  <Button size="sm" colorPalette="blue" onClick={handleSaveCurrentAgent}>
                    <Save size={14} />
                    Зберегти агента
                  </Button>
                </HStack>

                <HStack gap="2" wrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={handleDownloadMarkdown}
                  >
                    <Download size={14} />
                    Завантажити (.md / AGY Skill)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="teal"
                    onClick={handleDownloadJson}
                  >
                    <Download size={14} />
                    Завантажити (.json)
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
