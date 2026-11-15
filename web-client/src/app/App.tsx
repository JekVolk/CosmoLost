import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PLANETS } from '../entities/planet/model/planetData';
import type { PlanetConfig, PlanetId, SpaceArtifact } from '../entities/planet/model/types';
import { AstroGuessrGame } from '../features/astro-guessr-360';
import { ViewControls } from '../features/view-controls/ui/ViewControls';
import { ArenaPage } from '../pages/arena';
import {
  apiArtifactDetailToSpaceArtifact,
  apiArtifactSummaryToSpaceArtifact,
  portalApi,
} from '../shared/api/portalApi';
import { AboutModal } from '../widgets/about/ui/AboutModal';
import { CatalogPage } from '../widgets/catalog/ui/CatalogPage';
import { CommunityVideosPage } from '../widgets/community/ui/CommunityVideosPage';
import { DossierPage } from '../widgets/dossier/ui/DossierPage';
import { type AppView, Header } from '../widgets/header/ui/Header';
import { PlanetTelemetry } from '../widgets/planet-telemetry/ui/PlanetTelemetry';
import { PlanetViewer } from '../widgets/planet-viewer/ui/PlanetViewer';
import { AppProviders } from './providers';
import './styles/global.css';

export const App: React.FC = () => {
  const [currentPlanetId, setCurrentPlanetId] = useState<PlanetId>('mars');
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [activeArtifact, setActiveArtifact] = useState<SpaceArtifact | null>(null);
  const [filteredArtifactIds, setFilteredArtifactIds] = useState<Set<string> | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [planets, setPlanets] = useState<Record<PlanetId, PlanetConfig>>(PLANETS);
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function initDataFromPortalApi() {
      const isOnline = await portalApi.checkHealth();
      if (!active) return;
      setApiOnline(isOnline);

      try {
        const [marsRes, moonRes, bodies] = await Promise.all([
          portalApi.listArtifacts({ body: 'mars', limit: 200 }),
          portalApi.listArtifacts({ body: 'moon', limit: 200 }),
          portalApi.getCelestialBodies(),
        ]);

        if (!active) return;

        const marsBody = bodies.find((b) => b.id === 'mars');
        const moonBody = bodies.find((b) => b.id === 'moon');

        const marsArts: SpaceArtifact[] = marsRes.results.map((item) =>
          apiArtifactSummaryToSpaceArtifact(item, 'mars'),
        );
        const moonArts: SpaceArtifact[] = moonRes.results.map((item) =>
          apiArtifactSummaryToSpaceArtifact(item, 'moon'),
        );

        setPlanets((prev) => ({
          mars: {
            ...prev.mars,
            name: marsBody?.name || prev.mars.name,
            artifacts: marsArts.length > 0 ? marsArts : prev.mars.artifacts,
          },
          moon: {
            ...prev.moon,
            name: moonBody?.name || prev.moon.name,
            artifacts: moonArts.length > 0 ? moonArts : prev.moon.artifacts,
          },
        }));
      } catch (err) {
        console.warn('Using offline cached OpenAPI artifacts:', err);
      }
    }

    initDataFromPortalApi();
    return () => {
      active = false;
    };
  }, []);

  const [standaloneDossier, setStandaloneDossier] = useState<{
    artifact: SpaceArtifact;
    planetId: PlanetId;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const artifactId = params.get('artifact');
    const planetParam = (params.get('planet') as PlanetId) || 'mars';

    if (artifactId) {
      portalApi
        .getArtifactDetail(artifactId)
        .then((detail) => {
          if (detail) {
            const art = apiArtifactDetailToSpaceArtifact(detail, planetParam);
            setStandaloneDossier({ artifact: art, planetId: planetParam });
            setCurrentPlanetId(planetParam);
          }
        })
        .catch(() => {});
    }

    const handlePopState = () => {
      const popParams = new URLSearchParams(window.location.search);
      const popArtId = popParams.get('artifact');
      const popPlanet = (popParams.get('planet') as PlanetId) || 'mars';
      if (popArtId) {
        portalApi
          .getArtifactDetail(popArtId)
          .then((detail) => {
            if (detail) {
              setStandaloneDossier({
                artifact: apiArtifactDetailToSpaceArtifact(detail, popPlanet),
                planetId: popPlanet,
              });
              setCurrentPlanetId(popPlanet);
            }
          })
          .catch(() => {});
      } else {
        setStandaloneDossier(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const sceneActionsRef = useRef<{
    flyTo: (artifact: SpaceArtifact, onComplete?: () => void) => void;
    resetView: () => void;
    toggleAutoRotate: () => boolean;
  } | null>(null);

  const currentPlanet = planets[currentPlanetId] || PLANETS[currentPlanetId];

  const handleOpenDossier = (artifact: SpaceArtifact, planetId?: PlanetId) => {
    const pId = planetId || currentPlanetId;
    setActiveArtifact(artifact);
    setCurrentPlanetId(pId);

    setStandaloneDossier({ artifact, planetId: pId });
    window.history.pushState({}, '', `?artifact=${artifact.id}&planet=${pId}`);

    portalApi
      .getArtifactDetail(artifact.id)
      .then((detail) => {
        if (detail) {
          const detailedArtifact = apiArtifactDetailToSpaceArtifact(detail, pId);
          setStandaloneDossier({ artifact: detailedArtifact, planetId: pId });
        }
      })
      .catch(() => {});
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
    const pConfig = planets[standaloneDossier.planetId] || PLANETS[standaloneDossier.planetId];
    return (
      <AppProviders>
        <DossierPage
          artifact={standaloneDossier.artifact}
          planet={pConfig}
          onBackToMap={() => {
            window.history.pushState({}, '', window.location.pathname);
            setStandaloneDossier(null);
          }}
        />
      </AppProviders>
    );
  }

  const isMars = currentPlanetId === 'mars';
  const themeAccent = isMars ? '#f97316' : '#00F0FF';

  return (
    <AppProviders>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {currentView !== 'astro-guessr' && (
          <Header
            currentPlanetId={currentPlanetId}
            onSelectPlanet={(id) => {
              setCurrentPlanetId(id);
              setActiveArtifact(null);
            }}
            artifactCount={currentPlanet?.artifacts?.length || 0}
            currentView={currentView}
            onSelectView={(view) => {
              setCurrentView(view);
              if (view !== 'map') {
                setActiveArtifact(null);
              }
            }}
            onOpenAbout={() => setIsAboutOpen(true)}
            isLiveApi={apiOnline}
          />
        )}

        {currentView === 'map' && currentPlanet && (
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
            planets={planets}
          />
        )}

        {currentView === 'community' && (
          <CommunityVideosPage
            onOpenArtifact={(art, pId) => {
              setCurrentPlanetId(pId);
              handleOpenDossier(art, pId);
            }}
            planets={planets}
          />
        )}

        {currentView === 'astro-guessr' && (
          <AstroGuessrGame
            onExit={() => setCurrentView('map')}
            onOpenDossier={(art, pId) => {
              setCurrentPlanetId(pId);
              handleOpenDossier(art, pId);
            }}
          />
        )}

        {currentView === 'arena' && (
          <div style={{ padding: '80px 20px 20px', height: '100vh', overflowY: 'auto' }}>
            <ArenaPage />
          </div>
        )}

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </AppProviders>
  );
};
