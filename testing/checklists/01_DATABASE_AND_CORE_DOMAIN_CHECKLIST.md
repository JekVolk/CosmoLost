# Чекліст: База Даних PostgreSQL 16 та Core Домен (01_DATABASE_AND_CORE_DOMAIN_CHECKLIST.md)

> **Модуль**: `backend/core/` та `backend/users/`  
> **Статус аудиту Batch 1**: **98.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість тестів**: 17 тестів (`core/tests.py`, `users/tests.py`) — всі успішні  
> **Нормативна база**: `01_ENTITIES.md`, `02_FIELDS_AND_VALIDATIONS.md`, `02_DATA_MODEL_ERD.md`

---

## 1. Архітектурне Обмеження: Строго 8 Таблиць

- [x] **`celestial_bodies` (`CelestialBody`)**:
  - [x] Первинний ключ `id` (SlugField: `moon`, `mars`).
  - [x] Фізичні константи: `radius_km`, `gravity_ms2`, `day_length_hours`, `avg_temperature_c`.
  - [x] Система координат: `coordinate_system_type` (`SELENOGRAPHIC`, `PLANETOCENTRIC_360`).
  - [x] WMTS тайли: `wmts_tile_url` (шаблон NASA Solar System Treks).
- [x] **`missions` (`Mission`)**:
  - [x] Унікальний ідентифікатор каталогу: `nssdca_id` (з індексом).
  - [x] Хронологія: `launch_date`, `landing_date`, `end_date`.
  - [x] Атрибуція: `agency` (NASA, ESA, JAXA тощо), `summary`.
- [x] **`artifacts` (`Artifact`)**:
  - [x] Зовнішні ключі: `celestial_body` (`on_delete=models.PROTECT`), `mission` (`on_delete=models.SET_NULL`).
  - [x] Типи обладнання (10 типів): `ROVER`, `HELICOPTER`, `LANDER`, `DESCENT_STAGE`, `IMPACT_STAGE`, `INSTRUMENT`, `RETRO_REFLECTOR`, `SAMPLE_TUBE`, `ENTRY_DEBRIS`, `DEEP_SPACE_PROBE`.
  - [x] Статуси працездатності (6 статусів): `OPERATIONAL`, `DECOMMISSIONED`, `LOST_CONTACT`, `CRASHED`, `SAMPLE_STORED`, `RELIC_PASSIVE`.
  - [x] IAU-2000 координати: `latitude` ($-90..90^\circ$), `longitude` ($-180..180^\circ$ або $0..360^\circ$).
  - [x] Монолог від першої особи (en-US): `first_person_monologue`.
  - [x] 3D Модель: `model_3d_url` (NASA GitHub CDN `.glb`).
  - [x] Прапорці вибірки: `is_featured`, `is_nasa_hardware`.
- [x] **`traverse_waypoints` (`TraverseWaypoint`)**:
  - [x] Зовнішній ключ: `artifact` (`on_delete=models.CASCADE`).
  - [x] Порядок: `sol_or_step`, `latitude`, `longitude`, `elevation_m`.
  - [x] Телеметрія: `telemetry_snapshot` (JSON: power Wh, dust Tau, tilt, odometry).
- [x] **`scientific_discoveries` (`ScientificDiscovery`)**:
  - [x] Зв'язок: `artifact` (`CASCADE`).
  - [x] Подвійна наука: `scientific_fact` (PDS рівень) + `kid_friendly_story` (для школярів).
  - [x] Науковий інструмент: `instrument_acronym`.
- [x] **`artifact_media` (`ArtifactMedia`)**:
  - [x] Зв'язок: `artifact` (`CASCADE`).
  - [x] Категорії: `SURFACE_PHOTO`, `SURFACE_FIRST_PERSON`, `PANORAMA`, `ORBITAL_RECON`, `SCHEMATIC_3D`, `LAST_KNOWN_PHOTO`.
  - [x] Каталоги: `nasa_id_or_pia`, `credit`, `original_url`.
- [x] **`community_publications` (`CommunityPublication`)**:
  - [x] Зв'язок з артефактом та місією: `artifact_id`, `mission_id`.
  - [x] Платформи: `YOUTUBE_SHORTS`, `TIKTOK`, `INSTAGRAM_REELS`, `TELEGRAM`.
  - [x] Премодерація: `is_approved` (дефолт `False`).
- [x] **`users_user` (`User`)**:
  - [x] Кастомна модель користувача з прапорцями доступу.

---

## 2. Валідації та Цілісність Даних

- [x] **Нормалізація координат (`normalize_coords`)**: Метод автоматично перераховує східну довготу Марса до діапазону $[0..360^\circ]$.
- [x] **Захист від некоректних значень**: Валідатори відхиляють широти за межами $[-90..90^\circ]$ з HTTP 400/422.
- [x] **Індекси продуктивності**:
  - `artifacts(celestial_body, operational_status)` — фільтрація на мапі.
  - `artifacts(latitude, longitude)` — швидкі просторові запити.
  - `artifacts(is_featured)` — головна вітрина.
  - `traverse_waypoints(artifact, sol_or_step)` — сортування треку пересування.
  - `community_publications(is_approved, platform_type)` — фільтр затвердженого контенту.

---

## 3. Статус для Клієнта
- **Готовність**: **100%**
- **Приймання**: Затверджено. Жодних нових таблиць додавати не потрібно.
