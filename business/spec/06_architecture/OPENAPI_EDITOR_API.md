# CosmoLost Editor & FastMCP API — OpenAPI 3.1 Специфікація (OPENAPI_EDITOR_API.md)

> **Контур**: Десктопна «Фабрика контенту» (`/api/v1/editor/`), Шлюз FastMCP (`/mcp/`) та Завантажувач (`/api/v1/loader/`)  
> **Версія специфікації**: `v1.0.0 (OpenAPI 3.1.0)`  
> **Цільова аудиторія**: Desktop App (Tauri v2 + Chakra UI), ШІ-агенти (Gemini, Claude)  
> **Сумісність із БД**: Строго **8 існуючих серверних таблиць** PostgreSQL (ЖОДНИХ нових моделей Django!)  
> **Дата оновлення**: 14 листопада 2026 року  

---

## 1. Архітектурні Принципи: Local-First та Нульові Нові Таблиці БД

Відповідно до затвердженого архітектурного рішення, **нові моделі до бази даних Django НЕ додаються**.

### Принцип «Local-First / Клієнтська автономія»:
1. **Зберігання проектів на ПК**: Усі чернетки монтажного столу, розбивка на слайди (`VideoScriptSlide`), таймлайни, закешовані B-roll файли та OAuth-токени соцмереж зберігаються **виключно локально** на комп'ютері користувача у папці `%APPDATA%/CosmoLost/` (SQLite / локальні JSON-файли).
2. **Нульове навантаження на сервер**: Сервер не зберігає проекти користувачів і не створює нових сутностей у PostgreSQL.
3. **Роль Редактор API**: Бекенд виступає виключно як **постачальник перевірених знань NASA**:
   * Віддає SMM-структури рубрик із вбудованих констант коду (`GET /editor/templates/`).
   * Формує монтажний медіапакет із таблиць `artifacts` та `artifact_media` (`GET /editor/artifacts/{id}/assets/`).
   * Динамічно рекомендує тему наступного ролика за зв'язками між місіями (`POST /editor/recommend-next-topic/`).
4. **Роль Серверного FastMCP Шлюзу**: Надає зовнішнім ШІ-агентам (Gemini / Claude) 8 інструментів для читання 8 таблиць БД без RAG.

---

## 2. Матриця Даних: Поля API $\leftrightarrow$ Існуючі 8 Таблиць БД

| Ендпоінт / Інструмент | Поле / Дія | Джерело даних у PostgreSQL | Логіка та обробка |
|---|---|---|---|
| `GET /editor/templates/` | `id`, `rubric_name`, `target_duration_sec`, `slide_structure` | **Вбудовані константи Django** (без таблиць) | Готові структури рубрик (~40с, Safe Zones) |
| `GET /editor/artifacts/{id}/assets/` | `tts_script.en` | `artifacts.first_person_monologue` | Англійський оригінал монологу для озвучки |
| | `tts_script.uk` | *(Динамічний адаптер)* | Локалізований текст для українського Edge-TTS |
| | `seo_caption` | `artifacts` + `missions` | Сформований 3-рядковий SEO опис із `#cosmolost` |
| | `pin_comment` | `artifacts.cause_of_deactivation` | Дискусійне питання із знаком `?` наприкінці |
| | `high_res_photos[]` | `artifact_media.media_url` | Фотографії високої роздільності для FFmpeg |
| | `model_3d_glb_url` | `artifacts.model_3d_url` | Прямий лінк на `.glb` з репозиторію NASA 3D |
| `POST /editor/recommend-next-topic/` | `suggested_artifact_id`, `narrative_bridge`, `suggested_hook` | `artifacts` JOIN `missions` | Пошук споріднених або контрастних апаратів у БД |
| **FastMCP Tools** (8 тулзів) | Прямі SQL / ORM запити | Строго 8 таблиць БД | Читання каталогів, приладів, телеметрії |

---

## 3. Повна Специфікація OpenAPI 3.1 (YAML-блок)

```yaml
openapi: 3.1.0
info:
  title: CosmoLost Editor, FastMCP & Ingestion API
  version: 1.0.0
  description: API for Desktop Content Factory (Local-First) and Server FastMCP AI Gateway. Strictly utilizes existing 8 PostgreSQL tables without new Django models.
servers:
  - url: https://cosmolost.lihtar.org/api/v1
    description: Production Server
  - url: http://localhost:8000/api/v1
    description: Local Dev Server

paths:
  # ===========================================================================
  # 1. EDITOR API: РЕДАКТОР ДЕСКТОПА (LOCAL-FIRST)
  # ===========================================================================
  /editor/templates/:
    get:
      tags:
        - Editor Templates
      summary: Список SMM-рубрик та таймлайн-структур
      description: Повертає дефолтні конфігурації вертикальних відео (~40 секунд) із безпечними зонами (Safe Zones). Дані повертаються з конфігурації без створення нових таблиць.
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ContentTemplate'

  /editor/templates/{id}/:
    get:
      tags:
        - Editor Templates
      summary: Отримати деталі структури рубрики
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContentTemplate'
        '404':
          $ref: '#/components/responses/NotFound'

  /editor/artifacts/{id}/assets/:
    get:
      tags:
        - Editor Assets
      summary: Монтажний медіапакет артефакту
      description: |
        Формує повний пакет фактів, адаптований під відеовиробництво:
        * Текст монологу для Edge-TTS (en / uk)
        * Готовий 3-рядковий SEO опис та перший закріплений Pin Comment
        * Фотографії NASA високої роздільності для локального кешування
        * Пряме посилання на 3D-модель .glb
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EditorAssetBundle'
        '404':
          $ref: '#/components/responses/NotFound'

  /editor/recommend-next-topic/:
    post:
      tags:
        - Editor Recommendations
      summary: Розумний підбір наступної теми (Smart Next Topic Engine)
      description: На основі поточного артефакту та рубрики виконує семантичний запит до таблиць artifacts і missions для створення серійності контенту.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RecommendNextTopicRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecommendNextTopicResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

  # ===========================================================================
  # 2. INGESTION API: СИНХРОНІЗАЦІЯ ДАНИХ З NASA
  # ===========================================================================
  /loader/sync-nasa-catalog/:
    post:
      tags:
        - Ingestion
      summary: Примусова синхронізація з каталогами NASA
      description: Адміністративний запуск фонового оновлення даних з NSSDCA та Lunar Manmade Catalog у таблиці artifacts і missions.
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, example: "COMPLETED" }
                  synced_records: { type: integer, example: 142 }
                  duration_sec: { type: number, example: 3.2 }

components:
  schemas:
    ContentTemplate:
      type: object
      required: [id, rubric_name, target_duration_sec, slide_structure]
      properties:
        id:
          type: string
          example: "last-sol-drama"
        rubric_name:
          type: string
          example: "Останній день на зв'язку"
        target_duration_sec:
          type: integer
          minimum: 15
          maximum: 60
          example: 40
        safe_zone_preset:
          type: string
          example: "PILLOWBOX_9_16"
        slide_structure:
          type: array
          items:
            type: object
            required: [slide_index, type, duration_sec, safe_zone_layout]
            properties:
              slide_index: { type: integer, example: 1 }
              type: { type: string, enum: [HOOK, B_ROLL_FACTS, DRAMA_PEAK, SEAMLESS_LOOP_CTA] }
              duration_sec: { type: number, example: 3.5 }
              safe_zone_layout: { type: string, example: "FULLSCREEN_AVATAR" }

    EditorAssetBundle:
      type: object
      required: [artifact_id, name, tts_script, seo_caption, pin_comment, high_res_photos]
      properties:
        artifact_id:
          type: string
          example: "opportunity-rover"
        name:
          type: string
          example: "Opportunity Rover"
        tts_script:
          type: object
          required: [uk, en]
          properties:
            uk: { type: string, example: "Мій годинник зупинився на Sol 5111..." }
            en: { type: string, example: "My clock stopped on Sol 5111..." }
        seo_caption:
          type: object
          required: [line1_hook, line2_seo, line3_tags]
          properties:
            line1_hook: { type: string, example: "Чому вчені NASA мовчали про Sol 5111? 👇" }
            line2_seo: { type: string, example: "Повна історія Opportunity на Марсі. 3D-мапа: cosmolost.lihtar.org" }
            line3_tags: { type: string, example: "#cosmolost #nasa #mars #opportunity" }
        pin_comment:
          type: string
          example: "Як ви вважаєте, чи варто в майбутньому забрати марсоходи на Землю у музей?"
        high_res_photos:
          type: array
          items: { type: string, format: uri }
        model_3d_glb_url:
          type: string
          format: uri
          nullable: true

    RecommendNextTopicRequest:
      type: object
      required: [current_artifact_id, rubric_id, selection_reason]
      properties:
        current_artifact_id:
          type: string
          example: "spirit-rover"
        rubric_id:
          type: string
          example: "last-sol-drama"
        selection_reason:
          type: string
          minLength: 10
          maxLength: 500
          example: "Застрягання колеса в піщаній пастці Troy та замерзання"

    RecommendNextTopicResponse:
      type: object
      required: [suggested_artifact_id, suggested_artifact_name, narrative_bridge, suggested_hook, suggested_rubric_id, recommended_pin_comment]
      properties:
        suggested_artifact_id: { type: string, example: "opportunity-rover" }
        suggested_artifact_name: { type: string, example: "Opportunity Rover (MER-B)" }
        narrative_bridge: { type: string, example: "Поки Spirit замерзав у пісках, його близнюк Opportunity пройшов понад 45 км..." }
        suggested_hook: { type: string, example: "А ви знали, що близнюк застряглого Spirit здійснив марсіанське диво?" }
        suggested_rubric_id: { type: string, example: "last-sol-drama" }
        recommended_pin_comment: { type: string, example: "Хто з двох марсоходів мав героїчнішу долю: Spirit чи Opportunity?" }

  responses:
    NotFound:
      description: Ресурс не знайдено
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "NOT_FOUND" }
              message: { type: string }
    BadRequest:
      description: Некоректні параметри запиту
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "BAD_REQUEST" }
              message: { type: string }
```

---

## 4. Специфікація Серверного FastMCP Шлюзу (8 Інструментів)

Шлюз FastMCP (`lihtar.org/mcp/`) використовує транспорт SSE / Stdio і працює за стандартом Model Context Protocol. Усі інструменти працюють строго на читання 8 таблиць БД без використання RAG:

### 1. `search_artifacts`
```json
{
  "name": "search_artifacts",
  "description": "Direct relational search across artifacts on Moon and Mars.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "celestial_body": { "type": "string", "enum": ["moon", "mars"] },
      "artifact_type": { "type": "string" },
      "limit": { "type": "integer", "default": 20 }
    }
  }
}
```

### 2. `get_artifact_details`
```json
{
  "name": "get_artifact_details",
  "description": "Fetch verified technical passport, monologue, and lifetime dates.",
  "parameters": {
    "type": "object",
    "properties": { "artifact_id": { "type": "string" } },
    "required": ["artifact_id"]
  }
}
```

### 3. `get_mission_manifest`
```json
{
  "name": "get_mission_manifest",
  "description": "List all hardware items deposited on the surface by a specific NASA mission.",
  "parameters": {
    "type": "object",
    "properties": { "mission_id": { "type": "string" } },
    "required": ["mission_id"]
  }
}
```

### 4. `get_last_sol_chronology`
```json
{
  "name": "get_last_sol_chronology",
  "description": "Fetch final telemetry and status from traverse_waypoints before losing radio contact.",
  "parameters": {
    "type": "object",
    "properties": { "artifact_id": { "type": "string" } },
    "required": ["artifact_id"]
  }
}
```

### 5. `get_science_discoveries`
```json
{
  "name": "get_science_discoveries",
  "description": "Get instruments and discoveries with kid-friendly stories and PDS scientific facts.",
  "parameters": {
    "type": "object",
    "properties": { "artifact_id": { "type": "string" } },
    "required": ["artifact_id"]
  }
}
```

### 6. `get_verified_citations`
```json
{
  "name": "get_verified_citations",
  "description": "Retrieve official NSSDCA ID, PDS archive links, and mandatory NASA attribution statements.",
  "parameters": {
    "type": "object",
    "properties": { "artifact_id": { "type": "string" } },
    "required": ["artifact_id"]
  }
}
```

### 7. `get_3d_and_media_assets`
```json
{
  "name": "get_3d_and_media_assets",
  "description": "Direct open links to 3D .glb models and archival NASA photos.",
  "parameters": {
    "type": "object",
    "properties": { "artifact_id": { "type": "string" } },
    "required": ["artifact_id"]
  }
}
```

### 8. `list_active_passive_artifacts`
```json
{
  "name": "list_active_passive_artifacts",
  "description": "Find passive retroreflectors and sample tubes functioning without batteries.",
  "parameters": {
    "type": "object",
    "properties": { "celestial_body": { "type": "string", "enum": ["moon", "mars"] } }
  }
}
```

---

## 5. Нативний Десктопний MCP та Tauri IPC (Локальне Ядро ПК)

Виконуються **строго на машині користувача** у десктопному клієнті:
* **`create_video_task`**: Створює завдання монтажу в локальній черзі ПК.
* **`get_render_status`**: Перевіряє хід рендерингу FFmpeg та локальний шлях `.mp4`.
* **`trigger_social_publish`**: Запускає локальний воркер публікації у соцмережі.
* **`batch_generate_rubric`**: Пакетна генерація серії роликів у локальну папку.
* **Tauri IPC команди**: `connect_platform_account`, `list_platform_connectors`, `dispatch_publication_multi`, `open_folder_with_video`, `copy_to_clipboard`.
