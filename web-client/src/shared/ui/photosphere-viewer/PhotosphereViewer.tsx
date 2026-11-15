import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  RotateCcw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { PhotosphereViewerProps } from './types';
import styles from './PhotosphereViewer.module.css';
import { API_BASE_URL } from '../../api/portalApi';

function getCompassHeading(azimuthDeg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(azimuthDeg / 45) % 8;
  return `${Math.round(azimuthDeg)}° ${directions[index]}`;
}

export const PhotosphereViewer: React.FC<PhotosphereViewerProps> = ({
  isOpen = true,
  onClose,
  imageUrl,
  caption,
  nasaIdOrPia,
  credit,
  planetTheme = 'mars',
  mode = 'modal',
  showHeadingCompass = true,
  initialFov = 75,
  onHeadingChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [headingDeg, setHeadingDeg] = useState<number>(0);
  const [currentFov, setCurrentFov] = useState<number>(initialFov);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Three.js internal references
  const threeRefs = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    mesh?: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
    texture?: THREE.Texture;
    frameId?: number;
    // Camera rotation and damping targets
    targetLon: number;
    targetLat: number;
    currentLon: number;
    currentLat: number;
    targetFov: number;
    // Pointer drag tracking
    isPointerDown: boolean;
    pointerStartX: number;
    pointerStartY: number;
    startLon: number;
    startLat: number;
    activeTouchCount: number;
    initialPinchDist: number;
  }>({
    targetLon: 0,
    targetLat: 0,
    currentLon: 0,
    currentLat: 0,
    targetFov: initialFov,
    isPointerDown: false,
    pointerStartX: 0,
    pointerStartY: 0,
    startLon: 0,
    startLat: 0,
    activeTouchCount: 0,
    initialPinchDist: 0,
  });

  const isMars = planetTheme === 'mars';
  const accentColor = isMars ? '#f97316' : '#38bdf8';

  // Toggle fullscreen mode
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Zoom helpers
  const handleZoomIn = useCallback(() => {
    const refs = threeRefs.current;
    refs.targetFov = Math.max(30, refs.targetFov - 10);
  }, []);

  const handleZoomOut = useCallback(() => {
    const refs = threeRefs.current;
    refs.targetFov = Math.min(95, refs.targetFov + 10);
  }, []);

  const handleResetView = useCallback(() => {
    const refs = threeRefs.current;
    refs.targetLon = 0;
    refs.targetLat = 0;
    refs.targetFov = initialFov;
  }, [initialFov]);

  // Handle ESC key for modal closing & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r') {
        handleResetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetView]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize Three.js scene and load 360 texture
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    setIsLoading(true);
    setLoadError(null);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    // 3. Geometry (Inverted Sphere)
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    // Invert geometry normals so inner surface is visible to camera at (0, 0, 0)
    geometry.scale(-1, 1, 1);

    const refs = threeRefs.current;
    refs.renderer = renderer;
    refs.scene = scene;
    refs.camera = camera;
    refs.targetFov = initialFov;

    // 4. Texture Loader with CORS
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    let isSubscribed = true;

    const textureUrl = imageUrl.startsWith('http')
      ? `${API_BASE_URL}/media-proxy/?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;

    textureLoader.load(
      textureUrl,
      (texture) => {
        if (!isSubscribed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        refs.texture = texture;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        refs.mesh = mesh;

        setIsLoading(false);
      },
      undefined,
      (err) => {
        if (!isSubscribed) return;
        console.warn('Photosphere texture load warning, attempting standard fetch:', err);
        // Fallback: try loading via Image element for additional CORS fallback if needed
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isSubscribed) return;
          const fallbackTex = new THREE.CanvasTexture(img);
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          refs.texture = fallbackTex;
          const material = new THREE.MeshBasicMaterial({ map: fallbackTex });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          refs.mesh = mesh;
          setIsLoading(false);
        };
        img.onerror = () => {
          if (!isSubscribed) return;
          setIsLoading(false);
          setLoadError('Failed to load 360° spherical texture from NASA archive.');
        };
        img.src = textureUrl;
      }
    );

    // 5. Animation loop with smooth damping
    let lastReportedHeading = -1;

    const animate = () => {
      refs.frameId = requestAnimationFrame(animate);

      // Inertia lerp damping
      refs.currentLon += (refs.targetLon - refs.currentLon) * 0.08;
      refs.currentLat += (refs.targetLat - refs.currentLat) * 0.08;

      // Clamp lat
      refs.currentLat = Math.max(-85, Math.min(85, refs.currentLat));

      // FOV lerp
      camera.fov += (refs.targetFov - camera.fov) * 0.12;
      camera.updateProjectionMatrix();

      // Convert spherical coordinates (lon, lat) to cartesian lookAt vector
      const phi = THREE.MathUtils.degToRad(90 - refs.currentLat);
      const theta = THREE.MathUtils.degToRad(refs.currentLon);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);

      renderer.render(scene, camera);

      // Calculate azimuth in degrees [0..359]
      const currentAzimuth = ((Math.round(-refs.currentLon) % 360) + 360) % 360;
      if (Math.abs(currentAzimuth - lastReportedHeading) >= 1) {
        lastReportedHeading = currentAzimuth;
        setHeadingDeg(currentAzimuth);
        setCurrentFov(Math.round(camera.fov));
        if (onHeadingChange) {
          onHeadingChange(currentAzimuth);
        }
      }
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isSubscribed = false;
      window.removeEventListener('resize', handleResize);
      if (refs.frameId) cancelAnimationFrame(refs.frameId);
      if (refs.texture) refs.texture.dispose();
      if (refs.mesh) {
        refs.mesh.geometry.dispose();
        if (Array.isArray(refs.mesh.material)) {
          refs.mesh.material.forEach((m) => m.dispose());
        } else {
          refs.mesh.material.dispose();
        }
      }
      geometry.dispose();
      renderer.dispose();
    };
  }, [isOpen, imageUrl, initialFov, onHeadingChange]);

  // Pointer & Touch Controls
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (loadError) return;
    const refs = threeRefs.current;
    refs.isPointerDown = true;
    refs.pointerStartX = e.clientX;
    refs.pointerStartY = e.clientY;
    refs.startLon = refs.targetLon;
    refs.startLat = refs.targetLat;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const refs = threeRefs.current;
    if (!refs.isPointerDown) return;

    const deltaX = e.clientX - refs.pointerStartX;
    const deltaY = e.clientY - refs.pointerStartY;

    // Scale rotation sensitivity by current FOV
    const fovScale = (refs.camera?.fov || 75) / 75;
    const sensitivity = 0.15 * fovScale;

    refs.targetLon = refs.startLon - deltaX * sensitivity;
    refs.targetLat = refs.startLat + deltaY * sensitivity;
    refs.targetLat = Math.max(-85, Math.min(85, refs.targetLat));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const refs = threeRefs.current;
    refs.isPointerDown = false;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const refs = threeRefs.current;
    const zoomDelta = e.deltaY * 0.05;
    refs.targetFov = Math.max(30, Math.min(95, refs.targetFov + zoomDelta));
  };

  // Touch pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const refs = threeRefs.current;
    refs.activeTouchCount = e.touches.length;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      refs.initialPinchDist = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const refs = threeRefs.current;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (refs.initialPinchDist > 0) {
        const pinchDelta = (refs.initialPinchDist - dist) * 0.15;
        refs.targetFov = Math.max(30, Math.min(95, refs.targetFov + pinchDelta));
        refs.initialPinchDist = dist;
      }
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      ref={containerRef}
      className={mode === 'modal' ? styles.overlay : styles.embeddedContainer}
      style={{ '--planet-accent': accentColor } as React.CSSProperties}
    >
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${isDragging ? styles.canvasDragging : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* HUD Layer */}
      <div className={styles.hudLayer}>
        {/* Top Header */}
        <div className={styles.hudTop}>
          <div className={styles.hudTopLeft}>
            <span className={`${styles.badge} ${isMars ? styles.badgeMars : styles.badgeMoon}`}>
              <Compass size={13} />
              <span>360° {planetTheme.toUpperCase()} SURFACE PANORAMA</span>
            </span>

            {showHeadingCompass && (
              <div className={styles.compassCard} title="Azimuth / Direction Heading">
                <div
                  className={styles.compassDial}
                  style={{ transform: `rotate(${-headingDeg}deg)` }}
                >
                  <div className={styles.compassNeedle} />
                </div>
                <span>{getCompassHeading(headingDeg)}</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>FOV {currentFov}°</span>
              </div>
            )}
          </div>

          <div className={styles.hudTopRight}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {mode === 'modal' && onClose && (
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.closeBtn}`}
                onClick={onClose}
                title="Close 360° Viewer (Esc)"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Right Floating Controls */}
        <div className={styles.hudRightControls}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleZoomIn}
            title="Zoom In (+)"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleZoomOut}
            title="Zoom Out (-)"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleResetView}
            title="Reset Orientation (R)"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Bottom Metadata & Controls */}
        <div className={styles.hudBottom}>
          {(caption || nasaIdOrPia || credit) && (
            <div className={styles.metaCard}>
              <div className={styles.metaTopRow}>
                {nasaIdOrPia && <span className={styles.piaTag}>NASA ID: {nasaIdOrPia}</span>}
                {credit && <span className={styles.creditTag}>CREDIT: {credit}</span>}
              </div>
              {caption && <div className={styles.captionText}>{caption}</div>}
            </div>
          )}

          <div className={styles.hudHint}>
            <span>DRAG TO PAN • SCROLL / PINCH TO ZOOM</span>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className={styles.centerNotice}>
          <div className={`${styles.spinner} ${isMars ? styles.spinnerMars : ''}`} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f1f5f9' }}>
            ACQUIRING NASA HIGH-RESOLUTION SPHERICAL PANORAMA...
          </div>
        </div>
      )}

      {/* Error Card */}
      {loadError && (
        <div className={styles.centerNotice}>
          <AlertCircle size={36} style={{ color: '#ef4444' }} />
          <div className={styles.errorTitle}>360° Panorama Texture Error</div>
          <div className={styles.errorDesc}>{loadError}</div>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.retryBtn}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>Open Direct Image in NASA Archive</span>
          </a>
        </div>
      )}
    </div>
  );

  return content;
};
