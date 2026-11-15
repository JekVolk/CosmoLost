import React, { useState } from 'react';
import type { SpaceArtifact, PlanetConfig } from '../../entities/planet/model/types';
import { Model3DViewer } from '../../features/artifact-3d-viewer';
import { PhotosphereViewer } from '../../shared/ui/photosphere-viewer';
import {
  X,
  Box,
  Camera,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: SpaceArtifact;
  planet: PlanetConfig;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({
  isOpen,
  onClose,
  artifact,
  planet,
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'photo' | 'panorama'>('3d');
  const [is360ViewerOpen, setIs360ViewerOpen] = useState(false);

  if (!isOpen) return null;

  const isMars = planet.id === 'mars';
  const themeColor = isMars ? '#f97316' : '#38bdf8';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 7, 13, 0.88)',
        backdropFilter: 'blur(16px)',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(11, 17, 31, 0.96)',
          border: `1.5px solid ${themeColor}40`,
          borderRadius: '20px',
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${themeColor}20`,
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: themeColor,
                  background: `${themeColor}15`,
                  border: `1px solid ${themeColor}40`,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}
              >
                {artifact.agency} • {planet.nameEn.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                {artifact.statusLabel}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              {artifact.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close modal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === '3d' ? `${themeColor}25` : 'rgba(15, 23, 42, 0.8)',
              color: activeTab === '3d' ? themeColor : '#94a3b8',
              outline: activeTab === '3d' ? `1px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box size={14} />
            <span>3D DIGITAL TWIN (GLB)</span>
          </button>

          {artifact.imageUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'photo' ? `${themeColor}25` : 'rgba(15, 23, 42, 0.8)',
                color: activeTab === 'photo' ? themeColor : '#94a3b8',
                outline: activeTab === 'photo' ? `1px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Camera size={14} />
              <span>ARCHIVAL PHOTO</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIs360ViewerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: `1.5px solid ${themeColor}`,
              background: `${themeColor}15`,
              color: '#ffffff',
              boxShadow: `0 0 12px ${themeColor}30`,
            }}
          >
            <Compass size={14} style={{ color: themeColor }} />
            <span>360° SURFACE PANORAMA</span>
          </button>
        </div>

        {/* 3D / Photo Viewport */}
        <div style={{ width: '100%', minHeight: '400px' }}>
          {activeTab === '3d' ? (
            <Model3DViewer
              artifact={artifact}
              modelUrl={artifact.model3dUrl}
              themeColor={themeColor}
            />
          ) : (
            artifact.imageUrl && (
              <div
                style={{
                  width: '100%',
                  height: '420px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative',
                }}
              >
                <img
                  src={artifact.imageUrl}
                  alt={artifact.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )
          )}
        </div>

        {/* Telemetry metadata footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            color: '#94a3b8',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: themeColor }} />
            <span>{artifact.locationName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>Landing Date: {artifact.landingDate}</span>
          </div>

          {artifact.massKg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: '#22c55e' }} />
              <span>Mass: {artifact.massKg.toLocaleString()} kg</span>
            </div>
          )}
        </div>
      </div>

      {/* 360 Photosphere Viewer overlay if triggered */}
      {is360ViewerOpen && (
        <PhotosphereViewer
          isOpen={is360ViewerOpen}
          onClose={() => setIs360ViewerOpen(false)}
          imageUrl={artifact.imageUrl || ''}
          caption={`${artifact.name} 360° Surface Panorama`}
          nasaIdOrPia={artifact.nssdcaId}
          credit={`${artifact.agency} / NASA Archive`}
          planetTheme={isMars ? 'mars' : 'moon'}
        />
      )}
    </div>
  );
};
