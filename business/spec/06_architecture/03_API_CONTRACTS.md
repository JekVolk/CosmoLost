# Контракти API, FastMCP та Native Desktop MCP (03_API_CONTRACTS.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.3.0`  
> **Стандарт**: OpenAPI 3.1 & Model Context Protocol (FastMCP & Native MCP)

---

## 1. Контур Portal API (`/api/v1/portal/`) — для Вебпорталу

Оптимізований для читання та кешування шар публічного API вебпорталу.

### 1.1. Список небесних тіл
* **Ендпоінт**: `GET /api/v1/portal/celestial-bodies/`
* **Опис**: Повертає список планет для Three.js мапи (радіус, гравітація, тайли NASA Treks).
* **Відповідь 200 OK**:
```json
[
  {
    "id": "mars",
    "name": "Марс",
    "radius_km": 3396.2,
    "gravity_ms2": 3.72,
    "wmts_tile_url": "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg"
  },
  {
    "id": "moon",
    "name": "Місяць",
    "radius_km": 1737.4,
    "gravity_ms2": 1.62,
    "wmts_tile_url": "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg"
  }
]
```

---

### 1.2. Каталог артефактів для Three.js сцени
* **Ендпоінт**: `GET /api/v1/portal/artifacts/`
* **Query параметри**: `body` (moon/mars), `type`, `status`, `is_featured`, `cluster_distance_m` (default 500), `search`, `limit`, `offset`.
* **Відповідь 200 OK**:
```json
{
  "total": 1,
  "limit": 50,
  "offset": 0,
  "results": [
    {
      "id": "opportunity-rover",
      "name": "Opportunity Rover (MER-B)",
      "mission_name": "Mars Exploration Rover - Opportunity",
      "celestial_body": "mars",
      "is_nasa_hardware": true,
      "artifact_type": "ROVER",
      "operational_status": "DORMANT",
      "coordinates": {
        "latitude": -1.9462,
        "longitude": 354.4734,
        "coordinate_system": "PLANETOCENTRIC_360",
        "location_name": "Perseverance Valley"
      },
      "cluster_info": {
        "is_clustered": false,
        "cluster_id": null,
        "cluster_count": 1
      },
      "mass_kg": 185.0,
      "is_featured": true,
      "preview_image_url": "https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg",
      "cosmolost_url": "https://cosmolost.lihtar.org/artifacts/opportunity-rover"
    }
  ]
}
```

---

### 1.3. Повна картка артефакту
* **Ендпоінт**: `GET /api/v1/portal/artifacts/{id}/`
* **Опис**: Повертає дані для картки, лінк на 3D-модель `.glb` (для `GLTFLoader`), монолог від першої особи та наукові відкриття.

---

### 1.4. Публікації спільноти по місіях та артефактах (Community Publications)
> **Примітка щодо клієнтського UI**: Інтерфейс подачі та відображення користувацьких відео на клієнті заплановано на майбутнє (`[AI-DRAFT]`). Ендпоінти та серверні моделі реалізуються зараз для готовності бекенду.

* **Ендпоінт**: `GET /api/v1/portal/community-publications/`
* **Query параметри**: `mission_id` (опціонально), `artifact_id` (опціонально), `platform_type` (YOUTUBE/TIKTOK/REELS), `limit` (default 20), `offset` (default 0).
* **Відповідь 200 OK**:
```json
{
  "total": 1,
  "results": [
    {
      "id": "e2a1b5c4-d6e7-4f8a-9b0c-1d2e3f4a5b6c",
      "mission_id": "mars-exploration-rover-opportunity",
      "artifact_id": "opportunity-rover",
      "title": "Last Sol of Opportunity: The Storm that Never Ended",
      "video_url": "https://youtube.com/shorts/dQw4w9WgXcQ",
      "platform_type": "YOUTUBE",
      "source_references": "NASA Photojournal PIA22521, MER PDS raw imaging catalog, Sol 5111 tau readings",
      "author_name": "SpaceGeek99",
      "is_approved": true,
      "created_at": "2026-10-15T12:00:00Z"
    }
  ]
}
```

* **Ендпоінт**: `POST /api/v1/portal/community-publications/`
* **Опис**: Подання посилання на опубліковане зовнішнє відео автором контенту з прив'язкою до місії та зазначенням наукових першоджерел.
* **Тіло запиту**:
```json
{
  "mission_id": "mars-exploration-rover-opportunity",
  "artifact_id": "opportunity-rover",
  "title": "Last Sol of Opportunity: The Storm that Never Ended",
  "video_url": "https://youtube.com/shorts/dQw4w9WgXcQ",
  "platform_type": "YOUTUBE",
  "source_references": "NASA Photojournal PIA22521, MER PDS raw imaging catalog, Sol 5111 tau readings",
  "author_name": "SpaceGeek99"
}
```
* **Відповідь 201 Created**:
```json
{
  "id": "e2a1b5c4-d6e7-4f8a-9b0c-1d2e3f4a5b6c",
  "status": "SUBMITTED_FOR_REVIEW",
  "is_approved": false,
  "message": "Publication submitted successfully. It will appear on the portal once approved by moderators."
}
```

---

## 2. Контур Редактор API (`/api/v1/editor/`) — для «Фабрики контенту»

Спеціалізований API для зв'язку бекенду з десктопним додатком.

### 2.1. Отримання шаблонів рубрик
* **Ендпоінт**: `GET /api/v1/editor/templates/`
* **Відповідь 200 OK**:
```json
[
  {
    "id": "last-sol-drama",
    "rubric_name": "Останній день на зв'язку",
    "target_duration_sec": 35,
    "slide_structure": [
      { "slide_index": 1, "type": "HOOK", "duration_sec": 3, "safe_zone_layout": "FULLSCREEN_AVATAR" },
      { "slide_index": 2, "type": "B_ROLL_FACTS", "duration_sec": 12, "safe_zone_layout": "CORNER_AVATAR_CENTER_3D" },
      { "slide_index": 3, "type": "DRAMA_PEAK", "duration_sec": 15, "safe_zone_layout": "TELEMETRY_HUD_SPLIT" },
      { "slide_index": 4, "type": "SEAMLESS_LOOP_CTA", "duration_sec": 5, "safe_zone_layout": "CTA_QR_PORTAL" }
    ]
  }
]
```

---

### 2.2. Отримання монтажного медіапакету артефакту
* **Ендпоінт**: `GET /api/v1/editor/artifacts/{id}/assets/`
* **Опис**: Віддає пакет контенту, адаптований під відеогенерацію (підготовлений текст для TTS з мітками пауз, масив фотографій високої роздільності, готові 3-рядкові SEO-описи та Pin Comment).
* **Відповідь 200 OK**:
```json
{
  "artifact_id": "opportunity-rover",
  "name": "Opportunity Rover",
  "tts_script": {
    "uk": "Мій годинник зупинився на Sol 5111. Навколо мене темніло з кожною годиною...",
    "en": "My clock stopped on Sol 5111. Darkness fell across Meridiani Planum..."
  },
  "seo_caption": {
    "line1_hook": "Чому вчені NASA мовчали про те, що сталося на Sol 5111? 👇",
    "line2_seo": "Повна історія марсохода Opportunity, його останнє фото перед замерзанням та відкриття води на Марсі.",
    "line3_tags": "#космос #наука #марсохід #nasa #cosmolost"
  },
  "pin_comment": "Як ви вважаєте, чи варто в майбутньому забрати марсоходи на Землю, чи залишити їх пам'ятниками на Марсі?",
  "high_res_photos": [
    "https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg"
  ],
  "model_3d_glb_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Opportunity%20Rover/opportunity.glb"
}
```

---

### 2.3. Синхронізація текстових даних проєкту на сервер
* **Ендпоінт**: `POST /api/v1/editor/projects/sync/`
* **Опис**: Зберігає повний текстовий склад відеопроєкту (сценарій, монологи, описи, закріплений коментар та причину вибору даних) у реляційну базу PostgreSQL для бекапу та аналітики. Сервер **не приймає жодних відео- чи аудіофайлів**.
* **Тіло запиту (Request Body)**:
```json
{
  "project_id": "7b8f2d1e-9a4c-4e8b-821f-3d6a9e1b2c3d",
  "artifact_id": "opportunity-rover",
  "template_id": "last-sol-drama",
  "status": "DRAFT",
  "selection_reason": "Річниця останнього сигналу Сола 5111 та драматичне засипання сонячних батарей глобальною пиловою бурею",
  "target_duration_sec": 40,
  "render_timeout_sec": 40,
  "script_slides": [
    { "slide_index": 1, "type": "HOOK", "duration_sec": 3.0, "narrator_text": "Чому зв'язок з Opportunity обірвався саме у Солі 5111?" },
    { "slide_index": 2, "type": "B_ROLL_FACTS", "duration_sec": 15.0, "narrator_text": "Пилова буря закрила 99% сонячного світла в долині Perseverance." }
  ],
  "caption_line1": "Останній день легендарного марсохода 😱👇",
  "caption_line2_seo": "Повна історія Opportunity на Марсі. 3D-мапа: cosmolost.lihtar.org",
  "caption_line3_tags": "#cosmolost #nasa #mars #opportunity",
  "pin_comment": "Як ви вважаєте, чи варто забрати Opportunity на Землю у музей, чи залишити на Марсі?"
}
```
* **Відповідь 200 OK**:
```json
{
  "status": "SYNCED",
  "project_id": "7b8f2d1e-9a4c-4e8b-821f-3d6a9e1b2c3d",
  "synced_at": "2026-11-14T15:45:00Z"
}
```

---

### 2.4. Рекомендація теми для наступного ролика (Smart Next Topic Engine)
* **Ендпоінт**: `POST /api/v1/editor/recommend-next-topic/`
* **Опис**: На основі поточної рубрики, цільового артефакту та причини вибору даних (`selection_reason`) знаходить у базі даних релевантний наступний артефакт і генерує сюжетний міст (Narrative Bridge) для створення серійного контенту.
* **Тіло запиту (Request Body)**:
```json
{
  "current_artifact_id": "spirit-rover",
  "rubric_id": "last-sol-drama",
  "selection_reason": "Застрягання колеса в піщаній пастці Troy та замерзання в марсіанську зиму"
}
```
* **Відповідь 200 OK**:
```json
{
  "suggested_artifact_id": "opportunity-rover",
  "suggested_artifact_name": "Opportunity Rover (MER-B)",
  "narrative_bridge": "Поки Spirit замерзав у пісках кратера Гусєв, його близнюк Opportunity пройшов понад 45 кілометрів і пережив брата на 8 років...",
  "suggested_hook": "А ви знали, що близнюк застряглого Spirit здійснив справжнє марсіанське диво?",
  "suggested_rubric_id": "last-sol-drama",
  "recommended_pin_comment": "Хто з двох марсоходів мав трагічнішу долю: Spirit чи Opportunity?"
}
```

---

## 3. Серверний FastMCP Шлюз (Для ШІ-агентів Gemini / Claude)

Працює на сервері Django (`lihtar.org/mcp/`) за протоколом FastMCP (транспорт SSE та stdio, БЕЗ RAG). Мова за замовчуванням — **English**.

### 3.1. Tool: `search_artifacts`
```json
{
  "name": "search_artifacts",
  "description": "Search abandoned space hardware across the Moon and Mars using official NASA records (Direct Relational & Full-Text Search).",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search keyword (e.g., 'Opportunity', 'Apollo 11', 'retroreflector')" },
      "celestial_body": { "type": "string", "enum": ["moon", "mars", "deep_space"], "description": "Target body" },
      "artifact_type": { "type": "string", "enum": ["ROVER", "LANDER", "DESCENT_STAGE", "INSTRUMENT", "RETRO_REFLECTOR", "SAMPLE_TUBE"], "description": "Hardware category" },
      "operational_status": { "type": "string", "enum": ["DORMANT", "PASSIVE_ACTIVE", "DESTROYED_ON_IMPACT"], "description": "Current status" },
      "is_featured": { "type": "boolean", "description": "Only curated artifacts with 3D models (Tier 1)" },
      "limit": { "type": "integer", "default": 20, "description": "Maximum number of results" }
    }
  }
}
```

### 3.2. Tool: `get_artifact_details`
```json
{
  "name": "get_artifact_details",
  "description": "Retrieve comprehensive verified technical passport, coordinates, lifetime dates, deactivation cause, and story for a specific artifact.",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Unique slug identifier (e.g. 'opportunity-rover', 'apollo-11-lm-eagle')" }
    },
    "required": ["artifact_id"]
  }
}
```

### 3.3. Tool: `get_mission_manifest`
```json
{
  "name": "get_mission_manifest",
  "description": "List all pieces of hardware and debris left on the surface by a specific NASA mission.",
  "parameters": {
    "type": "object",
    "properties": {
      "mission_id": { "type": "string", "description": "Mission slug (e.g., 'apollo-11', 'apollo-15', 'mars-2020')" }
    },
    "required": ["mission_id"]
  }
}
```

### 3.4. Tool: `get_last_sol_chronology`
```json
{
  "name": "get_last_sol_chronology",
  "description": "Fetch final day/sol telemetry (tau opacity, solar power Wh, tilt angle) and last status transmission before going silent.",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Unique artifact slug" }
    },
    "required": ["artifact_id"]
  }
}
```

### 3.5. Tool: `get_science_discoveries`
```json
{
  "name": "get_science_discoveries",
  "description": "Get instruments onboard and major scientific discoveries with both rigorous facts and kid-friendly storytelling analogies.",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Unique artifact slug" }
    },
    "required": ["artifact_id"]
  }
}
```

### 3.6. Tool: `get_verified_citations`
```json
{
  "name": "get_verified_citations",
  "description": "Retrieve official NSSDCA catalog ID, PDS archive links, and mandatory NASA attribution statement for citations.",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Unique artifact slug" }
    },
    "required": ["artifact_id"]
  }
}
```

### 3.7. Tool: `get_3d_and_media_assets`
```json
{
  "name": "get_3d_and_media_assets",
  "description": "Fetch direct open URLs for 3D .glb models (from NASA 3D Resources) and orbital proof photos (LROC NAC / MRO HiRISE).",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Unique artifact slug" }
    },
    "required": ["artifact_id"]
  }
}
```

### 3.8. Tool: `list_active_passive_artifacts`
```json
{
  "name": "list_active_passive_artifacts",
  "description": "Discover hardware items that are still operational or useful today without batteries (e.g. laser retroreflectors, sample depot tubes).",
  "parameters": {
    "type": "object",
    "properties": {
      "celestial_body": { "type": "string", "enum": ["moon", "mars", "deep_space"] }
    }
  }
}
```

---

## 4. Нативний Десктопний MCP (Native Desktop MCP)

Вбудований локальний інтерфейс десктопного додатка Tauri для керування фабрикою автономними роботами та ШІ-агентами на ПК користувача.

### 4.1. Tool: `create_video_task`
```json
{
  "name": "create_video_task",
  "description": "Create an automated video rendering task in Content Factory on the local PC.",
  "parameters": {
    "type": "object",
    "properties": {
      "artifact_id": { "type": "string", "description": "Artifact slug (e.g. 'opportunity-rover')" },
      "rubric_id": { "type": "string", "enum": ["last-sol-drama", "dictionary-explain", "lunar-secrets", "crash-test"], "description": "Rubric template" },
      "language": { "type": "string", "enum": ["en", "uk"], "default": "en", "description": "Voiceover language" },
      "enable_pngtuber": { "type": "boolean", "default": true, "description": "Include reactive PNGTuber avatar with audio lip-sync" }
    },
    "required": ["artifact_id", "rubric_id"]
  }
}
```

### 4.2. Tool: `get_render_status`
```json
{
  "name": "get_render_status",
  "description": "Check local FFmpeg rendering progress and output .mp4 file path.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": { "type": "string", "description": "Local task UUID" }
    },
    "required": ["task_id"]
  }
}
```

### 4.3. Tool: `trigger_social_publish`
```json
{
  "name": "trigger_social_publish",
  "description": "Directly trigger publishing the rendered video to YouTube Shorts, Telegram, or export package to disk.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": { "type": "string", "description": "Rendered task UUID" },
      "platform": { "type": "string", "enum": ["YOUTUBE_SHORTS", "TELEGRAM", "EXPORT_FOLDER"], "description": "Publish channel" }
    },
    "required": ["task_id", "platform"]
  }
}
```

### 4.4. Tool: `batch_generate_rubric`
```json
{
  "name": "batch_generate_rubric",
  "description": "Batch generate a series of 5 to 10 short videos for a specific rubric into the local output folder.",
  "parameters": {
    "type": "object",
    "properties": {
      "rubric_id": { "type": "string", "enum": ["last-sol-drama", "tech-explain", "lunar-secrets", "billion-crash", "build-in-public"] },
      "count": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 },
      "language": { "type": "string", "enum": ["en", "uk"], "default": "en" }
    },
    "required": ["rubric_id", "count"]
  }
}
```

---

## 5. Контур Tauri Desktop IPC Контрактів (Frontend <-> Rust Backend)

Взаємодія React / Chakra UI інтерфейсу «Фабрики контенту» з нативним ядром Rust через команду `invoke('command_name', payload)`.

### 5.1. Команда: `connect_platform_account`
* **Опис**: Запуск OAuth2 PKCE або валідація токена бота для створення активного конектора.
* **Аргументи**:
```typescript
interface ConnectPlatformAccountArgs {
  platform_type: "YOUTUBE_SHORTS" | "TELEGRAM_CHANNEL" | "TIKTOK";
  auth_payload?: {
    bot_token?: string;
    chat_id?: string;
    custom_client_id?: string;
  };
}
```
* **Результат**:
```typescript
interface ConnectPlatformAccountResult {
  connector_id: string;
  platform_type: string;
  display_name: string;
  connection_status: "CONNECTED" | "ERROR";
  error_message?: string;
}
```

---

### 5.2. Команда: `list_platform_connectors`
* **Опис**: Отримання списку всіх налаштованих каналів та їх статусів підключення.
* **Результат**:
```typescript
interface PlatformConnectorDto {
  id: string;
  platform_type: string;
  display_name: string;
  auth_type: string;
  connection_status: "CONNECTED" | "DISCONNECTED" | "EXPIRED";
  is_active: boolean;
  last_connected_at: string | null;
  settings: {
    default_privacy?: "public" | "unlisted" | "private";
    auto_pin_comment?: boolean;
  };
}
```

---

### 5.3. Команда: `dispatch_publication_multi`
* **Опис**: Запуск паралельної доставки змонтованого ролика у вибрані підключені канали.
* **Аргументи**:
```typescript
interface DispatchPublicationMultiArgs {
  project_id: string;
  connector_ids: string[];
}
```
* **Результат**:
```typescript
interface DispatchPublicationMultiResult {
  project_id: string;
  dispatches: Array<{
    dispatch_id: string;
    connector_id: string;
    dispatch_status: "PENDING" | "UPLOADING" | "PUBLISHED" | "FAILED";
  }>;
}
```

---

### 5.4. Команда: `open_folder_with_video`
* **Опис**: Нативне відкриття файлового провідника операційної системи з виділенням готового файлу `.mp4` та одночасним копіюванням повного 3-рядкового SEO-пакету в системний буфер обміну.
* **Аргументи**:
```typescript
interface OpenFolderWithVideoArgs {
  project_id: string;
}
```
* **Нативна реалізація в Rust**:
  * Windows: `std::process::Command::new("explorer").arg("/select,").arg(video_path).spawn()`
  * macOS: `std::process::Command::new("open").arg("-R").arg(video_path).spawn()`
  * Linux: `std::process::Command::new("xdg-open").arg(parent_dir).spawn()`
  * Буфер обміну: `clipboard_manager.write_text(format!("{}\n\n{}\n\n{}", line1, line2, line3))`
* **Результат**:
```typescript
interface OpenFolderWithVideoResult {
  success: boolean;
  opened_path: string;
  copied_to_clipboard: boolean;
  seo_bundle_text: string;
  pin_comment_text: string;
}
```

---

### 5.5. Команда: `copy_to_clipboard`
* **Опис**: Допоміжна команда копіювання специфічного тексту (наприклад, окремо Pin Comment) у буфер обміну операційної системи.
* **Аргументи**:
```typescript
interface CopyToClipboardArgs {
  text: string;
  type: "SEO_BUNDLE" | "PIN_COMMENT";
}
```
* **Результат**: `{ success: boolean }`
