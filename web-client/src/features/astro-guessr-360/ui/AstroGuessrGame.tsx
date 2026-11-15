import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gamepad2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { SpaceArtifact } from '../../../entities/planet/model/types';
import { PhotosphereViewer } from '../../../shared/ui/photosphere-viewer';
import { useAstroGuessr } from '../model/useAstroGuessr';
import styles from './AstroGuessr.module.css';
import { AstroGuessrMiniMap } from './AstroGuessrMiniMap';

interface AstroGuessrGameProps {
  onExit: () => void;
  onOpenDossier?: (artifact: SpaceArtifact, planetId: 'mars' | 'moon') => void;
}

export const AstroGuessrGame: React.FC<AstroGuessrGameProps> = ({ onExit, onOpenDossier }) => {
  const {
    currentRound,
    currentRoundIndex,
    totalRounds,
    phase,
    playerPin,
    lastResult,
    totalScore,
    setPlayerPin,
    confirmGuess,
    nextRound,
    restartGame,
  } = useAstroGuessr();

  const [showClue, setShowClue] = useState<boolean>(false);

  const isMars = currentRound.planetId === 'mars';
  const accentColor = isMars ? '#f97316' : '#38bdf8';

  // Rank calculation based on total score
  const getRankTitle = (score: number, maxScore: number) => {
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 0.85) return 'CHIEF PLANETARY ARCHAEOLOGIST';
    if (ratio >= 0.65) return 'SENIOR MISSION RECON OPERATOR';
    if (ratio >= 0.4) return 'SURFACE TELEMETRY ANALYST';
    return 'ORBITAL CADET EXPLORER';
  };

  return (
    <div className={styles.gameContainer}>
      {/* Top HUD Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.brandWrap}>
          <button
            type="button"
            className={styles.exitBtn}
            onClick={onExit}
            title="Return to 3D Orbit Map"
          >
            <ArrowLeft size={15} />
            <span>EXIT GAME</span>
          </button>

          <div className={styles.gameTitle}>
            <Gamepad2 size={18} style={{ color: accentColor }} />
            <span>ASTRO-GUESSR 360°</span>
          </div>

          <span className={styles.roundBadge}>
            ROUND {currentRoundIndex + 1} / {totalRounds}
          </span>
        </div>

        <div className={styles.topActions}>
          <div className={styles.scoreBadge} title="Total Deduction Score">
            <Trophy size={15} />
            <span>{totalScore} PTS</span>
          </div>

          {currentRound.clue && (
            <button
              type="button"
              className={styles.clueToggleBtn}
              onClick={() => setShowClue((prev) => !prev)}
            >
              <HelpCircle size={14} style={{ color: accentColor }} />
              <span>{showClue ? 'HIDE CLUE' : 'TERRAIN CLUE'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Terrain Geological Clue Popover */}
      {showClue && currentRound.clue && (
        <div className={styles.clueBanner}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: accentColor,
              fontWeight: 700,
              fontSize: '11px',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            <span>Orbital Reconnaissance Clue</span>
          </div>
          <div>{currentRound.clue}</div>
        </div>
      )}

      {/* Main Split Layout: 70% Photosphere / 30% Mini-Map */}
      <div className={styles.splitLayout}>
        {/* 70% Photosphere Viewport */}
        <div className={styles.panoramaViewport}>
          <PhotosphereViewer
            isOpen={true}
            mode="embedded"
            imageUrl={currentRound.panoramaUrl}
            caption={
              phase === 'revealed'
                ? currentRound.caption
                : 'SURFACE PHOTO RECONNAISSANCE • IDENTIFY LANDING SITE'
            }
            nasaIdOrPia={phase === 'revealed' ? currentRound.artifact.nssdcaId : undefined}
            credit={phase === 'revealed' ? currentRound.credit : undefined}
            planetTheme={currentRound.planetId}
            showHeadingCompass={false}
            showTopHud={false}
          />
        </div>

        {/* 30% Interactive NASA Treks Mini-Map Sidebar */}
        <div className={styles.mapSidebar}>
          <AstroGuessrMiniMap
            planetId={currentRound.planetId}
            playerPin={playerPin}
            trueCoordinates={phase === 'revealed' ? currentRound.trueCoordinates : null}
            isRevealed={phase === 'revealed'}
            onSetPin={setPlayerPin}
            onConfirmGuess={confirmGuess}
            accentColor={accentColor}
          />
        </div>
      </div>

      {/* Round Reveal Modal */}
      {phase === 'revealed' && lastResult && (
        <div className={styles.resultOverlay}>
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#34d399',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}
              >
                {lastResult.ratingBadge}
              </span>

              <div className={styles.resultScoreRow}>
                <span className={styles.scoreHuge}>+{lastResult.score}</span>
                <span
                  style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                >
                  POINTS
                </span>
              </div>
            </div>

            <div className={styles.errorDistance}>
              Deviation Error:{' '}
              <strong style={{ color: accentColor }}>{lastResult.distanceKm} km</strong> from actual
              site
            </div>

            <AstroGuessrMiniMap
              planetId={currentRound.planetId}
              playerPin={{ lat: lastResult.guessLat, lon: lastResult.guessLon }}
              trueCoordinates={currentRound.trueCoordinates}
              isRevealed={true}
              onSetPin={() => undefined}
              onConfirmGuess={() => undefined}
              accentColor={accentColor}
              compact
            />

            {/* Target Hardware Identity Card */}
            <div className={styles.targetCard}>
              {currentRound.artifact.imageUrl && (
                <img
                  src={currentRound.artifact.imageUrl}
                  alt={currentRound.artifact.name}
                  className={styles.targetThumb}
                />
              )}
              <div className={styles.targetInfo}>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: accentColor,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {currentRound.artifact.agency} • {currentRound.artifact.mission}
                </div>
                <div className={styles.targetName}>{currentRound.artifact.name}</div>
                <div className={styles.targetLocation}>
                  Site:{' '}
                  <strong style={{ color: '#f1f5f9' }}>
                    {currentRound.trueCoordinates.locationName}
                  </strong>
                </div>
              </div>
            </div>

            {/* Feedback message */}
            <div className={styles.targetFeedback}>{lastResult.ratingFeedback}</div>

            {/* Modal Actions */}
            <div className={styles.resultActions}>
              {onOpenDossier && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onOpenDossier(currentRound.artifact, currentRound.planetId)}
                >
                  <FileText size={14} />
                  <span>VIEW FULL DOSSIER</span>
                </button>
              )}

              <button type="button" className={styles.btnPrimary} onClick={nextRound}>
                <span>
                  {currentRoundIndex + 1 < totalRounds ? 'NEXT ROUND' : 'VIEW FINAL RESULTS'}
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {phase === 'gameover' && (
        <div className={styles.resultOverlay}>
          <div className={styles.gameOverCard}>
            <div className={styles.trophyIconWrap}>
              <Trophy size={36} />
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              EXPEDITION RECON EVALUATION COMPLETE
            </div>

            <div className={styles.rankTitle}>{getRankTitle(totalScore, totalRounds * 100)}</div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className={styles.scoreHuge}>{totalScore}</span>
              <span style={{ fontSize: '16px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                / {totalRounds * 100} PTS
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#10b981',
                fontSize: '13px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>All planetary sectors verified with NASA telemetry</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button type="button" className={styles.btnSecondary} onClick={restartGame}>
                <RotateCcw size={14} />
                <span>PLAY AGAIN</span>
              </button>

              <button type="button" className={styles.btnPrimary} onClick={onExit}>
                <span>BACK TO 3D ORBIT MAP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
