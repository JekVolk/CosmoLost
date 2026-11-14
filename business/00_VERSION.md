# Реєстр Версій та Аудит-лог Специфікації (00_VERSION.md)

> **Стандарт версіонування**: Semantic Versioning (SemVer 2.0.0).  
> **Регламент версіонування та переходи станів**: [`.agents/rules/spec_versioning.md`](.agents/rules/spec_versioning.md).

---

## Поточний статус специфікації

| Параметр | Значення |
| :--- | :--- |
| **Поточна версія** | **`v0.6.1`** |
| **Статус версії** | `APPROVED (Повний інженерний пакет NASA Data Loader / Ingest Worker: Clean Architecture, багатотокенний пул NASA з ротацією на 429, дельта-оновлення SHA-256, 8 таблиць)` |
| **Дата випуску** | 2026-11-14 |
| **Власник специфікації** | Product Lead & System Architect |
| **Основна мова вебпорталу**| **English (en-US)** (з локалізацією українською uk-UA) |
| **Кількість фіч (FEAT)** | 6 (MVP) + 3 (`[AI-DRAFT]` беклог) |
| **Кількість MCP Tools** | **12 інструментів** (8 Server FastMCP + 4 Native Desktop MCP) |
| **Кількість Use Cases (UC)** | **14 наскрізних сценаріїв** (Web, Desktop, MCP, Admin) + **19 рольових інженерних UC** у довіднику |
| **Кількість сутностей (ENT)** | **8 серверних сутностей** (БД) + **7 локальних десктопних сутностей** (Local-First) |
| **Кількість атомарних операцій (OP)** | **22 операції** (+`OP-FAC-07` Topic Engine, +`OP-FAC-08` Text Sync) |
| **Кількість валідацій (FIELD)** | **33 валідаційні обмеження** (+`FIELD-32` selection_reason, +`FIELD-33` target_duration) |
| **Кількість досліджень (RES)** | 9 задач (з них `RES-08` / `MKT-01` у статусі `COMPLETED`) |
| **Кількість тест-кейсів (QA)** | 10 наскрізних приймальних сценаріїв |
| **Контроль цілісності** | 100% покриття за моделлю даних, контрактами та інструментами ШІ |

---

## Журнал змін (Changelog)

### [v0.6.1] — 2026-11-14 (Покроковий інженерний TASK для NASA Data Loader & Ingest Worker: Clean Architecture, багатотокенний пул NASA, ротація на 429, дельта-оновлення SHA-256)
* **Додано**:
  * **Вичерпне технічне завдання для Data / Backend розробника модуля `loader`**:
    * [`spec/06_architecture/TASK_NASA_INGEST_LOADER_GUIDE.md`](spec/06_architecture/TASK_NASA_INGEST_LOADER_GUIDE.md) — детальний інженерний гайд із готовим кодом та Clean Layered Architecture:
      * **Багатотокенний пул NASA (`TokenPoolManager`)**: підтримка кількох ключів у `NASA_API_KEYS`, авторотація токенів при отриманні HTTP 429 / 403, відстеження заголовків квоти `X-RateLimit-Remaining` та експоненційний бекоф.
      * **Розділення на шари (Clean Layered Architecture)**: `NASAClient` ➔ чисто доменні `DTO` (dataclass без ORM) ➔ `SyncStateStore` (дельта-трекінг хешів SHA-256 у Redis / JSON) ➔ `DjangoNASAIngestRepository` ➔ атомарне збереження у 8 моделей `core/models.py`.
      * **Трекінг змін та дельта-інгест**: порівняння контрольних сум, фіксація створених, оновлених та пропущених сутностей без навантаження на БД.
      * **Django Management команда**: `python manage.py run_ingest` з прапорцями `--daemon`, `--interval 3600`, `--target moon|mars`, `--force`, `--dry-run` та форматованим ASCII-звітом.
      * **Сумісність із Docker воркером та Celery**: повна інтеграція з контейнером `cosmolost-ingest-worker` та альтернативним періодичним таском Celery (`tasks.py`).
      * **Модульні тести**: Pytest-сьюти для перевірки ротації токенів, ідемпотентності репозиторію та валідації DTO.
* **Архітектурні особливості**:
  * **Суворе дотримання 8 серверних таблиць**: жодної нової моделі в Django ORM! Усі артефакти, місії, фото та телеметрія зберігаються виключно в наявних таблицях `core/models.py`.
  * **Захист від блокувань на хакатоні**: підтримка аварійного режиму `NASA_ENABLE_MOCK_FALLBACK=True` для стабільної роботи без падінь навіть при повному блекауті API NASA.

### [v0.6.0] — 2026-11-14 (Автономний інфраструктурний TASK для DevOps / Сисадміна: 8 контейнерів, Ingestion NASA, бекапи, гнучкі домени)
* **Додано**:
  * **Вичерпне технічне завдання для DevOps / Системного адміністратора**:
    * [`spec/06_architecture/TASK_DEVOPS_SYSADMIN_GUIDE.md`](spec/06_architecture/TASK_DEVOPS_SYSADMIN_GUIDE.md) — повністю автономний покроковий інженерний гайд («без води для новачка»):
      * Топологія 8 контейнерів (`postgres:16`, `redis:7`, `backend` Django 6.1 Gunicorn, `mcp-server` FastMCP SSE, `ingest-worker` щогодинний NASA крон, `web-client` SPA, `gateway` Nginx, `db-backup` pg_dump).
      * Вбудована повна специфікація `.env` із плейсхолдерами безпеки (без зашитих доменів).
      * Вбудований повний маніфест `docker-compose.yml`.
      * Вбудовані Dockerfiles (backend, mcp, web), Nginx reverse proxy конфіг (із підтримкою SSE `proxy_buffering off`) та скрипти `entrypoint.sh` і `backup.sh`.
      * Покроковий план: UFW налаштування (22, 80, 443), міграції, створення superuser, перевірка 8 обов'язкових таблиць БД, curl smoke-тести та аварійне відновлення БД (Disaster Recovery).
* **Архітектурні особливості**:
  * **Повна свобода щодо доменів та SSL**: домени не хардкодяться, сисадмін сам прописує свої домени у DNS та підключає сертифікати через Certbot чи Cloudflare.
  * **Суворе дотримання 8 таблиць БД**: жодних сторонніх сервісів чи нових таблиць Django.

### [v0.5.9] — 2026-11-14 (2 окремі MD-файли OpenAPI: Portal API та Editor/FastMCP API, строго 8 таблиць PostgreSQL, без нових моделей Django)
* **Додано**:
  * **Покрокові інженерні та дизайн-гайди для команди («без води для новачка»)**:
    * [`design/00_DESIGNER_BRIEF_HANDOFF.md`](../design/00_DESIGNER_BRIEF_HANDOFF.md) — повноцінний бриф передачі завдань дизайнерці (Віолетта) з покроковим планом та готовими матеріалами.
    * [`design/01_TASK_DESIGN_PORTAL_WEB.md`](../design/01_TASK_DESIGN_PORTAL_WEB.md) — ТЗ дизайну Вебпорталу (Three.js сфера, плаваючі фільтри, Drawer з 3D .glb, каталог, відеогалерея).
    * [`design/02_TASK_DESIGN_EDITOR_DESKTOP.md`](../design/02_TASK_DESIGN_EDITOR_DESKTOP.md) — ТЗ дизайну Десктопного Редактора (спліт-редактор, Safe Zones 9:16, Pillow-box, PNGTuber аватар).
    * [`design/03_PAGE_LAYOUTS_AND_MISSION_SPEC.md`](../design/03_PAGE_LAYOUTS_AND_MISSION_SPEC.md) — анатомія та wireframe сторінки місії (`/missions/:id`) за 6 блоками з полями з бази даних.
    * [`design/04_DESIGN_SYSTEM_TOKENS_AND_ICONS.md`](../design/04_DESIGN_SYSTEM_TOKENS_AND_ICONS.md) — готова дизайн-система: 4/8px сітка, точні неонові блюри (Cyan/Amber), радіуси Chakra UI v3, 10 іконок NASA Lucide.
    * [`spec/06_architecture/TASK_API_PORTAL_AND_EDITOR_GUIDE.md`](spec/06_architecture/TASK_API_PORTAL_AND_EDITOR_GUIDE.md) — інструкція для розробника Portal API та Editor API на Django REST Framework із готовими серіалізаторами, контролерами та повним набором тестів Pytest.
    * [`spec/06_architecture/TASK_MCP_SERVER_AND_TOOLS_GUIDE.md`](spec/06_architecture/TASK_MCP_SERVER_AND_TOOLS_GUIDE.md) — окрема постановка задачі для розробника ШІ-інтеграцій: серверний FastMCP (8 тулзів до Django ORM без RAG), конфігурація для Claude/Cursor та тести Pytest.
  * **Розділення на 2 окремі MD-файли зі специфікаціями OpenAPI 3.1**:
    1. [`spec/06_architecture/OPENAPI_PORTAL_API.md`](spec/06_architecture/OPENAPI_PORTAL_API.md) — вичерпний контракт публічного Web Portal API (Three.js сфера, координати, кластеризація, фільтри, картка об'єкта, наукові відкриття, публікації спільноти).
    2. [`spec/06_architecture/OPENAPI_EDITOR_API.md`](spec/06_architecture/OPENAPI_EDITOR_API.md) — контракт Редактора «Фабрики контенту», 8 серверних FastMCP інструментів для ШІ, завантажувача NASA та нативних Desktop MCP/Tauri IPC.
  * **Рішення щодо БД Django (Anti-Bloat / No New Models)**:
    * Відхилено додавання будь-яких нових моделей до Django ORM.
    * Серверна база даних PostgreSQL строго зберігає **8 затверджених таблиць**.
    * Усі чернетки монтажу, слайди та локальні проекти зберігаються **виключно Local-First на машині автора** (`%APPDATA%/CosmoLost/`), а бекенд повертає верифіковані дані NASA без створення нових таблиць.
  * **Майстер-протокол та матриця трасування**: збережено файл [`spec/06_architecture/API_DATABASE_PROTOCOL_SPECIFICATION.md`](spec/06_architecture/API_DATABASE_PROTOCOL_SPECIFICATION.md) та єдиний [`spec/06_architecture/openapi.yaml`](spec/06_architecture/openapi.yaml).
* **Додано**:
  * **Чітке розмежування сховищ (Серверна БД vs Local-First Десктоп)**:
    * Серверна база даних PostgreSQL містить строго **8 таблиць**: 7 базових таблиць космічних знань (`CELESTIAL_BODIES`, `MISSIONS`, `ARTIFACTS`, `TRAVERSE_WAYPOINTS`, `SCIENTIFIC_DISCOVERIES`, `ARTIFACT_MEDIA`) та 1 таблицю для роликів спільноти (`COMMUNITY_PUBLICATIONS`).
    * Відеоролики хостяться безпосередньо на відеоплатформах (YouTube Shorts, TikTok) або локально на диску автора. У базі даних немає важких бінарних файлів — лише легкі посилання та цитування джерел.
    * Внутрішні сутності монтажного столу (`VideoScriptSlide`, черги `BatchQueueTask`, локальні шляхи до рендерів, приватні OAuth/Bot токени) зберігаються **виключно на десктопному клієнті** (Tauri, `%APPDATA%/CosmoLost/`).
  * **Таблиця `COMMUNITY_PUBLICATIONS` (Публікації спільноти по місіях)**:
    * Дозволяє зберігати зовнішні посилання на відео (`video_url`), прив'язку до місії (`mission_id`) та артефакту (`artifact_id`), перелік наукових першоджерел контенту (`source_references`: NASA PIA, каталоги PDS, статті), автора (`author_name`) та статус модерації (`is_approved`).
    * **Статус клієнтської частини**: Інтерфейс подачі користувацьких відео на клієнті віднесено до майбутнього беклогу (`[AI-DRAFT]`), але на бекенді структура БД та API ендпоінти (`GET/POST /api/v1/portal/community-publications/`) повністю спроєктовані.
  * **Сформовано інженерний шпаргалку-документ для бекендера**: повний опис 8 сутностей, ENUM-ів та SQL/ORM-типів.

### [v0.5.7] — 2026-11-14 (Адаптивний GPU Watchdog, Збереження текстів на сервері, Smart Next Topic Engine)
* **Додано**:
  * **Адаптивний Watchdog під слабкі GPU**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md), [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) (`FIELD-29`) та [`spec/05_domain/03_OPERATIONS.md`](spec/05_domain/03_OPERATIONS.md) (`OP-FAC-05`) замінено фіксований 45-секундний таймаут на настроюваний повзунок `render_timeout_sec` (діапазон 30–300 секунд, дефолт 40с для потужних GPU, 90–120с для інтегрованих/слабких відеокарт). Відео більше не видаляється і не обривається, доки рендеринг продовжує прогресувати на повільному залізі.
  * **Цільовий хронометраж ролика ~40 секунд**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md) та `FIELD-33` затверджено стандартну тривалість Shorts/TikTok роликів на фабриці у 40 секунд.
  * **Централізоване збереження текстів на сервері**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md), [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md) та [`spec/06_architecture/03_API_CONTRACTS.md`](spec/06_architecture/03_API_CONTRACTS.md) зафіксовано, що **весь текст** (сценарії, монологи диктора, 3-рядкові описи, Pin Comments, чернетки та `selection_reason`) зберігається у базі даних PostgreSQL на сервері. Сервер не приймає лише важкі відеофайли та фотографії (Zero-Media Server Load).
  * **Фіксація причини вибору даних (`selection_reason`)**: у [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md) та `FIELD-32` додано обов'язкове поле збереження мотивації креатора (річниця, драма, унікальний прилад).
  * **Smart Next Topic Engine (`REQ-FAC-13` / `OP-FAC-07`)**: додано функцію «Придумати тему для наступного відоса» з ендпоінтом `POST /api/v1/editor/recommend-next-topic/`, що на основі рубрики, поточного артефакту та `selection_reason` підбирає зв'язану наступну тему для серійності контенту.
  * **Оновлено та скомпільовано 10-сторінковий Master Handbook**: [CosmoLost_Engineering_Handbook.pdf](CosmoLost_Engineering_Handbook.pdf) (2.29 МБ).

### [v0.5.6] — 2026-11-14 (Ребілд 10-сторінкового Master Handbook: 10 типів обладнання та клієнтські контракти)
* **Додано**:
  * **Ребілд інженерного довідника `CosmoLost_Engineering_Handbook.pdf` (10 сторінок, 2.29 МБ)**:
    * **Розділ 3 (нова сторінка 4)**: Класифікатор **10 типів космічного обладнання** (`ROVER`, `HELICOPTER`, `LANDER`, `DESCENT_STAGE`, `IMPACT_STAGE`, `INSTRUMENT`, `RETRO_REFLECTOR`, `SAMPLE_TUBE`, `ENTRY_DEBRIS`, `DEEP_SPACE_PROBE`) з українськими інженерними описами та місіями NASA.
    * **Клієнтські контракти та налаштування десктопа**: включено схему даних полегшеного масиву для `THREE.InstancedMesh` (веб-клієнт), контракт RMS-амплітуд для ліпсингу аватара (десктоп) та повну специфікацію конфігураційного файлу `%APPDATA%\CosmoLost\config.json`.
    * **Вшиті PNG-діаграми та фото**: C4 Architecture (`inbox/arhitech.png`), UML Class Model (`class_diagram.png`), PostgreSQL 16 ERD (`erd.png`), 4 архівні фото NASA та візуалізація Pillow-box Safe Zones 9:16.
    * **Усі 19 Use Cases**: `UC-DES-01..05`, `UC-WEB-01..05`, `UC-BACK-01..04`, `UC-FAC-01..05`.

### [v0.5.5] — 2026-11-14 (IAU 2000 Планетоцентричні координати, Кластеризація та InstancedMesh)
* **Додано**:
  * **Планетоцентричні координати IAU 2000**: у [`spec/04_features/FEAT-01_interactive_map.md`](spec/04_features/FEAT-01_interactive_map.md), [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md) та [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) (`FIELD-02`) додано поле `coordinate_system_type` до `CelestialBody` із підтримкою східної довготи $[0..360^\circ]$ для Марса та $[-180..180^\circ]$ для Місяця.
  * **Кластеризація артефактів на мікро-дистанціях**: у [`spec/04_features/FEAT-01_interactive_map.md`](spec/04_features/FEAT-01_interactive_map.md) (`REQ-MAP-08`), [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) (`FIELD-31`) та [`spec/06_architecture/03_API_CONTRACTS.md`](spec/06_architecture/03_API_CONTRACTS.md) закладено об'єднання об'єктів у радіусі $<500$ м (майданчики посадки Apollo 11, Perseverance Three Forks) у бейджі з плавним spiderfying розкриттям при наближенні.
  * **Оптимізація 60 FPS через `THREE.InstancedMesh`**: у [`spec/04_features/FEAT-01_interactive_map.md`](spec/04_features/FEAT-01_interactive_map.md) (`REQ-MAP-09`) затверджено єдиний draw call для масивів маркерів.
  * **Регенеровано ERD діаграму**: оновлено фізичну модель бази даних [02_DATA_MODEL_ERD.md](spec/06_architecture/02_DATA_MODEL_ERD.md) та файл [images/erd.png](spec/06_architecture/images/erd.png) (623.2 KB).

### [v0.5.4] — 2026-11-14 (Рішення аудиту: Pillow-box, Rust Watchdog 45с, en-US сторітелінг та Combined SearchVector)
* **Додано**:
  * **FFmpeg Blurred Background Pillow-box**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md) та [`spec/05_domain/03_OPERATIONS.md`](spec/05_domain/03_OPERATIONS.md) (`OP-FAC-05`) затверджено обробку архівних знімків NASA $4:3$, квадрат чи $800 \times 600$ (Surveyor, Apollo, Viking) через генерацію розмитого фону замість агресивного обрізання.
  * **Rust Process Watchdog (Таймаут 45 секунд)**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md) та [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) (`FIELD-29`) впроваджено сторожовий таймер `tokio::time::timeout(45s)`. При зависанні кодека процес примусово вбивається через `child.kill()`, статус стає `FAILED`, а черга `BatchQueueTask` не блокується.
  * **Англійське ядро сторітелінгу (`en-US`)**: у [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md) підтверджено пряме збереження полів `first_person_monologue`, `how_it_worked`, `science_legacy` англійською мовою без ускладнення моделі даними перекладів (економія часу хакатону, фокус на міжнародне журі).
  * **Міжнародні колаборації NASA (`is_nasa_hardware`)**: у [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md), [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) (`FIELD-30`) та [`spec/06_architecture/02_DATA_MODEL_ERD.md`](spec/06_architecture/02_DATA_MODEL_ERD.md) додано прапорець `is_nasa_hardware` для відстеження апаратів, внесених до каталогів NASA (Луноход-1/2, відвіданий Surveyor 3).
  * **Combined SearchVector у FastMCP**: у [`spec/04_features/FEAT-05_mcp_rag_gateway.md`](spec/04_features/FEAT-05_mcp_rag_gateway.md) специфіковано комбінований індекс `SearchVector('name', 'location_name', config='english') + SearchVector('science_legacy', config='simple')` для безпомилкового пошуку.
  * **Регенеровано ERD діаграму**: оновлено фізичну схему бази даних [02_DATA_MODEL_ERD.md](spec/06_architecture/02_DATA_MODEL_ERD.md) та згенеровано файл [images/erd.png](spec/06_architecture/images/erd.png) (613.1 KB).

### [v0.5.3] — 2026-11-14 (Серверний Docker Compose стек, Redis локери та Local-First автономія Фабрики контенту)

### [v0.5.3] — 2026-11-14 (Серверний Docker Compose стек, Redis локери та Local-First автономія Фабрики контенту)
* **Додано**:
  * **Топологія розгортання Docker Compose**: у [`spec/06_architecture/01_C4_SYSTEM_CONTEXT.md`](spec/06_architecture/01_C4_SYSTEM_CONTEXT.md) та [`spec/07_quality_and_risks/01_NFR.md`](spec/07_quality_and_risks/01_NFR.md) зафіксовано архітектуру серверного стеку:
    * Виділений сервер (домен `lihtar.org`) із 7 контейнерами: `nginx`, `web-frontend`, `django-backend`, `fastmcp-service`, `postgres:16-alpine`, `redis`, `celery-worker`, `celery-beat`.
    * **Розподілені блокування (Distributed Task Locks)**: механізм `Redis Lock` (TTL 1800с) для гарантії атомарного щогодинного завантаження даних NASA без паралельних конфліктів.
  * **Фундаментальний закон «Local-First / Клієнтська автономія»**: у [`spec/04_features/FEAT-03_content_factory.md`](spec/04_features/FEAT-03_content_factory.md) закріплено вимогу користувача:
    * **Усі розрахунки, синтез мови, Jump-cut та монтаж FFmpeg виконуються виключно локально** на обладнанні креатора.
    * **Нульове навантаження на сервер**: бекенд не рендерить відео, не зберігає важкі файли та не проксіює B-roll.
    * **Мінімалістичний API-обмін**: через Редактор API передаються лише структуровані JSON-дані (дефолтні налаштування рубрик `ContentTemplate`, верифіковані факти NASA та URL опублікованих роликів).
    * **Обов'язкове кешування B-roll**: фотографії та 3D-моделі завантажуються клієнтом напряму і зберігаються в локальній папці `%APPDATA%/CosmoLost/projects/{id}/assets/` для стабільного офлайн-рендерингу.

### [v0.5.2] — 2026-11-14 (Use Case Діаграма Вебпорталу, інвентар контенту та розширення <<include>> / <<extend>>)

### [v0.5.2] — 2026-11-14 (Use Case Діаграма Вебпорталу, інвентар контенту та розширення <<include>> / <<extend>>)
* **Додано**:
  * **Use Case Діаграма Вебпорталу (Mermaid)**: у [`spec/04_features/02_USE_CASES.md`](spec/04_features/02_USE_CASES.md) розроблено повну системну діаграму з акторами `ROLE-WebUser` (школяр, любитель астрономії, журі NASA) та `ROLE-Researcher` (дослідник відкритих даних).
  * **Декомпозиція за стандартом `spec-decomposition-engine`**:
    * Обов'язкові зв'язки `<<include>>`: завантаження WMTS-тайлів NASA Treks, мапінг координат $(lat, lon) \to (X,Y,Z)$, стрімінг 3D-моделі `.glb` з NASA GitHub CDN, читання монологу «Щоденник останнього Сола», пояснення науки для школярів та відображення офіційних шлюзів NASA.
    * Умовні розширення `<<extend>>` (заплановані додаткові фічі):
      * `EXT-01: Анімація маршруту ровера` (NASA MMGIS GeoJSON Traverse & Waypoints).
      * `EXT-02: Таймлайн згасання енергії` (слайдер часу: оптична товщина пилу $Tau$ проти енергії батарей $Wh$).
      * `EXT-03: Реальний фізичний нахил кузова` (Pitch & Roll ровера Spirit у піску Troy або InSight).
      * `EXT-04: Аудіоплеєр «Голоси привидів»` (записи марсіанського вітру та сейсмограм InSight, переговори Apollo LRV).
      * `EXT-05: Порівняльна машина часу` (спліт-слайдер: останнє селфі проти орбітального знімка HiRISE/LROC через роки).
      * `EXT-06: 3D-огляд кладовища пробірок` (Three Forks Sample Depot) та розбитого теплового щита.
      * `EXT-07: Аудіоподкасти місій` (переведено в беклог `[AI-DRAFT] PLANNED`).
  * **Інвентар контенту першої черги та NASA Gateways**: у [`spec/04_features/FEAT-02_artifact_details.md`](spec/04_features/FEAT-02_artifact_details.md) структуровано паспортні поля, 3D Zero-Budget стрімінг, сторітелінг, дитячу науку та прямі посилання на NASA PDS, NSSDCA Master Catalog, NASA Solar System Treks та Image Library PIA.

### [v0.5.1] — 2026-11-14 (Архітектура конекторів соцмереж, Рубрики, Мультипостинг та Нативне відкриття папки)

### [v0.5.1] — 2026-11-14 (Архітектура конекторів соцмереж, Рубрики, Мультипостинг та Нативне відкриття папки)
* **Додано**:
  * **Архітектура Конекторів Соцмереж (`IPlatformConnector`)**: у [`spec/04_features/FEAT-04_social_publishing.md`](spec/04_features/FEAT-04_social_publishing.md) специфіковано плагінну систему підключення каналів у десктопному додатку:
    * `YouTubeShortsConnector`: OAuth2 PKCE авторизація, resumable upload частинами по 5 МБ, автоматичний заголовок до 50 символів + `#Shorts`, автопостинг та закріплення дискусійного коментаря (Pin Comment).
    * `TelegramChannelConnector`: авторизація за Bot Token + Channel ID, відправка через метод `sendVideo`, форматування MarkdownV2, інлайн-кнопка переходу на 3D-мапу вебпорталу.
    * `TikTokConnector`: підтримка Direct Post API з автоматичним перемиканням у режим локального експорту при відсутності токена розробника.
    * `LocalFolderExporterConnector` («Відкрити папку з відео»): нативна інтеграція з ОС для моментального експорту та ручного постингу в TikTok, Instagram Reels, Threads, Reddit.
  * **Нативна дія «Відкрити папку з відео»**:
    * Виклик системного файлового менеджера з позиціонуванням на готовому файлі `.mp4` (Windows: `explorer.exe /select,"path"`, macOS: `open -R "path"`, Linux: `xdg-open "dir"`).
    * Автоматичний запис 3-рядкового SEO-пакету (байт + SEO-ядро + хештеги) у системний буфер обміну через `tauri-plugin-clipboard-manager`.
    * Окрема кнопка в модальному вікні для копіювання дискусійного Pin Comment в 1 клік.
  * **Реєстр 5 канонічних рубрик (`ContentRubric`)**: деталізовано специфіку кожної рубрики з хронометражем, хуками 0–3с та провокативними питаннями для коментарів:
    1. `RUBRIC_LAST_SOL_DRAMA` («Останній сол» — трагедія замовклих апаратів).
    2. `RUBRIC_TECH_EXPLAIN` («Як це працює простими словами» — аналогії складних приладів).
    3. `RUBRIC_LUNAR_MYSTERIES` («Таємниці Місяця» — забуті артефакти та сейсмічні удари).
    4. `RUBRIC_BILLION_CRASH` («Краш-тест за мільярд» — інженерні катастрофи).
    5. `RUBRIC_BUILD_IN_PUBLIC` («Створюємо проєкт у прямому ефірі» — щоденник хакатону Space Apps).
  * **Нові доменні сутності**: у [`spec/05_domain/01_ENTITIES.md`](spec/05_domain/01_ENTITIES.md) та [`spec/06_architecture/02_DATA_MODEL_ERD.md`](spec/06_architecture/02_DATA_MODEL_ERD.md):
    * `ENT-12 PlatformConnector`: конфігурація та стан зовнішнього каналу (`platform_type`, `auth_type`, `connection_status`).
    * `ENT-13 PlatformCredential`: локальне захищене сховище токенів та секретів (OS Keychain / Windows Credential Manager).
    * `ENT-14 PublicationDispatch`: атомарний трекінг доставки ролика у конкретну соцмережу (`PENDING`, `UPLOADING`, `PUBLISHED`, `MANUAL_EXPORTED`, `FAILED`).
  * **Атомарні операції**: у [`spec/05_domain/03_OPERATIONS.md`](spec/05_domain/03_OPERATIONS.md) додано `OP-CONN-01`, `OP-CONN-02`, `OP-PUB-01` .. `OP-PUB-06` з повним дотриманням закону «ТА / І».
  * **Валідаційні обмеження**: у [`spec/05_domain/02_FIELDS_AND_VALIDATIONS.md`](spec/05_domain/02_FIELDS_AND_VALIDATIONS.md) зареєстровано `FIELD-22` .. `FIELD-28`.
  * **Tauri Desktop IPC Контракти**: у [`spec/06_architecture/03_API_CONTRACTS.md`](spec/06_architecture/03_API_CONTRACTS.md) додано контракти `connect_platform_account`, `list_platform_connectors`, `dispatch_publication_multi`, `open_folder_with_video`, `copy_to_clipboard`.
  * **Розширено сценарії Use Cases**: у [`spec/04_features/02_USE_CASES.md`](spec/04_features/02_USE_CASES.md) деталізовано `UC-FAC-04a`, `UC-FAC-04b`, `UC-FAC-04c`.

### [v0.5.0] — 2026-11-14 (Англомовний вебпортал та повна специфікація 12 MCP Tools)
* **Додано**:
  * **Англійська мова за замовчуванням**: у [`spec/02_core/01_PASSPORT.md`](spec/02_core/01_PASSPORT.md) закріплено **English (en-US)** як основну мову інтерфейсу вебпорталу для міжнародного журі NASA Space Apps Challenge (відповідальний: Нікіта). Українська мова реалізується як повноцінна локалізація.
  * **Аналіз потреб даних для MCP**: у [`spec/04_features/FEAT-05_mcp_rag_gateway.md`](spec/04_features/FEAT-05_mcp_rag_gateway.md) структуровано 6 ключових категорій фактів, які ШІ-агенти та дослідники вимагають від системи:
    1. Академічна ідентифікація (NSSDCA ID, місія, агентство).
    2. Геодезія та картографія IAU (точні $lat, lon$, висота, назва кратера/долини).
    3. Технічна доля та хронологія (дати, причина замовкання, телеметрія фінального дня $Tau$, $Wh$, нахил кузова).
    4. Наукова спадщина (прилади APXS, SEIS, Mössbauer, факти та дитячі історії).
    5. Медіа та 3D (прямі URL на .glb NASA 3D, останнє селфі, знімки з орбіти LROC/HiRISE).
    6. Верифіковані цитати (PDS, NSSDCA, посилання на CosmoLost, обов'язкові копірайти).
  * **Повна специфікація 12 MCP Tools**:
    * **8 Серверних інструментів FastMCP (Django)**:
      * `search_artifacts`: прямий реляційний пошук за фільтрами (БЕЗ RAG).
      * `get_artifact_details`: повний паспорт об'єкта.
      * `get_mission_manifest`: усі залишені об'єкти конкретної експедиції.
      * `get_last_sol_chronology`: телеметрія та останні слова перед смертю.
      * `get_science_discoveries`: прилади та дитячі/наукові факти.
      * `get_verified_citations`: академічні посилання та цитування.
      * `get_3d_and_media_assets`: лінки на .glb та орбітальні фото.
      * `list_active_passive_artifacts`: апарати, що функціонують досі (рефлектори LRRR, пробірки Perseverance).
    * **4 Нативні інструменти десктопного MCP (Tauri)**:
      * `create_video_task`: автопостановка монтажу ролика на ПК.
      * `get_render_status`: перевірка прогресу FFmpeg.
      * `trigger_social_publish`: публікація в YouTube Shorts / Telegram.
      * `batch_generate_rubric`: пакетний рендеринг серії з 5–10 відео.
  * Оновлено контракти API [`spec/06_architecture/03_API_CONTRACTS.md`](spec/06_architecture/03_API_CONTRACTS.md) із повними JSON-схемами всіх 12 інструментів.

### [v0.4.0] — 2026-11-14 (Глибинний аналіз потреб, Реєстр Use Cases та розширена модель даних)
### [v0.3.2] — 2026-11-14 (Zero-Budget CDN Streaming, Кастомний PNGTuber та відкладення подкастів)
### [v0.3.1] — 2026-11-14 (Закон відмови від RAG, Нодовий редактор React Flow та Слайд-шоу)
### [v0.3.0] — 2026-11-14 (SMM-інженерія, Двоконтурний MCP та точна C4 архітектура)
### [v0.2.1] — 2026-11-14 (Технологічна стандартизація 3D-рушія на Three.js)
### [v0.2.0] — 2026-11-14 (Повна модульна специфікація екосистеми CosmoLost)
### [v0.1.2] — 2026-11-14 (Формування плану досліджень CosmoLost)
### [v0.1.1] — 2026-11-14 (Шаблон дослідження зовнішніх інтеграцій)
### [v0.1.0] — 2026-11-14 (Ініціалізація інженерного каркасу)
