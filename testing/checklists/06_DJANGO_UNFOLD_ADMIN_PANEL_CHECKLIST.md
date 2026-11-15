# Чекліст: Django Unfold Адмін-панель (06_DJANGO_UNFOLD_ADMIN_PANEL_CHECKLIST.md)

> **Модуль**: `backend/core/admin.py`, `backend/users/admin.py`  
> **Статус аудиту Batch 1**: **98.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість перевірок**: 9 маршрутів дашборду/списків перевірено на HTTP 200 OK  
> **Нормативна база**: `FEAT-06_admin_ingestion.md`

---

## 1. Візуальна Ієрархія та Unfold UI

- [x] **Кастомізація теми Unfold**:
  - [x] Заголовок сайту: `CosmoLost Administration`.
  - [x] Темна палітра інтерфейсу (Space Dark).
  - [x] Радіуси скруглення 8px та фірмові іконки (rocket_launch, orbit, satellite).
- [x] **Навігаційні групи у сайдбарі**:
  - [x] **Overview**: головний екран дашборду.
  - [x] **Planetary Core**: `CelestialBody`, `Mission`, `Artifact`, `TraverseWaypoint`, `ScientificDiscovery`, `ArtifactMedia`.
  - [x] **Community & Publications**: `CommunityPublication`.
  - [x] **Authentication**: `User`, `Group`.
- [x] **Інлайн-форми редагування на `ArtifactAdmin`**:
  - [x] `ArtifactMediaInline`: додавання архівних фото NASA прямо в картці артефакту.
  - [x] `ScientificDiscoveryInline`: додавання фактів та дитячих історій.
  - [x] `TraverseWaypointInline`: таблиця точок маршруту з телеметрією.
- [x] **Кнопки швидких дій (Unfold Primary Actions)**:
  - [x] `trigger_full_ingest_action` (`@unfold_action`, `ActionVariant.PRIMARY`): миттєвий запуск завантаження каталогу NASA через інтерфейс адмінки.
  - [x] Кнопка доступна на `CelestialBodyAdmin`, `MissionAdmin`, `ArtifactAdmin`.
- [x] **Масові дії над списком (Bulk Actions)**:
  - [x] `sync_selected_bodies`: примусова синхронізація обраних планет.
  - [x] `sync_selected_artifacts`: оновлення медіа обраних апаратів.
  - [x] `approve_publications`: затвердження роликів спільноти у 1 клік (`is_approved = True`).

---

## 2. Статус для Клієнта
- **Готовність**: **98%**
- **Приймання**: Усі сторінки списків та додавання сутностей повертають HTTP 200 у тестах.
