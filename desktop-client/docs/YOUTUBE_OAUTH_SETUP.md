# Інструкція з налаштування Google Cloud OAuth 2.0 для YouTube Shorts API

Цей документ містить покрокову інструкцію щодо налаштування та підключення **Google Cloud OAuth 2.0 Client ID** для автоматичної публікації коротких відео (YouTube Shorts) безпосередньо з десктопного застосунку **CosmoLost Desktop Studio**.

---

## 1. Офіційний клієнт проєкту CosmoLost («З коробки»)

Застосунок **CosmoLost Desktop Studio** вже містить попередньо сконфігуровані офіційні налаштування Google Cloud OAuth для десктопних застосунків:

* **Проєкт Google Cloud**: `cosmolost`
* **Офіційний Client ID**: `YOUR_CLIENT_ID.apps.googleusercontent.com`
* **Файл конфігурації**: `client_secret_*.json`
* **Тип клієнта**: `installed` (Native Desktop Client)
* **Redirect URIs**: `http://localhost`, `http://127.0.0.1:8089/oauth/callback`

> [!TIP]
> У вкладці **Налаштування** $\to$ **YouTube Shorts** ви можете в один клік натиснути кнопку **`[Офіційний CosmoLost ID]`** або скористатися кнопкою **`[📂 Імпортувати client_secret.json]`**, щоб застосунок автоматично підхопив конфігурацію без ручного копіпасту.

---

## 2. Локальне середовище (.env)

Якщо ви запускаєте проєкт у режимі локальної розробки, параметри зберігаються у `desktop-client/.env`:

```env
# ==============================================================================
# YouTube Shorts API & Google Cloud OAuth PKCE
# Official Client ID from client_secret_*.json (Project: cosmolost)
# ==============================================================================
VITE_YOUTUBE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
VITE_YOUTUBE_CLIENT_SECRET="your_google_client_secret_here"
```

### 🔒 Політика безпеки (Zero-Trust & Client-Side BYOK)
1. Файл `.env` додано до `.gitignore`, він локальний і **ніколи не передається на сторонні сервери**.
2. У десктопному застосунку Google OAuth працює за протоколом **OAuth 2.0 PKCE** (Proof Key for Code Exchange) — авторизація проходить безпосередньо у вашому системному браузері, а токени зберігаються в захищеному сховищі вашої операційної системи.

---

## 3. Створення власного окремого Google Cloud проєкту (Опціонально)

Якщо ви бажаєте використовувати власний окремий проєкт у Google Cloud замість офіційного:

### Крок 1. Створення проєкту в Google Cloud
1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/).
2. Створіть новий проєкт (наприклад: `My-CosmoLost-Channel`).

### Крок 2. Увімкнення YouTube Data API v3
1. Відкрийте **APIs & Services** $\to$ **Library**.
2. Знайдіть `YouTube Data API v3` та натисніть **Enable**.

### Крок 3. Налаштування екрана згоди (OAuth Consent Screen)
1. Відкрийте **APIs & Services** $\to$ **OAuth consent screen** $\to$ **External**.
2. Вкажіть ім'я застосунку та контактну адресу розробника.
3. Додайте Scopes (Області доступу):
   * `https://www.googleapis.com/auth/youtube.upload`
   * `https://www.googleapis.com/auth/youtube.force-ssl`
4. Додайте свій Gmail у розділ **Test users**.

### Крок 4. Створення OAuth Client ID
1. Відкрийте **Credentials** $\to$ **Create Credentials** $\to$ **OAuth client ID**.
2. Оберіть **Application type: Desktop app**.
3. Завантажте отриманий JSON-файл (`client_secret_xxxxxxxx.json`).
4. У CosmoLost Desktop Studio відкрийте **Налаштування** $\to$ **YouTube Shorts** та натисніть кнопку **`[📂 Імпортувати client_secret.json]`**.

---

## 4. Процес публікації у застосунку

1. У студії перейдіть на крок **«Публікація»** або відкрийте діалог експорту.
2. При першому підключенні YouTube Shorts застосунок відкриє браузер для підтвердження доступу.
3. Відео завантажується із заголовком $\le 60$ символів (включаючи `#Shorts`) та автоматично публікується перший закріплений коментар (Pin Comment).

---

## 5. Гарантований бекап (Zero-API Fallback)

> [!IMPORTANT]
> Навіть без інтернету або без підключеного YouTube API функція збереження відео працює завжди:
> * Відео та повний SEO-пакет (`captions.txt`, `pin_comment.txt`, `project.json`) зберігаються локально в папку `Videos/CosmoLost/<project_id>/`.
> * Кнопка **«Відкрити в Провіднику»** відкриває папку у Windows Explorer із виділеним MP4-файлом і копіює підготовлений опис у буфер обміну.
