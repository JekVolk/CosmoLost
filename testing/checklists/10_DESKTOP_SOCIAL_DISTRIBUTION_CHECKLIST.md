# Чекліст: Дистрибуція та Соціальні Конектори (10_DESKTOP_SOCIAL_DISTRIBUTION_CHECKLIST.md)

> **Модуль**: `desktop-client/` (`features/social-publish/`, `shared/api/social/`, `src-tauri/`)  
> **Статус аудиту Batch 1**: **95.0% (ГОТОВО ДО ПРИЙОМУ)**  
> **Кількість тестів**: 3 тестові сьюти Vitest — всі успішні  
> **Нормативна база**: `FEAT-04_social_publishing.md`, `plans/03_native_ipc_distribution_and_mcp.md`

---

## 1. Єдиний Інтерфейс Конекторів (`IPlatformConnector`)

- [x] **Контракт підключення**:
  - [x] Методи `connect()`, `disconnect()`, `publishVideo()`, `postPinComment()`.
  - [x] Статуси з'єднання: `CONNECTED`, `DISCONNECTED`, `CONNECTING`, `ERROR`.
- [x] **YouTube Shorts Конектор (`YouTubeShortsConnector`)**:
  - [x] Авторизація через OAuth 2.0 PKCE.
  - [x] Валідація довжини заголовка: строго $\le 60$ символів.
  - [x] Обов'язкове автоматичне додавання тегу `#Shorts`.
  - [x] Автопостинг першого закріпленого коментаря (`postPinComment`) із посиланням на 3D мапу.
- [x] **Telegram Channel Конектор (`TelegramChannelConnector`)**:
  - [x] Авторизація через Bot Token та Chat ID.
  - [x] Форматування підпису за стандартом `MarkdownV2`.
  - [x] Ліміт довжини підпису: строго $\le 1024$ символи.
  - [x] Захист від битого екранування: алгоритм обрізки виключає хвостовий слеш `\` на межі ліміту.
  - [x] Додавання прямого посилання на досьє артефакту.
- [x] **Локальний Експорт у Провідник (`LocalFolderExporterConnector`)**:
  - [x] Нативний виклик системного файлового менеджера:
    - Windows: `explorer /select, <шлях_до_файлу>`.
    - macOS: `open -R <шлях_до_файлу>`.
    - Linux: `xdg-open <директорія>`.
  - [x] Автоматичне копіювання 3-рядкового SEO-пакету та Pin Comment у системний буфер обміну ОС.
  - [x] Кросплатформна реалізація у Rust через `clip`, `pbcopy`, `xclip`.
  - [x] Захист від зомбі-процесів через `child.wait()`.
  - [x] Створення папки за замовчуванням `%USERPROFILE%/Videos/CosmoLost/`.

---

## 2. Безпека Токенів та Local-First Принцип

- [x] **Ізоляція приватних ключів**:
  - [x] OAuth токени YouTube та Bot Token Telegram зберігаються виключно локально у сховищі користувача `%APPDATA%/com.cosmolost.desktop/`.
  - [x] Жоден приватний ключ ніколи не передається на серверний бекенд CosmoLost (Zero Server Secret Leak).
- [x] **Red-Team перевірка**:
  - [x] Тест `security-audit.test.ts` підтверджує, що функція експорту проєкту видаляє всі конфіденційні токени з вихідного файлу.

---

## 3. Статус для Клієнта
- **Готовність**: **95%**
- **Приймання**: Повністю покрито тестами Vitest (`social-connectors.test.ts`, `social-integrations-card.test.tsx`, `security-audit.test.ts`).
