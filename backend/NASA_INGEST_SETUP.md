# 🚀 Інструкція: Налаштування NASA Data Ingest, Секретів (.env) та Запуск

Цей документ містить повну інструкцію з розгортання, конфігурації секретів оточення, встановлення залежностей та запуску підсистеми синхронізації даних NASA (`backend/loader/`) для проєкту **CosmoLost** («Abandoned but not Forgotten»).

---

## 🔑 1. Налаштування Секретів та Змінних Оточення (`.env`)

Створіть файл `.env` у корені каталогу `backend/` (на основі наданого `.env.example`):

```bash
cp .env.example .env
```

### Таблиця параметрів конфігурації

| Змінна | Опис | Значення за замовчуванням | Рекомендація для продакшну |
| :--- | :--- | :--- | :--- |
| `NASA_API_KEYS` | Пул токенів NASA через кому без пробілів | `DEMO_KEY` | Зареєструвати 2–4 безкоштовні ключі на [api.nasa.gov](https://api.nasa.gov) |
| `NASA_API_BASE_URL` | Базовий шлюз NASA REST API | `https://api.nasa.gov` | `https://api.nasa.gov` |
| `NASA_IMAGES_API_URL` | Ендпоінт медіабібліотеки NASA (без ключа) | `https://images-api.nasa.gov` | `https://images-api.nasa.gov` |
| `MARS_ROVER_API_BASE_URL` | (Опціонально) Дзеркало для Mars Rover Photos | `None` (офіційний NASA Image Archive) | `None` або URL дзеркала |
| `NASA_SYNC_INTERVAL_SEC` | Інтервал синхронізації для daemon-режиму | `3600` (1 година) | `3600` або `7200` |
| `NASA_RATE_LIMIT_DELAY` | Затримка між запитами (секунди) | `0.25` | `0.25` |
| `NASA_REQUEST_TIMEOUT` | Таймаут одного HTTP-запиту (секунди) | `15` | `15` |
| `NASA_MAX_RETRIES` | Кількість повторних спроб при збоях мережі | `3` | `3` |
| `NASA_ENABLE_MOCK_FALLBACK` | Захист від блекауту (fallback на кураторські сіди) | `True` | `True` |
| `REDIS_URL` | Підключення до Redis для SHA-256 хешів | `redis://localhost:6379/1` | Redis контейнер або `None` (локальний JSON) |

### Як отримати безкоштовні ключі NASA API
1. Перейдіть на [https://api.nasa.gov/](https://api.nasa.gov/) у блок **Generate API Key**.
2. Вкажіть ім'я, прізвище та робочий email.
3. Отриманий ключ має ліміт **1 000 запитів на годину**.
4. Додайте 2 або більше ключів у `NASA_API_KEYS=KEY1,KEY2,KEY3`. Ротатор `NASATokenPool` автоматично перемикатиме ключі при отриманні HTTP 429/403.

---

## 📦 2. Встановлення Залежностей

Проєкт керується за допомогою менеджера пакетів **uv**:

```bash
# Встановлення всіх залежностей у віртуальне оточення (.venv)
uv sync

# Або пряме додавання пакетів (вже зафіксовано в pyproject.toml)
uv add requests redis
```

---

## 🏛️ 3. Архітектура Підсистеми (Clean Layered Architecture)

Код модуля `backend/loader/` реалізований за принципами чистої архітектури без прив'язки до деталей ORM на рівні парсингу:

```
backend/loader/
├── constants.py                     # Ендпоінти NASA, тайли Treks WMTS, еталонні каталоги
├── domain/                          # Чистий Python без Django
│   ├── dtos.py                      # Frozen Dataclasses (CelestialBodyDTO, ArtifactDTO...)
│   ├── exceptions.py                # LoaderBaseException, RateLimitExceededError...
│   └── mappers.py                   # Нормалізація координат (-180..180), дат, парсинг JSON
├── infrastructure/                  # Мережа та стан
│   ├── token_pool.py                # Thread-safe ротатор ключів з cooldown
│   ├── nasa_client.py               # HTTP-клієнт з ретраями (urllib3) та фолбеком
│   └── state_store.py               # Дельта-синхронізація (SHA-256 хеші у Redis або JSON)
├── repositories/                    # Збереження DTO у 8 моделей core/models.py
│   ├── base.py                      # Абстрактний інтерфейс INASAIngestRepository
│   └── django_repository.py         # Ідемпотентні upsert, update_or_create, транзакції
├── services/                        # Окремі сервіси на кожен ресурс (паралельність/асинхронність)
│   ├── celestial_bodies_service.py  # Імпорт Місяця та Марса
│   ├── missions_service.py          # Синхронізація місій NASA (Apollo, MER, MSL, M20)
│   ├── artifacts_service.py         # Синхронізація апаратів (ровери, платформи, ретрорефлектори)
│   ├── rover_photos_service.py      # Mars Rover Photos API (архівні кадри, фінальні солі)
│   ├── archive_media_service.py     # images-api.nasa.gov (орбітальні знімки LROC/HiRISE)
│   ├── traverse_waypoints_service.py# MMGIS GeoJSON (точки маршрутів з downsampling)
│   ├── discoveries_service.py       # Наукові відкриття з описом для школярів
│   └── ingest_pipeline.py           # Головний оркестратор з паралельним ThreadPoolExecutor
├── management/commands/
│   └── run_ingest.py                # CLI команда з підтримкою аргументів та демона
├── tasks.py                         # Фонова черга django_tasks (@task) та Celery
└── tests/
    └── test_loader.py               # Комплексний набір тестів із моканням усіх API
```

---

## 🏃 4. Запуск Синхронізації через CLI

### 4.1. Тестовий запуск без запису в базу даних (`--dry-run`)
```bash
uv run python manage.py run_ingest --dry-run
```

### 4.2. Синхронізація лише для конкретного небесного тіла
```bash
uv run python manage.py run_ingest --target mars
# або
uv run python manage.py run_ingest --target moon
```

### 4.3. Повна синхронізація із примусовим оновленням (`--force`)
Ігнорує кешовані SHA-256 хеші та примусово перезаписує дані:
```bash
uv run python manage.py run_ingest --force
```

### 4.4. Запуск у режимі демона (`--daemon`)
Працює у фоновому процесі (підходить для docker-контейнера `ingest-worker`):
```bash
uv run python manage.py run_ingest --daemon --interval 3600
```

---

## 🖥️ 5. Управління через Панель Адміністратора (Django Unfold Admin)

У панелі адміністратора інтегровано швидкі дії для виклику синхронізації:

1. **Синхронізація артефактів (`Artifacts`):**
   * Перейдіть у розділ `Planetary Core -> Artifacts`.
   * Виберіть потрібні апарати або всі.
   * У випадаючому меню дій оберіть:
     * `Sync selected artifacts with NASA APIs` — точкове оновлення.
     * `Force full NASA Ingest (All celestial bodies & missions)` — повне оновлення всього каталогу.
   * Натисніть **Виконати**. У верхній частині з'явиться зелений банер із детальним звітом (кількість створених/оновлених артефактів, вейпоінтів та медіа).

2. **Синхронізація небесних тіл (`Celestial Bodies`):**
   * Перейдіть у `Planetary Core -> Celestial Bodies`.
   * Оберіть `Moon` або `Mars`.
   * Оберіть дію `Sync hardware for selected celestial bodies from NASA`.

---

## ⚙️ 6. Виклик через Фоновий Планувальник (`django_tasks`)

У коді реалізована пряма інтеграція із модулем фонових задач `django_tasks`:

```python
from loader.tasks import sync_nasa_catalog_task

# Запуск фонової задачі в черзі
task_result = sync_nasa_catalog_task.enqueue(target_body='mars', force=False)
```

Також підтримується виклик через Celery Worker (`tasks.sync_nasa_hourly_catalog`).

---

## 🧪 7. Запуск Тестів

Усі модулі, математичні нормалізатори, ротація ключів при 429, ідемпотентність репозиторіїв та оркестратор покриті тестами із 100% ізоляцією (всі зовнішні виклики NASA замокані):

```bash
uv run pytest loader/tests/test_loader.py -v
```

Запуск усіх тестів бекенду:
```bash
uv run pytest -v
```
