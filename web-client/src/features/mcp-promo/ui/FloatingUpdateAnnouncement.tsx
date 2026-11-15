import { Database, Satellite, Sparkles, X, Zap } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface FloatingUpdateAnnouncementProps {
  onConnect?: () => void;
  onChangelog?: () => void;
  onClose?: () => void;
}

export const FloatingUpdateAnnouncement: React.FC<FloatingUpdateAnnouncementProps> = ({
  onConnect,
  onChangelog,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px',
        maxWidth: 'calc(100vw - 48px)',
        background: '#15294ff5',
        borderRadius: '14px',
        border: '1.5px solid rgba(0, 217, 245, 0.45)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 240, 255, 0.25)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        animation: 'cosmoFadeIn 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} style={{ color: '#00F0FF' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  color: '#00D9F5',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.6px',
                }}
              >
                UPDATE RELEASE · v2.4
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                  display: 'inline-block',
                }}
              />
            </div>
            <span
              style={{
                color: '#EAF2FF',
                fontSize: '13.5px',
                fontWeight: 800,
              }}
            >
              CosmoLost MCP v2.4 is Live!
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close Announcement"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            color: '#8FA2B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EAF2FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8FA2B8';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Features Box */}
      <div
        style={{
          background: '#142033',
          borderRadius: '8px',
          border: '1px solid #1B2A42',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={12} style={{ color: '#00F0FF', flexShrink: 0 }} />
          <span style={{ color: '#CBD5E1', fontSize: '10.5px', fontWeight: 500 }}>
            1-Click setup for Cursor, Claude Desktop & ChatGPT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Satellite size={12} style={{ color: '#FF9D35', flexShrink: 0 }} />
          <span style={{ color: '#CBD5E1', fontSize: '10.5px', fontWeight: 500 }}>
            Real-time 3D telemetry query tools for 142+ landing sites
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={12} style={{ color: '#22C55E', flexShrink: 0 }} />
          <span style={{ color: '#CBD5E1', fontSize: '10.5px', fontWeight: 500 }}>
            Live NASA PDS & JPL Horizons ephemeris synchronization
          </span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <button
          type="button"
          onClick={onConnect}
          style={{
            flex: 1,
            height: '36px',
            borderRadius: '6px',
            background: '#00D9F5',
            border: '1px solid #00D9F5',
            color: '#080D17',
            fontWeight: 800,
            fontSize: '11.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Zap size={13} style={{ color: '#080D17' }} />
          <span>Try MCP v2.4 Now</span>
        </button>

        {onChangelog && (
          <button
            type="button"
            onClick={onChangelog}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '6px',
              background: '#142033',
              border: '1px solid #1B2A42',
              color: '#00D9F5',
              fontWeight: 700,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Changelog ↗
          </button>
        )}
      </div>
    </div>
  );
};
