import { Gamepad2, Sparkles } from 'lucide-react';
import type React from 'react';
import type { PlanetId } from '../../../entities/planet/model/types';

export type AppView = 'map' | 'catalog' | 'community' | 'astro-guessr' | 'arena' | 'connect';

interface HeaderProps {
  currentPlanetId: PlanetId;
  onSelectPlanet: (id: PlanetId) => void;
  artifactCount: number;
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAbout: () => void;
  isLiveApi?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlanetId,
  onSelectPlanet,
  artifactCount,
  currentView,
  onSelectView,
  onOpenAbout,
  isLiveApi = false,
}) => {
  const isMars = currentPlanetId === 'mars';
  const themeAccent = isMars ? '#f97316' : '#00F0FF';

  return (
    <header className="cosmo-header-pen">
      <button
        type="button"
        className="cosmo-nav-brand"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
        onClick={() => onSelectView('map')}
      >
        <div className="cosmo-emblem-wrap">
          <div className="cosmo-emblem-diamond" style={{ borderColor: themeAccent }}>
            <div className="cosmo-emblem-core" style={{ backgroundColor: themeAccent }} />
          </div>
        </div>
        <div className="cosmo-brand-text">
          <div className="cosmo-brand-title">COSMOLOST</div>
          <div className="cosmo-brand-sub">NASA SPACE APPS 2026</div>
        </div>
      </button>

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
          className={`cosmo-nav-link ${currentView === 'astro-guessr' ? 'active' : ''}`}
          style={
            {
              '--link-accent': themeAccent,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: currentView === 'astro-guessr' ? themeAccent : undefined,
            } as React.CSSProperties
          }
          onClick={() => onSelectView('astro-guessr')}
        >
          <Gamepad2 size={13} />
          <span>AstroGuessr 360°</span>
        </button>
        <button
          type="button"
          className={`cosmo-nav-link ${currentView === 'arena' ? 'active' : ''}`}
          style={{ '--link-accent': themeAccent } as React.CSSProperties}
          onClick={() => onSelectView('arena')}
        >
          Arena
        </button>
        <button
          type="button"
          className={`cosmo-nav-link ${currentView === 'connect' ? 'active' : ''}`}
          style={
            {
              '--link-accent': '#00D9F5',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: currentView === 'connect' ? '#00D9F5' : undefined,
            } as React.CSSProperties
          }
          onClick={() => onSelectView('connect')}
        >
          {currentView === 'connect' && (
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#00D9F5',
                boxShadow: '0 0 6px #00D9F5',
                display: 'inline-block',
              }}
            />
          )}
          <span>MCP Connect</span>
        </button>
        <button type="button" className="cosmo-nav-link" onClick={onOpenAbout}>
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

        <button
          type="button"
          className="cosmo-mcp-badge"
          onClick={() => onSelectView('connect')}
          style={{ cursor: 'pointer', background: 'none', border: 'none', font: 'inherit' }}
          title={
            isLiveApi
              ? 'Connected to live OpenAPI backend · Click to open MCP Connect'
              : 'Using cached offline OpenAPI layer · Click to open MCP Connect'
          }
        >
          <Sparkles size={11} style={{ color: isLiveApi ? '#22c55e' : '#00F0FF' }} />
          <span className="cosmo-mcp-label">OPENAPI API</span>
          <span
            className="cosmo-pulse-dot"
            style={{
              backgroundColor: isLiveApi ? '#22c55e' : '#38bdf8',
              boxShadow: `0 0 6px ${isLiveApi ? '#22c55e' : '#38bdf8'}`,
            }}
          />
          <span className="cosmo-mcp-status" style={{ color: isLiveApi ? '#22c55e' : '#38bdf8' }}>
            {isLiveApi ? 'LIVE API' : 'CACHED'}
          </span>
        </button>

        <div className="cosmo-theme-tag">{artifactCount} ITEMS</div>
      </div>
    </header>
  );
};
