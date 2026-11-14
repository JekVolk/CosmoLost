# CosmoLost Backend — Підсумок Контексту та Архітектурний Звіт (CONTEXT_SUMMARY)

> **Гілка Git**: `feature/backend/api-portal` (створена на основі `feature/backend/database`)  
> **Контур**: Web Portal API (`/api/v1/portal/` та `/api/web/`)  
> **Статус**: Реалізовано, оптимізовано та на 100% покрито тестами (`35 passed`)  
> **Дата створення**: 14 листопада 2026 року  

---

## 1. Загальний Контекст Проєкту CosmoLost

**CosmoLost («Abandoned, but not forgotten»)** — освітня 3D-платформа та інструментарій контент-мейкера, присвячений космічним апаратам, роверам, посадковим модулям та історичним артефактам, залишеним людством на Місяці, Марсі та у глибокому космосі.

### Архітектурні зони екосистеми:
1. **Portal API (`/api/v1/portal/` / `/api/web/`)**: Швидкий публічний API читання (<50 мс) для Three.js 3D-вебпорталу (каталог планет, картки артефактів, просторова кластеризація, медіа, відкриття, треки пересування, публікації спільноти).
2. **Editor API (`/api/v1/editor/` / `/api/desktop/`)**: Обмін даними для десктопного редактора «Фабрика контенту» (Tauri v2, Local-First сховище чернеток, генерація монтажних пакетів, шаблони SMM-рубрик, підбір наступних тем).
3. **Ingestion API (`/api/v1/loader/`)**: Автоматизовані конвеєри синхронізації з офіційними каталогами NASA (PDS, NSSDCA, Horizons).
4. **FastMCP Protocol**: Стандартизований інтерфейс інструментів для зовнішніх LLM-агентів (Gemini, Claude).

---

## 2. Суворе Архітектурне Обмеження: 8 Моделей БД

Вся бізнес-логіка базується строго на 8 існуючих таблицях PostgreSQL (`backend/core/models.py`). Жодних нових моделей чи міграцій до БД не додавалося:
1. `CelestialBody` (`celestial_bodies`) — Місяць, Марс, радіуси, прискорення вільного падіння, системи координат, WMTS-шаблони NASA Treks.
2. `Mission` (`missions`) — програми польотів NASA / міжнародні місії, дати запуску та посадки, NSSDCA ID.
3. `Artifact` (`artifacts`) — апарати, ступені, прилади, координати, статус, англомовний монолог (en-US), лінк на `.glb` 3D-модель.
4. `TraverseWaypoint` (`traverse_waypoints`) — маршрутні точки пересування з показниками телеметрії (живлення, пил, нахил).
5. `ScientificDiscovery` (`scientific_discoveries`) — підтверджені наукові відкриття (науковий факт + дитяча адаптація).
6. `ArtifactMedia` (`artifact_media`) — архівні фотографії NASA Photojournal, панорами, орбітальні знімки.
7. `CommunityPublication` (`community_publications`) — ролики спільноти (YouTube Shorts, TikTok, Reels) з посиланнями на джерела NASA та прапорцем премодерації `is_approved`.
8. `User` (`users_user`) — користувачі системи.

---

## 3. Що Було Зроблено в Поточній Сесії

### 3.1. Git & Ізоляція Конфігураційних Файлів
- Створено робочу гілку:
  ```bash
  git checkout -b feature/backend/api-portal
  ```
- У `backend/.gitignore` додано точкові винятки для 6 файлів локальної документації та OpenAPI-специфікацій:
  - `openapi (1).yaml`
  - `openapi.yaml`
  - `OPENAPI_EDITOR_API.md`
  - `OPENAPI_PORTAL_API.md`
  - `TASK_API_PORTAL_AND_EDITOR_GUIDE (1).md`
  - `TASK_API_PORTAL_AND_EDITOR_GUIDE.md`
- Загальні розширення `.md` та `.yaml` залишаються доступними для відстеження Git.

---

### 3.2. Розробка Portal API (`backend/web_api/`)

#### А. Серіалізатори (`backend/web_api/serializers.py`)
- `CelestialBodySerializer` — серіалізація фізичних констант небесних тіл.
- `TraverseWaypointSerializer` — впорядкована телеметрія та координати маршруту.
- `ScientificDiscoverySerializer` — наукові досягнення та інструменти.
- `ArtifactMediaSerializer` — фотографії NASA, підписи та копірайти.
- `MissionSummarySerializer` — компактна інформація про місію для вкладення в детальну картку артефакту.
- `ArtifactSummarySerializer`:
  - `coordinates` — об'єкт із широтою, довготою, висотою, назвою локації та типом системи координат (`PLANETOCENTRIC_360` або `SELENOGRAPHIC`).
  - `cluster_info` — інформація про просторову кластеризацію (`is_clustered`, `cluster_id`, `cluster_count`).
  - `preview_image_url` — пріоритетний вибір зображення з кешу prefetched media (`SURFACE_PHOTO` / `SURFACE_FIRST_PERSON` $\to$ `PANORAMA` $\to$ `LAST_KNOWN_PHOTO` $\to$ дефолтний знімок). Запобігає проблемі N+1 запитів.
  - `cosmolost_url` — посилання на сторінку артефакту `https://cosmolost.lihtar.org/artifacts/{id}`.
- `ArtifactDetailSerializer` — повний паспорт артефакту з вкладеними об'єктом місії, медіа-файлами та відкриттями.
- `MissionSerializer` — деталі місії з вкладеним маніфестом артефактів.
- `CommunityPublicationSerializer` — публікації спільноти із підтримкою обох варіантів передачі зовнішніх ключів (`mission`/`artifact` та `mission_id`/`artifact_id`) та гарантією створення зі статусом `is_approved=False`.

#### Б. Контролери та Бізнес-логіка (`backend/web_api/views.py`)
- **Сферична кластеризація артефактів (`compute_artifact_clusters`)**:
  - Реалізовано алгоритм на базі формули гаверсину (велика дуга на сфері радіусом планети).
  - Артефакти на відстані $\le \text{cluster\_distance\_m}$ (за замовчуванням 500 м) на одному небесному тілі групуються у зв'язні компоненти за допомогою BFS та отримують єдиний `cluster_id` і спільний лічильник `cluster_count`.
- **Ендпоінти**:
  - `GET /celestial-bodies/` та `GET /celestial-bodies/<pk>/`
  - `GET /artifacts/` — з підтримкою фільтрів `body`, `type`, `status`, `is_featured`, `is_nasa_hardware`, текстового пошуку `search` (по назві, локації, причині вимкнення), пагінації `limit`/`offset` та динамічної кластеризації.
  - `GET /artifacts/<pk>/`
  - `GET /artifacts/<pk>/waypoints/`
  - `GET /artifacts/<pk>/discoveries/`
  - `GET /artifacts/<pk>/media/`
  - `GET /missions/` (фільтрація за `agency`, пагінація) та `GET /missions/<pk>/`
  - `GET /community-publications/` — фільтрація за `mission_id`, `artifact_id`, `platform_type`; видаються строго тільки схвалені ролики (`is_approved=True`).
  - `POST /community-publications/` — публічне подання ролика на модерацію, повертає статус `201 Created` з `SUBMITTED_FOR_REVIEW` та `is_approved=False`.
- **Доступність**:
  - Усі ендпоінти мають `@permission_classes([AllowAny])` для гарантії публічного доступу вебпорталу без авторизації.

#### В. Маршрутизація (`backend/web_api/urls.py` та `backend/config/urls.py`)
- Зареєстровано маршрути для:
  - Стандартного версіонування: `/api/v1/portal/`
  - Сумісності: `/api/web/`
  - Зарезервовано точки для десктопу: `/api/v1/editor/` та `/api/desktop/`

#### Г. Оптимізація налаштувань (`backend/config/settings.py`)
- Додано `SILENCED_SYSTEM_CHECKS = ['urls.W005']` для безпечного усунення попередження Django щодо навмисного дублювання alias-шляхів для API-сумісності.

---

## 4. Покриття Тестами (`backend/web_api/tests.py`)

Створено повноцінний набір інтеграційних тестів із тестовою базою даних та фікстурами на `pytest`:
1. `test_celestial_bodies_list` — перевірка списку та полів схем.
2. `test_celestial_body_detail` — перевірка деталей тіла.
3. `test_celestial_body_not_found` — 404 для неіснуючого тіла.
4. `test_artifacts_list_all` — перевірка списку, пагінації та розрахунку полів.
5. `test_artifacts_list_filters` — фільтри за планетою, типом, статусом, featured, nasa_hardware, текстовий пошук за назвою і локацією, limit/offset.
6. `test_artifacts_clustering` — математична перевірка об'єднання близьких об'єктів (<500 м) в один кластер та ізоляції далеких.
7. `test_artifact_detail` — детальна картка з вкладеними об'єктами.
8. `test_artifact_detail_not_found` — 404 для неіснуючого артефакту.
9. `test_artifact_waypoints` — впорядковані точки маршруту та 404.
10. `test_artifact_discoveries` — наукові факти та 404.
11. `test_artifact_media` — категорії медіа та 404.
12. `test_missions_list` — список місій, вкладені артефакти, фільтрація за агенцією.
13. `test_mission_detail` — деталі місії та 404.
14. `test_community_publications_list` — видача тільки `is_approved=True`.
15. `test_community_publications_filters` — фільтрація публікацій за місією та платформою.
16. `test_community_publication_submit_success` — успішне подання ролика з `is_approved=False`.
17. `test_community_publication_submit_validation_errors` — валідація обов'язкових полів та відхилення неіснуючих місій (400 Bad Request).
18. `test_url_compatibility_routes` — перевірка еквівалентності відповідей між `/api/v1/portal/` та `/api/web/`.

**Результат проходження тестів:**
```powershell
======================= 35 passed, 9 warnings in 5.86s =======================
```
Усі 35 тестів проєкту (включаючи `core` та `users`) проходять без помилок.

---

## 5. Довідкова Таблиця Ендпоінтів Portal API

| Метод | Шлях | Опис | Query Параметри |
|---|---|---|---|
| `GET` | `/api/v1/portal/celestial-bodies/` | Список планет (Місяць, Марс) з WMTS тайлами | — |
| `GET` | `/api/v1/portal/celestial-bodies/<pk>/` | Деталі небесного тіла | — |
| `GET` | `/api/v1/portal/artifacts/` | Каталог артефактів із кластеризацією | `body`, `type`, `status`, `is_featured`, `is_nasa_hardware`, `search`, `cluster_distance_m`, `limit`, `offset` |
| `GET` | `/api/v1/portal/artifacts/<pk>/` | Детальна картка з монологом, 3D glb, фото та відкриттями | — |
| `GET` | `/api/v1/portal/artifacts/<pk>/waypoints/` | Точки пересування та телеметрія ровера | — |
| `GET` | `/api/v1/portal/artifacts/<pk>/discoveries/` | Наукові відкриття апарату | — |
| `GET` | `/api/v1/portal/artifacts/<pk>/media/` | Архівні фото та медіа NASA | — |
| `GET` | `/api/v1/portal/missions/` | Список місій NASA з переліком обладнання | `agency`, `limit`, `offset` |
| `GET` | `/api/v1/portal/missions/<pk>/` | Деталі місії | — |
| `GET` | `/api/v1/portal/community-publications/` | Схвалені відеоролики спільноти | `mission_id`, `artifact_id`, `platform_type`, `limit`, `offset` |
| `POST` | `/api/v1/portal/community-publications/` | Подання нового відео на модерацію | Тіло JSON (`CommunityPublicationCreate`) |

---

## 6. Наступні Кроки для Розробки (Roadmap)

1. **Editor API (`desktop_api/`)**:
   - Реалізація `templates/` (статичний реєстр SMM-рубрик: Hook, B-Roll, Drama Peak, Loop CTA).
   - Ендпоінт `/artifacts/<pk>/assets/` — збірка монтажного пакету (TTS-скрипт en/uk, SEO-хештеги, закріплений коментар, фото високої якості).
   - Ендпоінт `/recommend-next-topic/` — двигун рекомендацій наступного зв'язаного артефакту (narrative bridge).
   - Покриття `desktop_api/tests.py`.
2. **Ingestion & Loader (`loader/`)**:
   - Автоматичний парсинг каталогів NASA PDS та оновлення бази даних.
