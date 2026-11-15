import {
  CheckCircle2,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { normalizeLongitude } from '../../../shared/lib/coordinates';
import styles from './AstroGuessr.module.css';

interface AstroGuessrMiniMapProps {
  planetId: 'mars' | 'moon';
  playerPin: { lat: number; lon: number } | null;
  trueCoordinates: { lat: number; lon: number; locationName: string } | null;
  isRevealed: boolean;
  onSetPin: (coords: { lat: number; lon: number }) => void;
  onConfirmGuess: () => void;
  accentColor: string;
  compact?: boolean;
}

function coordsToPercent(lat: number, lon: number) {
  const normLon = normalizeLongitude(lon);
  const x = ((normLon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export const AstroGuessrMiniMap: React.FC<AstroGuessrMiniMapProps> = ({
  planetId,
  playerPin,
  trueCoordinates,
  isRevealed,
  onSetPin,
  onConfirmGuess,
  accentColor,
  compact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const textureUrl = planetId === 'mars' ? '/textures/mars_color.jpg' : '/textures/moon_color.jpg';
  const isMars = planetId === 'mars';

  // Handle click on map to place pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRevealed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lon = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;

    onSetPin({
      lat: Math.round(lat * 1000) / 1000,
      lon: Math.round(lon * 1000) / 1000,
    });
  };

  // Hover coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lon = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;

    setHoverCoords({
      lat: Math.round(lat * 10) / 10,
      lon: Math.round(lon * 10) / 10,
    });
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  const playerPercent = useMemo(() => {
    if (!playerPin) return null;
    return coordsToPercent(playerPin.lat, playerPin.lon);
  }, [playerPin]);

  const truePercent = useMemo(() => {
    if (!trueCoordinates || !isRevealed) return null;
    return coordsToPercent(trueCoordinates.lat, trueCoordinates.lon);
  }, [trueCoordinates, isRevealed]);

  const toggleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      if (direction === 'in') return Math.min(prev + 0.3, 2.2);
      return Math.max(prev - 0.3, 1);
    });
  }, []);

  return (
    <div
      className={`${styles.miniMapWrapper} ${isExpanded ? styles.miniMapExpanded : ''} ${compact ? styles.miniMapCompact : ''}`}
    >
      {/* Mini-map Top Header */}
      {!compact && (
        <div className={styles.miniMapHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={14} style={{ color: accentColor }} />
            <span className={styles.miniMapTitle}>
              NASA TREKS CARTOGRAPHY • {planetId.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className={styles.mapToolBtn}
              onClick={() => toggleZoom('in')}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className={styles.mapToolBtn}
              onClick={() => toggleZoom('out')}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className={styles.mapToolBtn}
              onClick={() => setIsExpanded((prev) => !prev)}
              title={isExpanded ? 'Collapse Map' : 'Expand Map'}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* Surface Map Viewport */}
      <div
        ref={mapContainerRef}
        className={styles.mapViewport}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isRevealed ? 'default' : 'crosshair' }}
      >
        <div
          className={styles.mapImageContainer}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <img
            src={textureUrl}
            alt={`${planetId} Equirectangular map`}
            className={styles.mapImage}
            draggable={false}
          />

          {/* Coordinate Lat/Lon Grid lines overlay */}
          <div className={styles.gridOverlay}>
            <div className={styles.gridEquator} />
            <div className={styles.gridMeridian} />
          </div>

          {/* Player Guess Pin */}
          {playerPercent && (
            <div
              className={styles.playerPinMarker}
              style={{
                left: `${playerPercent.x}%`,
                top: `${playerPercent.y}%`,
                borderColor: accentColor,
              }}
            >
              <div
                className={styles.pinDot}
                style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
              />
              <span className={styles.pinLabel} style={{ color: accentColor }}>
                YOUR GUESS
              </span>
            </div>
          )}

          {/* True Location Pin (Revealed) */}
          {truePercent && (
            <div
              className={styles.truePinMarker}
              style={{
                left: `${truePercent.x}%`,
                top: `${truePercent.y}%`,
              }}
            >
              <div className={styles.truePinDot} />
              <span className={styles.truePinLabel}>
                {trueCoordinates?.locationName || 'TRUE ARTIFACT LOCATION'}
              </span>
            </div>
          )}

          {/* Geodesic trajectory SVG line connecting guess to true location */}
          {playerPercent && truePercent && isRevealed && (
            <svg className={styles.trajectorySvg}>
              <line
                x1={`${playerPercent.x}%`}
                y1={`${playerPercent.y}%`}
                x2={`${truePercent.x}%`}
                y2={`${truePercent.y}%`}
                stroke={accentColor}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className={styles.animatedTrajectoryLine}
              />
            </svg>
          )}
        </div>

        {/* Hover readout badge */}
        <div className={styles.coordsReadout}>
          {hoverCoords ? (
            <span>
              {Math.abs(hoverCoords.lat).toFixed(1)}°{hoverCoords.lat >= 0 ? 'N' : 'S'},{' '}
              {Math.abs(hoverCoords.lon).toFixed(1)}°{hoverCoords.lon >= 0 ? 'E' : 'W'}
            </span>
          ) : playerPin ? (
            <span>
              Pin: {Math.abs(playerPin.lat).toFixed(1)}°{playerPin.lat >= 0 ? 'N' : 'S'},{' '}
              {Math.abs(playerPin.lon).toFixed(1)}°{playerPin.lon >= 0 ? 'E' : 'W'}
            </span>
          ) : (
            <span>Click map to place pin</span>
          )}
        </div>
      </div>

      {/* Mini-map Footer / Confirm Action */}
      {!compact && (
        <div className={styles.miniMapFooter}>
          {!isRevealed ? (
            <button
              type="button"
              className={`${styles.confirmGuessBtn} ${playerPin ? styles.confirmActive : ''} ${isMars ? styles.marsConfirm : styles.moonConfirm}`}
              onClick={onConfirmGuess}
              disabled={!playerPin}
            >
              <CheckCircle2 size={16} />
              <span>CONFIRM COORDINATES</span>
            </button>
          ) : (
            <div className={styles.revealedCoordsNotice}>
              <MapPin size={14} style={{ color: '#10b981' }} />
              <span>Target telemetry decoded & verified</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
