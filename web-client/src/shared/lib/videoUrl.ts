import type { PlatformType } from '../api/types';

export interface VideoUrlValidationResult {
  isValid: boolean;
  platform?: PlatformType;
  cleanUrl?: string;
  embedUrl?: string | null;
  error?: string;
}

/**
 * Validates video URLs allowing only accepted platforms: YouTube, Instagram Reels, TikTok, Vimeo, NASA Media.
 * Extracts standard playable embed URLs and identifies platform type.
 */
export function validateVideoUrl(rawUrl: string): VideoUrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Video URL is required.' };
  }

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    // 1. YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      let videoId: string | null = null;
      if (host === 'youtu.be') {
        videoId = url.pathname.slice(1).split('/')[0] || null;
      } else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.replace('/shorts/', '').split('/')[0] || null;
      } else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.replace('/embed/', '').split('/')[0] || null;
      } else if (url.searchParams.has('v')) {
        videoId = url.searchParams.get('v');
      }

      if (videoId && videoId.length >= 6) {
        return {
          isValid: true,
          platform: 'YOUTUBE',
          cleanUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        };
      }
      return {
        isValid: false,
        error: 'Invalid YouTube link: missing video ID. Format: https://youtube.com/watch?v=... or https://youtu.be/...',
      };
    }

    // 2. Instagram Reels / Videos
    if (host === 'instagram.com' || host === 'instagr.am') {
      const match = url.pathname.match(/\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/);
      if (match && match[2]) {
        const shortcode = match[2];
        return {
          isValid: true,
          platform: 'REELS',
          cleanUrl: `https://www.instagram.com/reel/${shortcode}/`,
          embedUrl: `https://www.instagram.com/reel/${shortcode}/embed`,
        };
      }
      return {
        isValid: false,
        error: 'Invalid Instagram link. Accepted formats: https://instagram.com/reel/... or https://instagram.com/p/...',
      };
    }

    // 3. TikTok
    if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
      const match = url.pathname.match(/\/video\/(\d+)/);
      if (match && match[1]) {
        const videoId = match[1];
        return {
          isValid: true,
          platform: 'TIKTOK',
          cleanUrl: `https://www.tiktok.com/@user/video/${videoId}`,
          embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        };
      }
      if (host.includes('vm.tiktok.com') || host.includes('vt.tiktok.com') || url.pathname.length > 2) {
        return {
          isValid: true,
          platform: 'TIKTOK',
          cleanUrl: url.toString(),
          embedUrl: url.toString(),
        };
      }
      return {
        isValid: false,
        error: 'Invalid TikTok link. Format: https://www.tiktok.com/@creator/video/123456... or https://vm.tiktok.com/...',
      };
    }

    // 4. Vimeo
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const match = url.pathname.match(/\/(\d+)/);
      if (match && match[1]) {
        const id = match[1];
        return {
          isValid: true,
          platform: 'OTHER',
          cleanUrl: `https://vimeo.com/${id}`,
          embedUrl: `https://player.vimeo.com/video/${id}`,
        };
      }
      return {
        isValid: true,
        platform: 'OTHER',
        cleanUrl: url.toString(),
        embedUrl: url.toString(),
      };
    }

    // 5. NASA Public Media & Internet Archive
    if (host === 'nasa.gov' || host.endsWith('.nasa.gov') || host === 'archive.org') {
      return {
        isValid: true,
        platform: 'OTHER',
        cleanUrl: url.toString(),
        embedUrl: url.toString(),
      };
    }

    return {
      isValid: false,
      error: 'Unsupported domain. Please provide a video link from YouTube, Instagram, TikTok, Vimeo, or NASA Archive.',
    };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g. https://www.youtube.com/watch?v=...)',
    };
  }
}

/**
 * Returns an embeddable iframe URL for supported video publications.
 */
export function getEmbeddableVideoUrl(videoUrl: string): string {
  const result = validateVideoUrl(videoUrl);
  if (result.isValid && result.embedUrl) {
    return result.embedUrl;
  }
  if (videoUrl.includes('youtube.com/embed/')) {
    return videoUrl;
  }
  if (videoUrl.includes('watch?v=')) {
    return videoUrl.replace('watch?v=', 'embed/');
  }
  // Default NASA Mars/Moon documentary placeholder
  return 'https://www.youtube.com/embed/RMINSD7MmT4';
}
