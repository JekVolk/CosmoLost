import { usePublicationStore } from '@/entities/publication';
import { Badge, Box, Button, Card, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { Check, CheckCircle2, Download, Film, Sparkles, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameplayRecorder } from '../model/use-gameplay-recorder';
import { useGameplaySimulation } from '../model/use-gameplay-simulation';
import { useGameplayStore } from '../model/use-gameplay-store';
import { GameplayCanvas } from './GameplayCanvas';
import { GameplayControlsBar } from './GameplayControlsBar';

export const GameplayBrollModal: React.FC = () => {
  const { isModalOpen, closeModal, savedClips, addClip, deleteClip, attachToActiveProject } =
    useGameplayStore();
  const currentProject = usePublicationStore((s) => s.currentProject);

  const [recordDuration, setRecordDuration] = useState(15);
  const [attachedClipId, setAttachedClipId] = useState<string | null>(null);

  const { canvasRef, config, updateConfig, telemetry, triggerJump } = useGameplaySimulation();

  const { isRecording, recordedSeconds, startRecording, stopRecording } = useGameplayRecorder({
    canvasRef,
    preset: config.preset,
    avatar: config.avatar,
    aspectRatio: config.aspectRatio,
    onClipReady: (clip) => {
      addClip(clip);
    },
  });

  if (!isModalOpen) return null;

  const handleAttachClip = (clip: (typeof savedClips)[0]) => {
    attachToActiveProject(clip);
    setAttachedClipId(clip.id);
    setTimeout(() => setAttachedClipId(null), 3000);
  };

  const handleDownload = (clip: (typeof savedClips)[0]) => {
    const a = document.createElement('a');
    a.href = clip.videoBlobUrl;
    a.download = `cosmolost-broll-${clip.preset.toLowerCase()}-${clip.durationSec}s.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box
      position="fixed"
      inset="0"
      bg="blackAlpha.800"
      backdropFilter="blur(6px)"
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="4"
    >
      <Card.Root
        maxW="1180px"
        width="100%"
        maxH="92vh"
        overflowY="auto"
        bg="bg.panel"
        borderColor="border.subtle"
        borderWidth="1px"
        borderRadius="2xl"
        boxShadow="2xl"
        p="6"
      >
        {/* Header */}
        <Card.Header p="0" mb="5">
          <Flex justify="space-between" align="center" wrap="wrap" gap="3">
            <HStack gap="3">
              <Box p="2" borderRadius="lg" bg="purple.950" color="purple.300">
                <Sparkles size={20} />
              </Box>
              <VStack align="start" gap="0">
                <HStack gap="2">
                  <Heading size="md" color="fg">
                    Генератор Псевдо-Геймплею (NASA Moon/Mars Parkour B-Roll)
                  </Heading>
                  <Badge
                    colorPalette="teal"
                    variant="solid"
                    size="sm"
                    px="2.5"
                    py="0.5"
                    borderRadius="md"
                  >
                    Procedural 60 FPS
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  Задовольняюче нескінченне процедурне фонове відео (Subway Surfers / Minecraft
                  стиль) для утримання уваги в Shorts та TikTok.
                </Text>
              </VStack>
            </HStack>

            <Button size="xs" variant="ghost" onClick={closeModal}>
              <X size={16} />
            </Button>
          </Flex>
        </Card.Header>

        <Card.Body p="0">
          <Flex direction={{ base: 'column', lg: 'row' }} gap="6" align="start">
            {/* Left: Simulation Canvas Preview */}
            <Box flex={{ base: '1', lg: '1.2' }} width="100%">
              <GameplayCanvas
                canvasRef={canvasRef}
                config={config}
                telemetry={telemetry}
                isRecording={isRecording}
                recordedSeconds={recordedSeconds}
                targetSeconds={recordDuration}
                onJump={triggerJump}
              />
            </Box>

            {/* Right: Controls & Generated Clips */}
            <Box flex={{ base: '1', lg: '1' }} width="100%">
              <VStack align="stretch" gap="5">
                <GameplayControlsBar
                  config={config}
                  onUpdateConfig={updateConfig}
                  isRecording={isRecording}
                  recordedSeconds={recordedSeconds}
                  onStartRecord={(sec) => startRecording(sec)}
                  onStopRecord={() => stopRecording()}
                  recordDuration={recordDuration}
                  onSelectRecordDuration={setRecordDuration}
                />

                {/* Generated Clips Shelf */}
                <VStack align="stretch" gap="3" pt="2">
                  <HStack justify="space-between">
                    <HStack gap="2">
                      <Film size={15} color="#a855f7" />
                      <Text fontSize="xs" fontWeight="bold" color="fg">
                        Згенеровані кліпи B-Roll ({savedClips.length})
                      </Text>
                    </HStack>
                    {currentProject && (
                      <Badge colorPalette="blue" size="xs" px="2" py="0.5" borderRadius="md">
                        Проект: {currentProject.artifactName || 'Активний'}
                      </Badge>
                    )}
                  </HStack>

                  {savedClips.length === 0 ? (
                    <Box
                      p="4"
                      borderRadius="lg"
                      bg="bg.subtle"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      textAlign="center"
                    >
                      <Text fontSize="xs" color="fg.muted">
                        Натисніть кнопку «Записати кліп», щоб згенерувати плавний 60 FPS B-Roll
                        ролик і вставити його на фон ваших відео!
                      </Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" gap="3" maxH="280px" overflowY="auto">
                      {savedClips.map((clip) => {
                        const isAttached =
                          attachedClipId === clip.id ||
                          currentProject?.brollVideoUrl === clip.videoBlobUrl;

                        return (
                          <Box
                            key={clip.id}
                            p="3"
                            borderRadius="lg"
                            bg="bg.subtle"
                            borderWidth="1px"
                            borderColor={isAttached ? 'teal.500' : 'border.subtle'}
                          >
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between" align="center">
                                <HStack gap="2">
                                  <Badge
                                    colorPalette="cyan"
                                    size="xs"
                                    px="2"
                                    py="0.5"
                                    borderRadius="md"
                                  >
                                    {clip.preset.replace('_', ' ')}
                                  </Badge>
                                  <Badge
                                    colorPalette="purple"
                                    size="xs"
                                    px="2"
                                    py="0.5"
                                    borderRadius="md"
                                  >
                                    {clip.durationSec}с
                                  </Badge>
                                  <Badge
                                    colorPalette="gray"
                                    size="xs"
                                    px="2"
                                    py="0.5"
                                    borderRadius="md"
                                  >
                                    {clip.aspectRatio}
                                  </Badge>
                                </HStack>

                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorPalette="red"
                                  onClick={() => deleteClip(clip.id)}
                                  title="Видалити кліп"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </HStack>

                              {/* Video Playback Tag */}
                              <Box borderRadius="md" overflow="hidden" maxH="140px" bg="black">
                                <video
                                  src={clip.videoBlobUrl}
                                  controls
                                  loop
                                  muted
                                  style={{ width: '100%', maxHeight: '140px' }}
                                >
                                  <track kind="captions" />
                                </video>
                              </Box>

                              <HStack gap="2">
                                <Button
                                  size="xs"
                                  variant={isAttached ? 'solid' : 'outline'}
                                  colorPalette={isAttached ? 'teal' : 'blue'}
                                  onClick={() => handleAttachClip(clip)}
                                  disabled={!currentProject}
                                  title={
                                    currentProject
                                      ? 'Вставити як фоновий шар для монтажу FFmpeg'
                                      : 'Створіть або відкрийте проект на Фабриці'
                                  }
                                >
                                  {isAttached ? <Check size={13} /> : <CheckCircle2 size={13} />}
                                  {isAttached ? 'Вставлено в проект!' : 'Вставити у проект'}
                                </Button>

                                <Button
                                  size="xs"
                                  variant="subtle"
                                  onClick={() => handleDownload(clip)}
                                >
                                  <Download size={13} />
                                  Завантажити
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              </VStack>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
