# Архітектура Системи: C4 Діаграми (01_C4_SYSTEM_CONTEXT.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.3.0`  
> **Стандарт**: C4 Model (Context & Container) на основі затвердженої архітектурної схеми команди `arhitech.png`

---

## 1. C4 Рівень 1: Системний контекст (System Context Diagram)

```mermaid
flowchart TD
    subgraph Users["Користувачі та Агенти"]
        WebUser["Школяр / Ентузіаст космосу<br>[ROLE-WebUser]"]
        Creator["Контент-креатор<br>[ROLE-Creator]"]
        UserAgents["ШІ-агенти (Gemini / Claude / Локальні роботи)<br>[ROLE-AIAgent]"]
        Admin["Адміністратор / Тімлід<br>[ROLE-Admin]"]
    end

    subgraph CosmoLostSystem["Екосистема CosmoLost"]
        System["Платформа CosmoLost<br>(Вебпортал + Фабрика контенту + Двоконтурний MCP + Django API)"]
    end

    subgraph ExternalServices["Зовнішні сервіси та API"]
        NASA["Ресурси NASA 1..5<br>(Catalogue, Treks WMTS, NSSDCA, PDS, Images API)"]
        YouTube["YouTube Data API v3 (Shorts)"]
        TikTok["TikTok API (Direct Post / Manual)"]
        Telegram["Telegram Bot API (Канал)"]
    end

    WebUser -->|Досліджує 3D-мапу та історії| System
    Creator -->|Генерує вірусні Shorts/Reels| System
    UserAgents <-->|Серверний MCP (факти) & Native MCP (керування фабрикою)| System
    Admin -->|Адмініструє БД та парсери| System

    System -->|Щогодинний парсинг даних| NASA
    System -->|Публікація контенту| YouTube
    System -->|Публікація контенту| TikTok
    System -->|Публікація контенту| Telegram

    YouTube -.->|Трафік із соцмереж| WebUser
    TikTok -.->|Трафік із соцмереж| WebUser
    Telegram -.->|Трафік із соцмереж| WebUser
```

---

## 2. C4 Рівень 2: Діаграма контейнерів (Containers Diagram за схемою `arhitech.png`)

```mermaid
flowchart TD
    subgraph CosmoLostInner["Внутрішній контур екосистеми (Inner)"]

        subgraph WebPortalContainer["Вебпортал [Web]"]
            WebPortal["Сайт AI, 3D-мапа (Three.js), фільтри та подкасти<br>[React / Vite / Three.js]"]
        end

        subgraph BackendDjango["БЕК (Django)"]
            DB[("БД<br>[PostgreSQL / SQLite]")]
            AdminPanel["Адмінка<br>[Django Unfold]"]
            HourlyIngestion["Завантажувач щогодини<br>[Cron / Celery Worker]"]
            PortalAPI["Portal API<br>[Django REST]"]
            EditorAPI["Редактор API<br>[Django REST]"]
            ServerMCP["Серверний MCP Шлюз<br>[FastMCP]"]
            PodcastGen["Генерація подкастів (Женя)<br>[AI-DRAFT: Беклог / Поза межами MVP]"]

            AdminPanel -->|Керування даними| DB
            HourlyIngestion -->|Bulk Upsert метаданих| DB
            DB -->|Читання каталогу| PortalAPI
            DB <-->|Читання/запис проектів| EditorAPI
            DB -->|Вибірка верифікованих фактів| ServerMCP
            DB -.->|Заплановано на майбутнє| PodcastGen
        end

        subgraph DesktopContainer["Фабрика контенту [Desktop APP]"]
            DesktopApp["Фабрика контенту Desktop APP<br>[Tauri + TypeScript + Chakra UI]<br>FFmpeg монтаж, Safe Zones, PNGTuber"]
            NativeMCP["Native MCP (Локальний шлюз)<br>[Tauri Plugin / Stdio MCP]"]

            DesktopApp <-->|Локальне керування через ШІ| NativeMCP
        end

    end

    subgraph ExternalNASAResources["Зовнішні джерела NASA"]
        NASA1["NASA Ресурс 1: Catalogue of Manmade Material"]
        NASA2["NASA Ресурс 2: Solar System Treks WMTS"]
        NASA3["NASA Ресурс 3: Planetary Data System (PDS)"]
        NASA4["NASA Ресурс 4: NSSDCA Archive & Images API"]
        NASA5["NASA Ресурс 5: MMGIS Rover Traverse Data"]
    end

    subgraph SocialNetworks["Канали дистрибуції"]
        YouTubeOut["YouTube UA (Shorts)"]
        TikTokOut["TikTok API"]
        TelegramOut["Telegram (Канал)"]
    end

    subgraph AIAgentsPool["Зовнішній контур ШІ"]
        ExternalUserAgents["USER Agents<br>(Claude Desktop, Gemini, Cursor, Автономні роботи)"]
    end

    %% Зв'язки бекенду з порталом та десктопом
    PortalAPI -->|REST ендпоінти| WebPortal
    EditorAPI <-->|REST ендпоінти| DesktopApp
    PodcastGen -.->|Аудіодоріжки| WebPortal

    %% Зв'язки завантажувача з NASA
    HourlyIngestion -->|Парсинг щогодини| NASA1
    HourlyIngestion -->|Парсинг щогодини| NASA2
    HourlyIngestion -->|Парсинг щогодини| NASA3
    HourlyIngestion -->|Парсинг щогодини| NASA4
    HourlyIngestion -->|Парсинг щогодини| NASA5

    %% Зв'язки з ШІ-агентами (Подвійний MCP)
    ServerMCP <-->|Верифіковані факти NASA та цитати| ExternalUserAgents
    NativeMCP <-->|Автономне керування монтажем відео на ПК| ExternalUserAgents
    ExternalUserAgents -.->|Прямі посилання та рекомендації| WebPortal

    %% Зв'язки публікації з десктопу
    DesktopApp -->|Завантаження Shorts через Data API| YouTubeOut
    DesktopApp -->|Direct Post / Експорт .mp4| TikTokOut
    DesktopApp -->|Публікація медіапостів| TelegramOut

    %% Перенаправлення трафіку з соцмереж на сайт
    YouTubeOut ==>|Трафік глядачів за посиланням| WebPortal
    TikTokOut ==>|Трафік глядачів за посиланням| WebPortal
    TelegramOut ==>|Трафік читачів за посиланням| WebPortal
```

---

## 3. Опис ключових архітектурних вузлів

1. **Двоконтурна система MCP (Dual MCP Architecture)**:
   * **Серверний MCP (Server MCP)**: Працює на Django-бекенді. Надає `USER Agents` доступ до бази знань NASA (координати, відкриття, причини замовкання).
   * **Нативний десктопний MCP (Native MCP)**: Вбудований у додаток Tauri на машині користувача. Дозволяє локальним ШІ-агентам автономно ставити завдання на рендеринг відео, вибирати шаблони рубрик і запускати публікацію без участі людини (план «Джекпот для журі»).
2. **Розподіл API бекенду**:
   * **Portal API**: Оптимізований для швидкого читання та кешування даних для вебпорталу (`/api/v1/portal/...`).
   * **Редактор API (Editor API)**: Спеціалізований інтерфейс для «Фабрики контенту» (`/api/v1/editor/...`) з підтримкою DTO шаблонів, медіа-асетів та метаданих публікацій.
3. **Завантажувач щогодини (Hourly Ingestor)**:
   * Фоновий воркер, що за розкладом опитує 5 незалежних ресурсів NASA та підтримує локальну БД у стані 100% актуальності.
4. **Контур замикання трафіку (Traffic Funnel)**:
   * Відео з десктопу публікуються у соцмережі (YouTube Shorts, TikTok, Telegram), звідки глядачі переходять за посиланнями на інтерактивний вебпортал із 3D-мапою та панорамами.

---

## 4. Серверний Стек Розгортання (Docker Compose Stack)

Бекенд та вебпортал розгортаються на виділеному сервері за допомогою єдиного оркестраційного маніфесту `docker-compose.yml`:

```mermaid
flowchart TD
    subgraph HostServer ["Виділений сервер CosmoLost (Ubuntu 24.04 LTS / Docker Compose)"]
        Nginx["Nginx Reverse Proxy & SSL\n[Порти 80, 443]"]

        subgraph AppContainers ["Docker Контейнери"]
            WebUI["web-frontend\n[Next.js / Three.js UI]\nПорт 3000"]
            DjangoAPI["django-backend\n[Gunicorn + Django 5]\nPortal & Editor REST API\nПорт 8000"]
            FastMCPSvc["fastmcp-service\n[FastMCP Server (SSE)]\nПорт 8001"]
            CeleryWorker["celery-worker\n[Hourly Ingestor Task]"]
            CeleryBeat["celery-beat\n[Cron Scheduler]"]
            RedisCache[("redis\n[Кеш + Черга + Розподілені Локери]")]
            PostgresDB[("postgres:16-alpine\n[Реляційні дані + Повнотекстовий пошук]")]
        end
    end

    InternetTraffic(("🌐 Інтернет / Журі NASA")) --> Nginx
    Nginx -->|Проксіювання /| WebUI
    Nginx -->|Проксіювання /api/| DjangoAPI
    Nginx -->|Проксіювання /mcp/| FastMCPSvc

    DjangoAPI --> PostgresDB
    DjangoAPI --> RedisCache
    FastMCPSvc --> PostgresDB
    CeleryWorker --> RedisCache
    CeleryWorker --> PostgresDB
    CeleryBeat --> RedisCache
```

### 4.1. Розподілені блокування (Distributed Task Locks)
* **Механізм захисту**: Для запобігання паралельним конфліктам при щогодинному завантаженні каталогів NASA використовується механізм `Redis Lock` (червоні локери / Redlock з TTL 1800 сек).
* **Принцип дії**: Фоновий воркер `celery-worker` перед початком парсингу захоплює унікальний ключ `lock:ingestion:nasa_catalog`. Якщо попередня сесія завантаження ще не завершилась — новий запуск коректно пропускається без дублювання записів.

### 4.2. Гарантія нульового навантаження від «Фабрики контенту»
* Сервер **не містить** контейнерів для рендерингу відео або конвертації аудіо.
* Усі витрати на CPU/GPU для монтажу відео повністю ізольовані на клієнтських комп'ютерах користувачів. Сервер лише обслуговує легкі HTTP GET/POST запити метаданих.
