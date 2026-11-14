# Інженерний Протокол API та Матриця Трасування Даних БД (API_DATABASE_PROTOCOL_SPECIFICATION.md)

> **Проєкт**: CosmoLost («Покинуті, але не забуті»)  
> **Версія протоколу**: `v0.5.8 (APPROVED)`  
> **Стандарт специфікації**: OpenAPI 3.1.0 & Model Context Protocol (FastMCP 2024 / Tauri Native IPC)  
> **Дата релізу**: 14 листопада 2026 року  
> **Статус аудиту цілісності**: `100% COVERAGE & DATA VERIFIED`  
> **Файл OpenAPI 3.1 YAML**: [`openapi.yaml`](./openapi.yaml)  

---

## 1. Архітектурні Принципи та Контури Протоколу

Платформа **CosmoLost** побудована на взаємодії 4 чітко розмежованих контурів:
1. **Вебпортал API (`/api/v1/portal/`)**: Високопродуктивний шар для 3D-сцени Three.js (глобуси Місяця та Марса, фільтри, кластеризація артефактів, детальні картки, наукові відкриття та відео спільноти).
2. **Редактор API (`/api/v1/editor/`)**: Спеціалізований інтерфейс для десктопної «Фабрики контенту» (Tauri v2). Служить для отримання монтажних пакетів (TTS скрипти, 3-рядкові SEO-описи, фотографії NASA високої роздільності) та централізованого збереження текстів.
3. **Серверний FastMCP Шлюз (`lihtar.org/mcp/`)**: Протокол прямого доступу для зовнішніх ШІ-агентів (Gemini, Claude) до верифікованої бази даних NASA без галюцинацій та без важких векторних баз (Direct Relational & Full-Text Search).
4. **Нативний Десктопний MCP та Tauri IPC**: Локальний шар на комп'ютері креатора для запуску автономного монтажу FFmpeg, керування ліпсингом PNGTuber та публікації у соцмережі.

### Фундаментальні закони збереження даних:
* **Закон «Zero-Media Server Load»**: Сервер бази даних PostgreSQL зберігає **виключно структуровані тексти, координати, числові показники телеметрії та лінки на відкриті CDN**. Сервер **ніколи не приймає і не зберігає важкі відеофайли чи B-roll фотографії**.
* **Закон «Local-First / Клієнтська автономія»**: Важкий монтаж FFmpeg, синтез мови Edge-TTS, обрізка пауз Jump-cut та рендеринг виконуються на обладнанні користувача. Відеофайли залишаються на диску креатора або заливаються напряму в YouTube Shorts чи TikTok.
* **Централізоване зберігання текстів**: Усі тексти сценаріїв, монологи від першої особи (en-US), 3-рядкові описи та `selection_reason` зберігаються на сервері для бекапу, шарингу та роботи розумного генератора тем (Smart Next Topic Engine).

---

## 2. Глибокий Аудит Сутностей Бази Даних (Перевірка наявності даних)

У результаті перехресного аналізу вимог API, фізичної схеми БД PostgreSQL 16 (`cosmolost_db_package/models.py`), коду бекенду Django (`backend/core/models.py`) та бізнес-специфікації проведено повну ревізію наявності даних.

### 2.1. Ревізія 8 базових серверних таблиць

| № | Таблиця БД | Призначення | Наявність полів для API | Джерело походження даних (Source) |
|---|---|---|:---:|---|
| 1 | **`CELESTIAL_BODIES`** | Фізичні параметри планет та тайли NASA Treks | **100% OK** | Офіційні довідники NASA Planetary Fact Sheets, шари NASA Treks WMTS |
| 2 | **`MISSIONS`** | Експедиції та програми запуску NASA | **100% OK** | Головний каталог NASA NSSDCA Master Catalog (NSSDC ID) |
| 3 | **`ARTIFACTS`** | Покинуті апарати, монолог en-US, координати | **100% OK** | Каталог *Manmade Material on the Moon*, NASA PDS, GitHub 3D Models |
| 4 | **`TRAVERSE_WAYPOINTS`**| Маршрути та телеметрія роверів/дронів | **100% OK** | Телеметрія NASA MMGIS GeoJSON, PDS Analyst's Notebook |
| 5 | **`SCIENTIFIC_DISCOVERIES`**| Наукові факти та бортові прилади | **100% OK** | Офіційні звіти наукових команд NASA PDS, прес-релізи JPL |
| 6 | **`ARTIFACT_MEDIA`** | Архівні фотографії та аудіозаписи | **100% OK** | NASA Photojournal (PIA-коди), відкритий CDN `images-assets.nasa.gov` |
| 7 | **`COMMUNITY_PUBLICATIONS`**| Відео спільноти за місіями з першоджерелами | **100% OK** | Внесення авторами через `POST /api/v1/portal/community-publications/` |

---

### 2.2. Виявлені прогалини та Архітектурне рішення (Entity Gap Analysis)

Під час аудиту виявлено 2 важливих моменти, які необхідно зафіксувати для бекенд-інженера:

#### Прогалина 1: Збереження синхронізованих проєктів (`POST /api/v1/editor/projects/sync/`)
* **Проблема**: У релізі v0.5.8 фізична модель БД була оптимізована до 7+1 таблиць, де акцент був зроблений на публікаціях спільноти. Проте ендпоінт `POST /api/v1/editor/projects/sync/` (введений у v0.5.7) надсилає повний текстовий склад проєкту: `project_id`, `artifact_id`, `template_id`, `status`, `selection_reason`, `target_duration_sec`, `render_timeout_sec`, `script_slides` (JSON), `caption_line1`, `caption_line2_seo`, `caption_line3_tags`, `pin_comment`.
* **Рішення**: Для підтримки повної функціональності синхронізації проєктів у серверній БД PostgreSQL додається **Таблиця №8 (або 9) `PROJECT_TEXT_SYNCS`** (або `PUBLICATION_PROJECTS`). Вона містить строго текстові дані (кілька кілобайтів на проєкт) і не порушує закон Zero-Media Server Load!

```sql
-- DDL для збереження текстових проектів десктопу
CREATE TABLE project_text_syncs (
    id VARCHAR(64) PRIMARY KEY, -- project_id (UUID)
    artifact_id VARCHAR(64) NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    template_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    selection_reason TEXT NOT NULL,
    target_duration_sec INTEGER NOT NULL DEFAULT 40,
    render_timeout_sec INTEGER NOT NULL DEFAULT 40,
    script_slides JSONB NOT NULL DEFAULT '[]',
    caption_line1 VARCHAR(128) NOT NULL,
    caption_line2_seo VARCHAR(512) NOT NULL,
    caption_line3_tags VARCHAR(256) NOT NULL,
    pin_comment VARCHAR(280) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_proj_sync_art ON project_text_syncs(artifact_id);
```

#### Прогалина 2: Джерело шаблонів рубрик (`GET /api/v1/editor/templates/`)
* **Проблема**: Де зберігати дефолтні SMM-рубрики («Останній сол», «Як це працює», «Таємниці Місяця», «Краш-тест»)?
* **Рішення**: Шаблони рубрик є відносно статичними конфігураціями. На бекенді реалізується або як сидова таблиця `CONTENT_TEMPLATES`, або як кешований реестр Django Constants/JSON, який повертається через API. Поля повністю відповідають моделі: `id`, `rubric_name`, `target_duration_sec`, `slide_structure`.

---

## 3. Матриця Трасування Даних: Ендпоінти API $\to$ Сутності БД $\to$ Джерела Даних

Нижче наведено вичерпну таблицю полів для кожного ендпоінту: звідки беруться дані, чи зберігаються вони в базі, чи розраховуються на льоту.

### 3.1. Контур Portal API (`/api/v1/portal/`)

#### 1. `GET /api/v1/portal/celestial-bodies/`
| Поле JSON відповіді | Тип даних | Таблиця БД | Колонка БД | Джерело походження та логіка |
|---|---|---|---|---|
| `id` | `string` | `celestial_bodies` | `id` | Первинний ключ ('moon', 'mars') |
| `name` | `string` | `celestial_bodies` | `name` | Локалізована назва («Місяць», «Марс») |
| `radius_km` | `float` | `celestial_bodies` | `radius_km` | Екваторіальний радіус з NASA Fact Sheet |
| `gravity_ms2` | `float` | `celestial_bodies` | `gravity_ms2` | Поверхнева гравітація (1.62 / 3.72) |
| `coordinate_system_type`| `enum` | `celestial_bodies` | `coordinate_system_type` | `SELENOGRAPHIC` або `PLANETOCENTRIC_360` |
| `wmts_tile_url` | `url` | `celestial_bodies` | `wmts_tile_url` | Шаблон тайлів NASA Treks WMTS |

---

#### 2. `GET /api/v1/portal/artifacts/` (Каталог для Three.js сцени)
| Поле JSON відповіді | Тип даних | Таблиця БД | Колонка БД | Джерело походження та логіка |
|---|---|---|---|---|
| `id` | `string` | `artifacts` | `id` | Унікальний слаг ('opportunity-rover') |
| `name` | `string` | `artifacts` | `name` | Назва обладнання |
| `mission_name` | `string` | `missions` | `name` | Отримується через `JOIN missions ON ...` |
| `celestial_body` | `string` | `artifacts` | `celestial_body_id` | Зовнішній ключ ('moon', 'mars') |
| `is_nasa_hardware` | `boolean` | `artifacts` | `is_nasa_hardware` | Прапорець офіційного обладнання NASA |
| `artifact_type` | `enum` | `artifacts` | `artifact_type` | Класифікатор 10 типів обладнання |
| `operational_status` | `enum` | `artifacts` | `operational_status` | `DORMANT`, `PASSIVE_ACTIVE`, `DESTROYED` |
| `coordinates.latitude` | `float` | `artifacts` | `latitude` | Широта знаходження $[-90..90]$ |
| `coordinates.longitude`| `float` | `artifacts` | `longitude` | Довгота (Місяць $[-180..180]$, Марс $[0..360]$) |
| `coordinates.elevation_m`| `float` | `artifacts` | `elevation_m` | Висота за альтиметрією LOLA/MOLA |
| `coordinates.coordinate_system`|`enum`| `celestial_bodies`| `coordinate_system_type` | Отримується через зв'язок з планетою |
| `coordinates.location_name`| `string` | `artifacts` | `location_name` | Назва кратера або рівнини посадки |
| `cluster_info.is_clustered`| `bool` | *(Обчислюване)* | — | Динамічний розрахунок відстані ($<500$ м) |
| `cluster_info.cluster_id`| `string` | *(Обчислюване)* | — | ID групи найближчих об'єктів |
| `cluster_info.cluster_count`|`int` | *(Обчислюване)* | — | Кількість апаратів у даному кластері |
| `mass_kg` | `float` | `artifacts` | `mass_kg` | Посаджена суха маса (NASA NSSDCA) |
| `is_featured` | `boolean` | `artifacts` | `is_featured` | Пріоритетний об'єкт Tier 1 |
| `preview_image_url` | `url` | `artifact_media` | `media_url` | Перше фото з `category='SURFACE_FIRST_PERSON'` або `LAST_KNOWN_PHOTO` |
| `cosmolost_url` | `url` | *(Обчислюване)* | — | `format("https://cosmolost.lihtar.org/artifacts/{}", id)` |

---

#### 3. `GET /api/v1/portal/artifacts/{id}/` (Повна картка об'єкта)
| Поле JSON відповіді | Тип даних | Таблиця БД | Колонка БД | Джерело походження та логіка |
|---|---|---|---|---|
| `id`, `name`, `type`, `status`| — | `artifacts` | Відповідні поля | Паспортні дані об'єкта |
| `mission` | `object` | `missions` | `id`, `name`, `nssdca_id`, `agency` | `JOIN missions` |
| `last_contact_sol` | `int` | `artifacts` | `last_contact_sol` | Останній Сол зв'язку (Sol 5111 для Opportunity) |
| `cause_of_deactivation`| `text` | `artifacts` | `cause_of_deactivation` | Інженерна причина виходу з ладу |
| `first_person_monologue`| `text`| `artifacts` | `first_person_monologue` | Атмосферний монолог строго **англійською (en-US)** |
| `model_3d_url` | `url` | `artifacts` | `model_3d_url` | Пряме посилання на `.glb` з NASA 3D Resources |
| `media[]` | `array` | `artifact_media` | `id`, `media_category`, `media_url`, `caption`, `credit` | Всі медіафайли апарата |
| `discoveries[]` | `array` | `scientific_discoveries` | `instrument_acronym`, `title`, `kid_friendly_story`, `scientific_fact` | Наукові відкриття та прилади |

---

#### 4. `GET /api/v1/portal/community-publications/` та `POST`
| Поле JSON | Запит / Відповідь | Таблиця БД | Колонка БД | Валідація та джерело |
|---|:---:|---|---|---|
| `id` | Відповідь | `community_publications` | `id` | Автоматично `gen_random_uuid()` |
| `mission_id` | Обидва | `community_publications` | `mission_id` | Обов'язковий FK на `missions.id` |
| `artifact_id` | Обидва | `community_publications` | `artifact_id` | Опціональний FK на `artifacts.id` |
| `title` | Обидва | `community_publications` | `title` | Рядок до 256 символів |
| `video_url` | Обидва | `community_publications` | `video_url` | Посилання на YouTube Shorts або TikTok |
| `platform_type` | Обидва | `community_publications` | `platform_type` | `YOUTUBE`, `TIKTOK`, `REELS`, `OTHER` |
| `source_references` | Обидва | `community_publications` | `source_references` | **Обов'язкові цитати** (PIA коди, статті PDS) |
| `author_name` | Обидва | `community_publications` | `author_name` | Нікнейм автора (до впровадження Google Auth) |
| `is_approved` | Відповідь | `community_publications` | `is_approved` | Дефолт `false`, публікується після модерації |

---

### 3.2. Контур Редактор API (`/api/v1/editor/`)

#### 1. `GET /api/v1/editor/artifacts/{id}/assets/` (Монтажний медіапакет)
| Поле JSON відповіді | Тип даних | Таблиця / Джерело | Колонка / Логіка формування |
|---|---|---|---|
| `artifact_id` | `string` | `artifacts` | `id` |
| `name` | `string` | `artifacts` | `name` |
| `tts_script.en` | `text` | `artifacts` | `first_person_monologue` (підготовлений для читання з паузами) |
| `tts_script.uk` | `text` | *(Генератор / Локалізація)* | Перекладений адаптований монолог для українського голосу |
| `seo_caption.line1_hook`| `string` | *(Шаблонізатор фактів)* | Сформований хук (до 100 симв): *«Чому вчені NASA мовчали про Sol 5111? 👇»* |
| `seo_caption.line2_seo` | `string` | `artifacts` + `missions` | SEO-опис із посиланням на `cosmolost.lihtar.org` |
| `seo_caption.line3_tags`| `string` | *(Генератор тегів)* | 4–5 хештегів, включаючи обов'язковий `#cosmolost` |
| `pin_comment` | `string` | *(Шаблонізатор)* | Відкрите дискусійне питання з обов'язковим знаком `?` наприкінці |
| `high_res_photos[]` | `array[url]` | `artifact_media` | Масив `media_url` високої роздільності для монтажу FFmpeg |
| `model_3d_glb_url` | `url` | `artifacts` | `model_3d_url` |

---

#### 2. `POST /api/v1/editor/projects/sync/` (Синхронізація текстів)
| Поле JSON запиту | Тип даних | Таблиця БД | Колонка БД | Правило та валідація |
|---|---|---|---|---|
| `project_id` | `uuid` | `project_text_syncs` | `id` | Унікальний UUID проєкту на десктопі |
| `artifact_id` | `string` | `project_text_syncs` | `artifact_id` | FK на цільовий артефакт |
| `template_id` | `string` | `project_text_syncs` | `template_id` | Обрана рубрика ('last-sol-drama') |
| `status` | `enum` | `project_text_syncs` | `status` | `DRAFT`, `RENDERING`, `RENDERED`, `PUBLISHED` |
| `selection_reason` | `text` | `project_text_syncs` | `selection_reason` | **Обов'язкове** обґрунтування вибору (10..500 симв) |
| `target_duration_sec`| `int` | `project_text_syncs` | `target_duration_sec` | 15..60 секунд (дефолт 40с) |
| `render_timeout_sec` | `int` | `project_text_syncs` | `render_timeout_sec` | 30..300 секунд (для повільних GPU) |
| `script_slides` | `jsonb` | `project_text_syncs` | `script_slides` | Масив слайдів із текстом диктора `narrator_text` |
| `caption_line1` | `string` | `project_text_syncs` | `caption_line1` | Перший інтригуючий рядок (до 100 симв) |
| `caption_line2_seo` | `string` | `project_text_syncs` | `caption_line2_seo` | Ключові факти та лінк на CosmoLost |
| `caption_line3_tags`| `string` | `project_text_syncs` | `caption_line3_tags` | 4–5 хештегів із `#cosmolost` |
| `pin_comment` | `string` | `project_text_syncs` | `pin_comment` | Дискусійне питання із знаком `?` |

---

#### 3. `POST /api/v1/editor/recommend-next-topic/` (Smart Next Topic Engine)
* **Вхідні дані**: `current_artifact_id`, `rubric_id`, `selection_reason`.
* **Логіка пошуку в БД**:
  1. Знаходить артефакти тієї ж або суміжної програми (`missions`), які ще не мають синхронізованих проєктів у `project_text_syncs`.
  2. Враховує контекст: якщо поточний об'єкт загинув від пилової бурі на Марсі (`selection_reason`), алгоритм шукає контрастний об'єкт (наприклад, ядерний RTG апарат Curiosity або марсохід Spirit, що застряг у пісках).
  3. Формує сюжетний міст (Narrative Bridge) та промпт для закріпленого коментаря.
* **Результат**: `suggested_artifact_id`, `suggested_artifact_name`, `narrative_bridge`, `suggested_hook`, `suggested_rubric_id`, `recommended_pin_comment`.

---

## 4. Специфікація Серверного FastMCP Шлюзу (Для ШІ-агентів Gemini / Claude)

Працює на сервері за стандартом FastMCP (Model Context Protocol). Надає прямий доступ до реляційної бази даних **БЕЗ векторного RAG**.

```
+-----------------------------------------------------------------------------------+
|                           FASTMCP SERVER TOOLS (8 TOOLS)                          |
+-----------------------------+-----------------------------------------------------+
| Tool Name                   | Database Query & Action                             |
+-----------------------------+-----------------------------------------------------+
| 1. search_artifacts         | Full-text SearchVector('name', 'location_name')     |
| 2. get_artifact_details     | SELECT * FROM artifacts WHERE id = :id              |
| 3. get_mission_manifest     | SELECT * FROM artifacts WHERE mission_id = :id      |
| 4. get_last_sol_chronology  | SELECT telemetry_snapshot FROM traverse_waypoints   |
| 5. get_science_discoveries  | SELECT * FROM scientific_discoveries WHERE art_id   |
| 6. get_verified_citations   | SELECT nssdca_id, pds_links, attribution STATEMENT  |
| 7. get_3d_and_media_assets  | SELECT model_3d_url, media_url FROM artifact_media  |
| 8. list_active_passives     | WHERE operational_status IN ('PASSIVE_ACTIVE', ...) |
+-----------------------------+-----------------------------------------------------+
```

---

## 5. Нативний Десктопний MCP та Tauri IPC (Локальний контур ПК)

Для автономного запуску монтажу локальними агентами десктопний клієнт надає:

### 5.1. Native Desktop MCP Tools:
* `create_video_task(artifact_id, rubric_id, language, enable_pngtuber)` $\to$ створює локальний таск у черзі.
* `get_render_status(task_id)` $\to$ статус прогресу FFmpeg, локальний шлях `.mp4`.
* `trigger_social_publish(task_id, platform)` $\to$ ініціює доставку в YouTube Shorts / Telegram.
* `batch_generate_rubric(rubric_id, count, language)` $\to$ пакетна генерація 5–10 роликів.

### 5.2. Tauri IPC Commands (Frontend $\leftrightarrow$ Rust Backend):
* `connect_platform_account(args)` $\to$ OAuth2 PKCE або валідація токена бота Telegram.
* `list_platform_connectors()` $\to$ список активних підключень.
* `dispatch_publication_multi(project_id, connector_ids)` $\to$ паралельне завантаження відео.
* `open_folder_with_video(project_id)` $\to$ системне відкриття файлу в Explorer / Finder з одночасним копіюванням SEO-тексту в буфер обміну ОС.
* `copy_to_clipboard(text, type)` $\to$ запис специфічного тексту (Pin Comment) у буфер.

---

## 6. Інструкція з Використання Специфікації для Розробників

1. **Файл OpenAPI 3.1 YAML**: Завантажте готовий та валідований файл [`openapi.yaml`](./openapi.yaml). Його можна напряму імпортувати у **Swagger Editor**, **Postman**, **Insomnia** або згенерувати клієнтські типи через `openapi-typescript`.
2. **Бекенд розробникам (`backend/web_api` та `backend/desktop_api`)**:
   * Використовуйте моделі з `backend/core/models.py`.
   * Зареєструйте урли у `backend/web_api/urls.py` відповідно до контуру `/portal/`.
   * Зареєструйте урли у `backend/desktop_api/urls.py` відповідно до контуру `/editor/`.
   * Додайте таблицю `project_text_syncs` у Django ORM для синхронізації проектів.
3. **Фронтенд та Десктоп розробникам**:
   * Використовуйте контракти DTO та схеми відповідей без ризику невідповідності типів.
