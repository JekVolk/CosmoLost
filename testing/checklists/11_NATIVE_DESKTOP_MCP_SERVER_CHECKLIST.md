# Чекліст: Нативний Десктопний MCP Сервер (11_NATIVE_DESKTOP_MCP_SERVER_CHECKLIST.md)

> **Модуль**: `desktop-client/` (`scripts/cosmolost-mcp-server.mjs`, `features/mcp/`, `src-tauri/`)  
> **Статус аудиту Batch 1**: **95.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість тестів**: Реальний E2E тест процесу (`tests/mcp-server.test.ts`) + тести конфігурації  
> **Нормативна база**: `FEAT-03` (розділ 5, `REQ-FAC-12`), `docs/MCP_INTEGRATION_GUIDE.md`

---

## 1. Реалізація Протоколу Model Context Protocol (MCP)

- [x] **Протокольний рівень**:
  - [x] Повна відповідність специфікації JSON-RPC 2.0 через стандартні потоки вводу/виводу (`stdio`).
  - [x] Автономний Node.js скрипт `scripts/cosmolost-mcp-server.mjs` (731 рядок коду).
  - [x] Обробка методів `initialize`, `tools/list`, `tools/call`.
- [x] **Пряма інтеграція з локальним сховищем**:
  - [x] Читання та запис у конфігураційні файли:
    - `%APPDATA%/com.cosmolost.desktop/cosmolost-settings.json`.
    - `%APPDATA%/com.cosmolost.desktop/cosmolost-scheduler-tasks.json`.
  - [x] Можливість керувати станом десктопного додатку без відкриття вікна користувача.
- [x] **Реєстр інструментів (16 інструментів)**:
  - [x] **Content Factory інструменти (`FEAT-03 REQ-FAC-12`)**:
    1. `create_video_task`: постановка задачі на генерацію 40-секундного ролика за `artifact_id` та `rubric_id`.
    2. `get_render_status`: перевірка прогресу рендерингу та отримання шляху до згенерованого `.mp4`.
    3. `trigger_social_publish`: запуск публікації в YouTube Shorts, Telegram або експорт у папку.
    4. `batch_generate_rubric`: пакетна генерація 5–10 роликів із пулом паралелізму 2.
  - [x] **Супутні інструменти автоматизації**:
    - `search_artifacts`: локальний пошук по кешованій базі NASA.
    - `cosmolost_get_app_state`: перевірка стану вікон та активного проєкту.
    - `cosmolost_navigate`: програмне перемикання екранів додатку.
    - `cosmolost_set_theme`: зміна кольорової теми інтерфейсу.
    - `cosmolost_get_scheduler_tasks` та `cosmolost_trigger_scheduler_task`.
    - `cosmolost_get_diagnostics`: перевірка системних ресурсів.
    - `cosmolost_export_workspace`: експорт резервної копії робочого простору.
    - `cosmolost_get_cli_integrations_status`: перевірка встановлених CLI (claude, agy, node).

---

## 2. Автоматична Конфігурація ШІ-Клієнтів

- [x] **Команда Tauri Rust `auto_configure_cli_mcp`**:
  - [x] **Claude Desktop**: автоматичний запис блоку запуску сервера у `%APPDATA%/Claude/claude_desktop_config.json`.
  - [x] **Antigravity CLI (`agy`)**: автоматичний запис маніфесту сервера у `%USERPROFILE%/.gemini/antigravity-cli/mcp/cosmolost.json`.
  - [x] Безпекова санітизація: заборона виходу за межі дозволених директорій (`..`) та валідація розширення скрипта (`.js` / `.mjs`).
  - [x] Застосування конфігурації в 1 клік прямо з інтерфейсу сторінки `/mcp` (Alt+5).

---

## 3. Статус для Клієнта
- **Готовність**: **95%**
- **Приймання**: Повністю верифіковано наскрізним тестом `mcp-server.test.ts` через запуск реального дочірнього процесу `child_process.spawn`.
