import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Heart,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { PLANETS } from '../../../entities/planet/model/planetData';
import type { PlanetConfig, PlanetId, SpaceArtifact } from '../../../entities/planet/model/types';
import { portalApi } from '../../../shared/api/portalApi';
import type { CommunityPublication, PlatformType } from '../../../shared/api/types';
import { getEmbeddableVideoUrl, validateVideoUrl } from '../../../shared/lib/videoUrl';

interface CommunityVideosPageProps {
  onOpenArtifact: (artifact: SpaceArtifact, planetId: PlanetId) => void;
  planets?: Record<PlanetId, PlanetConfig>;
}

export const CommunityVideosPage: React.FC<CommunityVideosPageProps> = ({
  onOpenArtifact,
  planets,
}) => {
  const [publications, setPublications] = useState<CommunityPublication[]>([]);
  const [filterPlanet, setFilterPlanet] = useState<'all' | 'moon' | 'mars'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CommunityPublication | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    platform_type: 'YOUTUBE' as PlatformType,
    video_url: '',
    source_references: '',
    mission_id: 'Mars Exploration Rover',
    artifact_id: 'opportunity-mer-b',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const loadPublications = () => {
    portalApi.listCommunityPublications().then((resp) => {
      setPublications(resp.results);
      if (resp.results.length > 0 && !selectedVideo) {
        setSelectedVideo(resp.results[0]);
      }
    });
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const allArtifacts = [
    ...(planets?.moon?.artifacts || PLANETS.moon.artifacts || []).map((a: SpaceArtifact) => ({
      ...a,
      planet: 'moon' as PlanetId,
    })),
    ...(planets?.mars?.artifacts || PLANETS.mars.artifacts || []).map((a: SpaceArtifact) => ({
      ...a,
      planet: 'mars' as PlanetId,
    })),
  ];

  const filteredPubs = publications.filter((pub) => {
    if (filterPlanet !== 'all') {
      const art = allArtifacts.find(
        (a) => a.id === pub.artifact_id || a.mission === pub.mission_id,
      );
      if (art && art.planet !== filterPlanet) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        pub.title.toLowerCase().includes(q) ||
        pub.author_name.toLowerCase().includes(q) ||
        pub.source_references.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVideoUrlChange = (newUrl: string) => {
    setFormData((prev) => {
      const updated = { ...prev, video_url: newUrl };
      if (newUrl.trim()) {
        const val = validateVideoUrl(newUrl);
        if (val.isValid && val.platform) {
          updated.platform_type = val.platform;
          setUrlValidationError(null);
        } else if (!val.isValid) {
          setUrlValidationError(val.error || 'Invalid video link');
        }
      } else {
        setUrlValidationError(null);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url || !formData.author_name) return;

    // Strict URL validation: accept only YouTube, Instagram, TikTok, and verified video platforms
    const validation = validateVideoUrl(formData.video_url);
    if (!validation.isValid) {
      setUrlValidationError(
        validation.error ||
          'Please provide a valid video link from YouTube, Instagram, TikTok, or Vimeo.',
      );
      return;
    }

    setIsSubmitting(true);
    setUrlValidationError(null);
    try {
      await portalApi.submitCommunityPublication({
        title: formData.title,
        author_name: formData.author_name,
        platform_type: validation.platform || formData.platform_type,
        video_url: validation.cleanUrl || formData.video_url,
        source_references: formData.source_references,
        mission_id: formData.mission_id,
        artifact_id: formData.artifact_id,
      });
      loadPublications();
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        setFormData({
          title: '',
          author_name: '',
          platform_type: 'YOUTUBE',
          video_url: '',
          source_references: '',
          mission_id: 'Mars Exploration Rover',
          artifact_id: 'opportunity-mer-b',
        });
        setUrlValidationError(null);
      }, 1500);
    } catch {
      alert('Failed to submit publication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFeatured = selectedVideo || publications[0];

  return (
    <div className="pen-community-page">
      <div className="pen-community-container">
        <div className="pen-community-intro">
          <div className="pen-challenge-badge">
            <Sparkles size={11} className="text-cyan-400" />
            <span>NASA SPACE APPS CHALLENGE 2026 · COMMUNITY SPOTLIGHT</span>
          </div>

          <div className="pen-community-header-row">
            <div>
              <h1 className="pen-catalog-title">Community Videos</h1>
              <p className="pen-catalog-subtitle">
                Explore videos, documentaries, and archival breakdowns created by scientists,
                students, and space archivists worldwide.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="pen-btn-primary"
            >
              <Plus size={15} />
              <span>Submit Your Video</span>
            </button>
          </div>

          <div className="pen-metrics-bar">
            <div className="pen-metric-item">
              <span className="pen-metric-num cyan">{publications.length} STORIES</span>
              <span className="pen-metric-lbl">COMMUNITY ARCHIVE</span>
            </div>
            <div className="pen-metric-sep" />
            <div className="pen-metric-item">
              <span className="pen-metric-num">9:16 VERTICAL</span>
              <span className="pen-metric-lbl">MOBILE & DESKTOP</span>
            </div>
            <div className="pen-metric-sep" />
            <div className="pen-metric-item">
              <span className="pen-metric-num rust">VERIFIED PDS</span>
              <span className="pen-metric-lbl">PEER REVIEWED</span>
            </div>
          </div>
        </div>

        <div className="pen-community-layout">
          {currentFeatured && (
            <div className="pen-featured-video-card">
              <div className="pen-featured-player-wrap">
                <iframe
                  src={getEmbeddableVideoUrl(currentFeatured.video_url)}
                  title={currentFeatured.title}
                  className="pen-featured-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="pen-featured-info">
                <div className="pen-featured-badges">
                  <span className="pen-platform-pill">{currentFeatured.platform_type}</span>
                  <span className="pen-verified-pill">
                    <ShieldCheck size={12} />
                    <span>NASA PDS VERIFIED</span>
                  </span>
                </div>

                <h2 className="pen-featured-title">{currentFeatured.title}</h2>
                <div className="pen-featured-author">By {currentFeatured.author_name}</div>
                <p className="pen-featured-desc">{currentFeatured.source_references}</p>

                <div className="pen-featured-stats">
                  <span className="stat">
                    <Eye size={13} /> 2.4k views
                  </span>
                  <span className="stat">
                    <Heart size={13} /> 342 likes
                  </span>
                </div>

                {(() => {
                  const targetArt = allArtifacts.find((a) => a.id === currentFeatured.artifact_id);
                  if (!targetArt) return null;
                  return (
                    <div
                      className="pen-featured-artifact-link"
                      onClick={() => onOpenArtifact(targetArt, targetArt.planet)}
                    >
                      <span>
                        Related Artifact: <strong>{targetArt.name}</strong>
                      </span>
                      <ExternalLink size={13} />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="pen-videos-gallery-column">
            <div className="pen-gallery-header">
              <h3 className="pen-gallery-title">Recent Community Submissions</h3>
              <div className="pen-gallery-filters">
                <button
                  type="button"
                  className={`pen-sub-tab ${filterPlanet === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterPlanet('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`pen-sub-tab ${filterPlanet === 'moon' ? 'active' : ''}`}
                  onClick={() => setFilterPlanet('moon')}
                >
                  Moon
                </button>
                <button
                  type="button"
                  className={`pen-sub-tab ${filterPlanet === 'mars' ? 'active' : ''}`}
                  onClick={() => setFilterPlanet('mars')}
                >
                  Mars
                </button>
              </div>
            </div>

            <div className="pen-search-box" style={{ maxWidth: '300px', marginBottom: '8px' }}>
              <Search size={13} className="pen-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by creator, title..."
                className="pen-search-input"
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

            <div className="pen-videos-grid">
              {filteredPubs.map((pub) => {
                const isSelected = currentFeatured?.id === pub.id;
                return (
                  <div
                    key={pub.id}
                    className={`pen-video-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedVideo(pub)}
                  >
                    <div className="pen-video-card-thumb-wrap">
                      <div
                        className="pen-video-card-thumb"
                        style={{
                          background: '#0b1120',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Play size={24} style={{ color: '#00F0FF', opacity: 0.8 }} />
                      </div>
                      <div className="pen-video-play-overlay">
                        <Play size={20} fill="#fff" />
                      </div>
                      <span className="pen-video-platform-badge">{pub.platform_type}</span>
                    </div>

                    <div className="pen-video-card-body">
                      <h4 className="pen-video-card-title">{pub.title}</h4>
                      <div className="pen-video-card-meta">
                        <span>{pub.author_name}</span>
                        <span>•</span>
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pen-guidelines-card">
              <div className="pen-guidelines-header">
                <ShieldCheck size={16} className="text-cyan-400" />
                <span className="pen-guidelines-title">FEED SUBMISSION CRITERIA</span>
              </div>
              <ul className="pen-guidelines-list">
                <li>
                  9:16 vertical format (1080×1920) optimized for mobile & desktop exploration.
                </li>
                <li>Maximum 3-minute run time focused on lunar or martian hardware science.</li>
                <li>Include verified NASA PIA, PDS, or JPL archival references.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isSubmitModalOpen && (
        <div className="pen-modal-backdrop" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="pen-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pen-modal-header">
              <h3>Submit Community Video</h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="pen-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="pen-modal-success">
                <CheckCircle2 size={40} className="text-emerald-400" />
                <h4>Video Submitted for Verification!</h4>
                <p>Your video has been sent to the NASA PDS reviewer node.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pen-modal-form">
                <div className="pen-form-field">
                  <label>Video Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Descent of Eagle: Crew-11 Restored 4K"
                  />
                </div>

                <div className="pen-form-field">
                  <label>Creator / Channel Name</label>
                  <input
                    type="text"
                    required
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="e.g. Lunar Archives Hub"
                  />
                </div>

                <div className="pen-form-row">
                  <div className="pen-form-field">
                    <label>Platform</label>
                    <select
                      value={formData.platform_type}
                      onChange={(e) =>
                        setFormData({ ...formData, platform_type: e.target.value as any })
                      }
                    >
                      <option value="YOUTUBE">YouTube (Shorts/Video)</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="REELS">Instagram Reels</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="pen-form-field">
                    <label>Related Hardware</label>
                    <select
                      value={formData.artifact_id}
                      onChange={(e) => {
                        const selArt = allArtifacts.find((a) => a.id === e.target.value);
                        setFormData({
                          ...formData,
                          artifact_id: e.target.value,
                          mission_id: selArt?.mission || 'Space Mission',
                        });
                      }}
                    >
                      {allArtifacts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.planet.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pen-form-field">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <label style={{ margin: 0 }}>
                      Video URL / Link (YouTube, Instagram, TikTok, etc.)
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      Only verified video platforms
                    </span>
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.tiktok.com/@... or Instagram reel"
                    style={{
                      borderColor: urlValidationError
                        ? '#ef4444'
                        : formData.video_url && !urlValidationError
                          ? '#10b981'
                          : undefined,
                    }}
                  />
                  {urlValidationError ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '5px',
                        color: '#f87171',
                        fontSize: '11px',
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{urlValidationError}</span>
                    </div>
                  ) : formData.video_url.trim() ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '5px',
                        color: '#34d399',
                        fontSize: '11px',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Valid {formData.platform_type} video link detected</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px' }}>
                      Accepted formats: YouTube (video, shorts, youtu.be), Instagram (reels, p),
                      TikTok (videos, vm), Vimeo, NASA Media.
                    </div>
                  )}
                </div>

                <div className="pen-form-field">
                  <label>Archival References & Description</label>
                  <textarea
                    rows={3}
                    value={formData.source_references}
                    onChange={(e) =>
                      setFormData({ ...formData, source_references: e.target.value })
                    }
                    placeholder="Provide context regarding the telemetry or NASA archive PIA/PDS references..."
                  />
                </div>

                <div className="pen-modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="pen-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="pen-btn-primary">
                    {isSubmitting ? 'Submitting...' : 'Submit Video'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
