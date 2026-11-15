import {
  Activity,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Filter,
  Info,
  Layers,
  Search,
  Wind,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';

interface PlanetTelemetryProps {
  planet: PlanetConfig;
  onSelectArtifact: (artifact: SpaceArtifact) => void;
  activeArtifactId?: string | null;
  onFilteredIdsChange?: (ids: Set<string> | null) => void;
}

export const PlanetTelemetry: React.FC<PlanetTelemetryProps> = ({
  planet,
  onSelectArtifact,
  activeArtifactId,
  onFilteredIdsChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'registry' | 'atmosphere'>('registry');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);

  const activeFiltersCount = selectedTypes.length + selectedStatuses.length;

  const isMars = planet.id === 'mars';
  const themeColor = isMars ? '#f97316' : '#00F0FF';

  const typeOptions = [
    { id: 'rover', label: 'Rovers & Flight' },
    { id: 'lander', label: 'Landers & Descent' },
    { id: 'science', label: 'Laser & Relics' },
    { id: 'impact', label: 'Impact Sites' },
  ];

  const statusOptions = [
    { id: 'active', label: 'Active Telemetry' },
    { id: 'preserved', label: 'Defunct / Preserved' },
    { id: 'lost', label: 'Lost / Silent' },
  ];

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const filteredArtifacts = React.useMemo(() => {
    return planet.artifacts.filter((art) => {
      if (selectedTypes.length > 0) {
        const isMatch = selectedTypes.some((t) => {
          if (t === 'rover') return art.type === 'rover' || art.type === 'helicopter';
          if (t === 'lander') return art.type === 'lander' || art.type === 'descent_stage';
          if (t === 'science')
            return (
              art.type === 'retro_reflector' ||
              art.type === 'instrument' ||
              art.type === 'sample_depot'
            );
          if (t === 'impact') return art.type === 'impact_stage';
          return false;
        });
        if (!isMatch) return false;
      }

      if (selectedStatuses.length > 0) {
        const stat = (art.operationalStatus || '').toLowerCase();
        const isMatch = selectedStatuses.some((s) => {
          if (s === 'active') return stat.includes('active') || stat.includes('operating');
          if (s === 'preserved')
            return (
              stat.includes('preserved') || stat.includes('complete') || stat.includes('intact')
            );
          if (s === 'lost')
            return stat.includes('lost') || stat.includes('crashed') || stat.includes('inactive');
          return false;
        });
        if (!isMatch) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          art.name.toLowerCase().includes(q) ||
          art.mission.toLowerCase().includes(q) ||
          art.agency.toLowerCase().includes(q) ||
          art.locationName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [planet.artifacts, selectedTypes, selectedStatuses, searchQuery]);

  React.useEffect(() => {
    if (selectedTypes.length === 0 && selectedStatuses.length === 0 && !searchQuery.trim()) {
      onFilteredIdsChange?.(null);
    } else {
      onFilteredIdsChange?.(new Set(filteredArtifacts.map((a) => a.id)));
    }
  }, [filteredArtifacts, selectedTypes, selectedStatuses, searchQuery, onFilteredIdsChange]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="pen-sidebar-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open filters & catalog"
        >
          <Filter size={15} style={{ color: themeColor }} />
          <span>Telemetry & Registry ({planet.artifacts.length})</span>
          <ChevronRight size={14} />
        </button>
      )}

      <aside className={`pen-filters-panel ${!isOpen ? 'collapsed' : ''}`}>
        <div className="pen-filters-card">
          <div className="pen-filter-header">
            <div className="pen-filter-title-group">
              <Activity size={16} style={{ color: themeColor }} />
              <span className="pen-filter-title">
                {planet.name.toUpperCase()} Telemetry & Registry
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="pen-collapse-btn"
              title="Collapse"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('registry')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'registry' ? `${themeColor}25` : 'transparent',
                color: activeTab === 'registry' ? themeColor : '#94a3b8',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.2s',
              }}
            >
              <Compass size={12} />
              <span>ARTIFACTS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('atmosphere')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'atmosphere' ? `${themeColor}25` : 'transparent',
                color: activeTab === 'atmosphere' ? themeColor : '#94a3b8',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.2s',
              }}
            >
              <Wind size={12} />
              <span>ATMOSPHERE</span>
            </button>
          </div>

          {activeTab === 'atmosphere' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 220px)',
                paddingRight: '4px',
              }}
            >
              {/* Atmospheric Profile Card */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${themeColor}30`,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
                >
                  <Wind size={14} style={{ color: themeColor }} />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#f8fafc',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {isMars ? 'MARTIAN ATMOSPHERE' : 'LUNAR EXOSPHERE'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '12.5px',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    marginBottom: '8px',
                  }}
                >
                  <strong>Composition:</strong> {planet.telemetry.atmosphere}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      PRESSURE
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {isMars ? '6.10 mbar' : '10⁻¹² bar'}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      MEAN TEMP
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#fbbf24',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {planet.telemetry.avgTemperature}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      GRAVITY
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {planet.telemetry.surfaceGravity}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      DAY LENGTH
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={planet.telemetry.dayLength}
                    >
                      {isMars ? '24h 37m (1 sol)' : '27.3 Earth days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Properties Card */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
                >
                  <Layers size={14} style={{ color: '#38bdf8' }} />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#f8fafc',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    PLANETARY METRICS
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Radius:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {planet.telemetry.radiusKm.toLocaleString()} km
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Orbital Period:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {planet.telemetry.orbitPeriod}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Axial Tilt:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {planet.axialTiltDeg}°
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Temp Range:</span>
                    <span style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                      {planet.telemetry.tempRange}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Distance to Earth:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {planet.telemetry.distanceFromEarth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Source Citation */}
              <a
                href="https://pds-atmospheres.nmsu.edu/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span>NASA PDS Atmospheres Node</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <>
              <div className="pen-search-box">
                <Search size={13} className="pen-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by mission, name, site..."
                  className="pen-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="pen-search-clear"
                    title="Clear"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Collapsible Filter Bar to preserve vertical space for the list */}
              <div className="pen-filter-toggle-row">
                <button
                  type="button"
                  className={`pen-filter-toggle-btn ${activeFiltersCount > 0 ? 'has-active' : ''}`}
                  onClick={() => setIsFiltersExpanded((prev) => !prev)}
                >
                  <Filter size={12} style={{ color: themeColor }} />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                  <ChevronDown
                    size={13}
                    style={{
                      transform: isFiltersExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    className="pen-filter-reset-btn"
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedStatuses([]);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {isFiltersExpanded && (
                <div className="pen-filters-collapsible-content">
                  <div className="pen-filter-section">
                    <div className="pen-section-title">Object Type</div>
                    <div className="pen-checkbox-grid">
                      {typeOptions.map((opt) => {
                        const active = selectedTypes.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            className={`pen-chip-btn ${active ? 'active' : ''}`}
                            style={{ '--chip-accent': themeColor } as React.CSSProperties}
                            onClick={() => toggleType(opt.id)}
                          >
                            <span className="pen-chip-box">{active && <Check size={10} />}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pen-filter-section">
                    <div className="pen-section-title">Operational Status</div>
                    <div className="pen-checkbox-grid">
                      {statusOptions.map((opt) => {
                        const active = selectedStatuses.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            className={`pen-chip-btn ${active ? 'active' : ''}`}
                            style={{ '--chip-accent': themeColor } as React.CSSProperties}
                            onClick={() => toggleStatus(opt.id)}
                          >
                            <span className="pen-chip-box">{active && <Check size={10} />}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="pen-registry-header">
                <div className="pen-registry-title">
                  <Compass size={13} style={{ color: themeColor }} />
                  <span>Artifacts</span>
                </div>
                <span className="pen-registry-count" style={{ color: themeColor }}>
                  {filteredArtifacts.length} of {planet.artifacts.length}
                </span>
              </div>

              <div className="pen-artifact-scroll-list">
                {filteredArtifacts.map((art) => {
                  const isSelected = activeArtifactId === art.id;
                  return (
                    <div
                      key={art.id}
                      className={`pen-artifact-row ${isSelected ? 'selected' : ''}`}
                      style={{ '--row-accent': themeColor } as React.CSSProperties}
                      onClick={() => onSelectArtifact(art)}
                    >
                      <div className="pen-row-main">
                        <span className="pen-row-name">{art.name}</span>
                        <span
                          className="pen-row-dot"
                          style={{ backgroundColor: art.badgeColor || themeColor }}
                        />
                      </div>
                      <div className="pen-row-meta">
                        <span>{art.agency}</span>
                        <span>•</span>
                        <span className="truncate">{art.locationName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pen-tip-card">
                <Info size={14} className="pen-tip-icon" style={{ color: themeColor }} />
                <p className="pen-tip-text">
                  Click any surface beacon or list item to fly camera & open archival dossier.
                </p>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
