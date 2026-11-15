# Чекліст: NASA Ingestion Worker & Loader (04_NASA_INGESTION_LOADER_WORKER_CHECKLIST.md)

> **Модуль**: `backend/loader/`  
> **Статус аудиту Batch 1**: **97.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість тестів**: 18 тестів (`loader/tests/test_loader.py`) — всі успішні  
> **Нормативна база**: `FEAT-06`, `TASK_NASA_INGEST_LOADER_GUIDE.md`, `03_OPERATIONS`

---

## 1. Чиста Архітектура та Надійність Завантаження

- [x] **Багатотокенний пул NASA (`NASATokenPool`)**:
  - [x] Підтримка кількох ключів у `NASA_API_KEYS` (розділених комами).
  - [x] Автоматична ротація токенів при отриманні HTTP 429 (Too Many Requests) або HTTP 403.
  - [x] Відстеження заголовків квоти `X-RateLimit-Remaining` та затримка перед вичерпанням.
  - [x] Автоматичний перехід на резервний `DEMO_KEY` при порожньому пулі.
- [x] **Дельта-трекінг змін (`SyncStateStore`)**:
  - [x] Хешування DTO сутностей за алгоритмом SHA-256.
  - [x] Збереження контрольних сум у Redis або атомарний файл `loader_sync_state.json`.
  - [x] Пропуск запису в базу даних, якщо контрольна сума об'єкта не змінилася (Zero DB Waste).
- [x] **Репозиторій завантаження (`DjangoNASAIngestRepository`)**:
  - [x] Суворе збереження виключно у 8 існуючих таблиць `backend/core/models.py`.
  - [x] Ідемпотентна логіка `update_or_create` (жодних дублікатів при повторних запусках).
  - [x] Збереження зв'язків: місії $\to$ артефакти $\to$ медіа $\to$ відкриття $\to$ вейпоінти.
- [x] **Безпека та Санітизація**:
  - [x] Захист від введення невалідних чисел `NaN` / `Infinity` у широту та довготу.
  - [x] Блокування небезпечних протоколів (`javascript:`, `data:`, `file:`) в посиланнях на медіа.
  - [x] Обрізка наддовгих рядків згідно з обмеженнями моделей `CharField`.
- [x] **Curated Offline Seeds (Fallback режим)**:
  - [x] Повний автономний набір верифікованих даних для Tier-1 апаратів:
    - Apollo 11 (Eagle), Apollo 14 (Antares), Apollo 15 (Falcon + Lunar Rover).
    - Mars: Sojourner (Pathfinder), Spirit, Opportunity, Curiosity, Perseverance, Ingenuity, InSight.
  - [x] Можливість роботи в автономному режимі `NASA_ENABLE_MOCK_FALLBACK=True` без підключення до мережі інтернет.
- [x] **Команда керування (`management/commands/run_ingest.py`)**:
  - [x] Прапорець `--daemon`: запуск нескінченного циклу з інтервалом `--interval 3600`.
  - [x] Прапорець `--target`: вибіркове завантаження (`moon` або `mars`).
  - [x] Прапорець `--force`: ігнорування дельта-хешів та повне перезавантаження.
  - [x] Прапорець `--dry-run`: перевірка без запису змін у БД.
  - [x] Форматований вивід ASCII таблиці зі статистикою (створено, оновлено, пропущено).
- [x] **Фонові завдання та API-тригер**:
  - [x] Таск для `django_tasks`: `sync_nasa_catalog_task`.
  - [x] Таск для `Celery`: `sync_nasa_hourly_catalog`.
  - [x] API ендпоінт ручного запуску: `POST /api/v1/loader/sync-nasa-catalog/`.

---

## 2. Завдання на Batch 2
- [ ] Підключення додаткових джерел NASA: розширення бази на місії Surveyor, Viking та масив GeoJSON MMGIS для точних точок треків Apollo LRV.

---

## 3. Статус для Клієнта
- **Готовність**: **97%**
- **Приймання**: Повністю верифіковано 18 Pytest тестами.
