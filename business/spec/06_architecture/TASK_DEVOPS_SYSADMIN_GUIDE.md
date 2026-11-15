# Покрокова Інструкція та ТЗ для DevOps / Системного Адміністратора (TASK_DEVOPS_SYSADMIN_GUIDE.md)

> **Статус**: `APPROVED`  
> **Версія інфраструктури**: `v0.6.0`  
> **Цільовий фахівець**: DevOps Engineer / Linux System Administrator  
> **Контекст проєкту**: Платформа **CosmoLost** («Покинуті, але не забуті») — NASA Space Apps Challenge 2026.  
> **Пов'язані архітектурні документи**:  
> - Архітектура C4 Container: [`spec/06_architecture/01_C4_SYSTEM_CONTEXT.md`](./01_C4_SYSTEM_CONTEXT.md)  
> - Модель БД (8 обов'язкових таблиць): [`spec/06_architecture/02_DATA_MODEL_ERD.md`](./02_DATA_MODEL_ERD.md)  
> - Специфікація Portal API: [`spec/06_architecture/OPENAPI_PORTAL_API.md`](./OPENAPI_PORTAL_API.md)  
> - Специфікація Editor & FastMCP API: [`spec/06_architecture/OPENAPI_EDITOR_API.md`](./OPENAPI_EDITOR_API.md)  

---

## 1. Головна Мета та Принцип Розгортання

Ваше завдання — спроєктувати та підняти виробничу інфраструктуру платформи **CosmoLost** на базі Docker та Docker Compose. Усі сервіси працюють в ізольованій внутрішній мережі, а назовні відкриваються **тільки порти 80 та 443** зворотного проксі-шлюзу.

> [!IMPORTANT]
> **Автономність системного адміністратора (Ніяких жорстко зашитих доменів)**:
> Конкретні доменні імена у конфігураціях **не фіксуються** — ви самостійно налаштовуєте власні домени, DNS А-записи та SSL-сертифікати (Let's Encrypt / Certbot / Cloudflare). Усі конфіги використовують змінні середовища (`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`) та універсальний шлюз `server_name _;`.

---

## 2. Перелік Сервісів для Підняття (Стек із 8 Контейнерів)

```mermaid
flowchart TD
    Clients(["🌐 Зовнішній Інтернет / Клієнти"]) -->|Порти 80, 443 (HTTP/HTTPS)| Gateway["Nginx Gateway<br>[cosmolost-gateway]"]

    subgraph DockerNet["Ізольована внутрішня мережа Docker (cosmolost-net)"]
        Gateway -->|/| WebSPA["Web Client (SPA)<br>[cosmolost-web-client]<br>Port: 80"]
        Gateway -->|/api/ та /admin/| Backend["Django 6.1 + Gunicorn<br>[cosmolost-backend]<br>Port: 8000"]
        Gateway -->|/mcp/ (SSE без буферизації)| MCP["FastMCP AI Server<br>[cosmolost-mcp-server]<br>Port: 8001"]
        Gateway -->|/static/ та /media/| StaticVol[("Спільні томи<br>static_volume & media_volume")]

        Backend -->|ORM запити| Postgres[("PostgreSQL 16 Alpine<br>[cosmolost-postgres]<br>Port: 5432")]
        Backend -->|Кешування & Черги| Redis[("Redis 7 Alpine<br>[cosmolost-redis]<br>Port: 6379")]

        MCP -->|ORM читання фактів| Postgres
        
        Worker["NASA Ingest Worker<br>[cosmolost-ingest-worker]<br>Щогодинний крон"] -->|Bulk Upsert| Postgres
        Backup["DB Backup Daemon<br>[cosmolost-db-backup]<br>Щоночі о 03:00"] -->|pg_dump + gzip| Postgres
    end

    Backup -->|Ротація 14 днів| HostBackups[("📁 Хост: ./backups/postgres")]
```

### Детальна таблиця компонентів:

| # | Сервіс | Контейнер | Базовий образ / Стек | Внутр. порт | Призначення |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | **PostgreSQL 16** | `cosmolost-postgres` | `postgres:16-alpine` | `5432` | Реляційне сховище для **8 затверджених таблиць** NASA та користувачів. Текстовий пошук (Full-Text Search). |
| **2** | **Redis 7** | `cosmolost-redis` | `redis:7-alpine` | `6379` | Кешування відповідей 3D-мапи, тайлів NASA Treks та брокер черг `django-tasks`. |
| **3** | **Django Backend** | `cosmolost-backend` | `python:3.12-slim` + Gunicorn | `8000` | WSGI-сервер REST API (`/api/v1/portal/*`, `/api/v1/editor/*`) та адмінка Django Unfold. |
| **4** | **FastMCP Server** | `cosmolost-mcp-server` | `python:3.12-slim` + FastMCP | `8001` | SSE Шлюз для зовнішніх ШІ-агентів (Claude Desktop, Cursor, Gemini) з доступом до 8 інструментів фактів NASA. |
| **5** | **Ingest Worker** | `cosmolost-ingest-worker`| `python:3.12-slim` | - | Фоновий воркер, що щогодини синхронізує каталог об'єктів NASA (каталог артефактів, фото, координати). |
| **6** | **Web Client (SPA)** | `cosmolost-web-client` | `node:20` ➔ `nginx:alpine` | `80` | Клієнтський вебдодаток (Three.js 3D сфера, фільтри, картка артефакту, Chakra UI v3). |
| **7** | **Reverse Proxy** | `cosmolost-gateway` | `nginx:1.27-alpine` | `80 / 443` | Єдина точка входу, роутинг, віддача статики, термінація SSL та підтримка SSE для MCP. |
| **8** | **DB Backup** | `cosmolost-db-backup` | `postgres:16-alpine` | - | Автоматизований щоденний бекап (`pg_dump` ➔ `.sql.gz`) із глибиною зберігання 14 діб. |

---

## 3. Специфікація Змінних Середовища (.env)

Створіть файл `.env` із наступними параметрами (підставте ваші паролі, секрети та хости):

```ini
# ==============================================================================
# CosmoLost Platform Environment Configuration
# ==============================================================================
ENVIRONMENT=production
DEBUG=False
DJANGO_SECRET_KEY=CHANGE_ME_TO_A_SUPER_STRONG_64_CHAR_SECRET_KEY

# Дозволені хости для Django (через кому, без пробілів):
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS & CSRF Налаштування (через кому, без пробілів):
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:80

# Порти для мапінгу на хост-машині
GATEWAY_HTTP_PORT=80
GATEWAY_HTTPS_PORT=443

# База даних (PostgreSQL 16)
POSTGRES_DB=cosmolost_db
POSTGRES_USER=cosmolost_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_DATABASE_PASSWORD
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# In-Memory кеш та брокер (Redis 7)
REDIS_HOST=redis
REDIS_PORT=6379

# FastMCP AI Gateway (SSE)
MCP_SERVER_HOST=0.0.0.0
MCP_SERVER_PORT=8001
MCP_TRANSPORT=sse

# Синхронізація даних NASA (api.nasa.gov)
NASA_API_KEY=DEMO_KEY

# Резервне копіювання БД
BACKUP_RETENTION_DAYS=14
BACKUP_LOCAL_DIR=./backups/postgres
```

---

## 4. Готовий Маніфест Оркестрації: `docker-compose.yml`

Збережіть цей файл як `docker-compose.yml`:

```yaml
services:
  # 1. База даних PostgreSQL 16
  postgres:
    image: postgres:16-alpine
    container_name: cosmolost-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-cosmolost_db}
      POSTGRES_USER: ${POSTGRES_USER:-cosmolost_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Database password required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-cosmolost_user} -d ${POSTGRES_DB:-cosmolost_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 1024M

  # 2. Redis 7
  redis:
    image: redis:7-alpine
    container_name: cosmolost-redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 512M

  # 3. Серверний бекенд Django 6.1 (DRF + Gunicorn)
  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    container_name: cosmolost-backend
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      REDIS_HOST: redis
      REDIS_PORT: 6379
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 1024M

  # 4. Шлюз ШІ FastMCP Server (SSE для Claude Desktop / Cursor)
  mcp-server:
    build:
      context: .
      dockerfile: docker/mcp.Dockerfile
    container_name: cosmolost-mcp-server
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
    depends_on:
      postgres:
        condition: service_healthy
      backend:
        condition: service_started
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 512M

  # 5. Фоновий воркер щогодинного завантаження даних NASA (Ingest Worker)
  ingest-worker:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    container_name: cosmolost-ingest-worker
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
    depends_on:
      postgres:
        condition: service_healthy
    entrypoint: ["/bin/sh", "-c"]
    command: >
      "sleep 30 &&
       while true; do
         echo '>>> [INGEST WORKER] Running scheduled NASA data sync...';
         python manage.py run_ingest || echo '>>> [WARNING] Ingest cycle encountered error';
         sleep 3600;
       done"
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 512M

  # 6. Клієнтський Вебпортал (React / Three.js SPA)
  web-client:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    container_name: cosmolost-web-client
    restart: unless-stopped
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 256M

  # 7. Єдиний вхідний шлюз Reverse Proxy (Nginx Gateway)
  gateway:
    image: nginx:1.27-alpine
    container_name: cosmolost-gateway
    restart: unless-stopped
    ports:
      - "${GATEWAY_HTTP_PORT:-80}:80"
      - "${GATEWAY_HTTPS_PORT:-443}:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - static_volume:/var/www/static:ro
      - media_volume:/var/www/media:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - web-client
      - mcp-server
    networks:
      - cosmolost-net
    deploy:
      resources:
        limits:
          memory: 256M

  # 8. Автоматичний сервіс щоденного резервного копіювання БД (pg_dump)
  db-backup:
    image: postgres:16-alpine
    container_name: cosmolost-db-backup
    restart: unless-stopped
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${POSTGRES_DB:-cosmolost_db}
      POSTGRES_USER: ${POSTGRES_USER:-cosmolost_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Database password required}
      BACKUP_DIR: /backups
      BACKUP_RETENTION_DAYS: ${BACKUP_RETENTION_DAYS:-14}
    volumes:
      - ./docker/backup.sh:/backup.sh:ro
      - ${BACKUP_LOCAL_DIR:-./backups/postgres}:/backups
    depends_on:
      postgres:
        condition: service_healthy
    entrypoint: ["/bin/sh", "-c"]
    command: >
      "chmod +x /backup.sh &&
       while true; do
         /backup.sh || echo '>>> [BACKUP ERROR] Backup failed';
         sleep 86400;
       done"
    networks:
      - cosmolost-net

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:

networks:
  cosmolost-net:
    driver: bridge
```

---

## 5. Специфікація Контейнерів (Dockerfiles & Scripts)

### А. `docker/backend.Dockerfile`
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip uv
COPY backend/pyproject.toml ./
RUN uv pip install --system \
    "django>=6.1.3" "djangorestframework>=3.18.3" "django-tasks>=0.12.0" \
    "django-unfold>=0.110.1" "gunicorn>=23.0.0" "psycopg2-binary>=2.9.9" \
    "django-cors-headers>=4.4.0" "fastmcp>=0.4.0" "requests>=2.31.0" "redis>=5.0.0"

FROM python:3.12-slim AS runner
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/staticfiles /app/media /backups && \
    chown -R appuser:appuser /app /backups

COPY --chown=appuser:appuser backend/ /app/
COPY --chown=appuser:appuser docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/portal/stats/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120"]
```

### Б. `docker/entrypoint.sh`
```bash
#!/usr/bin/env bash
set -e
echo ">>> [ENTRYPOINT] Waiting for database at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
python - <<END
import sys, socket, time
host, port = "${POSTGRES_HOST}", int("${POSTGRES_PORT}")
for _ in range(30):
    try:
        with socket.create_connection((host, port), timeout=2):
            sys.exit(0)
    except OSError:
        time.sleep(2)
sys.exit(1)
END

echo ">>> [MIGRATIONS] Applying database migrations..."
python manage.py migrate --noinput

echo ">>> [COLLECTSTATIC] Collecting static files..."
python manage.py collectstatic --noinput --clear

exec "$@"
```

### В. `docker/mcp.Dockerfile`
```dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=config.settings

RUN apt-get update && apt-get install -y --no-install-recommends libpq5 curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir "fastmcp>=0.4.0" "django>=6.1.3" "psycopg2-binary>=2.9.9" "djangorestframework>=3.18.3"

RUN useradd -m -u 1000 mcpuser && chown -R mcpuser:mcpuser /app
COPY --chown=mcpuser:mcpuser backend/ /app/

USER mcpuser
EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8001/health || exit 1
CMD ["python", "mcp/server.py", "--transport", "sse", "--port", "8001", "--host", "0.0.0.0"]
```

### Г. `docker/web.Dockerfile`
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY web-client/package*.json web-client/pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; elif [ -f package.json ]; then pnpm install; else mkdir -p dist && echo '<html><body><h1>CosmoLost Portal</h1></body></html>' > dist/index.html; fi
COPY web-client/ ./
RUN if [ -f vite.config.ts ] || [ -f vite.config.js ]; then pnpm build; fi

FROM nginx:1.27-alpine AS runner
RUN rm -rf /etc/nginx/conf.d/default.conf
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/spa.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Д. `docker/backup.sh` (Автоматичний дамп та ротація)
```bash
#!/usr/bin/env bash
set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
BACKUP_FILE="${BACKUP_DIR}/cosmolost_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -F c -b | gzip > "${BACKUP_FILE}"
echo ">>> [BACKUP SUCCESS] Saved: ${BACKUP_FILE}"

# Ротація застарілих копій
find "${BACKUP_DIR}" -type f -name "cosmolost_db_*.sql.gz" -mtime +"${RETENTION}" -exec rm -f {} +
```

---

## 6. Конфігурація Шлюзу: `docker/nginx.conf`

Зверніть увагу: налаштування підтримує Server-Sent Events (SSE) для FastMCP (буферизація вимкнена) та роздає статику напряму:

```nginx
user  nginx;
worker_processes  auto;

events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    client_max_body_size 50M;

    upstream backend_service { server backend:8000; }
    upstream mcp_service     { server mcp-server:8001; }
    upstream web_service     { server web-client:80; }

    server {
        listen 80 default_server;
        server_name _; # Вкажіть власний домен або залиште універсальний слухач

        # 1. Django REST API
        location /api/ {
            proxy_pass http://backend_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 2. Django Unfold Admin Panel
        location /admin/ {
            proxy_pass http://backend_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 3. FastMCP AI Gateway (SSE Streaming для Claude / Cursor)
        location /mcp/ {
            proxy_pass http://mcp_service/;
            proxy_http_version 1.1;
            proxy_set_header Connection '';
            proxy_buffering off;
            proxy_cache off;
            chunked_transfer_encoding on;
            proxy_read_timeout 86400s;
        }

        # 4. Django Static & Media Files
        location /static/ {
            alias /var/www/static/;
            expires 30d;
            access_log off;
        }

        location /media/ {
            alias /var/www/media/;
            expires 7d;
        }

        # 5. Вебпортал (React SPA)
        location / {
            proxy_pass http://web_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## 7. Покроковий План Запуску та Верифікація Працездатності

### Крок 1. Мережева безпека на хост-сервері (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Крок 2. Збірка та запуск стеку
```bash
docker compose up -d --build
docker compose ps
```

### Крок 3. Створення адміністратора Django Unfold
```bash
docker compose exec backend python manage.py createsuperuser
```

### Крок 4. Перевірка наявності 8 обов'язкових таблиць PostgreSQL
```bash
docker compose exec postgres psql -U cosmolost_user -d cosmolost_db -c "\dt"
```
*У списку мають бути присутні: `core_celestialbody`, `core_mission`, `core_artifact`, `core_traversewaypoint`, `core_scientificdiscovery`, `core_artifactmedia`, `core_communitypublication`, `users_user`.*

### Крок 5. Швидкі Smoke-тести працездатності:
```bash
# 1. Перевірка публічного API порталу
curl -i http://localhost/api/v1/portal/stats/
# Очікується HTTP 200 OK з JSON структурою

# 2. Перевірка адмінки
curl -i http://localhost/admin/login/
# Очікується HTTP 200 OK

# 3. Перевірка FastMCP потоку
curl -i -N http://localhost/mcp/sse
# Очікується HTTP 200 OK, Content-Type: text/event-stream

# 4. Перевірка клієнтського SPA
curl -i http://localhost/
# Очікується HTTP 200 OK
```

---

## 8. Аварійне Відновлення Бази Даних (Disaster Recovery)

Для відновлення бази даних із будь-якого щоденного бекапу:
```bash
# 1. Зупинити бекенд та MCP, щоб розірвати активні з'єднання
docker compose stop backend mcp-server ingest-worker

# 2. Залити дамп у базу даних
gunzip -c backups/postgres/cosmolost_db_YYYYMMDD_HHMMSS.sql.gz | \
docker compose exec -T postgres pg_restore -U cosmolost_user -d cosmolost_db --clean --if-exists

# 3. Запустити сервіси назад
docker compose start backend mcp-server ingest-worker
```

---

## 9. Чекліст Здачі Робіт (DevOps Acceptance Checklist)

- [ ] **Docker Compose**: Усі 8 сервісів піднімаються командою `docker compose up -d`.
- [ ] **Healthchecks**: Контейнери `postgres`, `redis`, `backend` мають статус `healthy`.
- [ ] **Мережева ізоляція**: Порт 5432 (Postgres) та 6379 (Redis) закриті для зовнішнього світу, відкриті лише 80 та 443.
- [ ] **БД**: Створено строго 8 реляційних таблиць у PostgreSQL.
- [ ] **FastMCP SSE**: Запит `curl -N http://localhost/mcp/sse` повертає стрім подій без буферизації.
- [ ] **Статика**: Адмінка Unfold відображається зі стилями (`/static/admin/...`).
- [ ] **Бекапи**: У каталозі бекапів створюється стиснений архів `.sql.gz` та працює ротація за 14 днів.
- [ ] **Логи**: `docker compose logs` не містить нескінченних restart-циклів та критичних помилок.
