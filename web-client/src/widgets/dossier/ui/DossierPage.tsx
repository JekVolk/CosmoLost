import React, { useState, useEffect } from 'react';
import { portalApi } from '../../../shared/api/portalApi';
import type { ArtifactDetail, TraverseWaypoint } from '../../../shared/api/types';
import type { SpaceArtifact, PlanetConfig } from '../../../entities/planet/model/types';
import { CommunityPublicationsSection } from './CommunityPublicationsSection';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Activity,
  Cpu,
  Eye,
  Sparkles,
  BookOpen,
  Zap,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';

interface DossierPageProps {
  artifact: SpaceArtifact;
  planet: PlanetConfig;
  onBackToMap: () => void;
}

export const DossierPage: React.FC<DossierPageProps> = ({
  artifact,
  planet,
  onBackToMap,
}) => {
  const isMars = planet.id === 'mars';
  const themeColor = isMars ? '#f97316' : '#38bdf8';
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [liveDetail, setLiveDetail] = useState<ArtifactDetail | null>(null);
  const [liveWaypoints, setLiveWaypoints] = useState<TraverseWaypoint[]>([]);

  useEffect(() => {
    let active = true;
    async function fetchApiArtifact() {
      try {
        const [detail, waypoints] = await Promise.all([
          portalApi.getArtifactDetail(artifact.id),
          portalApi.getArtifactWaypoints(artifact.id),
        ]);
        if (!active) return;
        if (detail) setLiveDetail(detail);
        if (waypoints && waypoints.length > 0) setLiveWaypoints(waypoints);
      } catch {}
    }
    fetchApiArtifact();
    return () => {
      active = false;
    };
  }, [artifact.id]);

  const displayedMonologue = liveDetail?.first_person_monologue || artifact.firstPersonMonologue;
  const displayedCause = liveDetail?.cause_of_deactivation || artifact.whyAbandoned;
  const model3dUrl = liveDetail?.model_3d_url;
  const effectiveWaypoints = liveWaypoints.length > 0
    ? liveWaypoints.map((w) => ({
        solOrStep: w.sol_or_step,
        lat: w.latitude,
        lon: w.longitude,
        odometryM: (w as any).odometry_m ?? (w as any).odometryM ?? (w.sol_or_step * 250),
        title: (w.telemetry_snapshot as any)?.stepName || `Waypoint ${w.sol_or_step}`,
        storySnippet: w.story_snippet || undefined,
      }))
    : artifact.traversePath || [];

  return (
    <div className="dossier-page">
      <div className="dossier-container">
        {}
        <div className="dossier-nav-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="button" className="btn-back" onClick={onBackToMap}>
              <ArrowLeft size={16} />
              <span>Back to 3D Map</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={onBackToMap}>Home</span>
              <span>/</span>
              <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={onBackToMap}>Catalog</span>
              <span>/</span>
              <span style={{ color: themeColor, fontWeight: 600 }}>{artifact.name}</span>
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
            NASA SPACE APPS 2026 ARCHIVE
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(11, 17, 31, 0.85)',
            border: '1px solid #1E293B',
            borderRadius: '14px',
            padding: '12px 24px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>LANDING DATE</div>
            <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600, marginTop: '2px' }}>{artifact.landingDate}</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1E293B' }} />
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>PLANET</div>
            <div style={{ fontSize: '12.5px', color: themeColor, fontWeight: 700, marginTop: '2px' }}>{planet.nameEn.toUpperCase()}</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1E293B' }} />
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>LOCATION</div>
            <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600, marginTop: '2px' }}>{artifact.locationName}</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1E293B' }} />
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>HARDWARE MASS</div>
            <div style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600, marginTop: '2px' }}>
              {artifact.massKg ? `${artifact.massKg.toLocaleString()} kg` : 'Telemetry Not Available'}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1E293B' }} />
          <div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>COORDINATES</div>
            <div style={{ fontSize: '12.5px', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '2px' }}>
              {Math.abs(artifact.lat).toFixed(2)}°{artifact.lat >= 0 ? 'N' : 'S'}, {Math.abs(artifact.lon).toFixed(2)}°{artifact.lon >= 0 ? 'E' : 'W'}
            </div>
          </div>
        </div>

        {}
        <div className="cosmo-glass dossier-hero-card" style={{ borderColor: `${themeColor}40` }}>
          <div className="dossier-hero-main-row">
            {}
            <div className="dossier-hero-text">
              <div className="dossier-badge-row">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: themeColor,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: `${themeColor}18`,
                    border: `1px solid ${themeColor}40`,
                    textTransform: 'uppercase',
                  }}
                >
                  {artifact.agency} • {artifact.country}
                </span>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background:
                      artifact.operationalStatus === 'PASSIVE_ACTIVE'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : artifact.operationalStatus === 'DESTROYED_FOR_SCIENCE'
                        ? 'rgba(239, 68, 68, 0.18)'
                        : 'rgba(245, 158, 11, 0.15)',
                    border:
                      artifact.operationalStatus === 'PASSIVE_ACTIVE'
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : artifact.operationalStatus === 'DESTROYED_FOR_SCIENCE'
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid rgba(245, 158, 11, 0.4)',
                    color:
                      artifact.operationalStatus === 'PASSIVE_ACTIVE'
                        ? '#34d399'
                        : artifact.operationalStatus === 'DESTROYED_FOR_SCIENCE'
                        ? '#f87171'
                        : '#fbbf24',
                    textTransform: 'uppercase',
                  }}
                >
                  {artifact.operationalStatus || artifact.statusLabel}
                </span>

                {artifact.nssdcaId && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    NSSDCA ID: <strong style={{ color: '#fff' }}>{artifact.nssdcaId}</strong>
                  </span>
                )}

                {model3dUrl && (
                  <a
                    href={model3dUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#22c55e',
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>3D GLB Model</span>
                  </a>
                )}

                {artifact.massKg && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    Dry Mass: <strong style={{ color: '#fff' }}>{artifact.massKg.toLocaleString()} kg</strong>
                  </span>
                )}

                {artifact.powerSource && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Zap size={11} style={{ color: themeColor }} />
                    <span>Power: <strong style={{ color: '#fff' }}>{artifact.powerSource}</strong></span>
                  </span>
                )}
              </div>

              <h1 className="dossier-title">{artifact.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                <MapPin size={16} style={{ color: themeColor }} />
                <span>
                  Location on {planet.nameEn}: <strong style={{ color: '#fff' }}>{artifact.locationName}</strong>
                </span>
              </div>

              <p className="dossier-brief">{artifact.brief}</p>

              <div className="coords-box">
                <span>
                  LANDING COORDINATES: {artifact.lat.toFixed(4)}° {artifact.lat >= 0 ? 'N' : 'S'},{' '}
                  {artifact.lon.toFixed(4)}° {artifact.lon >= 0 ? 'E' : 'W'}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>PLANETARY REGISTRY: {planet.telemetry.designation}</span>
              </div>
            </div>

            {}
            {artifact.imageUrl && (
              <div className="dossier-photo-container">
                <div
                  className="dossier-photo-frame"
                  onClick={() => setIsPhotoExpanded(true)}
                  style={{ borderColor: `${themeColor}50` }}
                >
                  <img
                    src={artifact.imageUrl}
                    alt={artifact.name}
                    className="dossier-photo-img"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {}
                  <div className="dossier-photo-hud-top">
                    <span className="photo-hud-tag" style={{ color: themeColor }}>
                      <Camera size={12} /> ARCHIVAL RECON PHOTO
                    </span>
                    <button
                      type="button"
                      className="photo-expand-btn"
                      title="View Fullscreen"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPhotoExpanded(true);
                      }}
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                  <div className="dossier-photo-hud-bottom">
                    <span className="photo-credit-tag">{artifact.agency} MISSION ARCHIVE</span>
                    <span className="photo-hint-tag">Click to expand</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {displayedMonologue && (
          <div
            className="cosmo-glass"
            style={{
              padding: '24px 28px',
              borderRadius: '16px',
              marginBottom: '24px',
              borderLeft: `4px solid ${themeColor}`,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 28, 0.95) 100%)',
              boxShadow: `0 10px 30px -10px ${themeColor}25`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} style={{ color: themeColor }} className="animate-pulse" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: themeColor, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Diary of the Last Sol
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                ARCHIVAL AUDIO TRANSCRIPT
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontStyle: 'italic',
                lineHeight: 1.7,
                color: '#e2e8f0',
                margin: 0,
              }}
            >
              "{displayedMonologue}"
            </p>
          </div>
        )}

        {}
        {artifact.howItWorked && (
          <div
            className="cosmo-glass"
            style={{
              padding: '20px 24px',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BookOpen size={16} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontFamily: 'var(--font-chakra)', fontSize: '15px', color: '#fff', margin: 0, letterSpacing: '0.04em' }}>
                How It Worked (Engineering Breakdown)
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {artifact.howItWorked}
            </p>
          </div>
        )}

        {}
        <div className="dossier-grid">
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {}
            <div className="cosmo-glass dossier-block">
              <h3 className="dossier-block-title">
                <ShieldCheck size={18} style={{ color: themeColor }} />
                <span>Mission History & Scientific Impact</span>
              </h3>
              <p className="dossier-text">{artifact.description}</p>
            </div>

            {}
            <div className="cosmo-glass dossier-block" style={{ borderLeft: `3px solid ${themeColor}` }}>
              <h3 className="dossier-block-title">
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                <span>Why It Remained (Abandoned but Not Forgotten)</span>
              </h3>
              <p className="dossier-text">{displayedCause}</p>
            </div>

            {}
            {artifact.keyInstruments && artifact.keyInstruments.length > 0 && (
              <div className="cosmo-glass dossier-block">
                <h3 className="dossier-block-title">
                  <Cpu size={18} style={{ color: themeColor }} />
                  <span>Onboard Scientific Instruments</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {artifact.keyInstruments.map((inst, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: themeColor }}>
                          {inst.acronym}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{inst.fullName}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <strong>Tool:</strong> {inst.purpose}
                      </div>
                      <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
                        <strong style={{ color: '#34d399' }}>Discovery:</strong> {inst.discovery}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {effectiveWaypoints.length > 0 && (
              <div className="cosmo-glass dossier-block">
                <h3 className="dossier-block-title">
                  <Navigation size={18} style={{ color: themeColor }} />
                  <span>Surface Traverse Milestones</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {effectiveWaypoints.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: themeColor,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: `${themeColor}20`,
                          border: `1px solid ${themeColor}40`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Step {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                          {step.title} {step.odometryM ? `(${step.odometryM.toLocaleString()} m)` : ''}
                        </div>
                        {step.storySnippet && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {step.storySnippet}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {}
            {artifact.lastTelemetry && (
              <div
                className="cosmo-glass dossier-block"
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.7) 100%)',
                }}
              >
                <h3 className="dossier-block-title">
                  <Activity size={18} style={{ color: '#ef4444' }} />
                  <span>Final Telemetry & Last Signal</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  {artifact.lastTelemetry.powerWh !== undefined && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>FINAL POWER</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                        {artifact.lastTelemetry.powerWh} Wh
                      </div>
                      {artifact.lastTelemetry.powerInitialWh && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Initial: {artifact.lastTelemetry.powerInitialWh} Wh</div>
                      )}
                    </div>
                  )}

                  {artifact.lastTelemetry.dustTau !== undefined && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>DUST OPACITY (TAU)</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                        {artifact.lastTelemetry.dustTau}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Record solar blackout</div>
                    </div>
                  )}

                  {artifact.lastTelemetry.pitchDeg !== undefined && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>TILT PITCH</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {artifact.lastTelemetry.pitchDeg}°
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tilted away from Sun</div>
                    </div>
                  )}

                  {artifact.lastTelemetry.tempC !== undefined && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SURFACE TEMP</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {artifact.lastTelemetry.tempC} °C
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Deep Martian freeze</div>
                    </div>
                  )}
                </div>

                {artifact.lastTelemetry.finalQuoteOrSignal && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '12px', color: '#fca5a5' }}>
                    <strong>Last Signal:</strong> "{artifact.lastTelemetry.finalQuoteOrSignal}"
                  </div>
                )}
              </div>
            )}

            {}
            {artifact.orbitalSpottedBy && (
              <div className="cosmo-glass dossier-block" style={{ borderLeft: '3px solid #38bdf8' }}>
                <h3 className="dossier-block-title">
                  <Eye size={18} style={{ color: '#38bdf8' }} />
                  <span>Orbital Reconnaissance Proof</span>
                </h3>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                  {artifact.orbitalSpottedBy}
                </p>
                {artifact.nasaPiaId && (
                  <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                    NASA PIA ARCHIVE REF: <strong style={{ color: '#38bdf8' }}>{artifact.nasaPiaId}</strong>
                  </div>
                )}
              </div>
            )}

            {}
            <div className="cosmo-glass dossier-block">
              <h3 className="dossier-block-title">
                <Clock size={18} style={{ color: themeColor }} />
                <span>Mission Timeline & Registry</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Landing Date:</span>
                  <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{artifact.landingDate}</span>
                </div>

                {artifact.lastContactDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Last Contact:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{artifact.lastContactDate}</span>
                  </div>
                )}

                {artifact.operationalDays !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Surface Lifetime:</span>
                    <span style={{ color: themeColor, fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 700 }}>
                      {artifact.operationalDays} days / sols
                    </span>
                  </div>
                )}

                {artifact.distanceTraveledKm !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Distance Traveled:</span>
                    <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 700 }}>
                      {artifact.distanceTraveledKm} km
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Hardware Category:</span>
                  <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px', textTransform: 'capitalize' }}>
                    {artifact.type.replace('_', ' ')}
                  </span>
                </div>

                {artifact.powerSource && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12.5px' }}>Power Source:</span>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {artifact.powerSource}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="cosmo-glass dossier-block">
              <h3 className="dossier-block-title">
                <Sparkles size={18} style={{ color: themeColor }} />
                <span>Key Historic Facts</span>
              </h3>

              <div className="facts-list">
                {artifact.keyFacts.map((fact, idx) => (
                  <div key={idx} className="fact-item">
                    <span className="fact-dot" style={{ background: themeColor }} />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <CommunityPublicationsSection
          artifactId={artifact.id}
          missionName={artifact.name}
          themeColor={themeColor}
        />

        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(10, 15, 28, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: themeColor, fontWeight: 700, marginBottom: '4px' }}>
            NASA SPACE APPS CHALLENGE
          </div>
          Data and planetary cartography provided by NASA Planetary Data System (PDS), NSSDCA Master Catalog, JPL Mission Archives, LROC, and MRO HiRISE.
          Content adapted for school-age space enthusiasts and open science education.
        </div>

        {}
        {isPhotoExpanded && artifact.imageUrl && (
          <div className="dossier-lightbox-backdrop" onClick={() => setIsPhotoExpanded(false)}>
            <div className="dossier-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="dossier-lightbox-close"
                onClick={() => setIsPhotoExpanded(false)}
                title="Close"
              >
                <X size={20} />
              </button>
              <img
                src={artifact.imageUrl}
                alt={artifact.name}
                className="dossier-lightbox-img"
              />
              <div className="dossier-lightbox-caption">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{artifact.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: themeColor }}>
                    {artifact.agency}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Archival photograph captured on surface / orbital reconnaissance ({artifact.locationName})
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
