import React, { useState, useEffect } from 'react';
import type { PlatformType, CommunityPublication } from '../../../shared/api/types';
import { portalApi } from '../../../shared/api/portalApi';
import { validateVideoUrl } from '../../../shared/lib/videoUrl';
import { Video, PlusCircle, ExternalLink, CheckCircle, Sparkles, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CommunityPublicationsSectionProps {
  artifactId: string;
  missionName: string;
  themeColor: string;
}

export const CommunityPublicationsSection: React.FC<CommunityPublicationsSectionProps> = ({
  artifactId,
  missionName,
  themeColor,
}) => {
  const [publications, setPublications] = useState<CommunityPublication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formPlatform, setFormPlatform] = useState<PlatformType>('YOUTUBE');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSources, setFormSources] = useState('');

  const loadPublications = async () => {
    setIsLoading(true);
    try {
      const res = await portalApi.listCommunityPublications({ artifact_id: artifactId });
      setPublications(res.results);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [artifactId]);

  const handleVideoUrlChange = (newUrl: string) => {
    setFormVideoUrl(newUrl);
    if (newUrl.trim()) {
      const val = validateVideoUrl(newUrl);
      if (val.isValid && val.platform) {
        setFormPlatform(val.platform);
        setUrlValidationError(null);
      } else if (!val.isValid) {
        setUrlValidationError(val.error || 'Invalid video link');
      }
    } else {
      setUrlValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoUrl.trim() || !formAuthor.trim()) return;

    const validation = validateVideoUrl(formVideoUrl);
    if (!validation.isValid) {
      setUrlValidationError(validation.error || 'Accepted platforms: YouTube, Instagram, TikTok, Vimeo, NASA Media.');
      return;
    }

    setIsSubmitting(true);
    setUrlValidationError(null);
    try {
      const res = await portalApi.submitCommunityPublication({
        mission_id: artifactId,
        artifact_id: artifactId,
        title: formTitle.trim(),
        video_url: validation.cleanUrl || formVideoUrl.trim(),
        platform_type: validation.platform || formPlatform,
        source_references: formSources.trim() || 'NASA Public Archive',
        author_name: formAuthor.trim(),
      });

      setSubmitSuccess(res.message);
      setFormTitle('');
      setFormVideoUrl('');
      setFormAuthor('');
      setFormSources('');
      setUrlValidationError(null);
      await loadPublications();

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(null);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cosmo-glass dossier-block" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 className="dossier-block-title" style={{ margin: 0 }}>
          <Video size={18} style={{ color: themeColor }} />
          <span>Community Publications & Video Archive</span>
        </h3>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: `${themeColor}20`,
            border: `1px solid ${themeColor}60`,
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${themeColor}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${themeColor}20`;
          }}
        >
          <PlusCircle size={14} style={{ color: themeColor }} />
          <span>Submit Video</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '16px 0' }}>Loading community archive...</div>
      ) : publications.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
          No community videos submitted yet. Be the first to submit a video report for {missionName}!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {publications.map((pub) => (
            <div
              key={pub.id}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: pub.platform_type === 'YOUTUBE' ? '#ef444425' : pub.platform_type === 'TIKTOK' ? '#06b6d425' : '#8b5cf625',
                      color: pub.platform_type === 'YOUTUBE' ? '#f87171' : pub.platform_type === 'TIKTOK' ? '#22d3ee' : '#a78bfa',
                      border: `1px solid ${pub.platform_type === 'YOUTUBE' ? '#ef444450' : pub.platform_type === 'TIKTOK' ? '#06b6d450' : '#8b5cf650'}`,
                    }}
                  >
                    {pub.platform_type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={11} style={{ color: '#34d399' }} /> Approved
                  </span>
                </div>

                <h4 style={{ fontSize: '13.5px', color: '#f1f5f9', margin: '0 0 6px 0', lineHeight: 1.4, fontWeight: 600 }}>
                  {pub.title}
                </h4>

                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  By <strong style={{ color: '#e2e8f0' }}>{pub.author_name}</strong>
                </div>

                {pub.source_references && (
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: '6px', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Source:</span> {pub.source_references}
                  </div>
                )}
              </div>

              <a
                href={pub.video_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <span>Watch Video</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="cosmo-glass"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              borderRadius: '20px',
              border: `1px solid ${themeColor}50`,
              background: '#0d1322',
              boxShadow: `0 25px 60px -15px ${themeColor}30`,
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Sparkles size={20} style={{ color: themeColor }} />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontFamily: 'var(--font-chakra)' }}>
                Submit Community Video Report
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
              Post YouTube, TikTok or Reels videos about {missionName} to the CosmoLost global database.
            </p>

            {submitSuccess ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#34d399',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <CheckCircle size={18} />
                <span>{submitSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '5px' }}>
                    VIDEO TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Detailed Analysis of Opportunity MER-B Landing Site"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ margin: 0, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        VIDEO URL *
                      </label>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>YouTube, Instagram, TikTok</span>
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://youtube.com/watch?v=... or tiktok / instagram reel"
                      value={formVideoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${urlValidationError ? '#ef4444' : formVideoUrl && !urlValidationError ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                        color: '#fff',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {urlValidationError ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#f87171', fontSize: '10.5px' }}>
                        <AlertTriangle size={11} />
                        <span>{urlValidationError}</span>
                      </div>
                    ) : formVideoUrl.trim() ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#34d399', fontSize: '10.5px' }}>
                        <CheckCircle2 size={11} />
                        <span>Valid {formPlatform} video source</span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '5px' }}>
                      PLATFORM
                    </label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value as PlatformType)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#151d30',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="YOUTUBE">YouTube</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="REELS">Reels</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '5px' }}>
                    AUTHOR / CREATOR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name or channel handle"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '5px' }}>
                    SOURCE REFERENCES (NASA ARCHIVES / DATASETS)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NASA LROC PDS archive image M175408043RE"
                    value={formSources}
                    onChange={(e) => setFormSources(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      background: themeColor,
                      border: 'none',
                      color: '#000',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit to Moderation'}
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
