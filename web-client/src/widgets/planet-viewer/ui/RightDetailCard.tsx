import React from 'react';
import type { SpaceArtifact, PlanetId } from '../../../entities/planet/model/types';
import { X, ExternalLink, MapPin, Calendar, Activity, Rocket } from 'lucide-react';

interface RightDetailCardProps {
  artifact: SpaceArtifact;
  planetId: PlanetId;
  onClose: () => void;
  onExplore: (artifact: SpaceArtifact) => void;
}

export const RightDetailCard: React.FC<RightDetailCardProps> = ({
  artifact,
  planetId,
  onClose,
  onExplore,
}) => {
  const isMars = planetId === 'mars';
  const themeColor = isMars ? '#f97316' : '#00F0FF';

  return (
    <div className="pen-right-detail-card">
      <div className="pen-card-header">
        <div className="pen-header-title-wrap">
          <div className="pen-card-agency" style={{ color: themeColor }}>
            {artifact.agency} {artifact.country ? `• ${artifact.country}` : ''}
          </div>
          <h3 className="pen-card-title">{artifact.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="pen-close-btn"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      <div className="pen-mission-row">
        <div className="pen-mission-badge" style={{ borderColor: `${themeColor}60`, color: themeColor }}>
          <Rocket size={12} />
          <span>{artifact.mission}</span>
        </div>
        <div
          className="pen-status-pill"
          style={{
            borderColor: artifact.badgeColor ? `${artifact.badgeColor}70` : `${themeColor}70`,
            color: artifact.badgeColor || themeColor,
          }}
        >
          <span
            className="pen-status-dot"
            style={{ backgroundColor: artifact.badgeColor || themeColor }}
          />
          <span>{artifact.operationalStatus || artifact.type.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      {artifact.imageUrl && (
        <div className="pen-card-photo-wrap">
          <img
            src={artifact.imageUrl}
            alt={artifact.name}
            className="pen-card-photo"
            onError={(e) => {
              const el = e.target as HTMLElement;
              el.style.display = 'none';
            }}
          />
          <div className="pen-photo-vignette" />
        </div>
      )}

      <div className="pen-metadata-list">
        <div className="pen-meta-row">
          <div className="pen-meta-label">
            <MapPin size={13} style={{ color: themeColor }} />
            <span>Coordinates:</span>
          </div>
          <div className="pen-meta-value mono">
            {Math.abs(artifact.lat).toFixed(2)}°{artifact.lat >= 0 ? 'N' : 'S'}, {Math.abs(artifact.lon).toFixed(2)}°{artifact.lon >= 0 ? 'E' : 'W'}
          </div>
        </div>

        <div className="pen-meta-row">
          <div className="pen-meta-label">
            <Calendar size={13} style={{ color: themeColor }} />
            <span>Landing Date:</span>
          </div>
          <div className="pen-meta-value">
            {artifact.landingDate}
          </div>
        </div>

        <div className="pen-meta-row">
          <div className="pen-meta-label">
            <Activity size={13} style={{ color: themeColor }} />
            <span>Site Location:</span>
          </div>
          <div className="pen-meta-value truncate" title={artifact.locationName}>
            {artifact.locationName}
          </div>
        </div>

        {artifact.massKg && (
          <div className="pen-meta-row">
            <div className="pen-meta-label">
              <span>Hardware Mass:</span>
            </div>
            <div className="pen-meta-value mono">
              {artifact.massKg.toLocaleString()} kg
            </div>
          </div>
        )}
      </div>

      <p className="pen-card-description">
        {artifact.brief || artifact.description}
      </p>

      <button
        type="button"
        className="pen-explore-btn"
        style={{ '--accent-color': themeColor } as React.CSSProperties}
        onClick={() => onExplore(artifact)}
      >
        <span>Explore Full Dossier</span>
        <ExternalLink size={14} />
      </button>
    </div>
  );
};
