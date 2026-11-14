# Матриця Прав Доступу Системи CosmoLost (02_PERMISSIONS_MATRIX.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.2.0`  
> **Рівні доступу**: `READ`, `WRITE`, `EXECUTE`, `ADMIN`, `DENIED`

---

## 1. Зведена матриця доступу до ресурсів та операцій

| Ресурс / Модуль системи | Анонімний юзер (`ROLE-WebUser`) | Креатор десктопу (`ROLE-Creator`) | Адмін бекенду (`ROLE-Admin`) | Зовнішній ШІ (`ROLE-AIAgent`) |
| :--- | :---: | :---: | :---: | :---: |
| **Публічний каталог артефактів (`GET /api/v1/artifacts/`)** | `READ` | `READ` | `READ` | `READ` (через MCP) |
| **Детальна сторінка артефакту (`GET /api/v1/artifacts/:id/`)**| `READ` | `READ` | `READ` | `READ` (через MCP) |
| **3D тайли та карти NASA Treks WMTS** | `READ` | `READ` | `READ` | `DENIED` |
| **Локальне сховище ПК (файлова система)** | `DENIED` | `FULL (Local)` | `DENIED` | `DENIED` |
| **Локальний запуск FFmpeg (Sidecar)** | `DENIED` | `EXECUTE (Local)` | `DENIED` | `DENIED` |
| **Локальні API-токени (YouTube, Telegram, TTS)** | `DENIED` | `MANAGE (Local)` | `DENIED` | `DENIED` |
| **Адмін-панель Django Unfold (`/admin/`)** | `DENIED` | `DENIED` | `FULL (Admin)` | `DENIED` |
| **Примусовий запуск парсера NASA** | `DENIED` | `DENIED` | `EXECUTE` | `DENIED` |
| **Створення/редагування артефактів у БД** | `DENIED` | `DENIED` | `WRITE` | `DENIED` |
| **FastMCP Tools (`search_artifacts`, `get_details`)** | `DENIED` (Web UI) | `READ` | `READ` | `EXECUTE` |

---

## 2. Політика безпеки та лімітів (Rate Limiting)

1. **Публічне REST API (`/api/v1/`)**:
   * Для анонімних запитів встановлюється обмеження на рівні Nginx / Django: максимум **60 запитів за хвилину** з одного IP для запобігання скрапінгу.
   * Усі відповіді кешуються у Redis / пам'яті Django на 1 годину (дані космічних артефактів є статичними).
2. **FastMCP Server**:
   * Для фази MVP: відкритий доступ без API-ключів з обмеженням **30 запитів за хвилину** на підключення.
   * `[AI-DRAFT]` План розширення: реєстрація користувачів з видачею API-токена та квотою 10 000 запитів на місяць.
3. **Десктопний додаток**:
   * Повністю автономний, не передає призначені для користувача приватні ключі соцмереж чи сторонніх ШІ на сервер CosmoLost.
