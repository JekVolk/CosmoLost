# CosmoLost Web Portal API — OpenAPI 3.1 Специфікація (OPENAPI_PORTAL_API.md)

> **Контур**: Вебпортал CosmoLost (`/api/v1/portal/` або `/api/web/`)  
> **Версія специфікації**: `v1.0.0 (OpenAPI 3.1.0)`  
> **Цільова аудиторія**: Three.js Web Portal (React / Vite / Three.js)  
> **Сумісність із БД**: Строго **8 існуючих серверних таблиць** PostgreSQL (ЖОДНИХ нових моделей Django!)  
> **Дата оновлення**: 14 листопада 2026 року  

---

## 1. Загальний Опис та Архітектурний Контур

Шар **Portal API** оптимізований для високої швидкості читання ($<50$ мс) та публічного використання без обов'язкової реєстрації (`ROLE-WebUser`).

### Ключові задачі контуру:
1. **Ініціалізація 3D-сцени**: Надання фізичних констант Місяця та Марса (радіуси, прискорення гравітації) та шаблонів тайлів NASA Treks WMTS.
2. **Каталог артефактів для Three.js**: Видача списку апаратів із просторовими координатами, фільтрацією та кластеризацією для об'єктів на дистанціях $<500$ м (Apollo 11, Three Forks).
3. **Детальна картка артефакту**: Видача 3D-моделі `.glb`, англомовного монологу `first_person_monologue`, архівних фотографій NASA Photojournal та наукових відкриттів.
4. **Публікації спільноти**: Отримання та подання посилань на відеоролики (YouTube Shorts, TikTok) з обов'язковим зазначенням першоджерел контенту.

---

## 2. Матриця Даних: Поля API $\leftrightarrow$ 8 Таблиць PostgreSQL

Усі поля контуру Portal API витягуються **виключно з 8 затверджених таблиць БД**:

| Ендпоінт API | Поле відповіді | Таблиця БД | Колонка БД / Логіка |
|---|---|---|---|
| `GET /portal/celestial-bodies/` | `id` | `celestial_bodies` | `id` (PK: 'moon', 'mars') |
| | `name` | `celestial_bodies` | `name` |
| | `radius_km` | `celestial_bodies` | `radius_km` |
| | `gravity_ms2` | `celestial_bodies` | `gravity_ms2` |
| | `coordinate_system_type`| `celestial_bodies` | `coordinate_system_type` |
| | `wmts_tile_url` | `celestial_bodies` | `wmts_tile_url` |
| `GET /portal/artifacts/` | `id`, `name`, `type`, `status` | `artifacts` | `id`, `name`, `artifact_type`, `operational_status` |
| | `mission_name` | `missions` | `missions.name` (через `mission_id`) |
| | `celestial_body` | `artifacts` | `celestial_body_id` |
| | `coordinates.lat / lon` | `artifacts` | `latitude`, `longitude` |
| | `coordinates.location` | `artifacts` | `location_name` |
| | `is_nasa_hardware` | `artifacts` | `is_nasa_hardware` |
| | `is_featured` | `artifacts` | `is_featured` |
| | `cluster_info` | *(Обчислюване)* | Динамічна групування об'єктів у радіусі $<500$ м |
| | `preview_image_url` | `artifact_media` | Перше фото з `media_category='SURFACE_FIRST_PERSON'` |
| | `cosmolost_url` | *(Обчислюване)* | `https://cosmolost.lihtar.org/artifacts/{id}` |
| `GET /portal/artifacts/{id}/` | `first_person_monologue` | `artifacts` | `first_person_monologue` (en-US) |
| | `model_3d_url` | `artifacts` | `model_3d_url` (NASA GitHub `.glb`) |
| | `last_contact_sol` | `artifacts` | `last_contact_sol` |
| | `cause_of_deactivation` | `artifacts` | `cause_of_deactivation` |
| | `media[]` | `artifact_media` | `WHERE artifact_id = :id` |
| | `discoveries[]` | `scientific_discoveries` | `WHERE artifact_id = :id` |
| `GET .../waypoints/` | `waypoints[]` | `traverse_waypoints` | `WHERE artifact_id = :id ORDER BY sol_or_step` |
| `GET/POST .../community-publications/` | `publications[]` | `community_publications` | Строго поля таблиці `COMMUNITY_PUBLICATIONS` |

---

## 3. Повна Специфікація OpenAPI 3.1 (YAML-блок)

```yaml
openapi: 3.1.0
info:
  title: CosmoLost Web Portal API
  version: 1.0.0
  description: Public read-optimized API for CosmoLost Three.js Web Portal. Operates strictly on 8 PostgreSQL tables.
servers:
  - url: https://cosmolost.lihtar.org/api/v1/portal
    description: Production Server
  - url: http://localhost:8000/api/v1/portal
    description: Local Dev Server

paths:
  /celestial-bodies/:
    get:
      summary: Список небесних тіл
      description: Повертає параметри планет та тайли NASA Treks WMTS для Three.js сфери.
      responses:
        '200':
          description: Масив планет
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CelestialBody'

  /celestial-bodies/{id}/:
    get:
      summary: Деталі небесного тіла
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            enum: [moon, mars]
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CelestialBody'
        '404':
          $ref: '#/components/responses/NotFound'

  /artifacts/:
    get:
      summary: Каталог артефактів для Three.js сцени
      description: Отримання масиву точок артефактів із фільтрами та кластеризацією (<500м).
      parameters:
        - name: body
          in: query
          schema:
            type: string
            enum: [moon, mars]
        - name: type
          in: query
          schema:
            $ref: '#/components/schemas/ArtifactType'
        - name: status
          in: query
          schema:
            $ref: '#/components/schemas/OperationalStatus'
        - name: is_featured
          in: query
          schema:
            type: boolean
        - name: is_nasa_hardware
          in: query
          schema:
            type: boolean
        - name: cluster_distance_m
          in: query
          schema:
            type: number
            default: 500.0
        - name: search
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ArtifactListResponse'

  /artifacts/{id}/:
    get:
      summary: Повна картка артефакту
      description: Паспортні дані, монолог англійською (en-US), лінк на 3D-модель .glb, фото та наукові відкриття.
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
                $ref: '#/components/schemas/ArtifactDetail'
        '404':
          $ref: '#/components/responses/NotFound'

  /artifacts/{id}/waypoints/:
    get:
      summary: Маршрутні точки та телеметрія
      description: Хронологічний трек пересування ровера/дрона з показниками живлення та нахилу.
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
                type: array
                items:
                  $ref: '#/components/schemas/TraverseWaypoint'

  /artifacts/{id}/discoveries/:
    get:
      summary: Наукові відкриття та бортові прилади
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
                type: array
                items:
                  $ref: '#/components/schemas/ScientificDiscovery'

  /artifacts/{id}/media/:
    get:
      summary: Архівні медіафайли NASA
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
                type: array
                items:
                  $ref: '#/components/schemas/ArtifactMedia'

  /missions/:
    get:
      summary: Каталог місій запуску NASA
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MissionListResponse'

  /missions/{id}/:
    get:
      summary: Деталі місії та маніфест обладнання
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
                $ref: '#/components/schemas/MissionDetail'
        '404':
          $ref: '#/components/responses/NotFound'

  /community-publications/:
    get:
      summary: Список схвалених відео спільноти
      parameters:
        - name: mission_id
          in: query
          schema:
            type: string
        - name: artifact_id
          in: query
          schema:
            type: string
        - name: platform_type
          in: query
          schema:
            $ref: '#/components/schemas/PlatformType'
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommunityPublicationListResponse'

    post:
      summary: Подання ролика спільноти на модерацію
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommunityPublicationCreate'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CommunityPublicationSubmitResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

components:
  schemas:
    CoordinateSystemType:
      type: string
      enum: [SELENOGRAPHIC, PLANETOCENTRIC_360]

    ArtifactType:
      type: string
      enum:
        - ROVER
        - HELICOPTER
        - LANDER
        - DESCENT_STAGE
        - IMPACT_STAGE
        - INSTRUMENT
        - RETRO_REFLECTOR
        - SAMPLE_TUBE
        - ENTRY_DEBRIS
        - DEEP_SPACE_PROBE

    OperationalStatus:
      type: string
      enum:
        - DORMANT
        - PASSIVE_ACTIVE
        - DESTROYED_ON_IMPACT
        - ACTIVE_TRANSMITTING

    MediaCategory:
      type: string
      enum:
        - SURFACE_FIRST_PERSON
        - LAST_KNOWN_PHOTO
        - ORBITAL_PROOF_LROC_HIRISE
        - MODEL_3D
        - AUDIO_RECORDING

    PlatformType:
      type: string
      enum: [YOUTUBE, TIKTOK, REELS, OTHER]

    CelestialBody:
      type: object
      required: [id, name, radius_km, gravity_ms2, coordinate_system_type, wmts_tile_url]
      properties:
        id: { type: string, example: "mars" }
        name: { type: string, example: "Mars" }
        radius_km: { type: number, example: 3396.2 }
        gravity_ms2: { type: number, example: 3.72 }
        coordinate_system_type: { $ref: '#/components/schemas/CoordinateSystemType' }
        wmts_tile_url: { type: string, format: uri }

    Coordinates:
      type: object
      required: [latitude, longitude, coordinate_system, location_name]
      properties:
        latitude: { type: number, example: -1.9462 }
        longitude: { type: number, example: 354.4734 }
        elevation_m: { type: number, example: -1420.0 }
        coordinate_system: { $ref: '#/components/schemas/CoordinateSystemType' }
        location_name: { type: string, example: "Perseverance Valley" }

    ClusterInfo:
      type: object
      required: [is_clustered, cluster_count]
      properties:
        is_clustered: { type: boolean, example: false }
        cluster_id: { type: string, nullable: true }
        cluster_count: { type: integer, example: 1 }

    ArtifactSummary:
      type: object
      required: [id, name, mission_name, celestial_body, is_nasa_hardware, artifact_type, operational_status, coordinates, cluster_info, is_featured, preview_image_url, cosmolost_url]
      properties:
        id: { type: string, example: "opportunity-rover" }
        name: { type: string, example: "Opportunity Rover (MER-B)" }
        mission_name: { type: string, example: "Mars Exploration Rover - Opportunity" }
        celestial_body: { type: string, example: "mars" }
        is_nasa_hardware: { type: boolean, example: true }
        artifact_type: { $ref: '#/components/schemas/ArtifactType' }
        operational_status: { $ref: '#/components/schemas/OperationalStatus' }
        coordinates: { $ref: '#/components/schemas/Coordinates' }
        cluster_info: { $ref: '#/components/schemas/ClusterInfo' }
        mass_kg: { type: number, nullable: true, example: 185.0 }
        is_featured: { type: boolean, example: true }
        preview_image_url: { type: string, format: uri }
        cosmolost_url: { type: string, format: uri }

    ArtifactDetail:
      type: object
      required: [id, name, mission, celestial_body, artifact_type, operational_status, coordinates, is_featured, is_nasa_hardware, first_person_monologue, media, discoveries]
      properties:
        id: { type: string, example: "opportunity-rover" }
        name: { type: string, example: "Opportunity Rover (MER-B)" }
        mission:
          type: object
          properties:
            id: { type: string }
            name: { type: string }
            nssdca_id: { type: string }
        celestial_body: { type: string, example: "mars" }
        artifact_type: { $ref: '#/components/schemas/ArtifactType' }
        operational_status: { $ref: '#/components/schemas/OperationalStatus' }
        coordinates: { $ref: '#/components/schemas/Coordinates' }
        mass_kg: { type: number, nullable: true, example: 185.0 }
        last_contact_sol: { type: integer, nullable: true, example: 5111 }
        cause_of_deactivation: { type: string, nullable: true }
        is_featured: { type: boolean, example: true }
        is_nasa_hardware: { type: boolean, example: true }
        first_person_monologue: { type: string }
        model_3d_url: { type: string, format: uri, nullable: true }
        updated_at: { type: string, format: date-time }
        media:
          type: array
          items: { $ref: '#/components/schemas/ArtifactMedia' }
        discoveries:
          type: array
          items: { $ref: '#/components/schemas/ScientificDiscovery' }

    ArtifactListResponse:
      type: object
      required: [total, limit, offset, results]
      properties:
        total: { type: integer }
        limit: { type: integer }
        offset: { type: integer }
        results:
          type: array
          items: { $ref: '#/components/schemas/ArtifactSummary' }

    TraverseWaypoint:
      type: object
      required: [id, sol_or_step, latitude, longitude, elevation_m, odometry_m, telemetry_snapshot]
      properties:
        id: { type: string }
        sol_or_step: { type: integer, example: 5111 }
        latitude: { type: number }
        longitude: { type: number }
        elevation_m: { type: number }
        odometry_m: { type: number }
        telemetry_snapshot: { type: object }
        story_snippet: { type: string, nullable: true }

    ScientificDiscovery:
      type: object
      required: [id, instrument_acronym, instrument_full_name, title, kid_friendly_story, scientific_fact]
      properties:
        id: { type: string }
        instrument_acronym: { type: string, example: "Pancam" }
        instrument_full_name: { type: string }
        title: { type: string }
        kid_friendly_story: { type: string }
        scientific_fact: { type: string }

    ArtifactMedia:
      type: object
      required: [id, media_category, media_url, caption, credit]
      properties:
        id: { type: string }
        media_category: { $ref: '#/components/schemas/MediaCategory' }
        media_url: { type: string, format: uri }
        nasa_id_or_pia: { type: string, nullable: true }
        caption: { type: string }
        credit: { type: string }

    MissionDetail:
      type: object
      required: [id, nssdca_id, name, agency, summary]
      properties:
        id: { type: string }
        nssdca_id: { type: string }
        name: { type: string }
        agency: { type: string }
        launch_date: { type: string, format: date, nullable: true }
        landing_date: { type: string, format: date, nullable: true }
        end_date: { type: string, format: date, nullable: true }
        summary: { type: string }

    MissionListResponse:
      type: object
      required: [total, results]
      properties:
        total: { type: integer }
        results:
          type: array
          items: { $ref: '#/components/schemas/MissionDetail' }

    CommunityPublicationCreate:
      type: object
      required: [mission_id, title, video_url, platform_type, source_references, author_name]
      properties:
        mission_id: { type: string }
        artifact_id: { type: string, nullable: true }
        title: { type: string, maxLength: 256 }
        video_url: { type: string, format: uri }
        platform_type: { $ref: '#/components/schemas/PlatformType' }
        source_references: { type: string }
        author_name: { type: string, maxLength: 128 }

    CommunityPublicationSubmitResponse:
      type: object
      required: [id, status, is_approved, message]
      properties:
        id: { type: string, format: uuid }
        status: { type: string, example: "SUBMITTED_FOR_REVIEW" }
        is_approved: { type: boolean, example: false }
        message: { type: string }

    CommunityPublicationListResponse:
      type: object
      required: [total, results]
      properties:
        total: { type: integer }
        results:
          type: array
          items:
            type: object
            properties:
              id: { type: string, format: uuid }
              mission_id: { type: string }
              artifact_id: { type: string, nullable: true }
              title: { type: string }
              video_url: { type: string, format: uri }
              platform_type: { $ref: '#/components/schemas/PlatformType' }
              source_references: { type: string }
              author_name: { type: string }
              is_approved: { type: boolean }
              created_at: { type: string, format: date-time }

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
      description: Помилка валідації параметрів
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "BAD_REQUEST" }
              message: { type: string }
```
