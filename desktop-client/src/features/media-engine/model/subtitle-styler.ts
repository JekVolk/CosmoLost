import {
  DEFAULT_SUBTITLE_STYLE,
  type SubtitlePresetName,
  type SubtitleStyleConfig,
} from '@/entities/publication';

export interface SubtitlePresetDefinition {
  id: SubtitlePresetName;
  name: string;
  description: string;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
  highlightKeywords: boolean;
  wordsPerChunk: number;
}

export const SUBTITLE_PRESETS: Record<SubtitlePresetName, SubtitlePresetDefinition> = {
  HORMOZI_YELLOW: {
    id: 'HORMOZI_YELLOW',
    name: 'Alex Hormozi Yellow',
    description: 'Неоновий жовтий хук, білий текст, глибокий чорний контур та CAPS.',
    textColor: '#ffffff',
    highlightColor: '#facc15',
    strokeColor: '#000000',
    strokeWidth: 4,
    isUppercase: true,
    highlightKeywords: true,
    wordsPerChunk: 2,
  },
  MRBEAST_CYAN: {
    id: 'MRBEAST_CYAN',
    name: 'MrBeast Electric Cyan',
    description: 'Електричний бірюзовий глянець, контрастна тінь та виділення чисел.',
    textColor: '#ffffff',
    highlightColor: '#22d3ee',
    strokeColor: '#020617',
    strokeWidth: 3,
    isUppercase: true,
    highlightKeywords: true,
    wordsPerChunk: 3,
  },
  CYBER_LIME: {
    id: 'CYBER_LIME',
    name: 'Cyberpunk Lime',
    description: 'Вірусний лаймовий градієнт TikTok з максимальним контрастом.',
    textColor: '#ffffff',
    highlightColor: '#4ade80',
    strokeColor: '#022c22',
    strokeWidth: 3,
    isUppercase: true,
    highlightKeywords: true,
    wordsPerChunk: 2,
  },
  CLEAN_WHITE: {
    id: 'CLEAN_WHITE',
    name: 'Clean High Contrast',
    description: 'Класичний білий текст із чітким чорним обведенням 3px.',
    textColor: '#ffffff',
    highlightColor: '#cbd5e1',
    strokeColor: '#000000',
    strokeWidth: 3,
    isUppercase: false,
    highlightKeywords: false,
    wordsPerChunk: 3,
  },
};

const KEYWORDS_SET = new Set([
  'why',
  'what',
  'how',
  'secret',
  'critical',
  'lost',
  'found',
  'never',
  'stopped',
  'shocking',
  'nasa',
  'mars',
  'moon',
  'froze',
  'survived',
  'miracle',
  'explosion',
  'danger',
  'чому',
  'що',
  'як',
  'таємниця',
  'критична',
  'загинув',
  'знайшли',
  'ніколи',
  'зупинився',
  'шок',
  'місяць',
  'замерз',
  'вижив',
  'диво',
  'вибух',
  'небезпека',
]);

export interface TokenizedWord {
  text: string;
  isKeyword: boolean;
}

export function tokenizeChunk(
  chunk: string,
  config: SubtitleStyleConfig = DEFAULT_SUBTITLE_STYLE,
): TokenizedWord[] {
  const words = chunk.split(/\s+/).filter(Boolean);
  return words.map((rawWord) => {
    const clean = rawWord.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    const isKeyword =
      config.highlightKeywords &&
      (KEYWORDS_SET.has(clean) || /\d/.test(clean) || clean.includes('%'));
    const text = config.isUppercase ? rawWord.toUpperCase() : rawWord;
    return {
      text,
      isKeyword,
    };
  });
}

export function chunkSentence(sentence: string, wordsPerChunk = 3): string[] {
  const words = sentence.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }

  return chunks.length > 0 ? chunks : [sentence];
}

export function buildAssOverrideHeader(config: SubtitleStyleConfig): string {
  const fontSize = config.fontSizePx || 28;
  const outline = config.strokeWidth || 3;
  return `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,${outline},2,2,20,20,180,1`;
}
