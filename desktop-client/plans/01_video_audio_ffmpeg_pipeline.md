# План 1: Медіа-ядро та Монтажний Конвеєр FFmpeg (01_video_audio_ffmpeg_pipeline.md)

> **Статус**: ВЕРИФІКОВАНО ТА ЗАТВЕРДЖЕНО (Validated Technical Specification)  
> **Swarm Воркер**: `worker-media`  
> **Робоча директорія**: `desktop-client`  
> **Стек**: Rust (Tauri Backend) + FFmpeg (Local Sidecar) + Edge-TTS + Node Audio Processing  
> **Джерела**: `Створення IT-контенту для соцмереж.md` (розділи «Субтитри, озвучка та музика», «Технічні розміри, безпечні зони»), `FEAT-03_content_factory.md` (розділи 2.3, 2.4, 2.5, 3).  
>  
> **Обмеження поточної фази**:  
> - НЕ підключати реальний бекенд API. Всі фотографії та текстові скрипти беруться з локальних тестових фікстур або Direct NASA CDN.  
> - НЕ створювати складні стилі інтерфейсу (UI/UX).  
> - НЕ виконувати компіляцію чи білд коду зараз — тільки затвердження плану та архітектурних контрактів.

---

## 1. Мета та Зона Відповідальності

`worker-media` відповідає за проектування та верифікацію математики і контрактів автономного локального медіа-конвеєра:
1. **Синтез та динамічна обробка аудіо (Edge-TTS + Jump-Cut <0.15s)**.
2. **Багатодоріжковий мікшер аудіо (Voice -3dB + Synthwave BGM -24dB + SFX -12dB з sidechain ducking та normalize=0)**.
3. **Генератор субтитрів кінетичної типографіки (.ass)** із безпечними зонами (220px зверху, 420px знизу).
4. **FFmpeg Video Compositor (Pillow-box 4:3 -> 9:16, динамічний Ken Burns zoompan, 1080x1920 30/60 FPS)**.
5. **Дворівневий Rust Watchdog з адаптивним таймаутом `render_timeout_sec` (30-300s) та stagnation detection**.

---

## 2. Архітектура та Технічні Специфікації

### 2.1. Аудіо-пайплайн: Edge-TTS та Jump-Cut Фільтрація
- **Синтезатор**: Інтеграція локального виклику Edge-TTS (підтримка мов: `uk-UA-OstapNeural`, `uk-UA-PolinaNeural`, `en-US-GuyNeural`, `en-US-JennyNeural`).
- **Jump-Cut (Видалення тиші)**:
  - Згідно з правилами вірусного утримання: між реченнями та словами не повинно бути пауз довше **0.15 секунди**.
  - Верифікований фільтр тиші:
    ```bash
    silenceremove=start_periods=1:start_duration=0.03:start_threshold=-40dB:stop_periods=-1:stop_duration=0.15:stop_threshold=-40dB,atempo=1.1,dynaudnorm=f=150:g=15
    ```
  - Пояснення параметрів:
    - `start_periods=1:start_duration=0.03:start_threshold=-40dB`: безжально зрізає стартову тишу на початку запису.
    - `stop_periods=-1:stop_duration=0.15:stop_threshold=-40dB`: обрізає всі внутрішні паузи довше 150 мс.
    - `atempo=1.1`: динамічне прискорення темпу мовлення на 10% без зміни висоти тону.
    - `dynaudnorm=f=150:g=15`: динамічна нормалізація для рівного, щільного подкастового звучання.
- **RMS-амплітуда для ліпсингу аватара**:
  - Паралельний розрахунок амплітуди звукової хвилі з дискретизацією 50 мс (20 FPS) для передачі у модуль PNGTuber (масив нормалізованих значень `[0.0 .. 1.0]`).
  - Формула: $RMS = \sqrt{\frac{1}{N} \sum_{i=1}^{N} x_i^2}$. Поріг спрацьовування рота: $RMS > 0.15 \implies \text{рот відкритий}$.

### 2.2. Багатодоріжкове зведення звуку (Audio Mixing)
- **Баланс гучності**:
  - Голосова доріжка (Voiceover): цільовий рівень **-3 dB .. -6 dB** (щільний, скомпресований звук).
  - Фонова музика (BGM Synthwave / Dark Synth / Lo-Fi): рівень **-24 dB** (фоновий килим, що не заглушає голос).
  - Звукові акценти (SFX: whoosh на зміні слайдів, pop, keyboard typing, glitch): рівень **-12 dB .. -15 dB**.
- **Критична виправлена специфікація FFmpeg Filtergraph для аудіо**:
  > [!IMPORTANT]
  > За замовчуванням `amix` у FFmpeg ділить амплітуду кожного треку на кількість входів $N$ ($1/3 \approx -9.54\text{ dB}$). Щоб зберегти точні рівні гучності, прапорець **`normalize=0`** є обов'язковим! Для запобігання міжсемпловому кліпінгу додається `alimiter`.
  ```bash
  [voice]volume=-3dB[v_clean]; \
  [bgm]volume=-24dB,aloop=loop=-1:size=2e+09[bg_looped]; \
  [sfx]volume=-12dB[sfx_clean]; \
  [v_clean][bg_looped][sfx_clean]amix=inputs=3:duration=first:dropout_transition=2:normalize=0,alimiter=limit=0.95[aout]
  ```

### 2.3. Відео-композитинг та Ефекти
- **Роздільна здатність**: Строго **1080x1920 px** (9:16 вертикальний Full HD).
- **Частота кадрів**: 30 або 60 FPS (60 FPS для плавного Ken Burns та динамічних 3D симуляцій).
- **Pillow-box для архівних знімків NASA (4:3, квадрат або панорами)**:
  - Проблема: Старі фотографії Surveyor, Apollo або Viking мають співвідношення 4:3 або 800x600. Обрізати їх — втратити 60% наукового змісту.
  - Верифікований двопотоковий граф Pillow-box:
    1. Потік заднього фону: масштабування з покриттям 1080x1920 (`increase`), центральний кроп, розмиття `boxblur=25:2` (або `gblur=sigma=30`), легке затемнення `eq=brightness=-0.15:contrast=1.05`.
    2. Потік переднього плану: масштабування зі збереженням пропорцій (`decrease`) до розміру 1040x1840 (безпечний внутрішній відступ 20px).
    3. Оверлей: центрування різкого оригіналу по центру розмитого фону.
  ```bash
  [i:v]split=2[bg_raw][fg_raw]; \
  [bg_raw]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:2,eq=brightness=-0.15[bg_blurred]; \
  [fg_raw]scale=1040:1840:force_original_aspect_ratio=decrease[fg_sharp]; \
  [bg_blurred][fg_sharp]overlay=(W-w)/2:(H-h)/2[slide_comp]
  ```
- **Ефект Кена Бернса (Ken Burns / zoompan)**:
  - Математична верифікація:
    - За замовчуванням `zoompan` працює на 25 FPS, що призводить до десинхронізації відео 30/60 FPS. Параметр `fps={fps}` обов'язковий!
    - Параметр `d` задається у кадрах: $D = \text{duration\_sec} \times \text{fps}$.
    - Крок масштабування на кадр: $\Delta z = \frac{Z_{target} - 1.0}{D}$.
    - Для $T=5$с при 30 FPS ($D=150$, $Z=1.18$): $\Delta z = 0.0012$.
    - Центрування: $x = \frac{iw}{2} - \frac{iw}{2z}$, $y = \frac{ih}{2} - \frac{ih}{2z}$.
  ```bash
  [slide_comp]zoompan=z='min(zoom+0.0012,1.18)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[v_slide]
  ```
- **Безшовні переходи між слайдами (xfade)**:
  - Математична формула офсету для $k$-го переходу з тривалістю оверлапу $D_{fade}$:
    $$\text{offset}_k = \sum_{i=0}^{k} L_i - k \cdot D_{fade}$$
  - Приклад: `[v0][v1]xfade=transition=fade:duration=0.4:offset=2.6[v01]`.

### 2.4. Кінетична типографіка та Субтитри
- **Формат файлу**: Advanced SubStation Alpha (`.ass`).
- **Стильовий заголовок .ass з урахуванням безпечних зон**:
  ```ini
  [Script Info]
  ScriptType: v4.00+
  PlayResX: 1080
  PlayResY: 1920

  [V4+ Styles]
  Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
  Style: Default,Montserrat Black,56,&H00FFFFFF,&H0000D7FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3.5,0,2,80,150,480,1
  ```
  - **Безпечні зони**:
    - `Alignment: 2` (вирівнювання по низу-центру).
    - `MarginV: 480` (надійно вище нижньої мертвої зони 420 px).
    - `MarginR: 150` (лівіше правої мертвої зони кнопок взаємодії).
    - `MarginL: 80` (відступ зліва).
  - **Кольорове підсвічування active word**:
    - Формат ASS кольорів: `&HAABBGGRR&` (BGR, не RGB!).
    - Золотисто-жовтий `#FFD700` в ASS: `{\c&H00D7FF&}слово{\c&HFFFFFF&}`.
    - Неоново-зелений `#00FF66` в ASS: `{\c&H66FF00&}слово{\c&HFFFFFF&}`.
  - **Групування**: строго по 2–4 слова на репліку.

### 2.5. Дворівневий Rust Watchdog (Сторожовий таймер рендерингу)
- **Конфігурація користувача**: `render_timeout_sec` (повзунок у налаштуваннях: 30–300 секунд, дефолт 120с).
- **Архітектура двох рівнів захисту**:
  1. **Рівень 1 (Stagnation Watchdog — перевірка зависання)**:
     - Асинхронний моніторинг `child.stderr` через `tokio::io::BufReader`.
     - Парсинг рядків `time=00:00:15.20` та `fps=28.4`.
     - Якщо протягом **30 секунд** не надійшло жодного оновлення кадру — процес визнається завислим (deadlock / кодек упав).
     - Емітиться прогрес `render_progress` у React UI на кожні 250 мс.
  2. **Рівень 2 (Wall-Clock Ceiling — граничний час виконання)**:
     - Обертання у `tokio::time::timeout(Duration::from_secs(render_timeout_sec), ...)` як абсолютний запобіжник від вичерпання дискового простору або безкінечних циклів.
  3. **Чисте аварійне завершення**:
     - `child.kill().await` негайно зупиняє FFmpeg.
     - Асинхронне видалення часткових тимчасових файлів (`temp_render_{task_id}.mp4`, `.ass`).
     - Відправка статусу `FAILED` з діагностичним логом у frontend без блокування подальшої роботи застосунку.

---

## 3. Модульна декомпозиція та TypeScript контракти

```typescript
/** Конфігурація слайда для відеомонтажу */
export interface SlideRenderConfig {
  id: string;
  imagePath: string;
  durationSec: number;
  pillowBox: boolean;
  kenBurns: {
    enabled: boolean;
    targetZoom: number; // e.g. 1.15
    direction: "center" | "top" | "bottom";
  };
  transitionDurationSec: number; // e.g. 0.4
}

/** Конфігурація аудіодоріжок */
export interface AudioMixConfig {
  voiceTrackPath: string;
  voiceVolumeDb: number; // -3dB
  bgmTrackPath: string;
  bgmVolumeDb: number; // -24dB
  bgmLoop: boolean;
  sfxTrackPaths?: Array<{
    path: string;
    offsetSec: number;
    volumeDb: number; // -12dB
  }>;
}

/** Загальний запит на рендеринг у Rust Backend */
export interface RenderVideoRequest {
  taskId: string;
  outputPath: string;
  fps: 30 | 60;
  width: 1080;
  height: 1920;
  slides: SlideRenderConfig[];
  audio: AudioMixConfig;
  subtitlesAssPath?: string;
  renderTimeoutSec: number; // 30 .. 300
}

/** Прогрес рендерингу (Tauri Event: 'render-progress') */
export interface RenderProgressPayload {
  taskId: string;
  percent: number; // 0.0 .. 100.0
  currentFps: number;
  renderedSec: number;
  totalSec: number;
  etaSec: number;
}
```

---

## 4. Критерії Готовності (Definition of Done)
- [x] Верифіковано точні математичні формули `zoompan` Ken Burns із динамічним кроком та `fps`.
- [x] Розроблено двопотоковий шаблон Pillow-box розмиття для знімків NASA 4:3 та квадрата.
- [x] Виправлено команду `amix` з прапорцем `normalize=0` та `alimiter` для багатодоріжкового аудіо.
- [x] Спроектовано дворівневий Rust Watchdog із захистом від зависання (stagnation) та верхнім лімітом `render_timeout_sec`.
- [x] Описано точні TypeScript інтерфейси для нодового графа та IPC взаємодії.
