import React from 'react';
import type { PlanetId } from '../../../entities/planet/model/types';
import { Globe2 } from 'lucide-react';

interface HeaderProps {
  currentPlanetId: PlanetId;
  onSelectPlanet: (id: PlanetId) => void;
  artifactCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlanetId,
  onSelectPlanet,
  artifactCount,
}) => {
  return (
    <header className="cosmo-header">
      {}
      <div className="cosmo-brand">
        <div className="cosmo-logo-badge">
          <Globe2 size={22} className="text-cyan-400" />
        </div>
        <div className="cosmo-title-group">
          <div className="cosmo-brand-title">
            CosmoLost
          </div>
          <div className="cosmo-hackathon-tag">
            NASA Space Apps
          </div>
        </div>
      </div>

      {}
      <div className="planet-switcher-wrap">
        <button
          type="button"
          className={`planet-btn ${currentPlanetId === 'mars' ? 'active-mars' : ''}`}
          onClick={() => onSelectPlanet('mars')}
        >
          <span className="planet-icon-dot mars" />
          <span>MARS</span>
        </button>

        <button
          type="button"
          className={`planet-btn ${currentPlanetId === 'moon' ? 'active-moon' : ''}`}
          onClick={() => onSelectPlanet('moon')}
        >
          <span className="planet-icon-dot moon" />
          <span>MOON</span>
        </button>
      </div>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'rgba(10, 15, 28, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ color: currentPlanetId === 'mars' ? '#f97316' : '#38bdf8', fontWeight: 600 }}>
            {artifactCount}
          </span>{' '}
          artifacts archived
        </div>
      </div>
    </header>
  );
};
