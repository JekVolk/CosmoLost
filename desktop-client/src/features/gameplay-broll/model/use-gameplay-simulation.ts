import { useEffect, useRef, useState } from 'react';
import { ASPECT_RATIO_PRESETS, DEFAULT_SIMULATION_CONFIG } from './constants';
import { GameplayRunnerEngine } from './physics-engine';
import type { GameplaySimulationConfig, TelemetryMetrics } from './types';

export function useGameplaySimulation(initialConfig?: Partial<GameplaySimulationConfig>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameplayRunnerEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const [config, setConfig] = useState<GameplaySimulationConfig>({
    ...DEFAULT_SIMULATION_CONFIG,
    ...initialConfig,
  });

  const [telemetry, setTelemetry] = useState<TelemetryMetrics>({
    distanceMeters: 0,
    currentSpeedKmH: 0,
    gravityMps2: 1.62,
    altitudeMeters: 0,
    score: 0,
    collectedSamples: 0,
    comboMultiplier: 1,
    environmentName: 'Місячний Паркур (Apollo-11)',
  });

  // Initialize or resize and sync engine with config
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const aspect = ASPECT_RATIO_PRESETS[config.aspectRatio];
    canvas.width = aspect.width;
    canvas.height = aspect.height;

    if (!engineRef.current) {
      engineRef.current = new GameplayRunnerEngine(config, aspect.width, aspect.height);
    } else {
      engineRef.current.resize(aspect.width, aspect.height);
      engineRef.current.updateConfig(config);
    }
  }, [config]);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    lastTimeRef.current = performance.now();
    let tickCounter = 0;

    const renderLoop = (now: number) => {
      if (!isMounted) return;

      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const engine = engineRef.current;
      if (engine) {
        engine.step(dt);
        engine.render(ctx);

        // Update React telemetry state every ~10 frames for UI performance
        tickCounter++;
        if (tickCounter % 10 === 0) {
          setTelemetry(engine.getTelemetry());
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const triggerJump = () => {
    if (engineRef.current) {
      return engineRef.current.triggerJump();
    }
    return false;
  };

  const updateConfig = (patch: Partial<GameplaySimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  return {
    canvasRef,
    engineRef,
    config,
    updateConfig,
    telemetry,
    triggerJump,
  };
}
