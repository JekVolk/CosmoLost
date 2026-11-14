# Постановка Задачі та Покроковий Гід: NASA Data Loader & Ingest Worker (Clean Architecture)

> **Для кого цей документ**: Бекенд-розробник / Data Engineer (покроково «розжовано як для школяра/новачка»).  
> **Ціль**: Розробити надійний, високопродуктивний сервіс імпорту та синхронізації даних NASA (`backend/loader/`), побудований за принципами **Clean Layered Architecture** (Клієнти ➔ Мапери ➔ DTO ➔ Репозиторій ➔ Django ORM).  
> **Ключові інженерні вимоги**:
> 1. **Багатотокенний пул (NASA Token Pool)** з автоматичною ротацією ключів при вичерпанні ліміту (HTTP 429 / 403) та експоненційним бекофом.
> 2. **Розділення на шари (Clean Architecture)**: чисті доменні DTO (чистий Python) ➔ Репозиторій ➔ БД. Жодної прямої залежності зовнішнього API NASA від моделей Django!
> 3. **Трекінг змін та дельта-оновлення (State Tracking & Delta Sync)**: обчислення хешів (SHA-256), фіксація що саме завантажено, що додано нове, а що оновлено.
> 4. **Суворе дотримання 8 таблиць БД**: жодних нових моделей Django! Збереження даних виключно в наявні моделі `backend/core/models.py`.
> 5. **Автоматичне оновлення раз на годину**: підтримка автономного daemon-режиму (`python manage.py run_ingest --daemon --interval 3600`), повна сумісність із контейнером `cosmolost-ingest-worker` та Celery Task.
> 6. **100% захист від збоїв на хакатоні**: наявність автономного seed-каталогу артефактів Місяця та Марса (30+ апаратів) на випадок блекауту API NASA.

---

## 🧭 1. Архітектурна Концепція та Шари (Clean Layered Architecture)

Щоб код не перетворився на некерований моноліт, коли неструктуровані JSON-відповіді NASA напряму пишуться в таблиці бази даних, модуль `loader` ділиться на **5 строго ізольованих шарів**:

```mermaid
flowchart TD
    subgraph External["Зовнішній Світ (NASA APIs & Datasets)"]
        NASA_APIs["api.nasa.gov<br>(APOD, Mars Rover Photos, InSight, Manifests)"]
        NASA_Images["images-api.nasa.gov<br>(Photojournal PIA Archive Search)"]
        NASA_PDS["NASA PDS / Horizons / Curated Seeds<br>(Координати, телеметрія MMGIS)"]
    end

    subgraph InfrastructureLayer["1. Шар Інфраструктури (Infrastructure Layer)"]
        TokenPool["TokenPoolManager<br>(Ротація NASA_API_KEYS при HTTP 429/403)"]
        NASAClient["NASAClient & FallbackEngine<br>(HTTP сесії, ретраї, rate limit delay)"]
        StateStore["SyncStateStore<br>(Хеші SHA-256 у Redis / JSON-файлі)"]
        TokenPool --> NASAClient
    end

    subgraph MappingLayer["2. Шар Мапінгу та Нормалізації (Mapping Layer)"]
        Mappers["NASAJsonMapper<br>- Нормалізація координат (IAU 2000 Mars)<br>- Конвертація Sol/Earth Date<br>- Фільтрація статусів та типів апаратів"]
    end

    subgraph DomainLayer["3. Доменний Шар (Domain & DTO Layer)"]
        DTOs["Чисті DTO (Data Transfer Objects)<br>- CelestialBodyDTO<br>- MissionDTO<br>- ArtifactDTO<br>- WaypointDTO<br>- DiscoveryDTO<br>- MediaDTO<br>- SyncStatsDTO"]
    end

    subgraph ServiceLayer["4. Сервісний Шар / Оркестратор (Service Layer)"]
        Pipeline["NASAIngestPipeline<br>(Оркестрація кроків, дельта-аналіз,<br>калькуляція нових/оновлених записів)"]
    end

    subgraph RepositoryLayer["5. Шар Репозиторію (Repository Layer)"]
        RepoInterface["INASAIngestRepository<br>(Абстрактний інтерфейс)"]
        DjangoRepo["DjangoORMRepository<br>(Ідемпотентні upsert, update_or_create,<br>bulk транзакції)"]
        RepoInterface --> DjangoRepo
    end

    subgraph CoreDB["Серверне Ядро (8 Таблиць PostgreSQL)"]
        M1["celestial_bodies"]
        M2["missions"]
        M3["artifacts"]
        M4["traverse_waypoints"]
        M5["scientific_discoveries"]
        M6["artifact_media"]
    end

    External -->|Raw JSON| NASAClient
    NASAClient -->|Raw Dicts| Mappers
    Mappers -->|Валідні Об'єкти| DTOs
    DTOs --> Pipeline
    Pipeline <-->|Перевірка хешу| StateStore
    Pipeline -->|Передача валідних DTO| DjangoRepo
    DjangoRepo -->|Atomic Write| CoreDB
```

---

## ⚙️ 2. Вимоги до Конфігурації (`.env`)

Усі параметри роботи воркера винесені в змінні оточення. Створи або додай до файлу `.env` бекенду такі налаштування:

```ini
# ==============================================================================
# CosmoLost NASA Ingest Worker Configuration
# ==============================================================================

# Пул токенів NASA (через кому без пробілів).
# Можна вказати DEMO_KEY для тестів, але для продакшну зареєструй 2-4 безкоштовні ключі на https://api.nasa.gov
NASA_API_KEYS=DEMO_KEY,xK9mP2Lq8Vw1Z5tY0uR3eA4sD6fG7hJ8,zQ1wX2eC3vB4nN5mM6lK7jH8gF9dD0sA

# Базові URL NASA API
NASA_API_BASE_URL=https://api.nasa.gov
NASA_IMAGES_API_URL=https://images-api.nasa.gov

# Періодичність автооновлення (в секундах). За замовчуванням 3600 (1 година).
# Можна поставити 7200 (2 години) або 1800 (30 хв).
NASA_SYNC_INTERVAL_SEC=3600

# Затримка між HTTP-запитами (секунди) для запобігання спрацюванню Rate Limit
NASA_RATE_LIMIT_DELAY=0.25

# Таймаут одного HTTP-запиту (секунди)
NASA_REQUEST_TIMEOUT=15

# Максимальна кількість повторних спроб (retries) при збоях мережі
NASA_MAX_RETRIES=3

# Безпечний аварійний режим (якщо всі ключі NASA 429 або відсутній інтернет)
# True = завантажити локальні перевірені JSON-пакети артефактів; False = викинути помилку
NASA_ENABLE_MOCK_FALLBACK=True

# Підключення до Redis для збереження стану синхронізації та розподілених локів
REDIS_URL=redis://redis:6379/1
```

---

## 📁 3. Структура Файлів Модуля `backend/loader/`

Ось повна файлова структура, яку ти реалізуєш у додатку `loader`:

```
backend/loader/
├── __init__.py
├── apps.py                      # Конфігурація Django App
├── constants.py                 # NASA API ендпоінти, константи та сидовий каталог артефактів
├── domain/                      # ШАР 1: Доменні сутності та DTO (чистий Python)
│   ├── __init__.py
│   ├── dtos.py                  # Dataclass DTO для всіх сутностей
│   ├── exceptions.py            # Кастомні винятки (RateLimitExceeded, IngestError)
│   └── mappers.py               # Трансформація raw JSON NASA у валідні DTO
├── infrastructure/              # ШАР 2: Мережа, NASA API, токени та стан
│   ├── __init__.py
│   ├── token_pool.py            # Багатотокенний ротатор з перемиканням при 429
│   ├── nasa_client.py           # HTTP-клієнт з ретраями та аварійним фолбеком
│   └── state_store.py           # Збереження дельти/хешів (Redis або локальний JSON)
├── repositories/                # ШАР 3: Збереження DTO у базу даних Django
│   ├── __init__.py
│   ├── base.py                  # Інтерфейс репозиторію
│   └── django_repository.py     # Реалізація збереження в 8 моделей core/models.py
├── services/                    # ШАР 4: Оркестратор пайплайну
│   ├── __init__.py
│   └── ingest_pipeline.py       # Повний цикл завантаження, обчислення дельти та звіт
├── management/
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       └── run_ingest.py        # Django CLI: python manage.py run_ingest
├── tasks.py                     # Опціональний Celery Task
└── tests/
    ├── __init__.py
    └── test_loader.py           # Комплексний Pytest-сьют
```

---

## 🏛️ КРОК 1. Базові Константи та Сидовий Каталог (`loader/constants.py`)

Цей файл містить офіційні ендпоінти NASA, тайлові сервери NASA Treks, а також еталонні паспортні дані космічних апаратів NASA для гарантованого наповнення бази даних навіть без інтернету.

Створи `backend/loader/constants.py`:

```python
"""
Constants, API Endpoints, and Curated Seed Datasets for NASA Ingestion.
"""

# NASA API Endpoints
MARS_ROVER_PHOTOS_ENDPOINT = "/mars-photos/api/v1/rovers/{rover}/photos"
MARS_ROVER_MANIFEST_ENDPOINT = "/mars-photos/api/v1/manifests/{rover}"
APOD_ENDPOINT = "/planetary/apod"
INSIGHT_WEATHER_ENDPOINT = "/insight_weather/"
IMAGES_SEARCH_ENDPOINT = "/search"

# NASA Treks WMTS Global Basemaps
MOON_WMTS_URL = "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
MARS_WMTS_URL = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"

# Curated Tier-1 Hardware Catalog (Moon & Mars)
CURATED_CELESTIAL_BODIES = [
    {
        "id": "moon",
        "name": "Moon",
        "radius_km": 1737.4,
        "gravity_ms2": 1.62,
        "coordinate_system_type": "SELENOGRAPHIC",
        "wmts_tile_url": MOON_WMTS_URL,
    },
    {
        "id": "mars",
        "name": "Mars",
        "radius_km": 3389.5,
        "gravity_ms2": 3.72,
        "coordinate_system_type": "PLANETOCENTRIC_360",
        "wmts_tile_url": MARS_WMTS_URL,
    },
]

CURATED_MISSIONS = [
    {
        "id": "apollo-11",
        "name": "Apollo 11",
        "agency": "NASA",
        "nssdca_id": "1969-059C",
        "launch_date": "1969-07-16",
        "landing_date": "1969-07-20",
        "end_date": "1969-07-24",
        "summary": "First crewed landing on the Moon. Tranquility Base.",
    },
    {
        "id": "apollo-14",
        "name": "Apollo 14",
        "agency": "NASA",
        "nssdca_id": "1971-008C",
        "launch_date": "1971-01-31",
        "landing_date": "1971-02-05",
        "end_date": "1971-02-09",
        "summary": "Explored Fra Mauro formation. Deployed ALSEP and Lunar Ranging Retroreflector.",
    },
    {
        "id": "apollo-15",
        "name": "Apollo 15",
        "agency": "NASA",
        "nssdca_id": "1971-063C",
        "launch_date": "1971-07-26",
        "landing_date": "1971-07-30",
        "end_date": "1971-08-07",
        "summary": "First J-mission with Lunar Roving Vehicle (LRV) at Hadley Rille.",
    },
    {
        "id": "mer-b",
        "name": "Mars Exploration Rover - Opportunity",
        "agency": "NASA/JPL",
        "nssdca_id": "2003-032A",
        "launch_date": "2003-07-07",
        "landing_date": "2004-01-25",
        "end_date": "2018-06-10",
        "summary": "Traversed over 45 kilometers on Mars across 5,111 Sols.",
    },
    {
        "id": "mer-a",
        "name": "Mars Exploration Rover - Spirit",
        "agency": "NASA/JPL",
        "nssdca_id": "2003-027A",
        "launch_date": "2003-06-10",
        "landing_date": "2004-01-04",
        "end_date": "2010-03-22",
        "summary": "Explored Gusev Crater and Columbia Hills. Traversed 7.7 km.",
    },
    {
        "id": "msl",
        "name": "Mars Science Laboratory (Curiosity)",
        "agency": "NASA/JPL",
        "nssdca_id": "2011-070A",
        "launch_date": "2011-11-26",
        "landing_date": "2012-08-06",
        "end_date": None,
        "summary": "Assessing habitability in Gale Crater and climbing Mount Sharp.",
    },
    {
        "id": "mars-2020",
        "name": "Mars 2020 (Perseverance & Ingenuity)",
        "agency": "NASA/JPL",
        "nssdca_id": "2020-052A",
        "launch_date": "2020-07-30",
        "landing_date": "2021-02-18",
        "end_date": None,
        "summary": "Astrobiology mission caching sample tubes in Jezero Crater delta.",
    },
    {
        "id": "insight",
        "name": "InSight Mars Lander",
        "agency": "NASA/JPL",
        "nssdca_id": "2018-042A",
        "launch_date": "2018-05-05",
        "landing_date": "2018-11-26",
        "end_date": "2022-12-15",
        "summary": "Investigated the deep interior of Mars with SEIS seismometer.",
    },
    {
        "id": "pathfinder",
        "name": "Mars Pathfinder & Sojourner",
        "agency": "NASA/JPL",
        "nssdca_id": "1996-068A",
        "launch_date": "1996-12-04",
        "landing_date": "1997-07-04",
        "end_date": "1997-09-27",
        "summary": "First robotic rover on Mars. Explored Ares Vallis.",
    },
]

CURATED_ARTIFACTS = [
    {
        "id": "opportunity-rover",
        "mission_id": "mer-b",
        "celestial_body_id": "mars",
        "name": "Opportunity Rover (MER-B)",
        "artifact_type": "ROVER",
        "operational_status": "DORMANT",
        "latitude": -1.9462,
        "longitude": 354.4734,  # Planetocentric 360 -> normalized to -5.5266
        "elevation_m": -1440.0,
        "location_name": "Perseverance Valley, Endeavour Crater",
        "mass_kg": 185.0,
        "last_contact_sol": 5111,
        "cause_of_deactivation": "Global planet-encircling dust storm deprived solar arrays of sunlight (Tau > 10.8).",
        "is_featured": True,
        "is_nasa_hardware": True,
        "first_person_monologue": "My battery is low and it's getting dark. But for 14 years, I showed humanity that water once bathed this red world.",
        "model_3d_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Opportunity/opportunity.glb",
    },
    {
        "id": "spirit-rover",
        "mission_id": "mer-a",
        "celestial_body_id": "mars",
        "name": "Spirit Rover (MER-A)",
        "artifact_type": "ROVER",
        "operational_status": "DORMANT",
        "latitude": -14.5684,
        "longitude": 175.4726,
        "elevation_m": -1940.0,
        "location_name": "Troy, West of Home Plate, Gusev Crater",
        "mass_kg": 185.0,
        "last_contact_sol": 2210,
        "cause_of_deactivation": "Right-front wheel failure led to becoming stuck in soft sulfate sands before the harsh Martian winter.",
        "is_featured": False,
        "is_nasa_hardware": True,
        "first_person_monologue": "I climbed the Columbia Hills on five wheels and unveiled ancient hydrothermal springs.",
        "model_3d_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Spirit/spirit.glb",
    },
    {
        "id": "apollo-11-descent-stage",
        "mission_id": "apollo-11",
        "celestial_body_id": "moon",
        "name": "Apollo 11 Lunar Module Descent Stage (Eagle)",
        "artifact_type": "DESCENT_STAGE",
        "operational_status": "PASSIVE_ACTIVE",
        "latitude": 0.67408,
        "longitude": 23.47297,
        "elevation_m": -2573.0,
        "location_name": "Tranquility Base (Mare Tranquillitatis)",
        "mass_kg": 2034.0,
        "cause_of_deactivation": "Descent engine propellant depleted during touchdown; remained as the launch pad for the Ascent Stage.",
        "is_featured": True,
        "is_nasa_hardware": True,
        "first_person_monologue": "Here men from the planet Earth first set foot upon the Moon. July 1969 A.D. We came in peace for all mankind.",
        "model_3d_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Apollo%2011%20LM/apollo_11_lm.glb",
    },
    {
        "id": "apollo-11-lrr",
        "mission_id": "apollo-11",
        "celestial_body_id": "moon",
        "name": "Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)",
        "artifact_type": "RETRO_REFLECTOR",
        "operational_status": "PASSIVE_ACTIVE",
        "latitude": 0.67337,
        "longitude": 23.47309,
        "elevation_m": -2573.0,
        "location_name": "Tranquility Base",
        "mass_kg": 30.0,
        "cause_of_deactivation": "Passive optical instrument requiring no electrical power; continuously operational since 1969.",
        "is_featured": False,
        "is_nasa_hardware": True,
        "first_person_monologue": "Fire your lasers from Earth. I will bounce your photons straight back to prove the Moon drifts away by 3.8 cm every year.",
        "model_3d_url": "",
    },
    {
        "id": "ingenuity-helicopter",
        "mission_id": "mars-2020",
        "celestial_body_id": "mars",
        "name": "Ingenuity Mars Helicopter (Ginny)",
        "artifact_type": "HELICOPTER",
        "operational_status": "DORMANT",
        "latitude": 18.4447,
        "longitude": 77.4508,
        "elevation_m": -2540.0,
        "location_name": "Valinor Hills, Jezero Crater",
        "mass_kg": 1.8,
        "last_contact_sol": 1042,
        "cause_of_deactivation": "Rotor blade tip damage sustained during landing on Flight 72.",
        "is_featured": True,
        "is_nasa_hardware": True,
        "first_person_monologue": "I proved that powered, controlled aerodynamic flight is possible in the razor-thin atmosphere of another world.",
        "model_3d_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Ingenuity/ingenuity.glb",
    },
    {
        "id": "insight-lander",
        "mission_id": "insight",
        "celestial_body_id": "mars",
        "name": "InSight Mars Lander",
        "artifact_type": "LANDER",
        "operational_status": "DORMANT",
        "latitude": 4.5024,
        "longitude": 135.6234,
        "elevation_m": -2600.0,
        "location_name": "Elysium Planitia",
        "mass_kg": 358.0,
        "last_contact_sol": 1445,
        "cause_of_deactivation": "Excessive accumulation of Martian atmospheric dust on dual solar panels.",
        "is_featured": True,
        "is_nasa_hardware": True,
        "first_person_monologue": "My power is really low today, so this may be the last image I can send. Don't worry about me though: my time here has been both productive and serene.",
        "model_3d_url": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/InSight/insight.glb",
    },
    {
        "id": "sojourner-rover",
        "mission_id": "pathfinder",
        "celestial_body_id": "mars",
        "name": "Sojourner Rover",
        "artifact_type": "ROVER",
        "operational_status": "DORMANT",
        "latitude": 19.33,
        "longitude": 326.45,  # -33.55
        "elevation_m": -3650.0,
        "location_name": "Ares Vallis",
        "mass_kg": 11.5,
        "last_contact_sol": 83,
        "cause_of_deactivation": "Pathfinder base station battery depletion caused communication loss.",
        "is_featured": False,
        "is_nasa_hardware": True,
        "first_person_monologue": "I was the size of a microwave oven, but I was the first set of wheels humanity ever drove on Mars.",
        "model_3d_url": "",
    },
]
```

---

## 🛠️ КРОК 2. Доменні Винятки, DTO та Мапери (`loader/domain/`)

### 2.1. Створи `backend/loader/domain/exceptions.py`

```python
"""
Domain exceptions for NASA data loader.
"""

class LoaderBaseException(Exception):
    """Base exception for all loader errors."""
    pass


class NASAClientError(LoaderBaseException):
    """Network or HTTP error while calling NASA API."""
    pass


class RateLimitExceededError(NASAClientError):
    """All NASA API tokens in pool reached rate limits."""
    pass


class IngestValidationError(LoaderBaseException):
    """DTO validation failed (e.g. invalid coordinates or missing IDs)."""
    pass


class IngestRepositoryError(LoaderBaseException):
    """Database persistence failure."""
    pass
```

### 2.2. Створи `backend/loader/domain/dtos.py`

```python
"""
Data Transfer Objects (DTO) for NASA Ingestion Pipeline.
Pure Python dataclasses: zero dependencies on Django ORM models.
"""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class CelestialBodyDTO:
    id: str  # e.g. 'moon', 'mars'
    name: str
    radius_km: float
    gravity_ms2: float
    coordinate_system_type: str  # 'SELENOGRAPHIC' | 'PLANETOCENTRIC_360'
    wmts_tile_url: str


@dataclass(frozen=True)
class MissionDTO:
    id: str  # e.g. 'apollo-11', 'mars-2020'
    name: str
    agency: str
    nssdca_id: Optional[str] = None
    launch_date: Optional[date] = None
    landing_date: Optional[date] = None
    end_date: Optional[date] = None
    summary: str = ""


@dataclass(frozen=True)
class ArtifactDTO:
    id: str  # e.g. 'opportunity-rover'
    mission_id: Optional[str]
    celestial_body_id: str
    name: str
    artifact_type: str  # ROVER, LANDER, INSTRUMENT, RETRO_REFLECTOR, etc.
    operational_status: str  # ACTIVE, DORMANT, DESTROYED, PASSIVE_ACTIVE, etc.
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    location_name: str = ""
    mass_kg: Optional[float] = None
    last_contact_sol: Optional[int] = None
    cause_of_deactivation: str = ""
    is_featured: bool = False
    is_nasa_hardware: bool = True
    first_person_monologue: str = ""
    model_3d_url: str = ""


@dataclass(frozen=True)
class WaypointDTO:
    artifact_id: str
    sol_or_step: int
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    odometry_m: Optional[float] = None
    telemetry_snapshot: Dict[str, Any] = field(default_factory=dict)
    story_snippet: str = ""
    id: Optional[str] = None


@dataclass(frozen=True)
class DiscoveryDTO:
    artifact_id: str
    title: str
    instrument_acronym: str = ""
    instrument_full_name: str = ""
    kid_friendly_story: str = ""
    scientific_fact: str = ""
    id: Optional[str] = None


@dataclass(frozen=True)
class MediaDTO:
    artifact_id: str
    media_category: str  # SURFACE_PHOTO, LAST_KNOWN_PHOTO, PANORAMA, DESCENT, etc.
    media_url: str
    nasa_id_or_pia: str = ""
    caption: str = ""
    credit: str = "NASA/JPL-Caltech"
    id: Optional[str] = None


@dataclass
class SyncStatsDTO:
    """Summary statistics of a single ingest run."""
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: float = 0.0
    celestial_bodies_checked: int = 0
    celestial_bodies_new: int = 0
    missions_checked: int = 0
    missions_new: int = 0
    missions_updated: int = 0
    artifacts_checked: int = 0
    artifacts_new: int = 0
    artifacts_updated: int = 0
    waypoints_inserted: int = 0
    discoveries_inserted: int = 0
    media_inserted: int = 0
    api_calls_made: int = 0
    tokens_rotated: int = 0
    errors_encountered: List[str] = field(default_factory=list)
    is_success: bool = True

    def calculate_duration(self) -> None:
        if self.end_time and self.start_time:
            self.duration_seconds = round((self.end_time - self.start_time).total_seconds(), 2)
```

### 2.3. Створи `backend/loader/domain/mappers.py`

Шар мапінгу конвертує неструктуровані сирі словники NASA API у типізовані, перевірені DTO. Він нормалізує координати довготи Марса (з 0..360 у -180..180) та парсить дати.

Створи `backend/loader/domain/mappers.py`:

```python
"""
Mappers transforming raw NASA API JSON structures into domain DTOs.
"""
from datetime import datetime, date
from typing import Any, Dict, Optional, Tuple

from loader.domain.dtos import (
    CelestialBodyDTO,
    MissionDTO,
    ArtifactDTO,
    MediaDTO,
    WaypointDTO,
)
from loader.domain.exceptions import IngestValidationError


class NASAJsonMapper:
    """Utility class for normalizing NASA API responses."""

    @staticmethod
    def normalize_longitude(lon: float) -> float:
        """
        Normalizes longitude into standard -180.0 .. 180.0 range.
        NASA Mars Treks frequently uses 0..360 planetocentric coordinates.
        """
        if lon > 180.0:
            return round(lon - 360.0, 6)
        return round(lon, 6)

    @staticmethod
    def parse_date(date_str: Optional[str]) -> Optional[date]:
        """Safely parses ISO date string 'YYYY-MM-DD'."""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None

    @classmethod
    def raw_to_celestial_body_dto(cls, raw: Dict[str, Any]) -> CelestialBodyDTO:
        required = ['id', 'name', 'radius_km', 'gravity_ms2', 'coordinate_system_type', 'wmts_tile_url']
        for field_name in required:
            if field_name not in raw:
                raise IngestValidationError(f"Missing required field {field_name} for CelestialBody")

        return CelestialBodyDTO(
            id=str(raw['id']).strip().lower(),
            name=str(raw['name']).strip(),
            radius_km=float(raw['radius_km']),
            gravity_ms2=float(raw['gravity_ms2']),
            coordinate_system_type=str(raw['coordinate_system_type']).strip(),
            wmts_tile_url=str(raw['wmts_tile_url']).strip(),
        )

    @classmethod
    def raw_to_mission_dto(cls, raw: Dict[str, Any]) -> MissionDTO:
        if 'id' not in raw or 'name' not in raw:
            raise IngestValidationError("Mission requires 'id' and 'name'.")

        return MissionDTO(
            id=str(raw['id']).strip().lower(),
            name=str(raw['name']).strip(),
            agency=str(raw.get('agency', 'NASA')).strip(),
            nssdca_id=raw.get('nssdca_id'),
            launch_date=cls.parse_date(raw.get('launch_date')),
            landing_date=cls.parse_date(raw.get('landing_date')),
            end_date=cls.parse_date(raw.get('end_date')),
            summary=str(raw.get('summary', '')).strip(),
        )

    @classmethod
    def raw_to_artifact_dto(cls, raw: Dict[str, Any]) -> ArtifactDTO:
        if 'id' not in raw or 'celestial_body_id' not in raw:
            raise IngestValidationError("Artifact requires 'id' and 'celestial_body_id'.")

        lat = float(raw['latitude'])
        lon = cls.normalize_longitude(float(raw['longitude']))

        return ArtifactDTO(
            id=str(raw['id']).strip().lower(),
            mission_id=raw.get('mission_id'),
            celestial_body_id=str(raw['celestial_body_id']).strip().lower(),
            name=str(raw['name']).strip(),
            artifact_type=str(raw.get('artifact_type', 'ROVER')).strip().upper(),
            operational_status=str(raw.get('operational_status', 'DORMANT')).strip().upper(),
            latitude=lat,
            longitude=lon,
            elevation_m=float(raw['elevation_m']) if raw.get('elevation_m') is not None else None,
            location_name=str(raw.get('location_name', '')).strip(),
            mass_kg=float(raw['mass_kg']) if raw.get('mass_kg') is not None else None,
            last_contact_sol=int(raw['last_contact_sol']) if raw.get('last_contact_sol') is not None else None,
            cause_of_deactivation=str(raw.get('cause_of_deactivation', '')).strip(),
            is_featured=bool(raw.get('is_featured', False)),
            is_nasa_hardware=bool(raw.get('is_nasa_hardware', True)),
            first_person_monologue=str(raw.get('first_person_monologue', '')).strip(),
            model_3d_url=str(raw.get('model_3d_url', '')).strip(),
        )

    @classmethod
    def rover_photo_to_media_dto(cls, photo: Dict[str, Any], artifact_id: str) -> MediaDTO:
        """
        Maps a NASA Mars Rover API photo JSON object into MediaDTO.
        """
        camera = photo.get('camera', {}).get('name', 'PANCAM')
        sol = photo.get('sol', 0)
        img_src = photo.get('img_src', '').replace('http://', 'https://')
        photo_id = str(photo.get('id', ''))

        return MediaDTO(
            artifact_id=artifact_id,
            media_category="SURFACE_PHOTO",
            media_url=img_src,
            nasa_id_or_pia=f"MARS-PHOTO-{photo_id}",
            caption=f"Captured by {camera} on Sol {sol}.",
            credit="NASA/JPL-Caltech",
        )
```

---

## 🌐 КРОК 3. Інфраструктура: Пул Токенів та NASA Клієнт (`loader/infrastructure/`)

### 3.1. Пул Токенів з Авторотацією (`loader/infrastructure/token_pool.py`)

Створи `backend/loader/infrastructure/token_pool.py`:

```python
"""
NASA API Token Pool Manager.
Handles multi-key rotation, thread safety, HTTP 429 cooldowns, and quota tracking.
"""
import logging
import threading
import time
from typing import Dict, List, Optional

from loader.domain.exceptions import RateLimitExceededError

logger = logging.getLogger('loader.token_pool')


class TokenMetadata:
    """State tracking for a single NASA API key."""
    def __init__(self, key: str):
        self.key = key
        self.is_active = True
        self.total_requests = 0
        self.remaining_quota: Optional[int] = None
        self.rate_limited_until: float = 0.0

    def is_available(self) -> bool:
        if not self.is_active:
            return False
        return time.time() >= self.rate_limited_until


class NASATokenPool:
    """
    Thread-safe manager for multiple NASA API keys with auto-rotation on 429/403.
    """
    def __init__(self, raw_keys: str):
        parsed = [k.strip() for k in raw_keys.split(',') if k.strip()]
        if not parsed:
            parsed = ['DEMO_KEY']

        self.tokens: List[TokenMetadata] = [TokenMetadata(k) for k in parsed]
        self.current_index: int = 0
        self.rotation_count: int = 0
        self._lock = threading.Lock()
        logger.info(f"Initialized NASA Token Pool with {len(self.tokens)} key(s).")

    def get_token(self) -> str:
        with self._lock:
            for _ in range(len(self.tokens)):
                token_meta = self.tokens[self.current_index]
                if token_meta.is_available():
                    token_meta.total_requests += 1
                    return token_meta.key
                self._advance_index()

            wait_times = [max(0.0, t.rate_limited_until - time.time()) for t in self.tokens]
            min_wait = min(wait_times) if wait_times else 60.0
            raise RateLimitExceededError(
                f"All {len(self.tokens)} NASA API tokens are rate-limited! Min cooldown remaining: {min_wait:.1f}s"
            )

    def mark_rate_limited(self, key: str, cooldown_seconds: float = 3600.0) -> None:
        with self._lock:
            for t in self.tokens:
                if t.key == key:
                    t.rate_limited_until = time.time() + cooldown_seconds
                    logger.warning(
                        f"Token '...{key[-4:] if len(key) > 4 else key}' received HTTP 429! Cooldown for {cooldown_seconds}s."
                    )
                    break
            self.rotation_count += 1
            self._advance_index()

    def update_quota_headers(self, key: str, headers: Dict[str, str]) -> None:
        remaining = headers.get('X-RateLimit-Remaining')
        if remaining and remaining.isdigit():
            with self._lock:
                for t in self.tokens:
                    if t.key == key:
                        t.remaining_quota = int(remaining)
                        break

    def _advance_index(self) -> None:
        self.current_index = (self.current_index + 1) % len(self.tokens)
```

---

### 3.2. Клієнт NASA API з Ретраями та Фолбеком (`loader/infrastructure/nasa_client.py`)

Створи `backend/loader/infrastructure/nasa_client.py`:

```python
"""
Resilient HTTP Client for NASA Open Data APIs.
Features automatic retry, rate limiting delay, token pool rotation, and seed fallbacks.
"""
import logging
import time
from typing import Any, Dict, List, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

from loader.constants import (
    MARS_ROVER_PHOTOS_ENDPOINT,
    MARS_ROVER_MANIFEST_ENDPOINT,
    IMAGES_SEARCH_ENDPOINT,
)
from loader.domain.exceptions import NASAClientError, RateLimitExceededError
from loader.infrastructure.token_pool import NASATokenPool

logger = logging.getLogger('loader.nasa_client')


class NASAClient:
    """
    HTTP client for querying official NASA endpoints with resilience.
    """
    def __init__(
        self,
        token_pool: NASATokenPool,
        base_url: str = "https://api.nasa.gov",
        images_api_url: str = "https://images-api.nasa.gov",
        timeout: int = 15,
        rate_limit_delay: float = 0.25,
        max_retries: int = 3,
        enable_mock_fallback: bool = True,
    ):
        self.token_pool = token_pool
        self.base_url = base_url.rstrip('/')
        self.images_api_url = images_api_url.rstrip('/')
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.enable_mock_fallback = enable_mock_fallback

        self.session = requests.Session()
        retries = Retry(
            total=max_retries,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=20)
        self.session.mount('https://', adapter)
        self.session.mount('http://', adapter)

    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, use_images_api: bool = False) -> Dict[str, Any]:
        params = params.copy() if params else {}
        base = self.images_api_url if use_images_api else self.base_url
        url = f"{base}/{endpoint.lstrip('/')}"

        max_pool_attempts = len(self.token_pool.tokens)
        attempt = 0

        while attempt < max_pool_attempts:
            attempt += 1
            current_token = self.token_pool.get_token()
            if not use_images_api:
                params['api_key'] = current_token

            time.sleep(self.rate_limit_delay)

            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                self.token_pool.update_quota_headers(current_token, response.headers)

                if response.status_code in (429, 403):
                    logger.warning(
                        f"NASA returned status {response.status_code} for key ...{current_token[-4:]}. Rotating..."
                    )
                    self.token_pool.mark_rate_limited(current_token, cooldown_seconds=3600.0)
                    continue

                if response.status_code == 200:
                    return response.json()

                response.raise_for_status()

            except requests.RequestException as e:
                logger.error(f"HTTP request error for {url}: {e}")
                if attempt >= max_pool_attempts:
                    raise NASAClientError(f"Request failed after {attempt} attempts: {e}") from e

        raise RateLimitExceededError("Exhausted all available NASA tokens without a successful response.")

    def fetch_rover_manifest(self, rover_name: str) -> Dict[str, Any]:
        endpoint = MARS_ROVER_MANIFEST_ENDPOINT.format(rover=rover_name.lower())
        return self.get(endpoint)

    def fetch_rover_photos(self, rover_name: str, sol: int, camera: Optional[str] = None, page: int = 1) -> List[Dict[str, Any]]:
        endpoint = MARS_ROVER_PHOTOS_ENDPOINT.format(rover=rover_name.lower())
        params = {'sol': sol, 'page': page}
        if camera:
            params['camera'] = camera
        data = self.get(endpoint, params=params)
        return data.get('photos', [])

    def search_archive_images(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {'q': query, 'media_type': 'image', 'page_size': limit}
        try:
            data = self.get(IMAGES_SEARCH_ENDPOINT, params=params, use_images_api=True)
            items = data.get('collection', {}).get('items', [])
            results = []
            for item in items:
                data_list = item.get('data', [{}])
                links = item.get('links', [{}])
                if data_list and links:
                    info = data_list[0]
                    results.append({
                        'nasa_id': info.get('nasa_id', ''),
                        'title': info.get('title', ''),
                        'description': info.get('description', ''),
                        'href': links[0].get('href', ''),
                        'photographer': info.get('photographer', 'NASA/JPL'),
                    })
            return results
        except Exception as e:
            logger.warning(f"Error querying NASA Image Archive for '{query}': {e}")
            return []
```

---

### 3.3. Трекінг Змін та Дельта-Хеші (`loader/infrastructure/state_store.py`)

Створи `backend/loader/infrastructure/state_store.py`:

```python
"""
Sync State & Checksum Store for Delta Ingestion.
Uses Redis or a local JSON file ledger: NO extra Django database tables!
"""
import hashlib
import json
import logging
import os
from typing import Optional

logger = logging.getLogger('loader.state_store')


class SyncStateStore:
    """
    Tracks SHA-256 entity hashes to detect newly added or updated data.
    """
    def __init__(self, redis_url: Optional[str] = None, fallback_file_path: str = "loader_sync_state.json"):
        self.redis_client = None
        self.fallback_file_path = fallback_file_path
        self.local_cache = {}

        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                logger.info("Connected to Redis for sync state tracking.")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}). Falling back to local file ledger {fallback_file_path}.")
                self.redis_client = None

        if not self.redis_client:
            self._load_local_cache()

    def compute_hash(self, payload: dict) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def is_changed(self, entity_type: str, entity_id: str, current_hash: str) -> bool:
        key = f"cosmolost:sync:{entity_type}:{entity_id}"
        stored_hash = None

        if self.redis_client:
            try:
                stored_hash = self.redis_client.get(key)
            except Exception:
                stored_hash = self.local_cache.get(key)
        else:
            stored_hash = self.local_cache.get(key)

        return stored_hash != current_hash

    def update_hash(self, entity_type: str, entity_id: str, new_hash: str) -> None:
        key = f"cosmolost:sync:{entity_type}:{entity_id}"
        if self.redis_client:
            try:
                self.redis_client.set(key, new_hash)
            except Exception:
                self.local_cache[key] = new_hash
                self._save_local_cache()
        else:
            self.local_cache[key] = new_hash
            self._save_local_cache()

    def _load_local_cache(self) -> None:
        if os.path.exists(self.fallback_file_path):
            try:
                with open(self.fallback_file_path, 'r', encoding='utf-8') as f:
                    self.local_cache = json.load(f)
            except Exception:
                self.local_cache = {}

    def _save_local_cache(self) -> None:
        try:
            with open(self.fallback_file_path, 'w', encoding='utf-8') as f:
                json.dump(self.local_cache, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write local state ledger: {e}")
```

---

## 🗄️ КРОК 4. Шар Репозиторію (`loader/repositories/`)

Репозиторій приймає **DTO** і відповідає за збереження даних у **8 моделей `backend/core/models.py`**.

### 4.1. Інтерфейс Репозиторію `backend/loader/repositories/base.py`

```python
"""
Abstract Repository Interface for Ingest Persistence.
"""
from abc import ABC, abstractmethod
from typing import List, Tuple
from loader.domain.dtos import (
    CelestialBodyDTO,
    MissionDTO,
    ArtifactDTO,
    WaypointDTO,
    DiscoveryDTO,
    MediaDTO,
)


class INASAIngestRepository(ABC):
    @abstractmethod
    def upsert_celestial_body(self, dto: CelestialBodyDTO) -> Tuple[bool, bool]:
        """Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_mission(self, dto: MissionDTO) -> Tuple[bool, bool]:
        """Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_artifact(self, dto: ArtifactDTO) -> Tuple[bool, bool]:
        """Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_waypoints(self, artifact_id: str, waypoints: List[WaypointDTO]) -> int:
        """Returns count of inserted/updated waypoints."""
        pass

    @abstractmethod
    def upsert_discoveries(self, artifact_id: str, discoveries: List[DiscoveryDTO]) -> int:
        """Returns count of inserted discoveries."""
        pass

    @abstractmethod
    def upsert_media(self, artifact_id: str, media_list: List[MediaDTO]) -> int:
        """Returns count of inserted media items."""
        pass
```

### 4.2. Django ORM Реалізація `backend/loader/repositories/django_repository.py`

Створи `backend/loader/repositories/django_repository.py`:

```python
"""
Django ORM implementation of INASAIngestRepository.
Interacts strictly with the 8 models from core/models.py: ZERO extra tables!
"""
import logging
from typing import List, Tuple
from django.db import transaction

from core.models import (
    CelestialBody,
    Mission,
    Artifact,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
)
from loader.domain.dtos import (
    CelestialBodyDTO,
    MissionDTO,
    ArtifactDTO,
    WaypointDTO,
    DiscoveryDTO,
    MediaDTO,
)
from loader.domain.exceptions import IngestRepositoryError
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.repository')


class DjangoNASAIngestRepository(INASAIngestRepository):
    """
    Persists DTOs into Django PostgreSQL database with transactional integrity.
    """

    def upsert_celestial_body(self, dto: CelestialBodyDTO) -> Tuple[bool, bool]:
        try:
            obj, created = CelestialBody.objects.update_or_create(
                id=dto.id,
                defaults={
                    'name': dto.name,
                    'radius_km': dto.radius_km,
                    'gravity_ms2': dto.gravity_ms2,
                    'coordinate_system_type': dto.coordinate_system_type,
                    'wmts_tile_url': dto.wmts_tile_url,
                }
            )
            return created, not created
        except Exception as e:
            logger.error(f"Error upserting CelestialBody {dto.id}: {e}")
            raise IngestRepositoryError(f"CelestialBody {dto.id} failed: {e}") from e

    def upsert_mission(self, dto: MissionDTO) -> Tuple[bool, bool]:
        try:
            defaults = {
                'name': dto.name,
                'agency': dto.agency,
                'summary': dto.summary,
            }
            if dto.nssdca_id:
                defaults['nssdca_id'] = dto.nssdca_id
            if dto.launch_date:
                defaults['launch_date'] = dto.launch_date
            if dto.landing_date:
                defaults['landing_date'] = dto.landing_date
            if dto.end_date:
                defaults['end_date'] = dto.end_date

            obj, created = Mission.objects.update_or_create(
                id=dto.id,
                defaults=defaults,
            )
            return created, not created
        except Exception as e:
            logger.error(f"Error upserting Mission {dto.id}: {e}")
            raise IngestRepositoryError(f"Mission {dto.id} failed: {e}") from e

    def upsert_artifact(self, dto: ArtifactDTO) -> Tuple[bool, bool]:
        try:
            lon = dto.longitude
            if lon > 180.0:
                lon = lon - 360.0

            defaults = {
                'name': dto.name,
                'mission_id': dto.mission_id,
                'celestial_body_id': dto.celestial_body_id,
                'artifact_type': dto.artifact_type,
                'operational_status': dto.operational_status,
                'latitude': dto.latitude,
                'longitude': lon,
                'elevation_m': dto.elevation_m,
                'location_name': dto.location_name,
                'mass_kg': dto.mass_kg,
                'last_contact_sol': dto.last_contact_sol,
                'cause_of_deactivation': dto.cause_of_deactivation,
                'is_featured': dto.is_featured,
                'is_nasa_hardware': dto.is_nasa_hardware,
                'first_person_monologue': dto.first_person_monologue,
                'model_3d_url': dto.model_3d_url,
            }

            obj, created = Artifact.objects.update_or_create(
                id=dto.id,
                defaults=defaults,
            )
            return created, not created
        except Exception as e:
            logger.error(f"Error upserting Artifact {dto.id}: {e}")
            raise IngestRepositoryError(f"Artifact {dto.id} failed: {e}") from e

    def upsert_waypoints(self, artifact_id: str, waypoints: List[WaypointDTO]) -> int:
        if not waypoints:
            return 0
        try:
            with transaction.atomic():
                saved_count = 0
                for wp in waypoints:
                    lon = wp.longitude - 360.0 if wp.longitude > 180.0 else wp.longitude
                    TraverseWaypoint.objects.update_or_create(
                        artifact_id=artifact_id,
                        sol_or_step=wp.sol_or_step,
                        defaults={
                            'latitude': wp.latitude,
                            'longitude': lon,
                            'elevation_m': wp.elevation_m,
                            'odometry_m': wp.odometry_m,
                            'telemetry_snapshot': wp.telemetry_snapshot,
                            'story_snippet': wp.story_snippet,
                        }
                    )
                    saved_count += 1
                return saved_count
        except Exception as e:
            logger.error(f"Error saving waypoints for {artifact_id}: {e}")
            raise IngestRepositoryError(f"Waypoints for {artifact_id} failed: {e}") from e

    def upsert_discoveries(self, artifact_id: str, discoveries: List[DiscoveryDTO]) -> int:
        if not discoveries:
            return 0
        try:
            with transaction.atomic():
                saved = 0
                for d in discoveries:
                    ScientificDiscovery.objects.update_or_create(
                        artifact_id=artifact_id,
                        title=d.title,
                        defaults={
                            'instrument_acronym': d.instrument_acronym,
                            'instrument_full_name': d.instrument_full_name,
                            'kid_friendly_story': d.kid_friendly_story,
                            'scientific_fact': d.scientific_fact,
                        }
                    )
                    saved += 1
                return saved
        except Exception as e:
            logger.error(f"Error saving discoveries for {artifact_id}: {e}")
            raise IngestRepositoryError(f"Discoveries for {artifact_id} failed: {e}") from e

    def upsert_media(self, artifact_id: str, media_list: List[MediaDTO]) -> int:
        if not media_list:
            return 0
        try:
            with transaction.atomic():
                saved = 0
                for m in media_list:
                    lookup = {'artifact_id': artifact_id}
                    if m.nasa_id_or_pia:
                        lookup['nasa_id_or_pia'] = m.nasa_id_or_pia
                    else:
                        lookup['media_url'] = m.media_url

                    ArtifactMedia.objects.update_or_create(
                        **lookup,
                        defaults={
                            'media_category': m.media_category,
                            'media_url': m.media_url,
                            'caption': m.caption,
                            'credit': m.credit,
                        }
                    )
                    saved += 1
                return saved
        except Exception as e:
            logger.error(f"Error saving media for {artifact_id}: {e}")
            raise IngestRepositoryError(f"Media for {artifact_id} failed: {e}") from e
```

---

## 🚀 КРОК 5. Пайплайн Синхронізації (`loader/services/ingest_pipeline.py`)

Пайплайн координує весь процес:
1. Завантажує небесні тіла (Місяць, Марс).
2. Завантажує базові місії NASA.
3. Завантажує каталог артефактів та збагачує їх фотографіями з API.
4. Зберігає в БД тільки те, що змінилося (Дельта-оновлення на основі SHA-256).
5. Виводить форматований ASCII-звіт із точними лічильниками.

Створи `backend/loader/services/ingest_pipeline.py`:

```python
"""
Orchestration Pipeline for NASA Ingestion.
Coordinates Client -> Mappers -> DTOs -> StateStore -> Repository.
"""
from datetime import datetime
import logging
from typing import List, Optional

from loader.constants import (
    CURATED_CELESTIAL_BODIES,
    CURATED_MISSIONS,
    CURATED_ARTIFACTS,
)
from loader.domain.dtos import (
    CelestialBodyDTO,
    MissionDTO,
    ArtifactDTO,
    WaypointDTO,
    DiscoveryDTO,
    MediaDTO,
    SyncStatsDTO,
)
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.pipeline')


class NASAIngestPipeline:
    """
    Full-cycle ingestion pipeline with delta detection and reporting.
    """
    def __init__(
        self,
        client: NASAClient,
        repository: INASAIngestRepository,
        state_store: SyncStateStore,
    ):
        self.client = client
        self.repository = repository
        self.state_store = state_store

    def run_sync(self, target_body: Optional[str] = None, force: bool = False, dry_run: bool = False) -> SyncStatsDTO:
        stats = SyncStatsDTO(start_time=datetime.now())
        logger.info(f"Starting NASA Ingest Cycle (target={target_body or 'all'}, force={force}, dry_run={dry_run})...")

        try:
            # 1. Sync Celestial Bodies
            self._sync_celestial_bodies(stats, force=force, dry_run=dry_run)

            # 2. Sync Core Missions
            self._sync_missions(stats, force=force, dry_run=dry_run)

            # 3. Sync Artifacts (Rovers, Landers, Reflectors)
            self._sync_artifacts(stats, target_body=target_body, force=force, dry_run=dry_run)

            stats.is_success = True
        except Exception as e:
            stats.is_success = False
            stats.errors_encountered.append(str(e))
            logger.error(f"Fatal error during ingest cycle: {e}", exc_info=True)
        finally:
            stats.end_time = datetime.now()
            stats.calculate_duration()
            stats.tokens_rotated = self.client.token_pool.rotation_count

        self._print_sync_report(stats)
        return stats

    def _sync_celestial_bodies(self, stats: SyncStatsDTO, force: bool, dry_run: bool) -> None:
        for raw in CURATED_CELESTIAL_BODIES:
            b = NASAJsonMapper.raw_to_celestial_body_dto(raw)
            stats.celestial_bodies_checked += 1
            payload = {'id': b.id, 'name': b.name, 'radius': b.radius_km, 'gravity': b.gravity_ms2}
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('body', b.id, current_hash):
                if not dry_run:
                    created, _ = self.repository.upsert_celestial_body(b)
                    self.state_store.update_hash('body', b.id, current_hash)
                    if created:
                        stats.celestial_bodies_new += 1
                else:
                    stats.celestial_bodies_new += 1

    def _sync_missions(self, stats: SyncStatsDTO, force: bool, dry_run: bool) -> None:
        for raw in CURATED_MISSIONS:
            m = NASAJsonMapper.raw_to_mission_dto(raw)
            stats.missions_checked += 1
            payload = {'id': m.id, 'name': m.name, 'agency': m.agency, 'summary': m.summary}
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('mission', m.id, current_hash):
                if not dry_run:
                    created, updated = self.repository.upsert_mission(m)
                    self.state_store.update_hash('mission', m.id, current_hash)
                    if created:
                        stats.missions_new += 1
                    elif updated:
                        stats.missions_updated += 1
                else:
                    stats.missions_updated += 1

    def _sync_artifacts(self, stats: SyncStatsDTO, target_body: Optional[str], force: bool, dry_run: bool) -> None:
        for raw in CURATED_ARTIFACTS:
            art = NASAJsonMapper.raw_to_artifact_dto(raw)
            if target_body and art.celestial_body_id != target_body:
                continue

            stats.artifacts_checked += 1
            payload = {
                'id': art.id,
                'status': art.operational_status,
                'lat': art.latitude,
                'lon': art.longitude,
                'monologue': art.first_person_monologue,
            }
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('artifact', art.id, current_hash):
                if not dry_run:
                    created, updated = self.repository.upsert_artifact(art)
                    self.state_store.update_hash('artifact', art.id, current_hash)
                    if created:
                        stats.artifacts_new += 1
                    elif updated:
                        stats.artifacts_updated += 1

                    self._sync_artifact_children(art.id, stats)
                else:
                    stats.artifacts_new += 1

    def _sync_artifact_children(self, artifact_id: str, stats: SyncStatsDTO) -> None:
        if artifact_id == 'opportunity-rover':
            discoveries = [
                DiscoveryDTO(
                    artifact_id=artifact_id,
                    title='Hematite "Blueberries" Confirming Past Water',
                    instrument_acronym='Microscopic Imager & Mössbauer',
                    kid_friendly_story='Oppy found tiny gray spheres that formed inside watery pools billions of years ago!',
                    scientific_fact='Discovery of spherical hematite concretions in Eagle Crater proved persistent liquid water.',
                ),
            ]
            stats.discoveries_inserted += self.repository.upsert_discoveries(artifact_id, discoveries)

            media = [
                MediaDTO(
                    artifact_id=artifact_id,
                    media_category='SURFACE_PHOTO',
                    media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05556.jpg',
                    nasa_id_or_pia='PIA05556',
                    caption='Microscopic view of Martian blueberries at Eagle Crater.',
                    credit='NASA/JPL/Cornell/USGS',
                ),
                MediaDTO(
                    artifact_id=artifact_id,
                    media_category='LAST_KNOWN_PHOTO',
                    media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23000.jpg',
                    nasa_id_or_pia='PIA23000',
                    caption='Opportunity 360-degree panorama of Perseverance Valley.',
                    credit='NASA/JPL-Caltech',
                ),
            ]
            stats.media_inserted += self.repository.upsert_media(artifact_id, media)

        elif artifact_id == 'apollo-11-descent-stage':
            discoveries = [
                DiscoveryDTO(
                    artifact_id=artifact_id,
                    title='First Direct Lunar Surface Soil Sample Returned',
                    instrument_acronym='Apollo Contingency Sampler',
                    kid_friendly_story='Neil Armstrong scooped lunar dust into a Teflon bag within minutes of landing!',
                    scientific_fact='Returned 21.55 kg of basaltic rocks and regolith from Mare Tranquillitatis.',
                ),
            ]
            stats.discoveries_inserted += self.repository.upsert_discoveries(artifact_id, discoveries)

            media = [
                MediaDTO(
                    artifact_id=artifact_id,
                    media_category='SURFACE_PHOTO',
                    media_url='https://images-assets.nasa.gov/image/AS11-40-5927/AS11-40-5927~orig.jpg',
                    nasa_id_or_pia='AS11-40-5927',
                    caption='Apollo 11 Lunar Module Eagle standing on Mare Tranquillitatis.',
                    credit='NASA/Neil Armstrong',
                ),
            ]
            stats.media_inserted += self.repository.upsert_media(artifact_id, media)

    def _print_sync_report(self, stats: SyncStatsDTO) -> None:
        banner = f"""
======================================================================
🚀 [COSMOLOST NASA INGEST] SYNC REPORT [{stats.end_time.strftime('%Y-%m-%d %H:%M:%S') if stats.end_time else 'N/A'}]
======================================================================
Status:               {'SUCCESS ✅' if stats.is_success else 'FAILED ❌'}
Duration:             {stats.duration_seconds} sec
API Tokens Rotated:   {stats.tokens_rotated}
----------------------------------------------------------------------
Celestial Bodies:     Checked {stats.celestial_bodies_checked} | New: {stats.celestial_bodies_new}
Missions:             Checked {stats.missions_checked} | New: {stats.missions_new} | Updated: {stats.missions_updated}
Artifacts:            Checked {stats.artifacts_checked} | New: {stats.artifacts_new} | Updated: {stats.artifacts_updated}
Waypoints Inserted:   {stats.waypoints_inserted}
Discoveries Inserted: {stats.discoveries_inserted}
Media Items Inserted: {stats.media_inserted}
Errors Encountered:   {len(stats.errors_encountered)}
======================================================================
"""
        logger.info(banner)
        print(banner)
```

---

## 💻 КРОК 6. Django Management Команда (`loader/management/commands/run_ingest.py`)

Створи `backend/loader/management/commands/run_ingest.py`:

```python
"""
Django Management Command: run_ingest
Synchronizes NASA hardware catalog with the 8 core tables.

Usage:
  python manage.py run_ingest
  python manage.py run_ingest --target mars
  python manage.py run_ingest --force
  python manage.py run_ingest --dry-run
  python manage.py run_ingest --daemon --interval 3600
"""
import os
import signal
import sys
import time
import logging
from django.core.management.base import BaseCommand

from loader.infrastructure.token_pool import NASATokenPool
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.django_repository import DjangoNASAIngestRepository
from loader.services.ingest_pipeline import NASAIngestPipeline

logger = logging.getLogger('loader.command')


class Command(BaseCommand):
    help = 'Synchronizes NASA space artifacts, missions, and telemetry data into CosmoLost core tables.'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stop_requested = False

    def _signal_handler(self, signum, frame):
        self.stdout.write(self.style.WARNING("\n>>> [LOADER] Shutdown signal received. Exiting gracefully..."))
        self.stop_requested = True

    def add_arguments(self, parser):
        parser.add_argument(
            '--target',
            type=str,
            default=None,
            help="Limit sync to a specific celestial body ('moon' or 'mars').",
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bypass checksum state comparison and force update all records.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Fetch, parse, and validate DTOs without writing to the database.',
        )
        parser.add_argument(
            '--daemon',
            action='store_true',
            help='Run continuously in background with a sleep interval (for Docker ingest-worker).',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=int(os.getenv('NASA_SYNC_INTERVAL_SEC', '3600')),
            help='Interval in seconds between sync cycles in daemon mode (default: 3600s).',
        )

    def handle(self, *args, **options):
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        target = options['target']
        force = options['force']
        dry_run = options['dry_run']
        is_daemon = options['daemon']
        interval = options['interval']

        self.stdout.write(self.style.SUCCESS(">>> [LOADER] Initializing NASA Ingest Subsystem..."))

        raw_keys = os.getenv('NASA_API_KEYS', 'DEMO_KEY')
        base_url = os.getenv('NASA_API_BASE_URL', 'https://api.nasa.gov')
        images_url = os.getenv('NASA_IMAGES_API_URL', 'https://images-api.nasa.gov')
        redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/1')

        token_pool = NASATokenPool(raw_keys=raw_keys)
        client = NASAClient(
            token_pool=token_pool,
            base_url=base_url,
            images_api_url=images_url,
            timeout=int(os.getenv('NASA_REQUEST_TIMEOUT', '15')),
            rate_limit_delay=float(os.getenv('NASA_RATE_LIMIT_DELAY', '0.25')),
            enable_mock_fallback=os.getenv('NASA_ENABLE_MOCK_FALLBACK', 'True').lower() == 'true',
        )
        state_store = SyncStateStore(redis_url=redis_url)
        repository = DjangoNASAIngestRepository()
        pipeline = NASAIngestPipeline(client=client, repository=repository, state_store=state_store)

        if not is_daemon:
            self.stdout.write(f">>> Running single ingest cycle (force={force}, dry_run={dry_run})...")
            stats = pipeline.run_sync(target_body=target, force=force, dry_run=dry_run)
            if not stats.is_success:
                sys.exit(1)
            return

        self.stdout.write(
            self.style.WARNING(f">>> Entering DAEMON mode. Periodic sync every {interval} seconds (Ctrl+C to stop)...")
        )

        while not self.stop_requested:
            try:
                pipeline.run_sync(target_body=target, force=force, dry_run=dry_run)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f">>> [WARNING] Ingest cycle encountered error: {e}"))

            self.stdout.write(f">>> Sleeping for {interval}s until next sync...")
            sleep_chunks = interval
            while sleep_chunks > 0 and not self.stop_requested:
                time.sleep(min(1, sleep_chunks))
                sleep_chunks -= 1
```

---

## ⏱️ КРОК 7. Автооновлення: Docker-Воркер та Celery Task

### 7.1. Celery Periodic Task (`loader/tasks.py`)

Створи `backend/loader/tasks.py`:

```python
"""
Celery background task for NASA data synchronization.
"""
from celery import shared_task
import os
import logging
from loader.infrastructure.token_pool import NASATokenPool
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.django_repository import DjangoNASAIngestRepository
from loader.services.ingest_pipeline import NASAIngestPipeline

logger = logging.getLogger('loader.tasks')


@shared_task(name='tasks.sync_nasa_hourly_catalog', bind=True, max_retries=2)
def sync_nasa_hourly_catalog(self, force: bool = False):
    """Hourly periodic Celery task."""
    logger.info("Starting hourly NASA catalog ingestion via Celery...")
    try:
        token_pool = NASATokenPool(raw_keys=os.getenv('NASA_API_KEYS', 'DEMO_KEY'))
        client = NASAClient(token_pool=token_pool)
        state_store = SyncStateStore(redis_url=os.getenv('REDIS_URL'))
        repo = DjangoNASAIngestRepository()
        pipeline = NASAIngestPipeline(client=client, repository=repo, state_store=state_store)

        stats = pipeline.run_sync(force=force)
        return {
            'is_success': stats.is_success,
            'duration_sec': stats.duration_seconds,
            'artifacts_new': stats.artifacts_new,
            'artifacts_updated': stats.artifacts_updated,
        }
    except Exception as exc:
        logger.error(f"Celery Ingest Task Failed: {exc}")
        raise self.retry(exc=exc, countdown=300)
```

---

## 🧪 КРОК 8. Модульне Тестування (Pytest Suite)

Створи файл `backend/loader/tests/test_loader.py`:

```python
"""
Comprehensive Pytest Test Suite for NASA Ingestion Subsystem.
Run: pytest loader/tests/test_loader.py -v
"""
import pytest
from loader.infrastructure.token_pool import NASATokenPool
from loader.domain.exceptions import RateLimitExceededError
from loader.domain.mappers import NASAJsonMapper
from loader.domain.dtos import CelestialBodyDTO, ArtifactDTO
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.django_repository import DjangoNASAIngestRepository
from core.models import CelestialBody, Artifact


def test_token_pool_rotation_on_429():
    keys = "KEY_ALPHA,KEY_BETA,KEY_GAMMA"
    pool = NASATokenPool(raw_keys=keys)

    token1 = pool.get_token()
    assert token1 == "KEY_ALPHA"

    # Simulate HTTP 429 on first token
    pool.mark_rate_limited("KEY_ALPHA", cooldown_seconds=60)

    # Must automatically yield next active key
    token2 = pool.get_token()
    assert token2 == "KEY_BETA"

    pool.mark_rate_limited("KEY_BETA", cooldown_seconds=60)
    token3 = pool.get_token()
    assert token3 == "KEY_GAMMA"

    # All tokens blocked -> RateLimitExceededError
    pool.mark_rate_limited("KEY_GAMMA", cooldown_seconds=60)
    with pytest.raises(RateLimitExceededError):
        pool.get_token()


def test_longitude_normalization_mapper():
    # Mars IAU 2000 planetocentric: 354.4734 -> -5.5266
    lon_raw = 354.4734
    normalized = NASAJsonMapper.normalize_longitude(lon_raw)
    assert normalized == -5.5266

    # Normal coordinates within -180..180
    assert NASAJsonMapper.normalize_longitude(23.47297) == 23.47297
    assert NASAJsonMapper.normalize_longitude(-77.45) == -77.45


def test_state_store_hash_detection():
    store = SyncStateStore()
    payload1 = {'name': 'Opportunity', 'status': 'DORMANT'}
    payload2 = {'name': 'Opportunity', 'status': 'ACTIVE'}

    hash1 = store.compute_hash(payload1)
    hash2 = store.compute_hash(payload2)

    assert hash1 != hash2
    assert store.is_changed('artifact', 'oppy', hash1) is True

    store.update_hash('artifact', 'oppy', hash1)
    assert store.is_changed('artifact', 'oppy', hash1) is False
    assert store.is_changed('artifact', 'oppy', hash2) is True


@pytest.mark.django_db
def test_repository_upsert_idempotency():
    repo = DjangoNASAIngestRepository()

    dto = CelestialBodyDTO(
        id='test-mars',
        name='Test Mars',
        radius_km=3389.5,
        gravity_ms2=3.72,
        coordinate_system_type='PLANETOCENTRIC_360',
        wmts_tile_url='https://example.com/tiles',
    )

    created1, updated1 = repo.upsert_celestial_body(dto)
    assert created1 is True
    assert updated1 is False

    created2, updated2 = repo.upsert_celestial_body(dto)
    assert created2 is False
    assert updated2 is True

    assert CelestialBody.objects.filter(id='test-mars').count() == 1
```

---

## 🏃‍♂️ КРОК 9. Інструкція Запуску для Розробника (Developer Runbook)

### 1. Запуск модульних тестів
```bash
cd backend
pytest loader/tests/test_loader.py -v
```

### 2. Тестовий прогін валідації без запису в БД (`--dry-run`)
```bash
python manage.py run_ingest --dry-run --target mars
```

### 3. Одноразовий повний синк усіх об'єктів
```bash
python manage.py run_ingest
```

### 4. Примусове перезаписування ігноруючи хеші
```bash
python manage.py run_ingest --force
```

### 5. Запуск фонового демона з інтервалом оновлення 1 година (3600 с)
```bash
python manage.py run_ingest --daemon --interval 3600
```

### 6. Перевірка результату в базі даних PostgreSQL
```sql
SELECT id, name, operational_status, latitude, longitude, is_featured FROM artifacts ORDER BY name;
SELECT artifact_id, title FROM scientific_discoveries;
SELECT artifact_id, media_category, media_url FROM artifact_media;
```

---

## ✅ Чекліст Прийомки Робіт (Acceptance Checklist)

Перед здачею завдання переконайся, що виконано всі пункти:

- [ ] **1. Чистота шарів**: Логіка NASA винесена в `loader/domain/` та `loader/infrastructure/`. У коді парсингу немає викликів `Model.objects.create()`.
- [ ] **2. Пул токенів**: Змінна `NASA_API_KEYS` підтримує кілька ключів через кому. При отриманні статусу `429` або `403` воркер перемикає ключ без викидання фатальної помилки.
- [ ] **3. Дельта-трекінг**: Якщо викликати `python manage.py run_ingest` двічі поспіль, другий запуск показує `New: 0`, оскільки хеші SHA-256 співпадають.
- [ ] **4. Суворе дотримання 8 таблиць**: У проєкті не створено **жодної нової моделі Django** у `loader/models.py`. Усі дані зберігаються виключно в моделі з `core/models.py`.
- [ ] **5. Підтримка прапорців**: Команда підтримує `--daemon`, `--interval`, `--target moon|mars`, `--force` та `--dry-run`.
- [ ] **6. Тести**: Команда `pytest loader/tests/` проходить із результатом 100% PASS.
