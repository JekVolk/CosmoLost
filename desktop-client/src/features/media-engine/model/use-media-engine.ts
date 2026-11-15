import { usePublicationStore } from '@/entities/publication';
import { edgeTts, tauriCommands } from '@/shared/api';
import { useState } from 'react';

export function useMediaEngine() {
  const { currentProject, setRenderTimeout, updateStatus } = usePublicationStore();

  const [selectedVoice, setSelectedVoice] = useState<
    'uk-UA-OstapNeural' | 'uk-UA-PolinaNeural' | 'en-US-GuyNeural' | 'en-US-JennyNeural'
  >(() => {
    return currentProject?.contentLanguage === 'uk' ? 'uk-UA-OstapNeural' : 'en-US-GuyNeural';
  });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const renderTimeoutSec = currentProject?.renderTimeoutSec || 40;

  const synthesizeAudio = async () => {
    if (!currentProject?.slides.length) {
      setStatusMessage('Спочатку згенеруйте або додайте слайди до сценарію.');
      return;
    }

    setIsSynthesizing(true);
    setStatusMessage(null);
    try {
      const fullText = currentProject.slides.map((s) => s.narratorText).join(' ');
      const result = await edgeTts.synthesizeVoice({
        text: fullText,
        voice: selectedVoice,
        speedRate: 1.1,
        enableJumpCut: true,
      });

      setStatusMessage(
        `Озвучку синтезовано (${result.durationSec}с). Jump-cut вирізав ${result.jumpCutTrimsCount} пауз. Розраховано ${result.rmsFrames.length} кадрів RMS ліпсингу.`,
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  const renderFfmpegVideo = async () => {
    if (!currentProject) {
      setStatusMessage('Немає активного проекту для монтажу.');
      return;
    }

    setIsRendering(true);
    setRenderProgress(10);
    updateStatus('RENDERING');

    let unlisten: (() => void) | undefined;
    try {
      unlisten = await tauriCommands.listenVideoRenderProgress((progress) => {
        setRenderProgress(progress.progress);
      });

      const res = await tauriCommands.renderVideoFfmpeg({
        project_id: currentProject.id,
        input_video_path: currentProject.localVideoPath,
        audio_path: currentProject.localAudioPath,
        render_timeout_sec: renderTimeoutSec,
        fps: 60,
      });
      setRenderProgress(100);
      updateStatus('READY');
      setStatusMessage(
        `Монтаж завершено успішно! Файл: ${res.output_video_path} (${(res.file_size_bytes / 1024 / 1024).toFixed(1)} МБ, 60 FPS, Pillow-box розмиття 4:3).`,
      );
    } catch (e) {
      updateStatus('FAILED');
      setStatusMessage(
        `Помилка рендерингу: ${e instanceof Error ? e.message : 'Watchdog timeout'}`,
      );
    } finally {
      unlisten?.();
      setIsRendering(false);
    }
  };

  return {
    selectedVoice,
    setSelectedVoice,
    isSynthesizing,
    isRendering,
    renderProgress,
    statusMessage,
    renderTimeoutSec,
    setRenderTimeout,
    synthesizeAudio,
    renderFfmpegVideo,
    voices: edgeTts.getSupportedVoices(),
  };
}
