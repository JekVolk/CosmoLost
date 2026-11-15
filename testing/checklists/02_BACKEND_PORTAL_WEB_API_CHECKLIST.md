# Чекліст: Web Portal API (02_BACKEND_PORTAL_WEB_API_CHECKLIST.md)

> **Модуль**: `backend/web_api/`  
> **Маршрути**: `/api/v1/portal/` та `/api/web/`  
> **Статус аудиту Batch 1**: **100.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість тестів**: 20 тестів (`web_api/tests.py`) — всі успішні  
> **Нормативна база**: `OPENAPI_PORTAL_API.md`, `FEAT-01`, `FEAT-02`

---

## 1. Реєстр Ендпоінтів та Перевірка Відповідей

- [x] **`GET /api/v1/portal/celestial-bodies/`**:
  - [x] Повертає список небесних тіл (Місяць, Марс).
  - [x] Включає радіуси, прискорення вільного падіння, константи та шаблони тайлів NASA Treks.
- [x] **`GET /api/v1/portal/celestial-bodies/<pk>/`**:
  - [x] Повертає повні деталі конкретного тіла.
  - [x] При неіснуючому `pk` повертає HTTP 404.
- [x] **`GET /api/v1/portal/artifacts/`**:
  - [x] Підтримка фільтрації: `body` (moon/mars), `type`, `status`, `is_featured`, `is_nasa_hardware`.
  - [x] Текстовий пошук `search` (по імені, назві місця посадки, причині зупинки).
  - [x] Пагінація: параметри `limit` та `offset`.
  - [x] Зворотні посилання: `cosmolost_url`.
- [x] **Сферична Гаверсин-Кластеризація (`compute_artifact_clusters`)**:
  - [x] Відстань групування за замовчуванням $\le 500$ метрів (`cluster_distance_m`).
  - [x] Розрахунок великої дуги на сфері планети за формулою гаверсину.
  - [x] Об'єднання у зв'язні компоненти через BFS обхід графа.
  - [x] Поля у відповіді: `is_clustered`, `cluster_id`, `cluster_count`.
- [x] **Пріоритетний вибір обкладинки (`preview_image_url`)**:
  - [x] Ієрархія: `SURFACE_FIRST_PERSON` $\to$ `PANORAMA` $\to$ `LAST_KNOWN_PHOTO` $\to$ дефолт.
  - [x] Відсутність проблеми N+1 запитів завдяки `prefetch_related`.
- [x] **`GET /api/v1/portal/artifacts/<pk>/`**:
  - [x] Повний технічний паспорт апарату.
  - [x] Вкладений об'єкт місії (`MissionSummary`).
  - [x] Англомовний художній монолог (`first_person_monologue`).
  - [x] Посилання на 3D модель (`model_3d_url`).
- [x] **`GET /api/v1/portal/artifacts/<pk>/waypoints/`**:
  - [x] Хронологічний трек пересування ровера (`sol_or_step`).
  - [x] Вкладена телеметрія (power, dust, tilt).
- [x] **`GET /api/v1/portal/artifacts/<pk>/discoveries/`**:
  - [x] Список підтверджених наукових відкриттів із назвами приладів.
- [x] **`GET /api/v1/portal/artifacts/<pk>/media/`**:
  - [x] Повна медіа-галерея архівних фото NASA PIA.
- [x] **`GET /api/v1/portal/missions/` та `GET /missions/<pk>/`**:
  - [x] Список місій із фільтром за агенцією (`agency`).
  - [x] Вкладений перелік залишеного на поверхні обладнання.
- [x] **`GET /api/v1/portal/community-publications/`**:
  - [x] Фільтрація за `mission_id`, `artifact_id`, `platform_type`.
  - [x] Видача строго схвалених роликів (`is_approved=True`).
- [x] **`POST /api/v1/portal/community-publications/`**:
  - [x] Публічне подання нового ролика з обов'язковими науковими джерелами.
  - [x] Повертає статус `201 Created` з `is_approved=False`.
  - [x] Валідація некоректних посилань або неіснуючих місій (повертає HTTP 400).
- [x] **`GET /api/v1/portal/stats/`**:
  - [x] Лічильники артефактів, місій та відкриттів для головного екрана.
- [x] **Сумісність аліасів**:
  - [x] Еквівалентність відповідей між `/api/v1/portal/` та `/api/web/`.

---

## 2. Статус для Клієнта
- **Готовність**: **100%**
- **Приймання**: Повністю верифіковано 20 Pytest тестами. Готово до підключення фронтенду.
