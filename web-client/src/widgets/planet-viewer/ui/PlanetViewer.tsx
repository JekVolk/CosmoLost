import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import { PlanetScene } from '../lib/threeScene';
import { HoverPreviewCard } from './HoverPreviewCard';
import { RightDetailCard } from './RightDetailCard';

interface PlanetViewerProps {
  planet: PlanetConfig;
  onOpenDossier: (artifact: SpaceArtifact) => void;
  isAutoRotating: boolean;
  showMarkers: boolean;
  selectedArtifact?: SpaceArtifact | null;
  onSelectArtifact?: (artifact: SpaceArtifact | null) => void;
  filteredArtifactIds?: Set<string> | null;
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
  selectedArtifact,
  onSelectArtifact,
  filteredArtifactIds,
  onRegisterSceneActions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PlanetScene | null>(null);
  const onOpenDossierRef = useRef(onOpenDossier);
  onOpenDossierRef.current = onOpenDossier;

  const [hoveredArtifact, setHoveredArtifact] = useState<SpaceArtifact | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);

  const handleMarkerClick = (artifact: SpaceArtifact) => {
    if (onSelectArtifact) {
      onSelectArtifact(artifact);
    }
    if (sceneRef.current) {
      sceneRef.current.flyToArtifact(artifact, () => {
        if (sceneRef.current) {
          sceneRef.current.freezeControls();
        }
      });
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
      handleMarkerClick(artifact);
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

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setFilteredArtifactIds(filteredArtifactIds || null);
    }
  }, [filteredArtifactIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} className="planet-viewer-container" />

      {hoveredArtifact && hoverScreenPos && !selectedArtifact && (
        <HoverPreviewCard
          artifact={hoveredArtifact}
          screenPos={hoverScreenPos}
          planetId={planet.id}
          onOpenDossier={(art) => {
            handleMarkerClick(art);
          }}
        />
      )}

      {selectedArtifact && (
        <RightDetailCard
          artifact={selectedArtifact}
          planetId={planet.id}
          onClose={() => {
            if (onSelectArtifact) onSelectArtifact(null);
          }}
          onExplore={(art) => {
            onOpenDossierRef.current(art);
          }}
        />
      )}
    </div>
  );
};
