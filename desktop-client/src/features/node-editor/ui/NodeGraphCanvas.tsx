import { Badge, Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle2, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNodeGraphStore } from '../model/use-node-graph-store';
import { ArtifactSourceNode } from './nodes/ArtifactSourceNode';
import { AudioBgmNode } from './nodes/AudioBgmNode';
import { AudioTtsNode } from './nodes/AudioTtsNode';
import { FfmpegRenderNode } from './nodes/FfmpegRenderNode';
import { HookScorerNode } from './nodes/HookScorerNode';
import { PngTuberNode } from './nodes/PngTuberNode';
import { SafeZonePreviewNode } from './nodes/SafeZonePreviewNode';
import { ScriptTemplateNode } from './nodes/ScriptTemplateNode';
import { SocialPublishNode } from './nodes/SocialPublishNode';
import { SubtitleNode } from './nodes/SubtitleNode';
import { VisualCompositeNode } from './nodes/VisualCompositeNode';

const nodeTypes = {
  artifactSource: ArtifactSourceNode,
  scriptTemplate: ScriptTemplateNode,
  hookScorer: HookScorerNode,
  audioTts: AudioTtsNode,
  audioBgm: AudioBgmNode,
  pngTuber: PngTuberNode,
  subtitle: SubtitleNode,
  safeZonePreview: SafeZonePreviewNode,
  visualComposite: VisualCompositeNode,
  ffmpegRender: FfmpegRenderNode,
  socialPublish: SocialPublishNode,
};

export function NodeGraphCanvas() {
  const {
    nodes,
    edges,
    isPipelineRunning,
    lastExecutionResult,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetToDefaultLayout,
    runPipelineValidation,
    runPipelineExecution,
  } = useNodeGraphStore();

  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
  } | null>(null);

  const handleValidate = () => {
    const res = runPipelineValidation();
    setValidationResult(res);
  };

  const handleExecute = async () => {
    const valid = runPipelineValidation();
    setValidationResult(valid);
    if (!valid.isValid) return;

    await runPipelineExecution();
  };

  return (
    <Box
      width="100%"
      height="620px"
      borderRadius="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg.panel"
      position="relative"
    >
      {/* Top Floating Control Bar */}
      <Flex
        position="absolute"
        top="3"
        left="3"
        right="3"
        zIndex="10"
        justify="space-between"
        align="center"
        bg="rgba(9, 13, 22, 0.85)"
        backdropFilter="blur(10px)"
        p="2"
        px="4"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.subtle"
      >
        <HStack gap="2">
          <Text fontWeight="semibold" fontSize="xs" color="fg">
            Нодовий Пайплайн Контенту (@xyflow/react):
          </Text>
          <Badge colorPalette="teal" size="xs">
            {nodes.length} Нод
          </Badge>
          <Badge colorPalette="purple" size="xs">
            {edges.length} Зв'язків
          </Badge>
        </HStack>

        <HStack gap="2">
          {validationResult && (
            <Badge
              colorPalette={validationResult.isValid ? 'green' : 'red'}
              size="xs"
              variant="subtle"
            >
              {validationResult.isValid
                ? 'DAG Валідний'
                : `Помилок: ${validationResult.issues.length}`}
            </Badge>
          )}

          {lastExecutionResult && (
            <Badge
              colorPalette={lastExecutionResult.success ? 'green' : 'red'}
              size="xs"
              variant="solid"
            >
              {lastExecutionResult.success
                ? `Успіх: Hook ${lastExecutionResult.hookViralityScore}/100 • ${lastExecutionResult.totalDurationSec}с`
                : 'Помилка виконання'}
            </Badge>
          )}

          <Button
            size="xs"
            colorPalette="teal"
            variant="solid"
            loading={isPipelineRunning}
            onClick={handleExecute}
          >
            <Play size={12} />
            Запустити Пайплайн
          </Button>

          <Button size="xs" variant="subtle" onClick={handleValidate}>
            <CheckCircle2 size={12} />
            Валідувати Граф
          </Button>

          <Button
            size="xs"
            variant="outline"
            onClick={resetToDefaultLayout}
            title="Скинути до стандартного розміщення"
          >
            <RotateCcw size={12} />
            Скинути Розміщення
          </Button>
        </HStack>
      </Flex>

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </Box>
  );
}
