import {
  Calendar,
  ExternalLink,
  Filter,
  MapPin,
  Rocket,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { PLANETS } from '../../../entities/planet/model/planetData';
import type { PlanetConfig, PlanetId, SpaceArtifact } from '../../../entities/planet/model/types';

interface CatalogPageProps {
  onOpenDossier: (artifact: SpaceArtifact, planetId: PlanetId) => void;
  onBackToMap: () => void;
  planets?: Record<PlanetId, PlanetConfig>;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onOpenDossier, planets = PLANETS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanet, setSelectedPlanet] = useState<'all' | 'moon' | 'mars'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'mass-desc'>('date-desc');

  const allArtifactsWithPlanet = useMemo(() => {
    const list: { artifact: SpaceArtifact; planetId: PlanetId }[] = [];
    (planets.moon?.artifacts || []).forEach((art) =>
      list.push({ artifact: art, planetId: 'moon' }),
    );
    (planets.mars?.artifacts || []).forEach((art) =>
      list.push({ artifact: art, planetId: 'mars' }),
    );
    return list;
  }, [planets]);

  const totalCount = allArtifactsWithPlanet.length;
  const moonCount = planets.moon?.artifacts?.length || 0;
  const marsCount = planets.mars?.artifacts?.length || 0;

  const filtered = useMemo(() => {
    return allArtifactsWithPlanet
      .filter(({ artifact, planetId }) => {
        if (selectedPlanet !== 'all' && planetId !== selectedPlanet) return false;
        if (selectedType !== 'all') {
          if (
            selectedType === 'rover' &&
            artifact.type !== 'rover' &&
            artifact.type !== 'helicopter'
          )
            return false;
          if (
            selectedType === 'lander' &&
            artifact.type !== 'lander' &&
            artifact.type !== 'descent_stage'
          )
            return false;
          if (
            selectedType === 'science' &&
            artifact.type !== 'retro_reflector' &&
            artifact.type !== 'instrument' &&
            artifact.type !== 'sample_depot'
          )
            return false;
          if (selectedType === 'impact' && artifact.type !== 'impact_stage') return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            artifact.name.toLowerCase().includes(q) ||
            artifact.mission.toLowerCase().includes(q) ||
            artifact.agency.toLowerCase().includes(q) ||
            artifact.locationName.toLowerCase().includes(q) ||
            (artifact.country && artifact.country.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'mass-desc') {
          return (b.artifact.massKg || 0) - (a.artifact.massKg || 0);
        }
        const dateA = new Date(a.artifact.landingDate).getTime() || 0;
        const dateB = new Date(b.artifact.landingDate).getTime() || 0;
        return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
      });
  }, [allArtifactsWithPlanet, selectedPlanet, selectedType, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPlanet('all');
    setSelectedType('all');
    setSortBy('date-desc');
  };

  const hasActiveFilters = searchQuery !== '' || selectedPlanet !== 'all' || selectedType !== 'all';

  return (
    <div className="pen-catalog-page">
      <div className="pen-catalog-container">
        <div className="pen-catalog-intro">
          <div className="pen-challenge-badge">
            <Sparkles size={11} className="text-cyan-400" />
            <span>NASA SPACE APPS CHALLENGE 2026 · ARCHIVE CATALOG</span>
          </div>
          <h1 className="pen-catalog-title">Artifact Catalog</h1>
          <p className="pen-catalog-subtitle">
            Comprehensive archive of historical space mission hardware, rovers, landers, and
            scientific experiments abandoned across Lunar and Martian soil.
          </p>

          <div className="pen-metrics-bar">
            <div className="pen-metric-item">
              <span className="pen-metric-num cyan">{totalCount}</span>
              <span className="pen-metric-lbl">TOTAL ARTIFACTS</span>
            </div>
            <div className="pen-metric-sep" />
            <div className="pen-metric-item">
              <span className="pen-metric-num">{moonCount}</span>
              <span className="pen-metric-lbl">LUNAR SITES</span>
            </div>
            <div className="pen-metric-sep" />
            <div className="pen-metric-item">
              <span className="pen-metric-num rust">{marsCount}</span>
              <span className="pen-metric-lbl">MARTIAN SITES</span>
            </div>
          </div>
        </div>

        <div className="pen-catalog-toolbar">
          <div className="pen-toolbar-left">
            <div className="pen-catalog-search">
              <Search size={14} className="pen-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artifacts, missions, agencies..."
                className="pen-catalog-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="pen-search-clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="pen-planet-filter-group">
              <button
                type="button"
                className={`pen-filter-tab ${selectedPlanet === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('all')}
              >
                All Planets
              </button>
              <button
                type="button"
                className={`pen-filter-tab ${selectedPlanet === 'moon' ? 'active moon' : ''}`}
                onClick={() => setSelectedPlanet('moon')}
              >
                Moon
              </button>
              <button
                type="button"
                className={`pen-filter-tab ${selectedPlanet === 'mars' ? 'active mars' : ''}`}
                onClick={() => setSelectedPlanet('mars')}
              >
                Mars
              </button>
            </div>

            <div className="pen-type-select-wrap">
              <Filter size={12} className="pen-select-icon" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pen-type-select"
              >
                <option value="all">All Equipment Types</option>
                <option value="rover">Rovers & Flight</option>
                <option value="lander">Landers & Descent</option>
                <option value="science">Laser & Relics</option>
                <option value="impact">Impact Sites</option>
              </select>
            </div>
          </div>

          <div className="pen-toolbar-right">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pen-sort-select"
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
              <option value="mass-desc">Sort: Heaviest First</option>
            </select>
          </div>
        </div>

        <div className="pen-results-header">
          <div className="pen-results-count">
            <strong>{filtered.length}</strong> artifacts found
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="pen-clear-filters-btn">
              <RotateCcw size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="pen-empty-state">
            <div className="pen-empty-icon">🛰️</div>
            <h3>No artifacts matched your criteria</h3>
            <p>Try resetting the search terms or changing planet & equipment filters.</p>
            <button type="button" onClick={clearFilters} className="pen-btn-primary">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="pen-card-grid-3">
            {filtered.map(({ artifact, planetId }) => {
              const isMars = planetId === 'mars';
              const accentColor = isMars ? '#f97316' : '#00F0FF';
              return (
                <div
                  key={artifact.id}
                  className="pen-catalog-card"
                  style={{ '--card-accent': accentColor } as React.CSSProperties}
                  onClick={() => onOpenDossier(artifact, planetId)}
                >
                  <div className="pen-catalog-card-image-wrap">
                    {artifact.imageUrl ? (
                      <img
                        src={artifact.imageUrl}
                        alt={artifact.name}
                        className="pen-catalog-card-image"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="pen-card-image-placeholder">
                        <Rocket size={32} style={{ color: accentColor, opacity: 0.5 }} />
                      </div>
                    )}
                    <div className="pen-card-badge-row">
                      <span className={`pen-planet-badge ${isMars ? 'mars' : 'moon'}`}>
                        {planetId.toUpperCase()}
                      </span>
                      <span className="pen-agency-badge">{artifact.agency}</span>
                    </div>
                  </div>

                  <div className="pen-catalog-card-body">
                    <div className="pen-card-mission-tag" style={{ color: accentColor }}>
                      {artifact.mission}
                    </div>
                    <h3 className="pen-catalog-card-title">{artifact.name}</h3>

                    <div className="pen-catalog-card-meta">
                      <div className="pen-card-meta-line">
                        <MapPin size={12} style={{ color: accentColor }} />
                        <span className="truncate">{artifact.locationName}</span>
                      </div>
                      <div className="pen-card-meta-line">
                        <Calendar size={12} style={{ color: accentColor }} />
                        <span>{artifact.landingDate}</span>
                      </div>
                    </div>

                    <p className="pen-catalog-card-brief">
                      {artifact.brief || artifact.description}
                    </p>

                    <div className="pen-catalog-card-footer">
                      <span className="pen-view-dossier-link" style={{ color: accentColor }}>
                        <span>View Dossier</span>
                        <ExternalLink size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
