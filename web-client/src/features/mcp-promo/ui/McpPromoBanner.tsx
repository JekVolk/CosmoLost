import { ArrowRight, Orbit, Sparkles } from 'lucide-react';
import type React from 'react';

interface McpPromoBannerProps {
  onConnect?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const McpPromoBanner: React.FC<McpPromoBannerProps> = ({
  onConnect,
  className = '',
  style,
}) => {
  return (
    <div
      className={`cosmo-mcp-promo-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#101A2AF8',
        borderRadius: '14px',
        border: '1.5px solid rgba(0, 217, 245, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 240, 255, 0.08)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#070E1E',
            border: '1.5px solid #00D9F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(0, 217, 245, 0.25)',
          }}
        >
          <Orbit size={22} style={{ color: '#00F0FF' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                color: '#00F0FF',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              NEW · MODEL CONTEXT PROTOCOL
            </span>
          </div>
          <h3
            style={{
              color: '#EAF2FF',
              fontSize: '16px',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Have you taught your AI to explore space yet?
          </h3>
          <p
            style={{
              color: '#8FA2B8',
              fontSize: '13px',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Try CosmoLost MCP and unlock rich cosmic exploration data in your AI assistant.
          </p>
        </div>
      </div>

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
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          boxShadow: '0 0 16px rgba(0, 217, 245, 0.35)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 240, 255, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 217, 245, 0.35)';
        }}
      >
        <Sparkles size={14} style={{ color: '#080D17' }} />
        <span>Try MCP</span>
        <ArrowRight size={14} style={{ color: '#080D17' }} />
      </button>
    </div>
  );
};
