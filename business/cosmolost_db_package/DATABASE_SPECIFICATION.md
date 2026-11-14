# CosmoLost — Фізична Специфікація Бази Даних (7+1 Таблиць)

> **Версія специфікації**: `v0.5.8 (APPROVED)`  
> **Цільова СУБД**: PostgreSQL 16 (або SQLite для локальних тестів) / Django ORM  
> **Схема зв'язків**: [`erd.png`](./erd.png)  
> **Дата оновлення**: 2026-11-14  

---

## 1. Головні архітектурні принципи (Zero-Media Server Load)

1. **Ніяких важких медіафайлів у базі даних**:
   * Відеоролики та Shorts хостяться безпосередньо на **YouTube / TikTok** або зберігаються локально на комп'ютері автора.
   * Фотографії та 3D-моделі стрімляться з відкритих репозиторіїв та CDN NASA (`images-assets.nasa.gov`, GitHub Raw, Trek WMTS).
   * База даних зберігає виключно текстові метадані, координати, наукові факти та посилання ($0 витрат на зберігання гігабайтів відео).

2. **Розмежування Серверної БД та Десктопного Клієнта (Local-First)**:
   * Десктопна «Фабрика контенту» (Tauri) виконує монтаж, нарізку Jump-cut, TTS озвучення та локальний рендер FFmpeg.
   * Таймлайни слайдів (`VideoScriptSlide`), завдання черг пакетної генерації (`BatchQueueTask`) та конфіденційні токени соцмереж зберігаються **виключно локально** на машині автора в `%APPDATA%/CosmoLost/` (Zero-Trust).
   * Серверна база даних містить **7 базових таблиць космічних знань** + **1 таблицю публікацій спільноти**.

3. **Авторизація та профілі користувачів**:
   * Повноцінна реєстрація/авторизація через Google OAuth та профілі користувачів заплановані на наступний етап розробки («це як профіль реєстрації через Google, але потім»).
   * Для сумісності з майбутнім функціоналом у таблиці `COMMUNITY_PUBLICATIONS` зараз використовується поле `author_name` (нікнейм автора), яке в майбутньому можна буде мігрувати або зв'язати з зовнішнім ключем `user_id`.
   * Інтерфейс подачі користувацьких відео на клієнті знаходиться в плановому беклозі (`[AI-DRAFT]`), але модель БД та API-контракти на бекенді впроваджуються вже зараз.

---

## 2. Словник переліків (Enums)

### 2.1. `CoordinateSystemType` (Система координат небесного тіла)
* `SELENOGRAPHIC`: Селенографічна система для Місяця (довгота в діапазоні $[-180^\circ..180^\circ]$).
* `PLANETOCENTRIC_360`: Планетоцентрична система координат для Марса за каталогами IAU 2000 (східна довгота $[0^\circ..360^\circ]$).

### 2.2. `ArtifactType` (10 офіційних типів обладнання NASA)
* `ROVER`: Колісні всюдиходи та місячні ровери (Spirit, Opportunity, Apollo Lunar Roving Vehicle).
* `HELICOPTER`: Марсіанський розвідувальний атмосферний дрон (Ingenuity).
* `LANDER`: Стаціонарні дослідницькі посадочні модулі (Viking 1/2, InSight, Phoenix).
* `DESCENT_STAGE`: Посадочні ступені пілотованих місячних модулів (Apollo 11 LM Eagle).
* `IMPACT_STAGE`: Ступені ракет, навмисно розбиті об ґрунт для калібрування сейсмометрів (Saturn V S-IVB).
* `INSTRUMENT`: Автономні наукові комплекси на поверхні (сейсмометри ALSEP, датчики теплового потоку).
* `RETRO_REFLECTOR`: Пасивні лазерні куточкові відбивачі світла (Apollo 11/14/15 LRRR).
* `SAMPLE_TUBE`: Герметичні титанові трубки з відібраними зразками порід (Three Forks Sample Depot).
* `ENTRY_DEBRIS`: Відкинуті компоненти посадкової системи (Backshell, теплозахисні щити, парашути).
* `DEEP_SPACE_PROBE`: Автоматичні міжзоряні станції далекого космосу (Voyager 1/2, Pioneer 10/11).

### 2.3. `OperationalStatus` (Статус життєвого циклу апарата)
* `DORMANT`: Знеструмлений або засипаний пилом апарат (завершив роботу, очікує повернення людей).
* `PASSIVE_ACTIVE`: Пасивно працює без власних джерел живлення (лазерні відбивачі світла).
* `DESTROYED_ON_IMPACT`: Зруйнований при плановому зіткненні для сейсмічного аналізу.
* `ACTIVE_TRANSMITTING`: Продовжує передавати радіотелеметрію у Deep Space Network (Voyager 1/2).

### 2.4. `MediaCategory` (Категорія архівного медіафайлу)
* `SURFACE_FIRST_PERSON`: Панорами та селфі, зняті бортовими камерами апарата з поверхні.
* `LAST_KNOWN_PHOTO`: Фінальний кадр перед остаточною втратою зв'язку.
* `ORBITAL_PROOF_LROC_HIRISE`: Супутникові знімки високої роздільності місця стоянки з орбіти (LROC, HiRISE).
* `MODEL_3D`: Пряме посилання на інтерактивну 3D-модель `.glb` у відкритому репозиторії NASA.
* `AUDIO_RECORDING`: Архівні записи звуків посадки або марсіанського вітру (мікрофони Perseverance/InSight).

### 2.5. `PlatformType` (Платформа зовнішньої публікації)
* `YOUTUBE`: YouTube Shorts або повноформатне відео.
* `TIKTOK`: Вертикальні ролики TikTok.
* `REELS`: Відео Instagram Reels.
* `OTHER`: Інші платформи хостингу контенту.

---

## 3. Детальна специфікація 7+1 таблиць бази даних

### 3.1. `CELESTIAL_BODIES` (Небесні тіла для 3D-карти)
* `id` (`VARCHAR(32)`, **PK**): Унікальний код ('moon', 'mars').
* `name` (`VARCHAR(64)`, `NOT NULL`): Назва небесного тіла («Місяць», «Марс»).
* `radius_km` (`FLOAT`, `NOT NULL`): Екваторіальний радіус (1737.4 для Місяця, 3396.2 для Марса).
* `gravity_ms2` (`FLOAT`, `NOT NULL`): Прискорення вільного падіння (1.62 м/с² для Місяця, 3.72 м/с² для Марса).
* `coordinate_system_type` (`VARCHAR(32)`, `NOT NULL`): Перелік `CoordinateSystemType`.
* `wmts_tile_url` (`VARCHAR(512)`, `NOT NULL`): Шаблон URL тайлових мозаїк NASA Treks.
* `created_at` (`TIMESTAMP WITH TIME ZONE`, `DEFAULT NOW()`): Час створення запису.

### 3.2. `MISSIONS` (Космічні експедиції та програми запуску NASA)
* `id` (`VARCHAR(64)`, **PK**): Системний слаг місії ('apollo-11', 'mars-2020').
* `nssdca_id` (`VARCHAR(32)`, **UNIQUE**, `NOT NULL`): Офіційний каталожний код NASA (наприклад, '1969-059C').
* `name` (`VARCHAR(128)`, `NOT NULL`): Офіційна назва місії.
* `agency` (`VARCHAR(64)`, `DEFAULT 'NASA'`): Космічне агентство.
* `launch_date` (`DATE`, `NULLABLE`): Дата старту ракети з Землі.
* `landing_date` (`DATE`, `NULLABLE`): Дата посадки на поверхню.
* `end_date` (`DATE`, `NULLABLE`): Дата виходу з ладу або офіційного завершення місії.
* `summary` (`TEXT`, `NOT NULL`): Короткий опис цілей та наукової спадщини місії.

### 3.3. `ARTIFACTS` (Покинуті апарати, монолог en-US та 3D-моделі)
* `id` (`VARCHAR(64)`, **PK**): Унікальний слаг ('opportunity-rover', 'apollo-11-lm-descent').
* `mission_id` (`VARCHAR(64)`, **FK** $\to$ `MISSIONS.id`, `NOT NULL`): Зв'язок із місією доставки.
* `celestial_body_id` (`VARCHAR(32)`, **FK** $\to$ `CELESTIAL_BODIES.id`, `NOT NULL`): На якій планеті знаходиться.
* `name` (`VARCHAR(128)`, `NOT NULL`): Назва апарата («Opportunity Rover (MER-B)»).
* `artifact_type` (`VARCHAR(32)`, `NOT NULL`): Перелік `ArtifactType`.
* `operational_status` (`VARCHAR(32)`, `NOT NULL`): Перелік `OperationalStatus`.
* `latitude` (`FLOAT`, `CHECK (-90 <= latitude AND latitude <= 90)`, `NOT NULL`): Широта знаходження.
* `longitude` (`FLOAT`, `NOT NULL`): Довгота знаходження (Місяць: $[-180..180]$, Марс: $[0..360]$).
* `elevation_m` (`FLOAT`, `DEFAULT 0.0`): Висота рельєфу за альтиметрією LOLA/MOLA.
* `location_name` (`VARCHAR(128)`, `NOT NULL`): Назва кратера або рівнини («Perseverance Valley»).
* `mass_kg` (`FLOAT`, `NULLABLE`): Суха маса на поверхні з каталогу NASA.
* `last_contact_sol` (`INTEGER`, `NULLABLE`): Останній марсіанський день зв'язку (Sol 5111 для Opportunity).
* `cause_of_deactivation` (`TEXT`, `NULLABLE`): Інженерна причина виходу з ладу (глобальна пилова буря тощо).
* `is_featured` (`BOOLEAN`, `DEFAULT FALSE`): Прапорець пріоритетного об'єкта для головного екрана (Tier 1).
* `is_nasa_hardware` (`BOOLEAN`, `DEFAULT TRUE`): Обладнання NASA чи міжнародне (радянські Луноходи, Surveyor 3).
* `first_person_monologue` (`TEXT`, `NOT NULL`): Художній атмосферний монолог **англійською мовою (en-US)**.
* `model_3d_url` (`VARCHAR(512)`, `NULLABLE`): Пряме посилання на `.glb` з репозиторію NASA 3D Resources.
* `updated_at` (`TIMESTAMP WITH TIME ZONE`, `DEFAULT NOW()`): Часова мітка останнього оновлення.

### 3.4. `TRAVERSE_WAYPOINTS` (Маршрут та телеметрія роверів/дронів)
* `id` (`VARCHAR(64)`, **PK**): UUID або системний слаг точки.
* `artifact_id` (`VARCHAR(64)`, **FK** $\to$ `ARTIFACTS.id`, `NOT NULL`): Зовнішній ключ на апарат.
* `sol_or_step` (`INTEGER`, `NOT NULL`): Номер марсіанського дня (Sol) або крок пересування.
* `latitude` (`FLOAT`, `NOT NULL`): Широта точки маршруту.
* `longitude` (`FLOAT`, `NOT NULL`): Довгота точки маршруту.
* `elevation_m` (`FLOAT`, `DEFAULT 0.0`): Висота точки.
* `odometry_m` (`FLOAT`, `DEFAULT 0.0`): Накопичений пробіг від точки посадки в метрах.
* `telemetry_snapshot` (`JSONB`, `DEFAULT '{}'`): Показники бортових систем (`power_wh`, `dust_tau`, `temp_c`).
* `story_snippet` (`TEXT`, `NULLABLE`): Коротка подія або відкриття на цій ділянці маршруту.

### 3.5. `SCIENTIFIC_DISCOVERIES` (Наукові відкриття та бортові прилади)
* `id` (`VARCHAR(64)`, **PK**): UUID запису відкриття.
* `artifact_id` (`VARCHAR(64)`, **FK** $\to$ `ARTIFACTS.id`, `NOT NULL`): Прив'язка до апарата.
* `instrument_acronym` (`VARCHAR(32)`, `NOT NULL`): Код приладу (`Pancam`, `APXS`, `SEIS`, `Moxie`).
* `instrument_full_name` (`VARCHAR(256)`, `NOT NULL`): Офіційна повна назва інструменту.
* `title` (`VARCHAR(256)`, `NOT NULL`): Заголовок відкриття («Виявлення гематитових сфер "Blueberries"»).
* `kid_friendly_story` (`TEXT`, `NOT NULL`): Пояснення суті відкриття простою мовою для дітей/школярів.
* `scientific_fact` (`TEXT`, `NOT NULL`): Точний науковий факт з каталогу NASA PDS.

### 3.6. `ARTIFACT_MEDIA` (Офіційний архів фотографій NASA)
* `id` (`VARCHAR(64)`, **PK**): UUID медіафайлу.
* `artifact_id` (`VARCHAR(64)`, **FK** $\to$ `ARTIFACTS.id`, `NOT NULL`): Прив'язка до апарата.
* `media_category` (`VARCHAR(32)`, `NOT NULL`): Перелік `MediaCategory`.
* `media_url` (`VARCHAR(512)`, `NOT NULL`): Пряме посилання на відкритий CDN NASA.
* `nasa_id_or_pia` (`VARCHAR(64)`, `NULLABLE`): Каталожний код кадру (наприклад, 'PIA22521').
* `caption` (`VARCHAR(512)`, `NOT NULL`): Опис зображення.
* `credit` (`VARCHAR(256)`, `DEFAULT 'NASA/JPL-Caltech'`): Авторські права та джерело.

### 3.7. `COMMUNITY_PUBLICATIONS` (Публікації спільноти та відеоролики за місіями)
* `id` (`UUID`, **PK**, `DEFAULT gen_random_uuid()`): Унікальний ідентифікатор публікації.
* `mission_id` (`VARCHAR(64)`, **FK** $\to$ `MISSIONS.id`, `NOT NULL`): **Обов'язкова прив'язка до космічної місії**.
* `artifact_id` (`VARCHAR(64)`, **FK** $\to$ `ARTIFACTS.id`, `NULLABLE`): Опціональна прив'язка до конкретного артефакту.
* `title` (`VARCHAR(256)`, `NOT NULL`): Назва відеоролика або допису.
* `video_url` (`VARCHAR(512)`, `NOT NULL`): Пряме посилання на відео на YouTube Shorts або TikTok.
* `platform_type` (`VARCHAR(32)`, `NOT NULL`): Перелік `PlatformType` (`YOUTUBE`, `TIKTOK`, `REELS`, `OTHER`).
* `source_references` (`TEXT`, `NOT NULL`): **Джерела контенту** (посилання на фотографії NASA PIA, каталоги PDS, наукові статті).
* `author_name` (`VARCHAR(128)`, `NOT NULL`): Нікнейм або ім'я автора публікації.
* `is_approved` (`BOOLEAN`, `DEFAULT FALSE`): Прапорець премодерації перед показом на порталі.
* `created_at` (`TIMESTAMP WITH TIME ZONE`, `DEFAULT NOW()`): Дата та час подання запису.

---

## 4. Необхідні індекси (PostgreSQL)

Для забезпечення відгуку вебпорталу за $<50$ мс:
1. **GIN індекс для повнотекстового пошуку за назвами артефактів**:
   ```sql
   CREATE INDEX idx_artifacts_search ON artifacts USING gin (
       to_tsvector('english', name || ' ' || location_name)
   );
   ```
2. **Індекс просторової фільтрації артефактів за небесним тілом**:
   ```sql
   CREATE INDEX idx_artifacts_body_featured ON artifacts (celestial_body_id, is_featured);
   ```
3. **Індекс маршрутних точок ровера**:
   ```sql
   CREATE INDEX idx_waypoints_artifact_sol ON traverse_waypoints (artifact_id, sol_or_step);
   ```
4. **Індекс схвалених публікацій спільноти за місією**:
   ```sql
   CREATE INDEX idx_community_pub_mission_approved ON community_publications (mission_id, is_approved);
   ```

---

## 5. API ендпоінти для вебпорталу (`/api/v1/portal/`)

* `GET /api/v1/portal/celestial-bodies/` — список планет для Three.js глобуса.
* `GET /api/v1/portal/artifacts/?body=mars&is_featured=true` — каталог артефактів для 3D сцени.
* `GET /api/v1/portal/artifacts/{id}/` — детальна картка апарата з посиланням на `.glb`.
* `GET /api/v1/portal/community-publications/?mission_id={id}` — список схвалених роликів спільноти по місії.
* `POST /api/v1/portal/community-publications/` — подання нового ролика автором контенту з посиланням на YouTube та джерела.
