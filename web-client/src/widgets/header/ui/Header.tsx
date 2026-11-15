import {
  Database,
  Gamepad2,
  Globe,
  Info,
  Menu,
  Sparkles,
  Swords,
  Video,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { PlanetId } from '../../../entities/planet/model/types';

export type AppView = 'map' | 'catalog' | 'community' | 'astro-guessr' | 'arena';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMars = currentPlanetId === 'mars';
  const themeAccent = isMars ? '#f97316' : '#00F0FF';

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="cosmo-header-pen">
        <button type="button" className="cosmo-nav-brand" onClick={() => onSelectView('map')}>
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

        {/* Desktop Navigation Links */}
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
          <a
            href="/game"
            className="cosmo-nav-link"
            style={
              {
                '--link-accent': '#00F0FF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00F0FF',
                fontWeight: 700,
              } as React.CSSProperties
            }
          >
            <Swords size={13} />
            <span>Game Hub</span>
          </a>
          <button type="button" className="cosmo-nav-link" onClick={onOpenAbout}>
            About Project
          </button>
        </nav>

        {/* Header Right Bar */}
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

          <div
            className="cosmo-mcp-badge"
            title={
              isLiveApi ? 'Connected to live OpenAPI backend' : 'Using cached offline OpenAPI layer'
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
          </div>

          <div className="cosmo-theme-tag">{artifactCount} ITEMS</div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={`cosmo-burger-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{ '--burger-accent': themeAccent } as React.CSSProperties}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="cosmo-mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Futuristic Cyber Mobile Drawer */}
      <div
        className={`cosmo-mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        style={{ '--drawer-accent': themeAccent } as React.CSSProperties}
      >
        <div className="cosmo-mobile-nav-header">
          <div className="cosmo-mobile-nav-title">
            <span style={{ color: themeAccent }}>◈</span> NAVIGATION
          </div>
          <div className="cosmo-mobile-nav-badge">NASA SPACE APPS 2026</div>
        </div>

        <div className="cosmo-mobile-nav-list">
          <button
            type="button"
            className={`cosmo-mobile-nav-item ${currentView === 'map' ? 'active' : ''}`}
            onClick={() => handleNav(() => onSelectView('map'))}
          >
            <div className="cosmo-mobile-nav-icon">
              <Globe size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">3D Interactive Map</div>
              <div className="cosmo-mobile-nav-desc">Orbit, landmarks & laser beacons</div>
            </div>
            {currentView === 'map' && <span className="cosmo-mobile-nav-pill">ACTIVE</span>}
          </button>

          <button
            type="button"
            className={`cosmo-mobile-nav-item ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => handleNav(() => onSelectView('catalog'))}
          >
            <div className="cosmo-mobile-nav-icon">
              <Database size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">Artifacts Catalog</div>
              <div className="cosmo-mobile-nav-desc">Historical space hardware registry</div>
            </div>
            {currentView === 'catalog' && <span className="cosmo-mobile-nav-pill">ACTIVE</span>}
          </button>

          <button
            type="button"
            className={`cosmo-mobile-nav-item ${currentView === 'community' ? 'active' : ''}`}
            onClick={() => handleNav(() => onSelectView('community'))}
          >
            <div className="cosmo-mobile-nav-icon">
              <Video size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">Community Videos</div>
              <div className="cosmo-mobile-nav-desc">Archival & user-curated streams</div>
            </div>
            {currentView === 'community' && <span className="cosmo-mobile-nav-pill">ACTIVE</span>}
          </button>

          <button
            type="button"
            className={`cosmo-mobile-nav-item ${currentView === 'astro-guessr' ? 'active' : ''}`}
            onClick={() => handleNav(() => onSelectView('astro-guessr'))}
          >
            <div className="cosmo-mobile-nav-icon" style={{ color: themeAccent }}>
              <Gamepad2 size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">AstroGuessr 360°</div>
              <div className="cosmo-mobile-nav-desc">Panoramic surface location game</div>
            </div>
            <span
              className="cosmo-mobile-nav-badge-pill"
              style={{ borderColor: themeAccent, color: themeAccent }}
            >
              360°
            </span>
          </button>

          <button
            type="button"
            className={`cosmo-mobile-nav-item ${currentView === 'arena' ? 'active' : ''}`}
            onClick={() => handleNav(() => onSelectView('arena'))}
          >
            <div className="cosmo-mobile-nav-icon">
              <Swords size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">Battle Arena</div>
              <div className="cosmo-mobile-nav-desc">Spacecraft challenges & telemetry</div>
            </div>
            {currentView === 'arena' && <span className="cosmo-mobile-nav-pill">ACTIVE</span>}
          </button>

          <a
            href="/game"
            className="cosmo-mobile-nav-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="cosmo-mobile-nav-icon" style={{ color: '#00F0FF' }}>
              <Sparkles size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label" style={{ color: '#00F0FF' }}>
                Game Hub
              </div>
              <div className="cosmo-mobile-nav-desc">Full 3D browser space flight</div>
            </div>
            <span
              className="cosmo-mobile-nav-badge-pill"
              style={{ borderColor: '#00F0FF', color: '#00F0FF' }}
            >
              PLAY
            </span>
          </a>

          <button
            type="button"
            className="cosmo-mobile-nav-item"
            onClick={() => handleNav(onOpenAbout)}
          >
            <div className="cosmo-mobile-nav-icon">
              <Info size={18} />
            </div>
            <div className="cosmo-mobile-nav-text">
              <div className="cosmo-mobile-nav-label">About Project</div>
              <div className="cosmo-mobile-nav-desc">Mission, team & open data sources</div>
            </div>
          </button>
        </div>

        <div className="cosmo-mobile-nav-footer">
          <div className="cosmo-mobile-nav-footer-status">
            <span
              className="cosmo-pulse-dot"
              style={{
                backgroundColor: isLiveApi ? '#22c55e' : '#38bdf8',
                boxShadow: `0 0 8px ${isLiveApi ? '#22c55e' : '#38bdf8'}`,
              }}
            />
            <span className="cosmo-mobile-status-text">
              {isLiveApi ? 'LIVE OPENAPI v1' : 'OFFLINE CACHED'}
            </span>
          </div>
          <span className="cosmo-mobile-count-pill">{artifactCount} ARTIFACTS</span>
        </div>
      </div>
    </>
  );
};
