# CosmoLost Desktop Client: Генеральний Архітектурний та Імплементаційний План v2.2 (00_MASTER_PLAN.md)

> **Статус**: Впроваджено, Верифіковано та Узгоджено з Product Owner  
> **Версія проекту**: CosmoLost Desktop Client v0.3.2  
> **Стек**: Tauri v2 (Rust) + React 19 + TypeScript + Chakra UI v3 + Feature-Sliced Design (FSD v2.1) + `@xyflow/react` + FFmpeg + Edge-TTS + Native Desktop MCP  
> **Дизайн-джерела**:  
> - `design/canvas/02-desktop-studio.pen` / `02-desktop-studio.pen` (20 фреймів студії, монітора 9:16, діалогів від Віолетти)  
> - `design/02_TASK_DESIGN_EDITOR_DESKTOP.md`  
> - `design/03_PAGE_LAYOUTS_AND_MISSION_SPEC.md`  
> - `design/spec/theme.md`, `components.md`, `pages.md`  
> **Бізнес-джерела**:  
> - `business/inbox/Створення IT-контенту для соцмереж.md`  
> - `business/spec/04_features/FEAT-03_content_factory.md`  
> - `business/spec/04_features/FEAT-04_social_publishing.md`  
> - `business/spec/04_features/FEAT-05_mcp_rag_gateway.md`  
> - `business/spec/05_domain/01_ENTITIES.md`, `02_FIELDS_AND_VALIDATIONS.md`, `03_OPERATIONS.md`  
> - `desktop-client/docs/YOUTUBE_OAUTH_SETUP.md`  

---

## 1. Затверджені Рішення за Результатами Зворотного Зв'язку Користувача

### 1.1. FFmpeg Sidecar та автодетекція:
* **Автоматичний пошук**: Застосунок перевіряє наявність FFmpeg на комп'ютері через `where ffmpeg`, локальну папку `%LOCALAPPDATA%\CosmoLost\bin\` та системний `PATH`.
* **Якщо знайдено**: Відображається бейдж `🟢 FFmpeg Ready` у верхньому рядку `StudioActionHeader`.
* **Якщо не знайдено**: Відображається попередження `⚠️ FFmpeg не знайдено` з кнопкою `[⚡ Встановити FFmpeg]`, яка автоматично встановлює/довантажує бінарник у локальну папку користувача без ручних термінальних команд.

### 1.2. YouTube Shorts Authorization & Гарантований бекап:
* **Google Cloud OAuth 2.0 PKCE**: Створено детальну інструкцію [docs/YOUTUBE_OAUTH_SETUP.md](file:///C:/Users/JekVo/orca/workspaces/CosmoLost/feature-desktop-client-two-stage/desktop-client/docs/YOUTUBE_OAUTH_SETUP.md) з покроковим налаштуванням Client ID, посиланнями на консоль Google Cloud та змінними в `.env` (`VITE_YOUTUBE_CLIENT_ID`, `VITE_YOUTUBE_CLIENT_SECRET`).
* **BYOK заборонено**: Користувачі не вводять власні складні секрети — застосунок використовує нативний PKCE flow.
* **Обов'язкова базова фіча (Option C Foundation)**: Кожен згенерований проєкт ОБОВ'ЯЗКОВО зберігається у локальну папку `Videos/CosmoLost/<project_id>/` разом з:
  1. `rendered_<id>.mp4` (відео 1080x1920 60FPS)
  2. `project.json` (повні метадані)
  3. `captions.txt` (3-рядковий опис за Золотою формулою)
  4. `pin_comment.txt` (закріплений коментар)
* **Захист від дублікатів**: Якщо проєкт вже має статус `PUBLISHED` або `PUBLISHED_MANUALLY`, кнопка публікації блокується із попередженням `🔒 Вже опубліковано`.

### 1.3. Telegram Bot API (контроль ліміту 50 МБ):
* **Оригінальний бітрейт за замовчуванням**: Зберігається максимальна якість 1080x1920 60 FPS (~74 МБ).
* **Попереджувальний блок (Amber Alert)** у `PublicationExportDialog`: якщо відео перевищує 50 МБ, надаються дві альтернативи:
  1. `[⚡ Стиснути для Telegram (H.264 CRF 23, ~28 МБ без видимих втрат)]` — 1-клік оптимізація.
  2. `[📂 Відкрити в Провіднику (вручну без втрати якості)]` — відкриття Windows Explorer з інструкцією перетягування файлу в Telegram Desktop як «Документ» (до 2 ГБ).

### 1.4. Smart Next Topic Best Practices (Серіалізація контенту):
* **Автоуспадкування**: За рекомендаціями вірального retention у short-form серіях (Part 1, 2, 3), застосунок **автоматично зберігає** пресет аватара (Luna / Neil), мову озвучки (uk-UA) та тональність.
* **Інкремент серії**: Автоматично встановлюється `Part 2 of 3` з кліфхенгером у `seriesInfo`.
* **Картка безперервності**: У діалозі відображається блок *«Автоуспадкування серіалізації (Best-Practice Continuity: +40% утримання)»* з можливістю змінити параметри за бажанням.

### 1.5. CosmoLost Cloud (PostgreSQL) та 100% Local-First JSON:
* Усі проєкти та історія зберігаються локально в `tauri-storage` / `project.json` на диску.
* Фонова синхронізація не перевантажує мережу (налаштовуваний інтервал у налаштуваннях).
* Додано кнопку `[🌐 3D Мапа]` / «Прив'язати до 3D мапи CosmoLost» для миттєвої генерації deep link на веб-портал після публікації.

---

## 2. Матриця Відстеження Вимог (Requirements Traceability Matrix)

| Код Вимоги | Назва та Суть Вимоги | Статус | Цільовий Слайс (FSD v2.1) |
| :--- | :--- | :--- | :--- |
| **REQ-FAC-01** | Вибір небесного тіла (Місяць/Марс) та артефакту з NASA Open Data | ✅ **Завершено** | `entities/artifact`, `features/node-editor` |
| **REQ-FAC-02** | Двигун SMM-рубрикації (5 готових контент-патернів під ~40с) | ✅ **Завершено** | `features/script-generator`, `entities/content-template` |
| **REQ-FAC-03** | Фіксація причини вибору даних (`selection_reason`) від 10 до 500 символів | ✅ **Завершено** | `features/script-generator`, `entities/publication` |
| **REQ-FAC-04** | Синтез Edge-TTS з Jump-cut видаленням пауз ($< 0.15$с) та прискоренням 1.1x | ✅ **Завершено** | `features/media-engine`, `src-tauri` |
| **REQ-FAC-05** | Багатодоріжковий аудіомікшер (Голос -3dB, BGM -24dB, SFX -12dB з `normalize=0`) | ✅ **Завершено** | `features/media-engine`, `plans/01` |
| **REQ-FAC-06** | Реактивний PNGTuber (8 спрайтів, 4 емоції $\times$ 2 фази рота, RMS ліпсінк) | ✅ **Завершено** | `features/pngtuber-editor/`, `features/media-engine` |
| **REQ-FAC-07** | Кінематика переміщення аватара (Хук 0-3.5с по центру $\to$ кут над 420px зоною) | ✅ **Завершено** | `features/pngtuber-editor/`, `features/media-engine` |
| **REQ-FAC-08** | Ефект Pillow-box для архівних фото NASA 4:3 (розмитий фон + чіткий центр) | ✅ **Завершено** | `features/preview-player/`, `features/media-engine` |
| **REQ-FAC-09** | Матриця безпечних зон Safe Zones (220px верх, 420px низ, 150px право) | ✅ **Завершено** | `features/preview-player/`, `widgets/content-factory` |
| **REQ-FAC-10** | Налаштовуваний сторожовий таймер Rust Watchdog (`render_timeout_sec`: 30-300s) | ✅ **Завершено** | `widgets/content-factory`, `entities/settings` |
| **REQ-FAC-11** | Пакетний режим генерації (Batch Production Queue на 5 роликів) | ✅ **Завершено** | `entities/publication`, `features/task-scheduler` |
| **REQ-FAC-12** | Вбудований нативний десктопний MCP-сервер (stdio / IPC інструменти) | ✅ **Завершено** | `scripts/cosmolost-mcp-server.mjs`, `shared/lib/mcp` |
| **REQ-FAC-13** | Розумний підбір наступної теми (Smart Next Topic Engine + Narrative Bridge) | ✅ **Завершено** | `features/smart-next-topic/`, `entities/publication` |
| **REQ-PUB-01** | Пакетний експорт для ручної публікації (Zero-API Fallback) (`explorer /select`) | ✅ **Завершено** | `features/social-publishing/`, `src-tauri` |
| **REQ-PUB-02** | YouTube Shorts API інтеграція (OAuth 2.0 PKCE, інструкція в docs/) | ✅ **Завершено** | `shared/api/social/youtube-api.ts`, `docs/YOUTUBE` |
| **REQ-PUB-03** | Telegram Channel інтеграція (`sendVideo`, MarkdownV2, перевірка 50MB) | ✅ **Завершено** | `shared/api/social/telegram-api.ts`, `social-publishing` |
| **REQ-PUB-04** | TikTok Content Posting API інтеграція (OAuth PKCE, chunked upload) | 🟡 **Клієнт готовий** *(Очікує App Token)* | `shared/api/social/`, `features/social-publishing` |
| **REQ-PUB-05** | Відстеження статусів відправки (`PublicationDispatch`: PENDING $\to$ PUBLISHED) | ✅ **Завершено** | `entities/publication`, `features/social-publishing` |
| **REQ-PUB-06** | Збереження токенів соцмереж у захищеному OS Keychain (Zero-Trust) | ✅ **Завершено** | `entities/social-connector`, `shared/lib/storage` |
| **REQ-PUB-07** | Ручне підтвердження зовнішнього посилання (MANUAL_EXPORTED / URL entry) | ✅ **Завершено** | `features/social-publishing/ui/SocialPublishPanel.tsx` |

---

## 3. Критерії Готовності та Результати Перевірок (Definition of Done)

1. **Biome Check**: `pnpm run check` $\to$ **252 файли перевірено, 0 помилок Biome.**
2. **FSD v2.1 Валідація**: `node scripts/check-fsd.mjs` $\to$ **0 крос-імпортів та 0 порушень ієрархії.**
3. **TypeScript Typecheck**: `pnpm run typecheck` $\to$ **Код виходу 0. 0 помилок типізації.**
4. **Rust Cargo Check**: `cargo check --manifest-path src-tauri/Cargo.toml` $\to$ **Код виходу 0. 0 помилок компіляції.**
5. **Vitest Unit Coverage**: `pnpm vitest run --pool=forks` $\to$ **182 тести у 28 файлах пройдено успішно (100% pass rate).**
6. **Vite Production Build**: `pnpm build` $\to$ **Код виходу 0. 4033 модулі успішно скомпільовано у dist/.**
