import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type {
  CelestialGameplayPreset,
  GameplayAspectRatio,
  GameplayAvatarType,
  RecordedBrollClip,
} from './types';

interface UseGameplayRecorderOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  preset: CelestialGameplayPreset;
  avatar: GameplayAvatarType;
  aspectRatio: GameplayAspectRatio;
  onClipReady?: (clip: RecordedBrollClip) => void;
}

export function useGameplayRecorder({
  canvasRef,
  preset,
  avatar,
  aspectRatio,
  onClipReady,
}: UseGameplayRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState<number | null>(null);
  const [lastClip, setLastClip] = useState<RecordedBrollClip | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = useCallback((): Promise<RecordedBrollClip | null> => {
    return new Promise((resolve) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }

      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoBlobUrl = URL.createObjectURL(blob);

        const newClip: RecordedBrollClip = {
          id: `broll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          preset,
          avatar,
          durationSec: recordedSeconds || 5,
          videoBlobUrl,
          sizeBytes: blob.size,
          createdAt: new Date().toISOString(),
          aspectRatio,
        };

        setLastClip(newClip);
        setIsRecording(false);
        onClipReady?.(newClip);
        resolve(newClip);
      };

      recorder.stop();
    });
  }, [preset, avatar, aspectRatio, recordedSeconds, onClipReady]);

  const startRecording = useCallback(
    (durationSec?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      recordedChunksRef.current = [];
      setRecordedSeconds(0);
      setTargetSeconds(durationSec ?? null);

      try {
        // Check if captureStream & MediaRecorder are supported
        if (typeof canvas.captureStream === 'function' && typeof MediaRecorder !== 'undefined') {
          const stream = canvas.captureStream(60);

          let mimeType = 'video/webm;codecs=vp9';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          recorder.start(100);
          setIsRecording(true);

          // Update elapsed time counter every 1s
          let elapsed = 0;
          timerIntervalRef.current = setInterval(() => {
            elapsed += 1;
            setRecordedSeconds(elapsed);
          }, 1000);

          // Auto-stop after specified duration
          if (durationSec && durationSec > 0) {
            autoStopTimeoutRef.current = setTimeout(() => {
              stopRecording();
            }, durationSec * 1000);
          }
        } else {
          // Fallback simulation for headless / test environments
          setIsRecording(true);
          const fallbackBlob = new Blob(['cosmolost-mock-gameplay-video'], { type: 'video/webm' });
          const clip: RecordedBrollClip = {
            id: `broll-mock-${Date.now()}`,
            preset,
            avatar,
            durationSec: durationSec || 10,
            videoBlobUrl: URL.createObjectURL(fallbackBlob),
            sizeBytes: fallbackBlob.size,
            createdAt: new Date().toISOString(),
            aspectRatio,
          };
          setTimeout(() => {
            setLastClip(clip);
            setIsRecording(false);
            onClipReady?.(clip);
          }, 300);
        }
      } catch {
        setIsRecording(false);
      }
    },
    [canvasRef, preset, avatar, aspectRatio, stopRecording, onClipReady],
  );

  return {
    isRecording,
    recordedSeconds,
    targetSeconds,
    lastClip,
    startRecording,
    stopRecording,
  };
}
