import type { ProxyGenerateParams, ProxyGenerateResult } from './types';

/**
 * Executes a call to the local Generative Proxy (Antigravity Proxy / Google Flow / Hermes Bridge).
 * Compatible with OpenAI-style /v1/images/generations endpoint or direct mock fallback.
 */
export async function callGenerativeProxy(
  params: ProxyGenerateParams,
): Promise<ProxyGenerateResult> {
  const {
    endpoint,
    token,
    prompt,
    modality,
    model = modality === 'video' ? 'veo-3.1' : 'nano-banana-2',
    timeoutMs = 12000,
  } = params;

  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  const url =
    modality === 'video'
      ? `${cleanEndpoint}/videos/generations`
      : `${cleanEndpoint}/images/generations`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        model,
        n: 1,
        size: '1080x1920',
        response_format: 'url',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        mediaType: modality,
        source: 'proxy',
        error: `Проксі повернув статус ${response.status}: ${errText.slice(0, 120)}`,
      };
    }

    const data = await response.json();
    const mediaUrl =
      data?.data?.[0]?.url || data?.data?.[0]?.b64_json || data?.url || data?.video_url;

    if (!mediaUrl) {
      return {
        success: false,
        mediaType: modality,
        source: 'proxy',
        error: 'Проксі не повернув URL або DataURL медіафайлу у відповіді.',
      };
    }

    return {
      success: true,
      mediaUrl,
      mediaType: modality,
      source: 'proxy',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      mediaType: modality,
      source: 'proxy',
      error: `Не вдалося підключитися до проксі (${cleanEndpoint}): ${message}. Переконайтеся, що локальний сервер запущено або вставте асет вручну.`,
    };
  }
}
