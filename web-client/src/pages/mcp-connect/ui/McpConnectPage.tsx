import { FloatingUpdateAnnouncement } from '@/features/mcp-promo';
import {
  AI_CLIENT_GUIDES,
  type AiClientGuide,
  MCP_CONFIG,
  MCP_FAQ_ITEMS,
  MCP_PROMPT_ITEMS,
} from '@/shared/config/mcp';
import {
  BookOpen,
  Bot,
  Check,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Heart,
  Info,
  Laptop,
  Link as LinkIcon,
  MessageSquare,
  Orbit,
  Power,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';

interface McpConnectPageProps {
  onNavigate?: (view: 'map' | 'catalog' | 'community' | 'astro-guessr' | 'arena') => void;
  onOpenAbout?: () => void;
}

export const McpConnectPage: React.FC<McpConnectPageProps> = ({ onNavigate, onOpenAbout }) => {
  const [selectedClientId, setSelectedClientId] = useState<'gemini' | 'claude' | 'cursor'>(
    'gemini'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const instructionsRef = useRef<HTMLDivElement>(null);

  const selectedGuide: AiClientGuide = AI_CLIENT_GUIDES[selectedClientId];

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG.serverUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPrompt = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySnippet = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Fallback
    }
  };

  const scrollToInstructions = () => {
    instructionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderClientIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles size={18} style={{ color }} />;
      case 'bot':
        return <Bot size={18} style={{ color }} />;
      case 'terminal':
        return <Terminal size={18} style={{ color }} />;
      default:
        return <Sparkles size={18} style={{ color }} />;
    }
  };

  const renderPromptIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'orbit':
        return <Orbit size={14} style={{ color }} />;
      case 'book-open':
        return <BookOpen size={14} style={{ color }} />;
      case 'compass':
        return <Compass size={14} style={{ color }} />;
      case 'sparkles':
        return <Sparkles size={14} style={{ color }} />;
      default:
        return <Sparkles size={14} style={{ color }} />;
    }
  };

  const renderFaqIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles size={16} style={{ color }} />;
      case 'laptop':
        return <Laptop size={16} style={{ color }} />;
      case 'heart':
        return <Heart size={16} style={{ color }} />;
      case 'power':
        return <Power size={16} style={{ color }} />;
      default:
        return <Sparkles size={16} style={{ color }} />;
    }
  };

  return (
    <div
      className="mcp-connect-page"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#080D17',
        color: '#EAF2FF',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
        overflowY: 'auto',
        userSelect: 'text',
      }}
    >
      {/* Cosmic Background Layer with Gradients and Stars */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Nebula Glow Cyan Top */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '15%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(2, 132, 199, 0.03) 55%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Deep Space Ambience Violet Left */}
        <div
          style={{
            position: 'absolute',
            top: '350px',
            left: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 27, 75, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Nebula Glow Mars Middle Right */}
        <div
          style={{
            position: 'absolute',
            top: '1100px',
            right: '5%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255, 157, 53, 0.08) 0%, rgba(234, 88, 12, 0.03) 60%, transparent 75%)',
            filter: 'blur(55px)',
          }}
        />

        {/* Nebula Glow Cyan Bottom Left */}
        <div
          style={{
            position: 'absolute',
            top: '1100px',
            left: '100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Decorative Constellation Stars */}
        {[
          { x: '6%', y: '5%', size: 1.5, opacity: 0.7, color: '#FFFFFF' },
          { x: '15%', y: '9%', size: 2, opacity: 0.9, color: '#00F0FF' },
          { x: '24%', y: '6%', size: 1, opacity: 0.5, color: '#FFFFFF' },
          { x: '38%', y: '11%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
          { x: '49%', y: '5%', size: 2, opacity: 0.8, color: '#00D9F5' },
          { x: '62%', y: '10%', size: 1.5, opacity: 0.8, color: '#FFFFFF' },
          { x: '74%', y: '7%', size: 2, opacity: 0.7, color: '#FFB800' },
          { x: '86%', y: '5%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
          { x: '95%', y: '9%', size: 1, opacity: 0.4, color: '#FFFFFF' },
          { x: '8%', y: '32%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
          { x: '22%', y: '42%', size: 2, opacity: 0.7, color: '#00F0FF' },
          { x: '55%', y: '38%', size: 1.5, opacity: 0.5, color: '#FFFFFF' },
          { x: '81%', y: '35%', size: 1.5, opacity: 0.7, color: '#FF9D35' },
          { x: '93%', y: '44%', size: 2, opacity: 0.8, color: '#FFFFFF' },
          { x: '6%', y: '71%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
          { x: '32%', y: '75%', size: 2, opacity: 0.8, color: '#00F0FF' },
          { x: '58%', y: '73%', size: 1, opacity: 0.5, color: '#FFFFFF' },
          { x: '89%', y: '80%', size: 2, opacity: 0.8, color: '#FF9D35' },
          { x: '11%', y: '98%', size: 1.5, opacity: 0.7, color: '#FFFFFF' },
          { x: '37%', y: '57%', size: 2, opacity: 0.7, color: '#00F0FF' },
          { x: '70%', y: '94%', size: 1.5, opacity: 0.6, color: '#FFFFFF' },
          { x: '62%', y: '65%', size: 2, opacity: 0.8, color: '#FFFFFF' },
        ].map((star) => (
          <div
            key={`star-${star.x}-${star.y}`}
            style={{
              position: 'absolute',
              top: star.y,
              left: star.x,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: star.color,
              opacity: star.opacity,
              boxShadow: star.size >= 2 ? `0 0 4px ${star.color}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '16px 24px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Top Navigation Bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
            padding: '10px 20px',
            backgroundColor: '#101A2AF2',
            borderRadius: '12px',
            border: '1px solid #1B2A42',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Brand Logo Group */}
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              textAlign: 'left',
            }}
            onClick={() => onNavigate?.('map')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                backgroundColor: '#070E1E',
                border: '1.5px solid #00D9F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 217, 245, 0.3)',
              }}
            >
              <Orbit size={20} style={{ color: '#00D9F5' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span
                style={{
                  color: '#EAF2FF',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  lineHeight: 1.1,
                }}
              >
                COSMOLOST
              </span>
              <span
                style={{
                  color: '#00D9F5',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                }}
              >
                NASA SPACE APPS 2026
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onNavigate?.('map')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              3D Map
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('community')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              Missions
            </button>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 217, 245, 0.1)',
                border: '1px solid rgba(0, 217, 245, 0.38)',
                color: '#00D9F5',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '8px',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#00D9F5',
                  boxShadow: '0 0 8px #00D9F5',
                }}
              />
              <span>MCP Connect</span>
            </div>
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8FA2B8',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                About Project
              </button>
            )}
          </nav>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => onNavigate?.('map')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 14px',
              backgroundColor: '#00D9F5',
              border: 'none',
              borderRadius: '6px',
              color: '#080D17',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(0, 217, 245, 0.3)',
            }}
          >
            <Globe size={14} style={{ color: '#080D17' }} />
            <span>3D Explorer</span>
          </button>
        </header>

        {/* Hero Section */}
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '48px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left Hero Stack */}
          <div
            style={{
              flex: '1 1 600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 217, 245, 0.08)',
                border: '1px solid rgba(0, 217, 245, 0.3)',
                width: 'fit-content',
              }}
            >
              <Sparkles size={13} style={{ color: '#00F0FF' }} />
              <span
                style={{
                  color: '#00F0FF',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                }}
              >
                SPACE DATA IN YOUR AI CHATBOT
              </span>
            </div>

            <h1
              style={{
                color: '#EAF2FF',
                fontSize: '40px',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Teach Your AI to Explore Space
            </h1>

            <p
              style={{
                color: '#8FA2B8',
                fontSize: '16px',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '640px',
              }}
            >
              Connect CosmoLost to explore lost spacecraft, historic missions, and discoveries with
              your AI assistant.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={scrollToInstructions}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '46px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  backgroundColor: '#00D9F5',
                  color: '#080D17',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0, 217, 245, 0.4)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={16} style={{ color: '#080D17' }} />
                <span>Connect Your AI</span>
              </button>

              <span
                style={{
                  color: '#5A6E85',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Open standard · Client setup guide
              </span>
            </div>
          </div>

          {/* Right Cosmic Art Card */}
          <div
            style={{
              position: 'relative',
              width: '530px',
              height: '250px',
              borderRadius: '18px',
              backgroundColor: '#101A2AF0',
              border: '1px solid #1B2A42',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              flexShrink: 0,
            }}
          >
            {/* Art Nebulas */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '40px',
                width: '280px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '30px',
                width: '220px',
                height: '160px',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, rgba(255, 157, 53, 0.08) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Orbit Ring */}
            <div
              style={{
                position: 'absolute',
                top: '35px',
                left: '90px',
                width: '350px',
                height: '180px',
                borderRadius: '50%',
                border: '1px solid rgba(0, 217, 245, 0.2)',
                transform: 'rotate(-15deg)',
                pointerEvents: 'none',
              }}
            />

            {/* Moon Orb */}
            <div
              style={{
                position: 'absolute',
                top: '65px',
                left: '110px',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, #EAF2FF 0%, #8FA2B8 60%, #142033 100%)',
                boxShadow: '0 0 20px rgba(0, 217, 245, 0.25)',
              }}
            />

            {/* Mars Orb */}
            <div
              style={{
                position: 'absolute',
                top: '100px',
                right: '110px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, #FFB800 0%, #EA580C 70%, #331A10 100%)',
                boxShadow: '0 0 20px rgba(255, 157, 53, 0.3)',
              }}
            />

            {/* Floating Prompt Bubble */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#070E1EF8',
                borderRadius: '9999px',
                border: '1px solid rgba(0, 217, 245, 0.45)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 240, 255, 0.2)',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <Bot size={14} style={{ color: '#00F0FF' }} />
              <span style={{ color: '#EAF2FF', fontSize: '12px', fontWeight: 600 }}>
                “Where is the Perseverance rover right now?”
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(0, 217, 245, 0.15)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#00F0FF',
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                AI Ready
              </span>
            </div>
          </div>
        </section>

        {/* AI Selection Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2
              style={{
                color: '#EAF2FF',
                fontSize: '24px',
                fontWeight: 800,
                margin: '0 0 4px',
              }}
            >
              Which AI do you use?
            </h2>
            <p style={{ color: '#8FA2B8', fontSize: '14px', margin: 0 }}>
              Select your preferred service for a step-by-step setup guide:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {(Object.keys(AI_CLIENT_GUIDES) as Array<'gemini' | 'claude' | 'cursor'>).map(
              (clientId) => {
                const guide = AI_CLIENT_GUIDES[clientId];
                const isSelected = selectedClientId === clientId;

                return (
                  <button
                    type="button"
                    key={clientId}
                    onClick={() => setSelectedClientId(clientId)}
                    style={{
                      backgroundColor: isSelected ? '#0B1E36' : '#101A2AF0',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #00D9F5' : '1px solid #1B2A42',
                      boxShadow: isSelected
                        ? '0 0 24px rgba(0, 217, 245, 0.25), inset 0 0 16px rgba(0, 217, 245, 0.08)'
                        : 'none',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.18s ease',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#070E1E',
                          border: isSelected ? '1px solid #00D9F5' : '1px solid #1B2A42',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {renderClientIcon(guide.icon, isSelected ? '#00F0FF' : guide.accentColor)}
                      </div>

                      <span
                        style={{
                          backgroundColor: isSelected ? 'rgba(0, 217, 245, 0.15)' : '#142033',
                          color: isSelected ? '#00F0FF' : '#8FA2B8',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: isSelected ? 700 : 600,
                        }}
                      >
                        {guide.badge}
                      </span>
                    </div>

                    <h3
                      style={{
                        color: '#EAF2FF',
                        fontSize: '16px',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {guide.name}
                    </h3>

                    <p
                      style={{
                        color: '#8FA2B8',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        margin: 0,
                        minHeight: '34px',
                      }}
                    >
                      {guide.description}
                    </p>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: isSelected ? 'rgba(0, 217, 245, 0.1)' : '#070E1E',
                        border: isSelected
                          ? '1px solid rgba(0, 217, 245, 0.4)'
                          : '1px solid transparent',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        width: 'fit-content',
                        marginTop: 'auto',
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={12} style={{ color: '#00F0FF' }} />
                          <span style={{ color: '#00F0FF', fontSize: '11px', fontWeight: 700 }}>
                            Selected guide
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#8FA2B8', fontSize: '11px', fontWeight: 500 }}>
                          Click for guide
                        </span>
                      )}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* Dynamic Connection Instruction Section */}
        <section
          ref={instructionsRef}
          id="instructions-section"
          style={{
            backgroundColor: '#101A2AF8',
            borderRadius: '18px',
            border: '1.5px solid rgba(0, 217, 245, 0.4)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 32px rgba(0, 217, 245, 0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Instruction Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} style={{ color: '#00F0FF' }} />
              <h2
                style={{
                  color: '#EAF2FF',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {selectedGuide.title}
              </h2>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 217, 245, 0.1)',
                border: '1px solid rgba(0, 217, 245, 0.3)',
              }}
            >
              <Zap size={12} style={{ color: '#00F0FF' }} />
              <span
                style={{
                  color: '#00F0FF',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {selectedGuide.speedTag}
              </span>
            </div>
          </div>

          {/* Server URL Bar */}
          <div
            style={{
              backgroundColor: '#070E1E',
              borderRadius: '12px',
              border: '1px solid rgba(0, 217, 245, 0.35)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LinkIcon size={16} style={{ color: '#00F0FF' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#8FA2B8', fontSize: '11px', fontWeight: 500 }}>
                  CosmoLost Server URL:
                </span>
                <span
                  style={{
                    color: '#00F0FF',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    wordBreak: 'break-all',
                  }}
                >
                  {MCP_CONFIG.serverUrl}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 18px',
                borderRadius: '8px',
                backgroundColor: copiedUrl ? '#22C55E' : '#00D9F5',
                color: '#080D17',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>

          {/* Instruction Steps Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {selectedGuide.steps.map((step) => (
              <div
                key={step.number}
                style={{
                  backgroundColor: '#0B1322',
                  borderRadius: '12px',
                  border: '1px solid #182438',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '11px',
                      backgroundColor: step.number === 1 ? '#00D9F5' : '#1B2A42',
                      border: step.number === 1 ? 'none' : '1px solid rgba(0, 217, 245, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.number === 1 ? '#080D17' : '#00F0FF',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {step.number}
                  </div>
                  <h4
                    style={{
                      color: '#EAF2FF',
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h4>
                </div>

                <p
                  style={{
                    color: '#8FA2B8',
                    fontSize: '12px',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>

                {/* Step specific actions: Link button, copy snippet, or success badge */}
                {step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      padding: '0 12px',
                      backgroundColor: '#142033',
                      border: '1px solid rgba(0, 217, 245, 0.5)',
                      borderRadius: '6px',
                      color: '#EAF2FF',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      width: 'fit-content',
                      marginTop: 'auto',
                    }}
                  >
                    <ExternalLink size={12} style={{ color: '#00F0FF' }} />
                    <span>{step.actionLabel || 'Open Link'}</span>
                  </a>
                )}

                {step.codeSnippet && (
                  <div
                    style={{
                      position: 'relative',
                      backgroundColor: '#070E1E',
                      borderRadius: '6px',
                      border: '1px solid #1B2A42',
                      padding: '8px',
                      marginTop: 'auto',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '10.5px',
                        color: '#00F0FF',
                        fontFamily: "'JetBrains Mono', monospace",
                        overflowX: 'auto',
                      }}
                    >
                      {step.codeSnippet}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(step.codeSnippet || '')}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        padding: '3px 8px',
                        backgroundColor: '#142033',
                        border: '1px solid rgba(0, 217, 245, 0.4)',
                        borderRadius: '4px',
                        color: copiedSnippet ? '#22C55E' : '#00F0FF',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedSnippet ? <Check size={10} /> : <Copy size={10} />}
                      <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                {step.successBadge && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: '#22C55E',
                      fontSize: '11px',
                      fontWeight: 700,
                      width: 'fit-content',
                      marginTop: 'auto',
                    }}
                  >
                    <Check size={12} style={{ color: '#22C55E' }} />
                    <span>{step.successBadge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Verification Notice Strip */}
          <div
            style={{
              backgroundColor: '#0B1524',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={14} style={{ color: '#8FA2B8', flexShrink: 0 }} />
            <span style={{ color: '#8FA2B8', fontSize: '11px', fontWeight: 500 }}>
              Note: Setup requirements and MCP availability depend on your client environment.
              Configuration guides are also available for Claude and Cursor.
            </span>
          </div>
        </section>

        {/* Try Space Assistant Section ("See What Your AI Can Do") */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2
                style={{
                  color: '#EAF2FF',
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: '0 0 4px',
                }}
              >
                See What Your AI Can Do
              </h2>
              <p style={{ color: '#8FA2B8', fontSize: '14px', margin: 0 }}>
                Copy any prompt and ask your AI assistant in chat:
              </p>
            </div>

            <a
              href={MCP_CONFIG.geminiChatUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                backgroundColor: '#142033',
                border: '1px solid rgba(0, 217, 245, 0.5)',
                color: '#EAF2FF',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <MessageSquare size={14} style={{ color: '#00F0FF' }} />
              <span>Open Gemini Chat</span>
              <ExternalLink size={12} style={{ color: '#00F0FF' }} />
            </a>
          </div>

          {/* 4 Prompts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {MCP_PROMPT_ITEMS.map((item) => {
              const isCopied = copiedPromptId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#101A2AF0',
                    borderRadius: '14px',
                    border: '1px solid #1B2A42',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: `${item.accentColor}1A`,
                        color: item.accentColor,
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {item.category}
                    </span>

                    {renderPromptIcon(item.icon, item.accentColor)}
                  </div>

                  <div
                    style={{
                      backgroundColor: '#070E1E',
                      borderRadius: '8px',
                      border: '1px solid #182438',
                      padding: '12px',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#EAF2FF',
                        fontSize: '13px',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      “{item.prompt}”
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(item.id, item.prompt)}
                    style={{
                      width: '100%',
                      height: '34px',
                      backgroundColor: '#142033',
                      border: '1px solid #1B2A42',
                      borderRadius: '6px',
                      color: isCopied ? '#22C55E' : '#EAF2FF',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} style={{ color: '#22C55E' }} />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} style={{ color: '#00F0FF' }} />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Simplified FAQ Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2
              style={{
                color: '#EAF2FF',
                fontSize: '24px',
                fontWeight: 800,
                margin: '0 0 4px',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#8FA2B8', fontSize: '14px', margin: 0 }}>
              Key details about security, reliability, and using CosmoLost MCP:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {MCP_FAQ_ITEMS.map((faq) => (
              <div
                key={faq.id}
                style={{
                  backgroundColor: '#101A2AF0',
                  borderRadius: '12px',
                  border: '1px solid #1B2A42',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderFaqIcon(faq.icon, faq.accentColor)}
                  <h4
                    style={{
                      color: '#EAF2FF',
                      fontSize: '14px',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {faq.question}
                  </h4>
                </div>

                <p
                  style={{
                    color: '#8FA2B8',
                    fontSize: '13px',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Page Footer Bar */}
        <footer
          style={{
            backgroundColor: '#101A2AF2',
            borderRadius: '12px',
            border: '1px solid #1B2A42',
            height: '54px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: '#070E1E',
                border: '1px solid #00D9F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Orbit size={14} style={{ color: '#00F0FF' }} />
            </div>
            <span
              style={{
                color: '#EAF2FF',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              COSMOLOST · Open Science Space Exploration
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => onNavigate?.('map')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              3D Map
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('community')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA2B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Missions
            </button>
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8FA2B8',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                About Project
              </button>
            )}
          </div>

          <span
            style={{
              color: '#5A6E85',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            NASA Space Apps Challenge 2026
          </span>
        </footer>
      </div>

      {/* Floating Announcement Card (v2.4 Release) */}
      <FloatingUpdateAnnouncement
        onConnect={scrollToInstructions}
        onChangelog={scrollToInstructions}
      />
    </div>
  );
};
