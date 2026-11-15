# Чекліст: DevOps, Контейнери та Інфраструктура (12_DEVOPS_CONTAINERS_AND_INFRASTRUCTURE_CHECKLIST.md)

> **Модуль**: `deploy/` (`docker-compose.yml`, `gateway/`, `Dockerfile`)  
> **Статус аудиту Batch 1**: **92.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Нормативна база**: `01_C4_SYSTEM_CONTEXT.md` (розділ 2), `TASK_DEVOPS_SYSADMIN_GUIDE.md`

---

## 1. Топологія 8 Контейнерів Docker Compose

- [x] **`postgres` (`postgres:16-alpine`)**:
  - [x] Окрема мережа `cosmolost-network`.
  - [x] Healthcheck на базі команди `pg_isready -U postgres`.
  - [x] Збереження даних у том `postgres_data`.
- [x] **`redis` (`redis:7-alpine`)**:
  - [x] Політика пам'яті: `maxmemory 256mb`, `maxmemory-policy allkeys-lru`.
  - [x] Healthcheck на базі команди `redis-cli ping`.
- [x] **`backend` (Django 6.1 Gunicorn / Runserver)**:
  - [x] Залежність від готовності PostgreSQL та Redis.
  - [x] Автоматичне виконання міграцій `python manage.py migrate` перед стартом.
  - [x] Скрипт `entrypoint.sh` з первинним завантаженням офлайн-сідів.
- [x] **`ingest-worker` (Daemon NASA завантажувача)**:
  - [x] Запуск фонового процесу: `python manage.py run_ingest --daemon --interval 3600`.
  - [x] Постійне оновлення даних кожну годину.
- [x] **`mcp-service` (FastMCP SSE Сервер)**:
  - [x] Запуск на окремому порті 8001.
  - [x] Обслуговування потокових запитів від ШІ-агентів.
- [x] **`web-client` (SPA Nginx контейнер)**:
  - [x] Збірка фронтенду та роздача статичних файлів через Nginx.
- [x] **`gateway` (Головний Nginx Reverse Proxy)**:
  - [x] Єдина точка входу на портах 80 / 443 (локально 9088:80).
  - [x] Маршрутизація:
    - `/` $\to$ `web-client`.
    - `/api/` $\to$ `backend:8000`.
    - `/admin/` $\to$ `backend:8000/admin/`.
    - `/mcp/` $\to$ `mcp-service:8001`.
  - [x] **Критичне налаштування SSE для MCP**:
    - `proxy_buffering off;`
    - `proxy_cache off;`
    - `proxy_read_timeout 86400s;`
    - `chunked_transfer_encoding on;`
- [ ] **Завдання на Batch 2**:
  - [ ] Додавання контейнера автоматичного бекапу `cosmolost-db-backup` з періодичним запуском `pg_dump` та ротацією 7-денних архівів.

---

## 2. Статус для Клієнта
- **Готовність**: **92%**
- **Приймання**: Маніфест `docker-compose.yml` валідний і готовий до розгортання на цільовому сервері (`lihtar.org`).
