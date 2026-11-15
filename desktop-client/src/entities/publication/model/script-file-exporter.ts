import type { PublicationProject } from './types';

/**
 * Generates production-ready Markdown script and content-plan
 * according to MKT-01 SMM retention standards.
 */
export function generateScriptMarkdown(project: PublicationProject): string {
  const isSeries = Boolean(project.seriesInfo);
  const seriesHeader = isSeries
    ? `> **Серія**: ${project.seriesInfo?.seriesName} (Частина ${project.seriesInfo?.partNumber} з ${project.seriesInfo?.totalParts})  \n> **Кліфхенгер**: ${project.seriesInfo?.cliffhanger || 'Дивіться у наступній серії!'}\n`
    : '> **Формат**: Окремий вірусний Shorts / Reel\n';

  const magnetBadge = project.magnetWord ? `⚡ [МАГНІТНЕ СЛОВО: ${project.magnetWord}]` : '';

  const totalDuration =
    project.slides.reduce((acc, s) => acc + s.durationSec, 0) || project.targetDurationSec || 40;

  const slidesTable = project.slides
    .map((s, idx) => {
      const startSec = project.slides
        .slice(0, idx)
        .reduce((sum, curr) => sum + curr.durationSec, 0);
      const endSec = startSec + s.durationSec;
      return `| ${idx + 1} | [${startSec}s - ${endSec}s] | **${s.type}** | \`${s.pngtuberState}\` | ${s.narratorText} | *${s.visualPrompt}* |`;
    })
    .join('\n');

  const fullVoiceover = project.slides.map((s) => s.narratorText).join(' ');

  return `# 🚀 CosmoLost Shorts: ${project.artifactName}
${magnetBadge}

${seriesHeader}> **Цільовий хронометраж**: ~${totalDuration} сек (1080x1920 60FPS Спліт-Екран)  
> **Рубрика**: \`${project.rubricId}\`  
> **Мова**: \`${project.contentLanguage || 'uk'}\`  
> **Дата створення**: ${new Date(project.createdAt).toLocaleDateString('uk-UA')}  

---

## 1. 🎬 Покадровий монтажний план (Split-Screen & PNGTuber)

| # | Таймкод | Фаза | Емоція аватара | Дикторський текст (Voiceover) | B-Roll / Візуальний акцент |
|:-:|:-------:|:----:|:--------------:|:------------------------------|:---------------------------|
${slidesTable}

---

## 2. 🎙️ Повний суцільний дикторський текст (для Edge-TTS / Студії):

> "${fullVoiceover}"

---

## 3. 🎯 SEO-Пакет та Алгоритмічний Дистриб'юшн (3 рядки)

- **Рядок 1 (Хук / Байт на клік)**:  
  ${project.seoCaption.line1Hook}

- **Рядок 2 (SEO-ядро та посилання на 3D-мапу)**:  
  ${project.seoCaption.line2Seo}

- **Рядок 3 (Згруповані хештеги)**:  
  \`${project.seoCaption.line3Tags}\`

---

## 4. 📌 Перший закріплений коментар (Pin Comment)

\`\`\`
${project.pinComment}
\`\`\`

---

## 5. 🛡️ Безпечні Зони (Safe Zones Checklist)
- [x] Хук та Слово-магніт: верхня безпечна зона (нижче 220px від верхнього краю).
- [x] Кінетичні субтитри: центральна третина (вище 420px від низу екрана).
- [x] Аватар PNGTuber: лівий нижній кут (на висоті 400px від низу).
- [x] Права зона (150px): чиста від тексту (під системні кнопки лайків/шерингу).
`;
}

/**
 * Downloads the Markdown script as a .md file directly in the user's browser / OS
 */
export function downloadScriptMarkdownFile(project: PublicationProject): void {
  const content = generateScriptMarkdown(project);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = `${project.artifactId}_script_${Date.now().toString(36)}.md`;
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies the full markdown content to clipboard
 */
export async function copyScriptToClipboard(project: PublicationProject): Promise<boolean> {
  try {
    const content = generateScriptMarkdown(project);
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}
