# CosmoLost Desktop Studio (Фабрика Контенту v3.0)

> **Кросплатформенна десктопна студія для автоматизованого виробництва вірусних науково-популярних вертикальних відео (Shorts / Reels / TikTok) та верифікованого дослідження покинутого космічного обладнання.**  
> Створено в межах хакатону **NASA Space Apps Challenge 2026** (Команда: *Space Ліхтар*).

---

## 1. 🌌 Огляд Проєкту

Понад 60 років дослідження космосу залишили сотні апаратів на Місяці та Марсі. Офіційні каталоги NASA PDS/NSSDCA є сухими й недоступними для широкої аудиторії, а ручне створення якісного відеоконтенту займає 4+ години.

**CosmoLost Desktop Studio** — це автономна **Local-First студія контенту**, що скорочує час виробництва ролика до **30 секунд**:
- **11-нодовий орієнтований пайплайн (`@xyflow/react`)**: візуальне керування даними NASA, генерацією монологів, синтезом мови та композитингом.
- **9:16 Shorts Монітор**: інтерактивний плеєр із розміткою Safe Zones (YouTube Shorts, TikTok, Instagram Reels) та ефектом Pillow-Box для архівних фотографій $4:3$.
- **Реактивний PNGTuber Аватар**: ліпсінк на базі RMS-амплітуди аудіодоріжки, 8-спрайтова матриця емоцій (Idle, Expert, Shock, Hype) та кастомний студійний редактор.
- **Smart Next Topic Continuity Engine**: алгоритм серійності контенту на базі семантичного зв'язку місій та причини вибору (`selection_reason`) із 88% прогнозованим ретеншном.
- **ШІ-Лабораторія фрагментів (Student BYOK Mode)**: формулювання тримодальних промптів для Veo 3.1 (9:16 vertical), Nano Banana 2 (8K Hasselblad) та Lyria Audio, копіювання в 1 клік, Drag & Drop заміна асетів та локальний проксі-міст.
- **Багатоканальна дистрибуція**: автопостинг у YouTube Shorts (OAuth 2.0 PKCE resumable upload), Telegram Channel бота або експорт у системний Explorer ОС.

---

## 2. 🛠 Технічний Стек

* **Ядро десктопа**: [Tauri v2](https://v2.tauri.app/) (Rust 1.92, безпечна ізоляція процесів, нативні IPC-команди).
* **Фронтенд**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/).
* **Дизайн-система**: [Chakra UI v3](https://chakra-ui.com/) (сувора заборона Tailwind CSS, використання семантичних токенів кольорів `blue`, `orange`, `slate`, темна/світла теми).
* **Нодовий редактор**: [@xyflow/react v12](https://reactflow.dev/) (React Flow) з кастомними нодами та валідацією DAG.
* **Архітектура**: **Feature-Sliced Design (FSD v2.1)** (`app` $\to$ `pages` $\to$ `widgets` $\to$ `features` $\to$ `entities` $\to$ `shared`).
* **Аудіо та відеомонтаж**: Локальний [FFmpeg Sidecar](https://ffmpeg.org/) (H.264/AAC, 1080x1920, 60 FPS) + [Edge-TTS](https://github.com/rany2/edge-tts) (`uk-UA-OstapNeural` та `en-US-GuyNeural`) з Jump-cut обрізкою пауз.
* **Менеджмент стану**: [Zustand v5](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query/latest) + `createStoreMigrator` (автоматична Zod-міграція сховища `LazyStore`).
* **Автоматизація та тестування**: [Tauri MCP Bridge](https://crates.io/crates/tauri-plugin-mcp-bridge) (порт `9223`), [Vitest 5](https://vitest.dev/), [Biome](https://biomejs.dev/).

---

## 3. 📂 Архітектурна Структура (FSD v2.1)

```
desktop-client/src/
├── app/                  # Провайдери, стилі, глобальний HashRouter, MainLayout
├── pages/                # Сторінки (ContentFactory, Overview, FSD, IPC, Scheduler, MCP, Settings)
├── widgets/              # Композиційні віджети (ContentFactory, NodeEditor, Monitor, Catalog)
├── features/             # Бізнес-фічі
│   ├── generative-lab/   # ШІ-Лабораторія фрагментів (Veo 3.1, Nano Banana, Lyria, Dropzone)
│   ├── pngtuber-editor/  # Студія 8 спрайтів та створення кастомних аватарів
│   ├── smart-next-topic/ # Continuity Engine підбору тем та серійності
│   ├── node-editor/      # Граф нод (@xyflow/react) та аналізатор віральності хуків
│   ├── gameplay-broll/   # Процедурний геймплейний B-Roll (Parkour Moon/Mars)
│   ├── social-publishing/# YouTube OAuth PKCE, Telegram та Explorer експорт
│   └── settings-mgmt/    # Керування профілями, таймаутами GPU та BYOK-ключами
├── entities/             # Доменні моделі та сховища
│   ├── artifact/         # Артефакти NASA (Opportunity, Spirit, InSight, Apollo 11)
│   ├── content-template/ # 6 канонічних SMM-рубрик (last-sol-drama, tech-explain тощо)
│   ├── publication/      # Проєкт ролика, таймлайн слайдів, субтитри, черга рендерингу
│   ├── social-connector/ # Сховище коннекторів платформ
│   ├── scheduler/        # Фоновий планувальник автопостингу
│   └── settings/         # Локальні налаштування з Zod-валідацією та безпекою
└── shared/               # Утиліти, API-клієнт, i18n, Chakra тема, UI-компоненти
```

---

## 4. 🚀 Швидкий Старт та Команди

### Встановлення залежностей:
```powershell
pnpm install
```

### Запуск десктопного клієнта в режимі розробки:
```powershell
# Запуск Vite веб-сервера (порт 1420)
pnpm --filter desktop-client dev

# Запуск повноцінного нативного вікна Tauri v2 з MCP Bridge
pnpm --filter desktop-client tauri:dev
```

### Перевірка коду, лінтинг та FSD архітектура:
```powershell
# Biome Linter + Formatter + FSD Boundary Check
pnpm --filter desktop-client check

# TypeScript перевірка типів
pnpm --filter desktop-client typecheck
```

### Запуск тестів:
```powershell
# Запуск 29 тестових сьютів (189 тестів)
pnpm --filter desktop-client test
```

### Збірка релізного пакету:
```powershell
pnpm --filter desktop-client build
pnpm --filter desktop-client tauri build
```

---

## 5. 🔐 Zero-Trust BYOK Безпека (Bring Your Own Key)

Усі конфіденційні дані зберігаються **виключно локально на машині користувача** (у зашифрованому Tauri Store / `localStorage`):
* `VITE_YOUTUBE_CLIENT_ID` — Google OAuth 2.0 PKCE Client ID (без client_secret!).
* `VITE_TELEGRAM_BOT_TOKEN` та `VITE_TELEGRAM_CHAT_ID` — авторизація Telegram-каналу.
* `VITE_GEMINI_API_KEY` — ключ Google AI Studio.
* Токени та персональні ключі **НІКОЛИ** не надсилаються на центральний бекенд CosmoLost (нульовий ризик витоку секретів).

---

## 6. 🤖 Tauri MCP Автоматизація

Додаток містить інтегрований плагін `tauri-plugin-mcp-bridge` (порт `9223`), який надає автономним ШІ-агентам (Claude, Gemini, Antigravity) повний набір інструментів:
* `driver_session` — підключення до запущеного екземпляра програми.
* `webview_dom_snapshot` — отримання семантичного дерева доступності інтерфейсу.
* `webview_interact` — кліки, скрол, введення тексту та виклик модальних вікон.
* `webview_screenshot` — зняття скріншотів робочого вікна 1080x1920 у реальному часі.
* `ipc_execute_command` — прямий виклик Rust-команд бекенда (`get_system_info`, `ping`, `list_platform_connectors`, `detect_cli_tool`, `render_video_ffmpeg`).

---

## 7. 📄 Ліцензія

Розроблено командою **Space Ліхтар** для конкурсу **NASA Space Apps Challenge 2026**.  
Дані та 3D-моделі належать **NASA / JPL-Caltech** та поширюються згідно з Open Data Policy.
