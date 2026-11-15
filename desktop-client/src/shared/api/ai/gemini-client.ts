import { httpClient } from '../http';
import type {
  GenerateScriptPayload,
  GeneratedScriptResult,
  NextTopicPayload,
  NextTopicResult,
} from './types';

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class GeminiAiClient {
  private apiKey: string;

  constructor(apiKey = '') {
    const envKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : '') ||
      '';
    this.apiKey = apiKey || envKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Generate complete 40-second viral script according to SMM rules
   */
  async generateVideoScript(payload: GenerateScriptPayload): Promise<GeneratedScriptResult> {
    if (this.apiKey) {
      try {
        const response = await httpClient.post<{
          candidates?: Array<{
            content?: {
              parts?: Array<{ text: string }>;
            };
          }>;
        }>(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
          contents: [
            {
              parts: [
                {
                  text: this.buildScriptPrompt(payload),
                },
              ],
            },
          ],
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = this.parseJsonFromMarkdown(rawText) as Record<string, unknown> | null;
          if (parsed && Array.isArray(parsed.slides)) {
            return parsed as unknown as GeneratedScriptResult;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local heuristic generator:', err);
      }
    }

    // Heuristic Fallback compliant with "Створення IT-контенту для соцмереж.md"
    return this.generateHeuristicScript(payload);
  }

  /**
   * Smart Next Topic Engine: Narrative bridge + twin artifact selection
   */
  async recommendNextTopic(payload: NextTopicPayload): Promise<NextTopicResult> {
    const isUk = true; // default system locale
    if (payload.currentArtifactId.includes('spirit')) {
      return {
        suggestedArtifactId: 'opportunity-rover',
        suggestedArtifactName: 'Opportunity Rover (MER-B)',
        narrativeBridge: isUk
          ? 'Поки Spirit замерзав у пісках кратера Гусєв, його близнюк Opportunity пройшов понад 45 кілометрів і пережив брата на 8 років...'
          : 'While Spirit froze in the sands of Gusev, its twin Opportunity traversed over 45 km and survived 8 years longer...',
        suggestedHook: isUk
          ? 'А ви знали, що близнюк застряглого Spirit здійснив справжнє марсіанське диво?'
          : 'Did you know the twin of the stranded Spirit pulled off a true Martian miracle?',
        suggestedRubricId: 'last-sol-drama',
        recommendedPinComment: isUk
          ? 'Хто з двох марсоходів мав трагічнішу долю: Spirit чи Opportunity?'
          : 'Which rover had the more tragic fate: Spirit or Opportunity?',
      };
    }

    if (payload.currentArtifactId.includes('opportunity')) {
      return {
        suggestedArtifactId: 'apollo-11-lm-eagle',
        suggestedArtifactName: 'Apollo 11 Lunar Module Eagle',
        narrativeBridge: isUk
          ? 'Після марсіанських бур перенесемося на Місяць: що сталося з нижньою ступінню Eagle після історичного старту Ніла Армстронга?'
          : 'From Mars storms to the Moon: what became of Eagle Descent Stage after Armstrong’s liftoff?',
        suggestedHook: isUk
          ? 'Ось чому посадковий модуль Аполлона 11 досі стоїть у Морі Спокою!'
          : 'Here is why Apollo 11 descent stage still stands in the Sea of Tranquility!',
        suggestedRubricId: 'tech-explain',
        recommendedPinComment: isUk
          ? 'Чи варто NASA у майбутньому привезти Eagle на Землю як музейний експонат?'
          : 'Should NASA eventually bring Eagle back to Earth as a museum artifact?',
      };
    }

    return {
      suggestedArtifactId: 'spirit-rover',
      suggestedArtifactName: 'Spirit Rover (MER-A)',
      narrativeBridge: isUk
        ? 'А ось як починалася драма марсіанських роверів-близнюків...'
        : 'Here is how the saga of twin Martian rovers first began...',
      suggestedHook: isUk
        ? 'Цей марсохід першим знайшов докази бурхливого минулого Марса!'
        : 'This rover was first to unearth signs of ancient Martian water!',
      suggestedRubricId: payload.currentRubricId,
      recommendedPinComment: isUk
        ? 'Який апарат ви вважаєте головним науковим героєм космонавтики?'
        : 'Which machine is the ultimate hero of space exploration?',
    };
  }

  private buildScriptPrompt(p: GenerateScriptPayload): string {
    return `Generate a strict JSON response for a 40-second vertical video (YouTube Shorts / TikTok / Reels) about space artifact "${p.artifactName}".
Rubric: ${p.rubricId}. Language: ${p.language}.
Follow SMM Rules:
- Hook (0-3s, shocking opening line, PNGTuber state: HYPE or SHOCK).
- Core B-roll (3-32s, 3 factual bullet points without greetings or filler, PNGTuber state: EXPERT or IDLE).
- Loop CTA (32-40s, seamless sentence looping back to the hook + question to audience).
- 3-line SEO caption (Line 1: hook, Line 2: SEO keywords, Line 3: 5 hashtags).
- Provocative Pin Comment.
Output raw JSON only matching GeneratedScriptResult interface.`;
  }

  private parseJsonFromMarkdown(text: string): unknown {
    try {
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  private generateHeuristicScript(p: GenerateScriptPayload): GeneratedScriptResult {
    const isUk = p.language === 'uk';
    const isDual = p.language === 'dual';
    const art = p.artifactName;
    const magnetWord = p.magnetWord || (isUk ? 'ОСТАННІ СЛОВА' : 'LAST WORDS');
    const isChronicles = p.rubricId === 'chronicles';
    const seriesInfo =
      p.seriesInfo ||
      (isChronicles
        ? {
            seriesName: isUk ? 'Космічні Хроніки' : 'Cosmic Chronicles',
            partNumber: 1,
            totalParts: 3,
            cliffhanger: isUk
              ? 'Але що зафіксував сенсор за 60 секунд до темряви... дивіться у 2-й частині!'
              : 'What the sensors detected 60 seconds before darkness... find out in Part 2!',
          }
        : undefined);

    const titlePrefix = seriesInfo
      ? `[${seriesInfo.seriesName}: Ч.${seriesInfo.partNumber}/${seriesInfo.totalParts}] `
      : '';

    const hookPrefix = magnetWord ? `⚡ ${magnetWord}: ` : '';

    return {
      title: isUk
        ? `${titlePrefix}${art}: Таємниця останнього сигналу`
        : isDual
          ? `${titlePrefix}${art}: Mystery of the Final Signal • Таємниця сигналу`
          : `${titlePrefix}${art}: Mystery of the Final Signal`,
      rubricId: p.rubricId,
      totalDurationSec: 40,
      magnetWord,
      seriesInfo,
      slides: [
        {
          slideIndex: 1,
          type: 'HOOK',
          durationSec: 3,
          narratorText: isUk
            ? `${hookPrefix}Чому зв'язок з ${art} обірвався саме у цей фатальний день? Дивись до кінця!`
            : `${hookPrefix}Why did transmissions from ${art} abruptly vanish on that fateful day? Watch closely!`,
          visualPrompt:
            'Close up archival photo with high contrast dramatic zoom and magnet callout',
          pngtuberState: 'SHOCK',
        },
        {
          slideIndex: 2,
          type: 'B_ROLL_FACTS',
          durationSec: 14,
          narratorText: isUk
            ? 'Глобальна пилова буря заблокувала 99% сонячного світла. Сонячні панелі перестали заряджати акумулятори.'
            : 'A planetary dust storm blocked 99% of sunlight. Solar panels ceased charging internal power cells.',
          visualPrompt: 'Dust storm engulfing rover camera, telemetry HUD overlay',
          pngtuberState: 'EXPERT',
        },
        {
          slideIndex: 3,
          type: 'DRAMA_PEAK',
          durationSec: 15,
          narratorText: isUk
            ? 'Останнє повідомлення телеметрії зафіксувало критичну напругу. Температура впала нижче мінус сорока градусів.'
            : 'The final telemetry packet logged critical bus voltage. Ambient temperature plummeted beneath minus forty degrees.',
          visualPrompt: 'Sunset over Martian horizon, telemetry graphs dropping to zero',
          pngtuberState: 'IDLE',
        },
        {
          slideIndex: 4,
          type: 'SEAMLESS_LOOP_CTA',
          durationSec: 8,
          narratorText: seriesInfo?.cliffhanger
            ? `${seriesInfo.cliffhanger} Досліджуй 3D-мапу на CosmoLost!`
            : isUk
              ? 'Але його наукова спадщина назавжди змінила підручники астрономії. А ти знав...'
              : 'Yet its scientific legacy permanently rewrote textbooks of astrophysics. And did you know...',
          visualPrompt: '3D interactive model rotation with glowing safe zones and portal URL',
          pngtuberState: 'HYPE',
        },
      ],
      seoCaption: {
        line1Hook: isUk
          ? `${hookPrefix}Останні секунди ${art} перед вічним замерзанням 😱👇`
          : isDual
            ? `${hookPrefix}Final seconds of ${art} | Останні секунди перед замерзанням 😱👇`
            : `${hookPrefix}The final seconds of ${art} before eternal freezing 😱👇`,
        line2Seo: isUk
          ? `Повна історія та розбір останньої телеметрії ${art}. Досліджуй артефакт на 3D-мапі CosmoLost: cosmolost.lihtar.org`
          : isDual
            ? `Complete chronicle of ${art}. Explore 3D map: cosmolost.lihtar.org • Досліджуй на 3D-мапі`
            : `Complete chronicle and telemetry breakdown of ${art}. Explore on CosmoLost 3D map: cosmolost.lihtar.org`,
        line3Tags: isUk
          ? '#космос #наука #марсохід #nasa #cosmolost'
          : isDual
            ? '#space #nasa #космос #science #наука #cosmolost'
            : '#space #nasa #marsrover #science #cosmolost',
      },
      pinComment: isUk
        ? `Як ви вважаєте, чи варто майбутнім колоністам доставити ${art} на Землю в музей? Напишіть у коментарях 👇`
        : isDual
          ? `Should future explorers bring ${art} back to Earth? / Чи варто привезти в музей? 👇`
          : `Do you believe future colonists should retrieve ${art} back to Earth for a museum? Share below 👇`,
    };
  }
}

export const geminiAi = new GeminiAiClient();
