import React, { useState, useRef } from 'react';
import type { PlanetId, SpaceArtifact } from '../entities/planet/model/types';
import { PLANETS } from '../entities/planet/model/planetData';
import { Header, type AppView } from '../widgets/header/ui/Header';
import { PlanetViewer } from '../widgets/planet-viewer/ui/PlanetViewer';
import { PlanetTelemetry } from '../widgets/planet-telemetry/ui/PlanetTelemetry';
import { ViewControls } from '../features/view-controls/ui/ViewControls';
import { DossierPage } from '../widgets/dossier/ui/DossierPage';
import { CatalogPage } from '../widgets/catalog/ui/CatalogPage';
import { CommunityVideosPage } from '../widgets/community/ui/CommunityVideosPage';
import { AboutModal } from '../widgets/about/ui/AboutModal';
import './styles/global.css';

export const App: React.FC = () => {
  const [currentPlanetId, setCurrentPlanetId] = useState<PlanetId>('mars');
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [activeArtifact, setActiveArtifact] = useState<SpaceArtifact | null>(null);
  const [filteredArtifactIds, setFilteredArtifactIds] = useState<Set<string> | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [standaloneDossier, setStandaloneDossier] = useState<{
    artifact: SpaceArtifact;
    planetId: PlanetId;
  } | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const artifactId = params.get('artifact');
    const planetParam = params.get('planet') as PlanetId | null;
    if (artifactId) {
      const pId: PlanetId = planetParam && PLANETS[planetParam] ? planetParam : 'mars';
      const found = PLANETS[pId]?.artifacts.find((a) => a.id === artifactId);
      if (found) return { artifact: found, planetId: pId };
    }
    return null;
  });

  const sceneActionsRef = useRef<{
    flyTo: (artifact: SpaceArtifact, onComplete?: () => void) => void;
    resetView: () => void;
    toggleAutoRotate: () => boolean;
  } | null>(null);

  const currentPlanet = PLANETS[currentPlanetId];

  const handleOpenDossier = (artifact: SpaceArtifact, planetId?: PlanetId) => {
    const pId = planetId || currentPlanetId;
    setActiveArtifact(artifact);
    setCurrentPlanetId(pId);

    const url = `${window.location.origin}${window.location.pathname}?artifact=${artifact.id}&planet=${pId}`;
    const newWindow = window.open(url, '_blank');

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setStandaloneDossier({ artifact, planetId: pId });
    }
  };

  const handleSelectArtifactFromList = (artifact: SpaceArtifact) => {
    setActiveArtifact(artifact);
    if (currentView !== 'map') {
      setCurrentView('map');
    }
    if (sceneActionsRef.current) {
      sceneActionsRef.current.flyTo(artifact);
    }
  };

  const handleToggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
  };

  const handleResetView = () => {
    setActiveArtifact(null);
    if (sceneActionsRef.current) {
      sceneActionsRef.current.resetView();
    }
  };

  if (standaloneDossier) {
    const pConfig = PLANETS[standaloneDossier.planetId];
    return (
      <DossierPage
        artifact={standaloneDossier.artifact}
        planet={pConfig}
        onBackToMap={() => {
          window.history.pushState({}, '', window.location.pathname);
          setStandaloneDossier(null);
        }}
      />
    );
  }

  const isMars = currentPlanetId === 'mars';
  const themeAccent = isMars ? '#f97316' : '#00F0FF';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Header
        currentPlanetId={currentPlanetId}
        onSelectPlanet={(id) => {
          setCurrentPlanetId(id);
          setActiveArtifact(null);
        }}
        artifactCount={currentPlanet.artifacts.length}
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view !== 'map') {
            setActiveArtifact(null);
          }
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {currentView === 'map' && (
        <>
          <PlanetViewer
            planet={currentPlanet}
            onOpenDossier={(art) => handleOpenDossier(art, currentPlanetId)}
            isAutoRotating={isAutoRotating}
            showMarkers={showMarkers}
            selectedArtifact={activeArtifact}
            onSelectArtifact={setActiveArtifact}
            filteredArtifactIds={filteredArtifactIds}
            onRegisterSceneActions={(actions) => {
              sceneActionsRef.current = actions;
            }}
          />

          <PlanetTelemetry
            planet={currentPlanet}
            onSelectArtifact={handleSelectArtifactFromList}
            activeArtifactId={activeArtifact?.id}
            onFilteredIdsChange={setFilteredArtifactIds}
          />

          <ViewControls
            isAutoRotating={isAutoRotating}
            onToggleAutoRotate={handleToggleAutoRotate}
            onResetView={handleResetView}
            showMarkers={showMarkers}
            onToggleMarkers={() => setShowMarkers((prev) => !prev)}
            planetColor={themeAccent}
          />
        </>
      )}

      {currentView === 'catalog' && (
        <CatalogPage
          onOpenDossier={(art, pId) => handleOpenDossier(art, pId)}
          onBackToMap={() => setCurrentView('map')}
        />
      )}

      {currentView === 'community' && (
        <CommunityVideosPage
          onOpenArtifact={(art, pId) => {
            setCurrentPlanetId(pId);
            handleOpenDossier(art, pId);
          }}
        />
      )}

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};
