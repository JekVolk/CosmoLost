# Валідаційні Обмеження та Поля (02_FIELDS_AND_VALIDATIONS.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.4.0`  
> **Стандарт**: Pydantic v2 / Django Model Validators на основі SMM-досліджень та каталогів NASA

---

## Реєстр валідаційних обмежень (`FIELD-*`)

| ID | Сутність | Поле | Тип даних | Обмеження та правила | Опис помилки |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`FIELD-01`** | `Artifact` | `latitude` | `Float` | $-90.0 \le lat \le 90.0$ | *«Широта повинна знаходитися у діапазоні від -90 до 90 градусів»* |
| **`FIELD-02`** | `Artifact` | `longitude` | `Float` | $-180.0 \le lon \le 180.0$ (Місяць / Селенографічна) або $0.0 \le lon \le 360.0$ (Марс / IAU 2000 Planetocentric) | *«Довгота повинна відповідати системі координат обраного небесного тіла»* |
| **`FIELD-03`** | `Artifact` | `id` (slug) | `String` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, довжина 3..64 символи | *«Ідентифікатор артефакту повинен містити лише латинські малі літери, цифри та дефіс»* |
| **`FIELD-04`** | `Artifact` | `name` | `String` | Довжина 2..128 символів, обов'язкове | *«Назва артефакту обов'язкова і не може перевищувати 128 символів»* |
| **`FIELD-05`** | `Artifact` | `artifact_type` | `Enum` | Тільки зі списку: `ROVER`, `HELICOPTER`, `LANDER`, `DESCENT_STAGE`, `IMPACT_STAGE`, `INSTRUMENT`, `RETRO_REFLECTOR`, `SAMPLE_TUBE`, `ENTRY_DEBRIS`, `DEEP_SPACE_PROBE` | *«Неприпустимий тип артефакту»* |
| **`FIELD-06`** | `Artifact` | `operational_status` | `Enum` | Тільки зі списку: `PASSIVE_ACTIVE`, `DORMANT`, `DESTROYED_ON_IMPACT`, `ACTIVE_TRANSMITTING` | *«Неприпустимий статус функціонування»* |
| **`FIELD-07`** | `Artifact` | `power_source` | `Enum` | Тільки зі списку: `SOLAR`, `RTG`, `BATTERY`, `PASSIVE` | *«Неприпустиме джерело живлення»* |
| **`FIELD-08`** | `Artifact` | `mass_kg` | `Float` | $> 0.0$ або `null` | *«Маса повинна бути додатною величиною»* |
| **`FIELD-09`** | `Artifact` | `model_3d_url` | `URL` | Валідний URL, закінчується на `.glb` або `.gltf` (GitHub / NASA CDN) | *«Посилання на 3D-модель повинно вести на валідний .glb/.gltf файл»* |
| **`FIELD-10`** | `TraverseWaypoint`| `sol_or_step` | `Integer` | $\ge 0$ | *«Номер Сола або зупинки не може бути від'ємним»* |
| **`FIELD-11`** | `ArtifactMedia` | `media_category`| `Enum` | `SURFACE_FIRST_PERSON`, `LAST_KNOWN_PHOTO`, `ORBITAL_PROOF_LROC_HIRISE`, `MODEL_3D`, `AUDIO_RECORDING` | *«Неприпустима категорія медіафайлу»* |
| **`FIELD-12`** | `ArtifactMedia` | `media_url` | `URL` | Валідний HTTP/HTTPS URL відкритого архіву NASA | *«Медіа-ресурс повинен містити коректну веб-адресу»* |
| **`FIELD-13`** | `ContentTemplate` | `target_duration_sec` | `Integer` | Від 15 до 60 секунд (ліміт Shorts/TikTok) | *«Тривалість ролика повинна бути від 15 до 60 секунд»* |
| **`FIELD-14`** | `VideoScriptSlide`| `slide_type` | `Enum` | `HOOK`, `B_ROLL_MEAT`, `DRAMA_PEAK`, `SEAMLESS_LOOP` | *«Неприпустимий тип фази слайду»* |
| **`FIELD-15`** | `VideoScriptSlide`| `pngtuber_state`| `Enum` | `STATE_IDLE`, `STATE_EXPERT`, `STATE_SHOCK`, `STATE_HYPE` | *«Неприпустимий стан емоції PNGTuber»* |
| **`FIELD-16`** | `VideoScriptSlide`| `safe_zone_top` | `Integer` | $\ge 220$ px (захист від інтерфейсу пошуку соцмереж) | *«Текст не може перетинати верхню мертву зону 220 px»* |
| **`FIELD-17`** | `VideoScriptSlide`| `safe_zone_bottom`| `Integer`| $\ge 420$ px (захист від опису та аудіодоріжки) | *«Субтитри не можуть перетинати нижню мертву зону 420 px»* |
| **`FIELD-18`** | `PublicationProject`| `jump_cut_threshold`| `Float` | $\le 0.15$ секунд | *«Поріг Jump-cut не може перевищувати 0.15 секунди тиші»* |
| **`FIELD-19`** | `PublicationProject`| `target_platform` | `Enum` | `YOUTUBE_SHORTS`, `TELEGRAM`, `TIKTOK_MANUAL`, `INSTAGRAM_MANUAL` | *«Непідтримувана цільова платформа публікації»* |
| **`FIELD-20`** | `PublicationProject`| `status` | `Enum` | `DRAFT`, `RENDERING`, `RENDERED`, `PUBLISHED`, `PUBLISHED_MANUALLY`, `FAILED` | *«Неприпустимий стан життєвого циклу проєкту»* |
| **`FIELD-21`** | `BatchQueueTask` | `total_count` | `Integer` | Від 1 до 10 проєктів у пакеті | *«Пакетна генерація обмежена від 1 до 10 роликів за раз»* |
| **`FIELD-22`** | `PlatformConnector` | `platform_type` | `Enum` | `YOUTUBE_SHORTS`, `TELEGRAM_CHANNEL`, `TIKTOK`, `INSTAGRAM_REELS`, `THREADS`, `LOCAL_FOLDER_EXPORTER` | *«Непідтримуваний тип соціальної платформи»* |
| **`FIELD-23`** | `PlatformConnector` | `auth_type` | `Enum` | `OAUTH2_PKCE`, `BOT_TOKEN`, `API_KEY_SECRET`, `NATIVE_LOCAL` | *«Непідтримуваний механізм авторизації»* |
| **`FIELD-24`** | `PublicationDispatch` | `dispatch_status` | `Enum` | `PENDING`, `UPLOADING`, `PUBLISHED`, `MANUAL_EXPORTED`, `FAILED` | *«Неприпустимий стан завдання дистрибуції»* |
| **`FIELD-25`** | `PublicationProject` | `generated_caption_line1` | `String` | Довжина 5..100 символів, байт на розгортання «...ще» | *«Перший рядок опису повинен бути інтригуючим і не перевищувати 100 символів»* |
| **`FIELD-26`** | `PublicationProject` | `generated_caption_line2_seo` | `String` | Довжина 20..300 символів, обов'язкове посилання на `cosmolost` | *«SEO-опис повинен містити ключові факти та лінк на вебпортал CosmoLost»* |
| **`FIELD-27`** | `PublicationProject` | `generated_caption_line3_tags` | `String` | Рівно 4–5 хештегів, обов'язковий тег `#cosmolost` | *«Рядок хештегів повинен містити від 4 до 5 тегів, включаючи #cosmolost»* |
| **`FIELD-28`** | `PublicationProject` | `generated_pin_comment` | `String` | Довжина 15..280 символів, обов'язковий знак `?` наприкінці | *«Закріплений коментар повинен містити відкрите дискусійне питання із знаком '?'»* |
| **`FIELD-29`** | `PublicationProject` | `render_timeout_sec` | `Integer` | Від 30 до 300 секунд (дефолт: 40с на GPU, до 120–180с на слабких/інтегрованих картах) | *«Таймаут рендерингу повинен бути у межах від 30 до 300 секунд»* |
| **`FIELD-30`** | `Artifact` | `is_nasa_hardware` | `Boolean` | `true` або `false` (за замовчуванням `true`) | *«Прапорець приналежності до обладнання NASA або взаємодії з ним»* |
| **`FIELD-31`** | `ArtifactCluster` | `distance_threshold_m` | `Float` | $\le 500.0$ метрів (поріг кластеризації на 3D-мапі) | *«Об'єкти на відстані до 500 метрів об'єднуються у кластер»* |
| **`FIELD-32`** | `PublicationProject` | `selection_reason` | `String` | Довжина 10..500 символів, фіксація причини вибору теми/артефакту | *«Причина вибору теми обов'язкова і повинна містити від 10 до 500 символів»* |
| **`FIELD-33`** | `PublicationProject` | `target_duration_sec` | `Integer` | Від 15 до 60 секунд (дефолтне значення: 40 секунд) | *«Цільова тривалість ролика повинна знаходитися у діапазоні від 15 до 60 секунд»* |
