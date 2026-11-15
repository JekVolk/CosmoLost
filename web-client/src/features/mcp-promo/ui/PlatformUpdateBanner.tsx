import { Rocket, Sparkles } from 'lucide-react';
import type React from 'react';

interface PlatformUpdateBannerProps {
  onConnect?: () => void;
  onChangelog?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PlatformUpdateBanner: React.FC<PlatformUpdateBannerProps> = ({
  onConnect,
  onChangelog,
  className = '',
  style,
}) => {
  return (
    <div
      className={`cosmo-platform-update-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#101A2AF8',
        borderRadius: '14px',
        border: '1.5px solid rgba(0, 240, 255, 0.45)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 240, 255, 0.1)',
        padding: '16px 24px',
        width: '100%',
        maxWidth: '1392px',
        gap: '20px',
        margin: '0 auto',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#070E1E',
            border: '1.5px solid #00F0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 18px rgba(0, 240, 255, 0.3)',
          }}
        >
          <Rocket size={24} style={{ color: '#00F0FF' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(0, 240, 255, 0.12)',
                borderRadius: '4px',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                padding: '2px 6px',
                color: '#00F0FF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9.5px',
                fontWeight: 800,
                letterSpacing: '0.6px',
              }}
            >
              UPDATE v2.4 IS LIVE
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255, 157, 53, 0.12)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 157, 53, 0.35)',
                padding: '2px 6px',
                color: '#FF9D35',
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              REAL-TIME TELEMETRY & CLAUDE INTEGRATION
            </span>
          </div>

          <h3
            style={{
              color: '#EAF2FF',
              fontSize: '16px',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.2px',
            }}
          >
            CosmoLost MCP v2.4: Real-Time Planetary Telemetry & Cursor Integration
          </h3>

          <p
            style={{
              color: '#8FA2B8',
              fontSize: '12.5px',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Now with live 3D coordinates, instant 1-click configs for Cursor & Claude Desktop, and
            NASA PDS sync.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {onChangelog && (
          <button
            type="button"
            onClick={onChangelog}
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              background: '#142033',
              border: '1px solid #1B2A42',
              color: '#00D9F5',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            What's New in v2.4 →
          </button>
        )}

        <button
          type="button"
          onClick={onConnect}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '42px',
            padding: '0 20px',
            borderRadius: '8px',
            background: '#00D9F5',
            color: '#080D17',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 16px rgba(0, 217, 245, 0.35)',
          }}
        >
          <Sparkles size={14} style={{ color: '#080D17' }} />
          <span>Connect v2.4 ⚡</span>
        </button>
      </div>
    </div>
  );
};
