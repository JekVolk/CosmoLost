import React from 'react';
import type { PlanetId } from '../../../entities/planet/model/types';
import { Sparkles } from 'lucide-react';

export type AppView = 'map' | 'catalog' | 'community';

interface HeaderProps {
  currentPlanetId: PlanetId;
  onSelectPlanet: (id: PlanetId) => void;
  artifactCount: number;
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlanetId,
  onSelectPlanet,
  artifactCount,
  currentView,
  onSelectView,
  onOpenAbout,
}) => {
  const isMars = currentPlanetId === 'mars';
  const themeAccent = isMars ? '#f97316' : '#00F0FF';

  return (
    <header className="cosmo-header-pen">
      <div className="cosmo-nav-brand" onClick={() => onSelectView('map')}>
        <div className="cosmo-emblem-wrap">
          <div className="cosmo-emblem-diamond" style={{ borderColor: themeAccent }}>
            <div className="cosmo-emblem-core" style={{ backgroundColor: themeAccent }} />
          </div>
        </div>
        <div className="cosmo-brand-text">
          <div className="cosmo-brand-title">COSMOLOST</div>
          <div className="cosmo-brand-sub">NASA SPACE APPS 2026</div>
        </div>
      </div>

      <nav className="cosmo-nav-links">
        <button
          type="button"
          className={`cosmo-nav-link ${currentView === 'map' ? 'active' : ''}`}
          style={{ '--link-accent': themeAccent } as React.CSSProperties}
          onClick={() => onSelectView('map')}
        >
          3D Map
        </button>
        <button
          type="button"
          className={`cosmo-nav-link ${currentView === 'catalog' ? 'active' : ''}`}
          style={{ '--link-accent': themeAccent } as React.CSSProperties}
          onClick={() => onSelectView('catalog')}
        >
          Catalog
        </button>
        <button
          type="button"
          className={`cosmo-nav-link ${currentView === 'community' ? 'active' : ''}`}
          style={{ '--link-accent': themeAccent } as React.CSSProperties}
          onClick={() => onSelectView('community')}
        >
          Community Videos
        </button>
        <button
          type="button"
          className="cosmo-nav-link"
          onClick={onOpenAbout}
        >
          About Project
        </button>
      </nav>

      <div className="cosmo-nav-right">
        <div className="cosmo-planet-segmented">
          <button
            type="button"
            className={`cosmo-planet-seg-btn ${currentPlanetId === 'moon' ? 'active-moon' : ''}`}
            onClick={() => onSelectPlanet('moon')}
          >
            <span className="cosmo-seg-dot moon" />
            <span>Moon</span>
          </button>
          <button
            type="button"
            className={`cosmo-planet-seg-btn ${currentPlanetId === 'mars' ? 'active-mars' : ''}`}
            onClick={() => onSelectPlanet('mars')}
          >
            <span className="cosmo-seg-dot mars" />
            <span>Mars</span>
          </button>
        </div>

        <div className="cosmo-mcp-badge">
          <Sparkles size={11} className="text-cyan-400" />
          <span className="cosmo-mcp-label">AI GATEWAY (MCP)</span>
          <span className="cosmo-pulse-dot" />
          <span className="cosmo-mcp-status">SYNCED</span>
        </div>

        <div className="cosmo-theme-tag">
          {artifactCount} ITEMS
        </div>
      </div>
    </header>
  );
};
