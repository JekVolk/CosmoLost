# [ID: FEAT-05] Специфікація Шлюзу FastMCP та Нативного Десктопного MCP (FEAT-05_mcp_rag_gateway.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.5.0`  
> **Ролі**: [`ROLE-AIAgent`](../03_users/01_ROLES.md) (Зовнішній ШІ), [`ROLE-Creator`](../03_users/01_ROLES.md) (Локальний ШІ)  
> **Стек**: Python FastMCP / Model Context Protocol SDK  
> **Архітектурні правила**:
> 1. Відповідно до **Закону 7 (`spec_rules.md`)**, для MVP **RAG повністю виключено** — пошук працює виключно через реляційні індекси Django ORM та повнотекстовий пошук (швидкість відповіді $< 50$ мс).
> 2. Усі відповіді FastMCP за замовчуванням повертаються **англійською мовою (English)** із можливістю запиту української локалізації.

---

## 1. Аналіз потреб користувачів: Які саме дані потрібні через MCP?

ШІ-агенти (Gemini, Claude, Antigravity, Cursor) та кінцеві користувачі (школярі, дослідники, журналісти, креатори), які звертаються до бази CosmoLost через MCP, потребують 6 чітких категорій перевірених фактів NASA:

### 1.1. Ідентифікація та академічні коди
* **Офіційний NSSDCA ID** (наприклад, `"2003-027A"` для Opportunity або `"1969-059C"` для Apollo 11 LM): необхідний для академічного цитування у наукових роботах без ризику сплутати схожі місії.
* **Назва місії та космічне агентство**: NASA, NASA / JPL, ESA.
* **Тип артефакту**: точна класифікація (`ROVER`, `LANDER`, `DESCENT_STAGE`, `RETRO_REFLECTOR`, `SAMPLE_TUBE`, `IMPACT_STAGE`).
* **Операційний стан**: чи апарат мертвий (`DORMANT`), чи розбитий для сейсмічного тесту (`DESTROYED_ON_IMPACT`), чи працює пасивно досі (`PASSIVE_ACTIVE`).

### 1.2. Точні геодезичні координати та топоніміка
* **Координати посадки/падіння**: точні широта й довгота $(lat, lon)$ з геодезичною точністю.
* **Офіційна назва локації за класифікацією IAU/NASA**: назва кратера, рівнини або борозни (наприклад, *"Mare Tranquillitatis"*, *"Perseverance Valley"*, *"Hadley Rille"*).
* **Висота над рівнем рельєфу** (Elevation в метрах).

### 1.3. Хронологія життя та інженерна доля («Чому апарат замовк?»)
* **Дати запуску, посадки та останнього контакту**: контраст планового терміну служби з реальним (наприклад, план 90 днів vs факт 5111 солів).
* **Точна інженерна причина замовкання**: без вигадок про «інопланетян» — пилова буря, розрядка батарей, злам лопаті ротора, замерзання у піску Troy.
* **Телеметрія фінального дня**: рівень запиленості атмосфери ($Tau$), виробіток енергії ($Wh$), кут нахилу корпусу (pitch/roll).

### 1.4. Наукова спадщина та відкриття («Яку користь це принесло людству?»)
* **Перелік інструментів на борту**: абревіатура та назва приладу (APXS, Pancam, SEIS, Mössbauer).
* **Суть відкриття**: 
  * Науковий факт (для дорослих і дослідників): доказ наявності кислого озера, виявлення мінералу ярозиту, товщина кори Марса.
  * Адаптована дитяча історія: як пояснити це школяру за 1 хвилину через аналогії.
* **Зв'язок із майбутніми місіями**: як цей артефакт підготував програми Artemis або Mars Sample Return.

### 1.5. Медіа-активи та 3D-моделі
* **Прямий URL на 3D-модель** `.glb` у відкритому каталозі NASA 3D Resources.
* **Останній надісланий знімок** апарата перед втратою сигналу.
* **Орбітальне підтвердження (Orbital Proof)**: знімки супутників LROC NAC (Місяць) або MRO HiRISE (Марс) із зазначенням PIA-коду, де видно апарат і його тінь з космосу.

### 1.6. Верифіковані цитати та авторські права
* Офіційні посилання на першоджерела (PDS, NSSDCA, NASA Image Library).
* Пряме посилання на інтерактивну картку CosmoLost (`cosmolost.lihtar.org/artifacts/{slug}`).
* Обов'язковий текст копірайту: *"Data and imagery provided by NASA / JPL-Caltech / ASU / Cornell"*.

---

## 2. Каталог Інструментів Серверного FastMCP (Server MCP Tools)

Сервер FastMCP розгорнуто на бекенді Django (`lihtar.org/mcp/`). Він працює через транспортні протоколи `SSE` (для віддалених агентів Gemini/Claude) та `stdio` (для локальних терміналів).

```
+-----------------------------------------------------------------------------------+
|                           СЕРВЕРНИЙ FASTMCP ШЛЮЗ (DJANGO)                         |
+-----------------------------------------------------------------------------------+
|  1. search_artifacts              -> Пошук артефактів за фільтрами (БЕЗ RAG)      |
|  2. get_artifact_details          -> Повний технічний паспорт артефакту           |
|  3. get_mission_manifest          -> Усі об'єкти, залишені конкретною місією      |
|  4. get_last_sol_chronology       -> Хронологія та телеметрія останнього дня      |
|  5. get_science_discoveries       -> Прилади, наукові відкриття та дитячі історії |
|  6. get_verified_citations        -> Офіційні цитати NASA, PDS та посилання       |
|  7. get_3d_and_media_assets       -> Прямі лінки на .glb моделі та фото з орбіти  |
|  8. list_active_passive_artifacts -> Артефакти, що функціонують досі (рефлектори) |
+-----------------------------------------------------------------------------------+
```

### 2.1. Tool: `search_artifacts`
* **Опис**: Пошук покинутого обладнання за назвою, небесним тілом, типом або роками.
* **Індексація повнотекстового пошуку (Combined SearchVector у PostgreSQL)**:
  * Пошук виконується через комбінований реляційний індекс:  
    `SearchVector('name', 'location_name', config='english') + SearchVector('science_legacy', 'how_it_worked', config='simple')`.
  * Це забезпечує точний морфологічний стемінг для офіційних англійських назв місій та артефактів (en-US), а також безпомилкову роботу для мультиязичних/українських ключових слів без виклику синтаксичних помилок PostgreSQL.
* **Параметри (Input Schema)**:
  * `query` (string, optional): Ключове слово для пошуку (наприклад `"Opportunity"`, `"Eagle"`, `"seismometer"`).
  * `celestial_body` (string, optional): `"moon"` або `"mars"`.
  * `artifact_type` (string, optional): `"ROVER"`, `"LANDER"`, `"DESCENT_STAGE"`, `"INSTRUMENT"`, `"RETRO_REFLECTOR"`, `"SAMPLE_TUBE"`.
  * `operational_status` (string, optional): `"DORMANT"`, `"PASSIVE_ACTIVE"`, `"DESTROYED_ON_IMPACT"`.
  * `is_featured` (boolean, optional): Тільки кураторські об'єкти з 3D-моделями (Tier 1).
  * `limit` (integer, default 20): Кількість записів у відповіді.
* **Формат відповіді (Output Example)**:
```json
[
  {
    "id": "opportunity-rover",
    "name": "Opportunity Rover (MER-B)",
    "mission": "Mars Exploration Rover",
    "body": "mars",
    "artifact_type": "ROVER",
    "status": "DORMANT",
    "coordinates": { "latitude": -1.9462, "longitude": 354.4734, "site": "Perseverance Valley" },
    "active_years": "2004 - 2018",
    "cosmolost_url": "https://cosmolost.lihtar.org/artifacts/opportunity-rover"
  }
]
```

---

### 2.2. Tool: `get_artifact_details`
* **Опис**: Отримання вичерпного структурованого паспорта артефакту за його унікальним слагом (`id`).
* **Параметри**: `artifact_id` (string, required).
* **Формат відповіді**:
```json
{
  "id": "opportunity-rover",
  "name": "Opportunity Rover (MER-B)",
  "nssdca_id": "2003-027A",
  "mission_name": "Mars Exploration Rover",
  "celestial_body": "mars",
  "artifact_type": "ROVER",
  "operational_status": "DORMANT",
  "power_source": "SOLAR",
  "mass_kg": 185.0,
  "landing_date": "2004-01-25",
  "last_contact_date": "2018-06-10",
  "planned_duration_sols": 90,
  "actual_duration_sols": 5111,
  "coordinates": {
    "latitude": -1.9462,
    "longitude": 354.4734,
    "elevation_m": -1390.0,
    "location_name": "Perseverance Valley, Endeavour Crater"
  },
  "cause_of_deactivation": "A catastrophic planet-encircling dust storm blocked sunlight, preventing solar array charging, resulting in battery depletion and extreme thermal cooling.",
  "specific_metadata": {
    "total_odometry_km": 45.16,
    "final_sol": 5111,
    "final_dust_tau": 10.8
  },
  "first_person_monologue": "My clock stopped on Sol 5111. The skies above Perseverance Valley grew darker than night as dust blanketed my panels...",
  "cosmolost_url": "https://cosmolost.lihtar.org/artifacts/opportunity-rover"
}
```

---

### 2.3. Tool: `get_mission_manifest`
* **Опис**: Повертає перелік усіх апаратів та уламків, залишених конкретною експедицією на Місяці або Марсі.
* **Параметри**: `mission_id` (string, required, наприклад `"apollo-11"`, `"apollo-15"`, `"mars-2020"`).
* **Формат відповіді**:
```json
{
  "mission_id": "apollo-15",
  "mission_name": "Apollo 15",
  "landing_site": "Hadley Rille",
  "abandoned_hardware": [
    { "id": "apollo-15-lm-falcon-descent-stage", "type": "DESCENT_STAGE", "mass_kg": 2809.0, "status": "DORMANT" },
    { "id": "apollo-15-lrv-1", "type": "ROVER", "name": "Lunar Roving Vehicle 1", "status": "DORMANT" },
    { "id": "apollo-15-lrrr", "type": "RETRO_REFLECTOR", "name": "Laser Ranging Retroreflector", "status": "PASSIVE_ACTIVE" },
    { "id": "apollo-15-s-ivb", "type": "IMPACT_STAGE", "name": "Saturn V Third Stage (Impact Crater)", "status": "DESTROYED_ON_IMPACT" }
  ]
}
```

---

### 2.4. Tool: `get_last_sol_chronology`
* **Опис**: Хронологія фінального дня апарата, телеметрія пилу, заряду та останні слова перед замовканням.
* **Параметри**: `artifact_id` (string, required).
* **Формат відповіді**:
```json
{
  "artifact_id": "opportunity-rover",
  "final_sol_or_step": 5111,
  "final_date": "2018-06-10",
  "telemetry": {
    "atmospheric_opacity_tau": 10.8,
    "solar_energy_wh": 22.0,
    "battery_charge_percent": 3.2
  },
  "last_status_message": "My battery is low and it's getting dark.",
  "last_photo_url": "https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg"
}
```

---

### 2.5. Tool: `get_science_discoveries`
* **Опис**: Перелік наукових відкриттів, зроблених приладами артефакту, з дитячою історією та строгими фактами.
* **Параметри**: `artifact_id` (string, required).
* **Формат відповіді**:
```json
[
  {
    "instrument": "APXS & Mössbauer Spectrometer",
    "discovery_title": "Hematite Spherules ('Blueberries')",
    "kid_friendly_story": "I discovered tiny grey spheres on the ground that looked like blueberries. They were made of hematite, which only forms in liquid water, proving Mars was once a wet, lake-covered world!",
    "scientific_fact": "Confirmed precipitation of jarosite and hematite spherules, confirming past persistent standing water on Meridiani Planum."
  }
]
```

---

### 2.6. Tool: `get_verified_citations`
* **Опис**: Отримання офіційних бібліографічних посилань NASA та копірайтів для фактчекінгу.
* **Параметри**: `artifact_id` (string, required).
* **Формат відповіді**:
```json
{
  "artifact_id": "opportunity-rover",
  "nssdca_catalog_id": "2003-027A",
  "pds_archive_url": "https://pds-geosciences.wustl.edu/missions/mer/",
  "nasa_image_library_id": "PIA22521",
  "cosmolost_citation": "CosmoLost Open Planetary Registry (https://cosmolost.lihtar.org/artifacts/opportunity-rover)",
  "attribution_statement": "Data, telemetry and imagery provided by NASA / JPL-Caltech / ASU / PDS Geosciences."
}
```

---

### 2.7. Tool: `get_3d_and_media_assets`
* **Опис**: Прямі URL на 3D-моделі (.glb), орбітальні знімки LROC/HiRISE та аудіозаписи.
* **Параметри**: `artifact_id` (string, required).
* **Формат відповіді**:
```json
{
  "model_3d_glb_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Opportunity%20Rover/opportunity.glb",
  "orbital_proof_image_url": "https://www.uahirise.org/media/clips/HiRISE_Opportunity_Sol5111.jpg",
  "orbital_source_camera": "MRO HiRISE (NASA/JPL/University of Arizona)",
  "audio_recordings": []
}
```

---

### 2.8. Tool: `list_active_passive_artifacts`
* **Опис**: Повертає обладнання, яке *досі працює* або використовується науковцями без активного живлення.
* **Параметри**: `celestial_body` (string, optional: `"moon"` | `"mars"` | `"deep_space"`).
* **Формат відповіді**:
```json
[
  {
    "id": "apollo-11-lrrr",
    "name": "Apollo 11 Laser Ranging Retroreflector (LRRR)",
    "body": "moon",
    "status": "PASSIVE_ACTIVE",
    "why_active": "Reflects laser pulses fired from Earth observatories today to measure lunar orbit recession (3.8 cm/year). Requires zero electrical power."
  },
  {
    "id": "perseverance-sample-depot-three-forks",
    "name": "Three Forks Sample Depot (10 Titanium Sample Tubes)",
    "body": "mars",
    "status": "PASSIVE_ACTIVE",
    "why_active": "Sealed rock cores waiting on the surface for Mars Sample Return mission retrieval."
  }
]
```

---

## 3. Каталог Інструментів Нативного Десктопного MCP (Native Desktop MCP)

Працює локально всередині десктопного додатка Tauri (`ROLE-Creator`). Дозволяє локальним автономним агентам штампувати контент:

```
+-----------------------------------------------------------------------------------+
|                       НАТИВНИЙ ДЕСКТОПНИЙ MCP (TAURI APP)                         |
+-----------------------------------------------------------------------------------+
|  9. create_video_task         -> Створення завдання на авто-монтаж ролика на ПК   |
| 10. get_render_status         -> Перевірка статусу виконання рендерингу FFmpeg    |
| 11. trigger_social_publish    -> Пряма публікація в YouTube Shorts / Telegram     |
| 12. batch_generate_rubric     -> Пакетне створення серії з 5-10 роликів «у стіл»  |
+-----------------------------------------------------------------------------------+
```

### 3.1. Tool: `create_video_task`
* **Параметри**:
  * `artifact_id` (string, required): Слаг артефакту (`"opportunity-rover"`).
  * `rubric_id` (string, required): `"last-sol-drama"`, `"dictionary-explain"`, `"lunar-secrets"`, `"crash-test"`.
  * `language` (string, default `"en"`): Мова озвучки (`"en"` або `"uk"`).
  * `enable_pngtuber` (boolean, default `true`): Використання аватара з ліпсинком.
* **Результат**: `task_id: "task-uuid-12345"`, `status: "QUEUED"`.

### 3.2. Tool: `get_render_status`
* **Параметри**: `task_id` (string, required).
* **Результат**: `status: "RENDERED"`, `progress_percent: 100`, `local_video_path: "C:/Videos/cosmolost_opportunity.mp4"`.

### 3.3. Tool: `trigger_social_publish`
* **Параметри**:
  * `task_id` (string, required).
  * `platform` (string, required): `"YOUTUBE_SHORTS"`, `"TELEGRAM"`, `"EXPORT_FOLDER"`.
* **Результат**: `post_url: "https://youtube.com/shorts/xyz123"`, `pin_comment_copied: true`.

### 3.4. Tool: `batch_generate_rubric`
* **Параметри**:
  * `rubric_id` (string, required).
  * `count` (integer, 1..10, required).
  * `language` (string, default `"en"`).
* **Результат**: `batch_task_id`, список згенерованих завдань у черзі `BatchQueueTask`.
