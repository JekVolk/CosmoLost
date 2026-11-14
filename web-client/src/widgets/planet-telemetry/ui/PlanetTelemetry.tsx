import React, { useState } from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import { Filter, Search, X, ChevronLeft, ChevronRight, Info, Check, Compass } from 'lucide-react';

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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filteredArtifacts = React.useMemo(() => {
    return planet.artifacts.filter((art) => {
      if (selectedTypes.length > 0) {
        const isMatch = selectedTypes.some((t) => {
          if (t === 'rover') return art.type === 'rover' || art.type === 'helicopter';
          if (t === 'lander') return art.type === 'lander' || art.type === 'descent_stage';
          if (t === 'science') return art.type === 'retro_reflector' || art.type === 'instrument' || art.type === 'sample_depot';
          if (t === 'impact') return art.type === 'impact_stage';
          return false;
        });
        if (!isMatch) return false;
      }

      if (selectedStatuses.length > 0) {
        const stat = (art.operationalStatus || '').toLowerCase();
        const isMatch = selectedStatuses.some((s) => {
          if (s === 'active') return stat.includes('active') || stat.includes('operating');
          if (s === 'preserved') return stat.includes('preserved') || stat.includes('complete') || stat.includes('intact');
          if (s === 'lost') return stat.includes('lost') || stat.includes('crashed') || stat.includes('inactive');
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
          <span>Filters & Registry ({planet.artifacts.length})</span>
          <ChevronRight size={14} />
        </button>
      )}

      <aside className={`pen-filters-panel ${!isOpen ? 'collapsed' : ''}`}>
        <div className="pen-filters-card">
          <div className="pen-filter-header">
            <div className="pen-filter-title-group">
              <Filter size={16} style={{ color: themeColor }} />
              <span className="pen-filter-title">Filters & Registry</span>
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
                    <span className="pen-chip-box">
                      {active && <Check size={10} />}
                    </span>
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
                    <span className="pen-chip-box">
                      {active && <Check size={10} />}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
        </div>
      </aside>
    </>
  );
};
