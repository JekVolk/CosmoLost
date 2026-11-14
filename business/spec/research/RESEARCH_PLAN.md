# План Досліджень Проєкту CosmoLost (spec/research/RESEARCH_PLAN.md)

Цей документ є **операційним планом дослідницького контуру** проєкту **CosmoLost** (команда «Space Ліхтар» у рамках NASA Space Apps Challenge 2026: *«Abandoned but not Forgotten»*). Тут зафіксовано теми досліджень, дослідницькі запитання, перевірочні гіпотези, джерела пошуку та статус виконання.

Результати досліджень складаються у відповідні підкаталоги `spec/research/` з присвоєнням унікальних ID (`[ID: RES-*]`, `[ID: COMP-*]`, `[ID: INT-*]`, `[ID: BENCH-*]`, `[ID: MKT-*]`).

---

## 1. Реєстр Дослідницьких Завдань (Research Tracker)

| ID | Тема дослідження | Що саме шукаємо (Ключові питання) | Джерела пошуку | Відповідальний | Статус | Цільовий файл результату |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`RES-01`** | **Зовнішні джерела та API NASA** | Структура *Catalogue of Manmade Material on the Moon*, MMGIS ендпоінти роверів, Treks WMTS тайли карт, Image/Video Library API, Horizons API, ліміти та ліцензія Public Domain | Офіційні портали NASA (api.nasa.gov, trek.nasa.gov, images-api.nasa.gov, MMGIS, PDS) | `domain-researcher` | `PLANNED` | [`spec/research/integrations/INT-01_nasa_apis.md`](./integrations/INT-01_nasa_apis.md) |
| **`RES-02`** | **API соцмереж для публікації** | Можливості прямого завантаження відео в YouTube Data API (Shorts), TikTok Direct Post API, Instagram Reels, Telegram/Threads/Reddit; ліміти, квоти, верифікація та fallback-сценарії | Документація Google Cloud, TikTok for Developers, Meta for Developers, Telegram Bot API | `domain-researcher` | `PLANNED` | [`spec/research/integrations/INT-02_social_publishing.md`](./integrations/INT-02_social_publishing.md) |
| **`RES-03`** | **Десктопний монтажний рушій** | Використання статичного FFmpeg sidecar у Tauri, алгоритм склейки слайд-шоу/відео 1080x1920, накладання аудіо, ефектів та субтитрів, нодовий редактор сценаріїв (React Flow) | Tauri Sidecar Guides, FFmpeg CLI docs, React Flow documentation | `frontend-dev` / `backend-dev` | `PLANNED` | [`spec/research/integrations/INT-03_desktop_video_engine.md`](./integrations/INT-03_desktop_video_engine.md) |
| **`RES-04`** | **Технології TTS (Озвучка)** | Безкоштовні та якісні рішення озвучки українською та англійською мовами: Edge-TTS (нейронні голоси MS), Piper TTS (офлайн CPU), підключення ключів ElevenLabs/OpenAI | Edge-TTS repo, Piper TTS benchmarks, ElevenLabs API | `domain-researcher` | `PLANNED` | [`spec/research/integrations/INT-04_tts_engines.md`](./integrations/INT-04_tts_engines.md) |
| **`RES-05`** | **3D-візуалізація планет на Three.js** | Архітектура рендерингу сфери планет у Three.js (SphereGeometry, OrbitControls, Raycaster, текстурні мозаїки NASA Treks, кластеризація точок, імпорт .glb моделей через GLTFLoader) | Three.js docs, NASA Solar System Treks WMTS, NASA 3D Resources | `ui-ux-designer` / `frontend-dev` | `PLANNED` | [`spec/research/benchmarks/BENCH-01_3d_planet_maps.md`](./benchmarks/BENCH-01_3d_planet_maps.md) |
| **`RES-06`** | **Протокол MCP та RAG-шлюз** | Розробка FastMCP сервера для підключення LLM (Claude, Gemini, Antigravity) до БД CosmoLost; методи пошуку по базі, видача верифікованих фактів та обов'язкових посилань на першоджерела | FastMCP Python SDK, Model Context Protocol spec | `backend-dev` / `domain-researcher` | `PLANNED` | [`spec/research/integrations/INT-05_mcp_rag_gateway.md`](./integrations/INT-05_mcp_rag_gateway.md) |
| **`RES-07`** | **Конкурентний аналіз та РЕСП** | Аналіз аналогів (NASA Eyes, Solar System Treks, Space Engine), їхні недоліки для молодіжної аудиторії, формулювання РЕСП (Різниця, Ефективність, Спеціалізація, Простота) | Офіційні сайти NASA, освітні космічні платформи | `domain-researcher` | `PLANNED` | [`spec/research/competitors/COMP-01_space_storytelling.md`](./competitors/COMP-01_space_storytelling.md) |
| **`RES-08`** | **Контент-стратегія та віральні хуки** | Структура утримання уваги для Shorts/Reels/TikTok (3-сек хук, Safe Zones, PNGTuber state machine, кінетичні субтитри, аудіодизайн, 3-рядковий SEO опис та Pin Comment) | Дослідження `MKT-01`, воркшоп `Створення IT-контенту для соцмереж.md` | `domain-researcher` | `COMPLETED` | [`spec/research/market/MKT-01_shorts_retention_and_rubrics.md`](./market/MKT-01_shorts_retention_and_rubrics.md) |
| **`RES-09`** | **Безпека, збереження ключів та антифрод** | Локальне безпечне збереження API-ключів соцмереж та ШІ на клієнті у Tauri (OS Keychain), експорт/імпорт налаштувань, захист публічного Django API та ліцензії NASA Credits | Tauri Store / Keyring plugins, OWASP Desktop Security, NASA Media Guidelines | `domain-researcher` / `qa-tester` | `PLANNED` | [`spec/research/market/RISK-01_security_and_limits.md`](./market/RISK-01_security_and_limits.md) |

---

## 2. Детальні картки досліджень (Research Briefs)

### [ID: RES-01] Зовнішні джерела та API NASA (Вхідні потоки даних)
* **Мета та контекст**: Забезпечити бекенд перевіреними історичними даними, координатами та медіаматеріалами NASA без галюцинацій та без перевантаження сторонніх сервісів.
* **Критичність**: Висока (Блокує MVP БД та парсер).
* **Що шукаємо**:
  1. Детальний перелік артефактів на Місяці та Марсі з координатами, масою та роками місії.
  2. Доступність GeoJSON-маршрутів пересування роверів (Perseverance, Curiosity, Opportunity, Spirit) через MMGIS / PDS.
  3. Можливість підвантаження супутникових тайлів NASA Trek WMTS.
  4. Ліміти API (`api.nasa.gov` — 1000 запитів/год, безкоштовні ендпоінти без ключів).
  5. Правила копірайту та ліцензії Public Domain.
* **Гіпотези**:
  * `[ID: HYP-01]`: Одноразовий парсинг та кешування даних у локальну БД Django знімає залежність від зовнішніх рейт-лімітів NASA.
* **Цільовий файл**: `spec/research/integrations/INT-01_nasa_apis.md`

---

### [ID: RES-02] API соціальних мереж та автоматична публікація (Вихідний потік)
* **Мета та контекст**: Визначити технічні можливості та бар'єри автоматичної публікації контенту з десктопного додатку.
* **Критичність**: Висока (Впливає на архітектуру «Фабрики контенту»).
* **Що шукаємо**:
  1. YouTube Data API v3 (`Videos: insert`): чи дозволяє Google безкоштовно вантажити Shorts, ліміти квот (10 000 units/добу, 1600 units/відео).
  2. TikTok API: чи відкритий Direct Post API для незалежних розробників без юридичної особи.
  3. Meta Graph API (Instagram Reels): складність модерації App Review.
  4. Telegram Bot API та Threads/Reddit: простота реалізації публікації текстових постів із фото.
* **Гіпотези**:
  * `[ID: HYP-02]`: Для хакатону надійними каналами є YouTube Data API та Telegram Bot API; для TikTok та Instagram необхідний fallback у вигляді збереження готового `.mp4` для завантаження вручну.
* **Цільовий файл**: `spec/research/integrations/INT-02_social_publishing.md`

---

### [ID: RES-03] Десктопний монтажний рушій (Desktop Video Engine)
* **Мета та контекст**: Реалізувати локальний генератор відео в десктопному застосунку на Tauri + TypeScript.
* **Критичність**: Висока (Ядро функціоналу «Фабрики контенту»).
* **Що шукаємо**:
  1. Інтеграція FFmpeg як sidecar у бінарник Tauri для Windows/macOS/Linux.
  2. Команди та скрипти склейки слайд-шоу, накладання музики, ефектів затухання, субтитрів та оверлеїв у вертикальний формат 1080x1920.
  3. UI-компоненти для побудови сценарію відео: нодові редактори (React Flow) або покрокові майстри (Wizards).
* **Гіпотези**:
  * `[ID: HYP-03]`: FFmpeg через Tauri sidecar здатний змонтувати 30-секундний ролик за 5–10 секунд локально на машині користувача без залучення серверних потужностей.
* **Цільовий файл**: `spec/research/integrations/INT-03_desktop_video_engine.md`

---

### [ID: RES-04] Технології TTS (Нейронна озвучка контенту)
* **Мета та контекст**: Забезпечити створення озвучених відеороликів українською та англійською мовами.
* **Критичність**: Середня.
* **Що шукаємо**:
  1. Можливості та стабільність `edge-tts` (нейронні голоси Microsoft безкоштовно без реєстрації).
  2. Якість українських голосів (`uk-UA-PolinaNeural`, `uk-UA-OstapNeural`) та англійських (`en-US-GuyNeural`, `en-US-JennyNeural`).
  3. Можливість підключення ключів ElevenLabs або OpenAI TTS для користувачів, які хочуть преміум-озвучку.
* **Гіпотези**:
  * `[ID: HYP-04]`: `edge-tts` забезпечує студійну якість озвучки обома мовами і може запускатися локально або через легкий бекенд-ендпоінт безкоштовно.
* **Цільовий файл**: `spec/research/integrations/INT-04_tts_engines.md`

---

### [ID: RES-05] 3D-візуалізація планет на Three.js (Вебпортал)
* **Мета та контекст**: Забезпечити високу продуктивність та плавність відображення 3D-сфери Місяця та Марса на Three.js з тисячами точок артефактів.
* **Критичність**: Висока (Головний екран вебпорталу).
* **Що шукаємо**:
  1. Реалізація сфери планет у Three.js: вибір геометрії (`SphereGeometry`), накладання текстур/нормалей NASA Treks, оптимізація через `TextureLoader`.
  2. Механізми швидкого виявлення кліків та ховерів через `Raycaster` або інстансинг точок (`InstancedMesh`) для 2 000+ маркерів без просідання FPS.
  3. Інтеграція `GLTFLoader` для відображення детальних 3D-моделей (.glb) артефактів на сторінках об'єктів.
* **Гіпотези**:
  * `[ID: HYP-05]`: Використання Three.js із `InstancedMesh` та `OrbitControls` дозволяє тримати стабільні 60 FPS на десктопі та мобільних пристроях при відображенні всього масиву точок.
* **Цільовий файл**: `spec/research/benchmarks/BENCH-01_3d_planet_maps.md`

---

### [ID: RES-06] Протокол MCP (Model Context Protocol) та RAG-шлюз
* **Мета та контекст**: Надати зовнішнім ШІ-агентам (Gemini, Claude, Antigravity) доступ до перевірених фактів NASA без вигадок.
* **Критичність**: Висока (Ключова архітектурна фіча хакатону).
* **Що шукаємо**:
  1. Реалізація MCP-сервера на Python за допомогою FastMCP.
  2. Склад методів: пошук артефактів, отримання історії, телеметрії та обов'язкових посилань на джерела (Citations).
  3. Алгоритм пошуку по базі даних: повнотекстовий пошук (Postgres Full-Text Search) vs pgvector для швидкої відповіді.
* **Гіпотези**:
  * `[ID: HYP-06]`: FastMCP у зв'язці з Django ORM дозволяє розгорнути робочий MCP-шлюз за мінімальний час та легко підключати його до Gemini/Claude.
* **Цільовий файл**: `spec/research/integrations/INT-05_mcp_rag_gateway.md`

---

### [ID: RES-07] Конкурентний аналіз та формулювання РЕСП (УТП)
* **Мета та контекст**: Довести журі NASA Space Apps унікальність та високу практичну цінність CosmoLost.
* **Критичність**: Середня (Захист проєкту та бізнес-модель).
* **Що шукаємо**:
  1. Прямі аналоги: NASA Eyes, Solar System Treks, Space Engine, космічні енциклопедії.
  2. Слабкі місця аналогів: пасивність, відсутність у молодіжних медіа, суха наукова мова.
  3. Формулювання РЕСП (Різниця, Ефективність, Спеціалізація, Простота).
* **Гіпотези**:
  * `[ID: HYP-07]`: Поєднання наукової достовірності NASA з вірусними форматами TikTok/Shorts та MCP-шлюзом вирішує проблему залучення нового покоління до науки.
* **Цільовий файл**: `spec/research/competitors/COMP-01_space_storytelling.md`

---

### [ID: RES-08] Контент-стратегія, рубрики та вірусна драматургія
* **Мета та контекст**: Створити шаблони сценаріїв, які гарантують високе утримання уваги (retention) глядачів у Shorts/TikTok.
* **Критичність**: Середня.
* **Що шукаємо**:
  1. Структура вірусного ролика: хук (0–3 сек), інтрига, кульмінація з науковим фактом, CTA переходу на сайт.
  2. Каталог рубрик контенту: «Останній день на зв'язку», «Що залишилося на Місяці», «Космічні привиди», «Таємниці роверів».
* **Гіпотези**:
  * `[ID: HYP-08]`: Шаблонізація структури сторітелінгу дозволяє генерувати якісні ролики без ручного копірайтингу.
* **Цільовий файл**: `spec/research/market/MKT-01_shorts_retention_and_rubrics.md`

---

### [ID: RES-09] Безпека, збереження ключів та антифрод
* **Мета та контекст**: Убезпечити користувацькі API-ключі та захистити інфраструктуру проєкту.
* **Критичність**: Висока (Безпека десктопного клієнта).
* **Що шукаємо**:
  1. Збереження API-ключів соцмереж та ШІ в зашифрованому локальному сховищі десктопу (OS Keyring / Tauri store).
  2. Захист публічного Django API та MCP-ендпоінтів від спаму (rate limiting без авторизації).
  3. Дотримання вимог NASA щодо зазначення авторства (Credits / Attribution).
* **Гіпотези**:
  * `[ID: HYP-09]`: Локальне зберігання чутливих токенів на комп'ютері користувача повністю знімає ризики витоку даних через наш бекенд.
* **Цільовий файл**: `spec/research/market/RISK-01_security_and_limits.md`
