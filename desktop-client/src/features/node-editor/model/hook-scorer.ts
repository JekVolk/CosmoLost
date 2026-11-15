import type { HookScorerNodeData } from './types';

const QUESTION_WORDS = [
  'чому',
  'як',
  'хто',
  'де',
  'куди',
  'чи',
  'чому саме',
  'why',
  'how',
  'what',
  'who',
];
const CURIOSITY_WORDS = [
  'обірвався',
  'таємниця',
  'засекречено',
  'останній',
  'шок',
  '5111',
  'загибель',
  'катастрофа',
  'аномалія',
  'мовчить',
  'загублений',
  'secret',
  'mystery',
  'last',
  'fatal',
];
const EMOTIONAL_WORDS = [
  '😱',
  '⚡',
  '🔥',
  'небезпека',
  'тривожний',
  'неймовірно',
  'критичний',
  'фатальний',
  'загроза',
  'вражає',
  'страшний',
  'epic',
  'danger',
];

export function analyzeHookVirality(hookText: string): HookScorerNodeData {
  const clean = hookText.trim().toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const questionFormat =
    hookText.includes('?') ||
    QUESTION_WORDS.some((qw) => clean.startsWith(qw) || clean.includes(` ${qw} `));

  const curiosityGap = CURIOSITY_WORDS.some((cw) => clean.includes(cw));
  const brevityUnder12Words = wordCount >= 3 && wordCount <= 12;
  const hasEmotionalTrigger = EMOTIONAL_WORDS.some(
    (ew) => hookText.includes(ew) || clean.includes(ew),
  );

  let score = 40;
  if (questionFormat) score += 20;
  if (curiosityGap) score += 20;
  if (brevityUnder12Words) {
    score += 15;
  } else if (wordCount > 15) {
    score -= 15;
  }
  if (hasEmotionalTrigger) score += 15;

  score = Math.max(10, Math.min(100, score));

  let viralGrade: HookScorerNodeData['viralGrade'] = 'C';
  if (score >= 90) viralGrade = 'S';
  else if (score >= 80) viralGrade = 'A';
  else if (score >= 65) viralGrade = 'B';
  else if (score >= 50) viralGrade = 'C';
  else viralGrade = 'F';

  let feedbackTip = 'Чудовий вірусний гачок! Утримує увагу перші 3 секунди.';
  if (!questionFormat) {
    feedbackTip = 'Додайте пряме запитання для виклику цікавості (наприклад: "Чому...?").';
  } else if (!brevityUnder12Words && wordCount > 12) {
    feedbackTip = `Хук закороткий або задовгий (${wordCount} слів). Оптимально: 5-10 слів для перших 2.5с.`;
  } else if (!curiosityGap) {
    feedbackTip = 'Додайте інформаційний розрив (curiosity gap) або несподіваний факт.';
  } else if (!hasEmotionalTrigger) {
    feedbackTip = 'Підсильте емоційний тригер (наприклад, емодзі 😱 чи слово небезпеки).';
  }

  return {
    score,
    viralGrade,
    curiosityGap,
    questionFormat,
    brevityUnder12Words,
    hasEmotionalTrigger,
    feedbackTip,
  };
}
