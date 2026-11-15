import { ExternalLink, MapPin } from 'lucide-react';
import type React from 'react';
import type { PlanetId, SpaceArtifact } from '../../../entities/planet/model/types';

interface HoverPreviewCardProps {
  artifact: SpaceArtifact;
  screenPos: { x: number; y: number };
  planetId: PlanetId;
  onOpenDossier: (artifact: SpaceArtifact) => void;
}

export const HoverPreviewCard: React.FC<HoverPreviewCardProps> = ({
  artifact,
  screenPos,
  planetId,
  onOpenDossier,
}) => {
  const isMars = planetId === 'mars';
  const themeColor = isMars ? '#f97316' : '#38bdf8';

  return (
    <div
      className="hover-preview-card"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onOpenDossier(artifact);
      }}
    >
      <div className="cosmo-glass preview-card-inner">
        {}
        {artifact.imageUrl && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '84px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '10px',
              background: '#000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={artifact.imageUrl}
              alt={artifact.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) parent.style.display = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(10, 15, 28, 0.85) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {}
        <div className="preview-badge-row">
          <span className="preview-agency" style={{ color: themeColor }}>
            {artifact.agency} • {artifact.country}
          </span>
          <span
            className="preview-status"
            style={{ borderColor: artifact.badgeColor || themeColor }}
          >
            {artifact.operationalStatus || artifact.type.toUpperCase().replace('_', ' ')}
          </span>
        </div>

        {artifact.nssdcaId && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-dim)',
              marginBottom: '4px',
            }}
          >
            NSSDCA
          </div>
        )}

        {}
        <h4 className="preview-title">{artifact.name}</h4>

        {}
        <div className="preview-location">
          <MapPin size={13} style={{ color: themeColor, flexShrink: 0 }} />
          <span>{artifact.locationName}</span>
        </div>

        {}
        <p className="preview-brief">{artifact.brief}</p>

        {}
        <div className="preview-footer-action">
          <span style={{ color: 'var(--text-dim)' }}>
            Landed: <strong style={{ color: '#fff' }}>{artifact.landingDate.split(' ')[0]}</strong>
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: themeColor,
              fontWeight: 600,
            }}
          >
            <span>Dossier</span>
            <ExternalLink size={13} />
          </span>
        </div>
      </div>
    </div>
  );
};
