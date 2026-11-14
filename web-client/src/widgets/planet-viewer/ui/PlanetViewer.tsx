import React, { useEffect, useRef, useState } from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import { PlanetScene } from '../lib/threeScene';
import { HoverPreviewCard } from './HoverPreviewCard';

interface PlanetViewerProps {
  planet: PlanetConfig;
  onOpenDossier: (artifact: SpaceArtifact) => void;
  isAutoRotating: boolean;
  showMarkers: boolean;
  onRegisterSceneActions?: (actions: {
    flyTo: (artifact: SpaceArtifact, onComplete?: () => void) => void;
    resetView: () => void;
    toggleAutoRotate: () => boolean;
  }) => void;
}

export const PlanetViewer: React.FC<PlanetViewerProps> = ({
  planet,
  onOpenDossier,
  isAutoRotating,
  showMarkers,
  onRegisterSceneActions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PlanetScene | null>(null);
  const onOpenDossierRef = useRef(onOpenDossier);
  onOpenDossierRef.current = onOpenDossier;

  const [hoveredArtifact, setHoveredArtifact] = useState<SpaceArtifact | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);

  const handleOpenDossierWithFlight = (artifact: SpaceArtifact) => {
    if (sceneRef.current) {

      sceneRef.current.flyToArtifact(artifact, () => {
        if (sceneRef.current) {
          sceneRef.current.freezeControls();
        }

        setTimeout(() => {
          onOpenDossierRef.current(artifact);
        }, 80);
      });
    } else {
      onOpenDossierRef.current(artifact);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new PlanetScene(containerRef.current, planet);
    sceneRef.current = scene;

    scene.onMarkerHover = (artifact, pos) => {
      setHoveredArtifact(artifact);
      setHoverScreenPos(pos);
    };

    scene.onMarkerClick = (artifact) => {

      handleOpenDossierWithFlight(artifact);
    };

    if (onRegisterSceneActions) {
      onRegisterSceneActions({
        flyTo: (art, onComplete) => scene.flyToArtifact(art, onComplete),
        resetView: () => scene.resetView(),
        toggleAutoRotate: () => scene.toggleAutoRotate(),
      });
    }

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPlanet(planet);
      setHoveredArtifact(null);
      setHoverScreenPos(null);
    }
  }, [planet]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAutoRotate(isAutoRotating);
    }
  }, [isAutoRotating]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setMarkersVisible(showMarkers);
    }
  }, [showMarkers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} className="planet-viewer-container" />

      {}
      {hoveredArtifact && hoverScreenPos && (
        <HoverPreviewCard
          artifact={hoveredArtifact}
          screenPos={hoverScreenPos}
          planetId={planet.id}
          onOpenDossier={handleOpenDossierWithFlight}
        />
      )}
    </div>
  );
};
