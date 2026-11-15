import { httpClient } from '../http';
import type { GenerateImagePayload, GeneratedImageResult, ImageProviderOption } from './types';

export interface ImageClientCredentials {
  openaiApiKey?: string;
  geminiApiKey?: string;
  defaultProvider?: ImageProviderOption;
}

export class ImageGeneratorClient {
  private credentials: ImageClientCredentials;

  constructor(credentials: ImageClientCredentials = {}) {
    this.credentials = {
      defaultProvider: 'pollinations-free',
      ...credentials,
    };
  }

  setCredentials(credentials: Partial<ImageClientCredentials>) {
    this.credentials = { ...this.credentials, ...credentials };
  }

  /**
   * Generates or fetches an image according to selected provider
   */
  async generateImage(payload: GenerateImagePayload): Promise<GeneratedImageResult> {
    const provider = payload.provider || this.credentials.defaultProvider || 'pollinations-free';

    switch (provider) {
      case 'openai-dalle':
        return this.callOpenAiDalle(payload);
      case 'gemini-imagen':
        return this.callGeminiImagen(payload);
      default:
        return this.callPollinations(payload);
    }
  }

  private async callOpenAiDalle(payload: GenerateImagePayload): Promise<GeneratedImageResult> {
    const apiKey = this.credentials.openaiApiKey?.trim();
    if (!apiKey) {
      return this.callPollinations(payload, true);
    }

    try {
      const response = await httpClient.post<{
        data?: Array<{ url: string; revised_prompt?: string }>;
      }>(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: `Cinematic Mars/Space realistic photo: ${payload.prompt}, 8k resolution, documentary style`,
          n: 1,
          size: payload.size === '1024x1792' ? '1024x1792' : '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      const url = response.data?.data?.[0]?.url;
      if (url) {
        return {
          imageUrl: url,
          provider: 'openai-dalle',
          prompt: payload.prompt,
          isFallback: false,
        };
      }
      return this.callPollinations(payload, true);
    } catch (err) {
      console.warn('OpenAI DALL-E call failed, using Pollinations AI fallback:', err);
      return this.callPollinations(payload, true);
    }
  }

  private async callGeminiImagen(payload: GenerateImagePayload): Promise<GeneratedImageResult> {
    const apiKey = this.credentials.geminiApiKey?.trim();
    if (!apiKey) {
      return this.callPollinations(payload, true);
    }

    // Google Vertex / Gemini Imagen REST endpoint
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:predict?key=${apiKey}`;
      const response = await httpClient.post<{
        predictions?: Array<{ bytesBase64Encoded?: string }>;
      }>(endpoint, {
        instances: [{ prompt: payload.prompt }],
        parameters: { sampleCount: 1, aspectRatio: '9:16' },
      });

      const b64 = response.data?.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return {
          imageUrl: `data:image/jpeg;base64,${b64}`,
          provider: 'gemini-imagen',
          prompt: payload.prompt,
          isFallback: false,
        };
      }
      return this.callPollinations(payload, true);
    } catch {
      return this.callPollinations(payload, true);
    }
  }

  private callPollinations(
    payload: GenerateImagePayload,
    isFallback = false,
  ): GeneratedImageResult {
    const encodedPrompt = encodeURIComponent(
      `mars rover telemetry space photorealistic: ${payload.prompt}`,
    );
    const width = payload.size === '1024x1792' ? 1024 : 1080;
    const height = payload.size === '1024x1792' ? 1792 : 1920;
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=42`;

    return {
      imageUrl: url,
      provider: 'pollinations-free',
      prompt: payload.prompt,
      isFallback,
    };
  }
}

export const imageGeneratorClient = new ImageGeneratorClient();
