import React, { useState } from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import { ChevronLeft, ChevronRight, Layers, Radio, Search, X } from 'lucide-react';

interface PlanetTelemetryProps {
  planet: PlanetConfig;
  onSelectArtifact: (artifact: SpaceArtifact) => void;
  activeArtifactId?: string | null;
}

export const PlanetTelemetry: React.FC<PlanetTelemetryProps> = ({
  planet,
  onSelectArtifact,
  activeArtifactId,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMars = planet.id === 'mars';
  const themeColor = isMars ? '#f97316' : '#38bdf8';

  const filteredArtifacts = planet.artifacts.filter((art) => {
    if (filterType === 'rovers' && art.type !== 'rover' && art.type !== 'helicopter') return false;
    if (filterType === 'landers' && art.type !== 'lander' && art.type !== 'descent_stage') return false;
    if (filterType === 'science' && art.type !== 'retro_reflector' && art.type !== 'impact_stage' && art.type !== 'sample_depot' && art.type !== 'instrument') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = art.name.toLowerCase().includes(q);
      const matchMission = art.mission.toLowerCase().includes(q);
      const matchAgency = art.agency.toLowerCase().includes(q);
      const matchCountry = art.country?.toLowerCase().includes(q);
      const matchLoc = art.locationName.toLowerCase().includes(q);
      const matchNssdca = art.nssdcaId?.toLowerCase().includes(q);
      return matchName || matchMission || matchAgency || matchCountry || matchLoc || matchNssdca;
    }
    return true;
  });

  return (
    <>
      {}
      {!isOpen && (
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open telemetry registry"
        >
          <Layers size={16} style={{ color: themeColor }} />
          <span>Artifact Registry ({planet.artifacts.length})</span>
          <ChevronRight size={14} />
        </button>
      )}

      {}
      <aside className={`telemetry-sidebar ${!isOpen ? 'collapsed' : ''}`}>
        <div className="cosmo-glass sidebar-scroll-box" style={{ borderColor: `${themeColor}30` }}>
          {}
          <div className="sidebar-header">
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: themeColor, textTransform: 'uppercase' }}>
                {planet.telemetry.designation}
              </div>
              <h2 className="planet-title-large">{planet.nameEn}</h2>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hud-btn"
              style={{ width: '32px', height: '32px' }}
              title="Collapse panel"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {}
          <p className="planet-tagline">{planet.tagline}</p>

          {}
          <div className="telemetry-grid">
            <div className="telemetry-stat-card">
              <div className="stat-label">Radius</div>
              <div className="stat-value">{planet.telemetry.radiusKm.toLocaleString()} km</div>
            </div>

            <div className="telemetry-stat-card">
              <div className="stat-label">Gravity</div>
              <div className="stat-value">{planet.telemetry.surfaceGravity.split(' ')[0]} m/s²</div>
            </div>

            <div className="telemetry-stat-card">
              <div className="stat-label">Day Length</div>
              <div className="stat-value">{planet.telemetry.dayLength.split('(')[0]}</div>
            </div>

            <div className="telemetry-stat-card">
              <div className="stat-label">Avg Temp</div>
              <div className="stat-value">{planet.telemetry.avgTemperature}</div>
            </div>
          </div>

          {}
          <div className="artifacts-section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} style={{ color: themeColor }} />
              <span>Abandoned Hardware</span>
            </div>
            <span style={{ color: themeColor }}>{filteredArtifacts.length} / {planet.artifacts.length}</span>
          </div>

          {}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '9px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mission, name, NSSDCA..."
              style={{
                width: '100%',
                padding: '6px 28px 6px 28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'rovers', label: 'Rovers & Flight' },
              { id: 'landers', label: 'Landers' },
              { id: 'science', label: 'Laser & Relics' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: filterType === f.id ? `1px solid ${themeColor}` : '1px solid rgba(255,255,255,0.1)',
                  background: filterType === f.id ? `${themeColor}25` : 'rgba(255,255,255,0.03)',
                  color: filterType === f.id ? '#fff' : 'var(--text-dim)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredArtifacts.map((artifact) => {
              const isSelected = activeArtifactId === artifact.id;
              return (
                <div
                  key={artifact.id}
                  className="artifact-item-card"
                  style={{
                    borderColor: isSelected ? themeColor : undefined,
                    background: isSelected ? `${themeColor}15` : undefined,
                  }}
                  onClick={() => onSelectArtifact(artifact)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="artifact-item-name">{artifact.name}</span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: artifact.badgeColor || themeColor,
                        boxShadow: `0 0 6px ${artifact.badgeColor || themeColor}`,
                      }}
                    />
                  </div>

                  <div className="artifact-item-meta">
                    <span>{artifact.agency}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {artifact.massKg ? `${artifact.massKg} kg` : ''} • {artifact.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '10px',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: themeColor, fontWeight: 600, marginBottom: '2px' }}>
              NASA SPACE APPS 2026
            </div>
            Sourced from NASA Planetary Data System (PDS), NSSDCA Master Catalog, JPL Mission Archives, LROC & MRO HiRISE.
          </div>
        </div>
      </aside>
    </>
  );
};
