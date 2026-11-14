# Фізична Модель Бази Даних (02_DATA_MODEL_ERD.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.5.8`  
> **СУБД**: PostgreSQL 16 (або SQLite для швидкого хакатон-деплою) / Django ORM  
> **Згенерована схема**: [`images/erd.png`](./images/erd.png) (612 KB)

---

## 1. Візуальна схема бази даних (Rendered ERD PNG)

![Схема бази даних ERD](./images/erd.png)

---

## 2. Діаграма сутностей та зв'язків серверної бази даних (Mermaid ERD)

```mermaid
erDiagram
    CELESTIAL_BODIES ||--o{ ARTIFACTS : contains
    MISSIONS ||--o{ ARTIFACTS : launches
    ARTIFACTS ||--o{ TRAVERSE_WAYPOINTS : steps
    ARTIFACTS ||--o{ SCIENTIFIC_DISCOVERIES : enables
    ARTIFACTS ||--o{ ARTIFACT_MEDIA : has
    MISSIONS ||--o{ COMMUNITY_PUBLICATIONS : receives
    ARTIFACTS ||--o{ COMMUNITY_PUBLICATIONS : references

    CELESTIAL_BODIES {
        varchar id PK "Наприклад 'moon', 'mars'"
        varchar name "Назва небесного тіла"
        float radius_km "Радіус у кілометрах"
        float gravity_ms2 "Гравітація в м/с^2"
        varchar coordinate_system_type "SELENOGRAPHIC або PLANETOCENTRIC_360"
        varchar wmts_tile_url "Шаблон URL тайлів NASA Treks"
        timestamp created_at
    }

    MISSIONS {
        varchar id PK "Системний слаг місії"
        varchar nssdca_id UK "Офіційний код запуску NASA"
        varchar name "Назва місії (Apollo 11, Mars 2020)"
        varchar agency "Космічне агентство (NASA, NASA/JPL)"
        date launch_date "Дата запуску з Землі"
        date landing_date "Дата посадки на поверхню"
        date end_date "Дата завершення контакту"
        text summary "Короткий опис місії"
    }

    ARTIFACTS {
        varchar id PK "Унікальний слаг ('opportunity-rover')"
        varchar mission_id FK "Зовнішній ключ на MISSIONS"
        varchar celestial_body_id FK "Зовнішній ключ на CELESTIAL_BODIES"
        varchar name "Назва артефакту"
        varchar artifact_type "ROVER, LANDER, INSTRUMENT..."
        varchar operational_status "DORMANT, PASSIVE_ACTIVE, DESTROYED"
        float latitude "Широта місця знаходження (-90..90)"
        float longitude "Довгота місця знаходження (-180..180 або 0..360)"
        float elevation_m "Висота рельєфу"
        varchar location_name "Назва кратера або рівнини"
        float mass_kg "Маса на поверхні в кг"
        int last_contact_sol "Останній Сол зв'язку (для Марса)"
        text cause_of_deactivation "Причина виходу з ладу"
        boolean is_featured "Кураторська картка (Tier 1)"
        boolean is_nasa_hardware "Офіційне NASA чи міжнародне"
        text first_person_monologue "Художній монолог апарата (en-US)"
        varchar model_3d_url "Посилання на .glb модель з NASA 3D"
        timestamp updated_at
    }

    TRAVERSE_WAYPOINTS {
        varchar id PK "Унікальний UUID точки"
        varchar artifact_id FK "Зовнішній ключ на ARTIFACTS"
        int sol_or_step "Номер Сола або зупинки"
        float latitude "Координата широти"
        float longitude "Координата довготи"
        float elevation_m "Висота точки"
        float odometry_m "Накопичений пробіг"
        jsonb telemetry_snapshot "Заряд (Wh), пил (Tau), нахил"
        text story_snippet "Коротка подія на зупинці"
    }

    SCIENTIFIC_DISCOVERIES {
        varchar id PK "UUID відкриття"
        varchar artifact_id FK "Зовнішній ключ на ARTIFACTS"
        varchar instrument_acronym "Код приладу (Pancam, APXS, SEIS)"
        varchar instrument_full_name "Повна назва інструменту"
        varchar title "Заголовок наукового відкриття"
        text kid_friendly_story "Пояснення для школярів"
        text scientific_fact "Науковий факт з архіву PDS"
    }

    ARTIFACT_MEDIA {
        varchar id PK "UUID медіафайлу"
        varchar artifact_id FK "Зовнішній ключ на ARTIFACTS"
        varchar media_category "SURFACE_PHOTO, LAST_KNOWN_PHOTO..."
        varchar media_url "Пряме посилання на CDN NASA"
        varchar nasa_id_or_pia "Офіційний код (PIA22521)"
        varchar caption "Підпис до фотографії"
        varchar credit "Копірайт (NASA/JPL-Caltech)"
    }

    COMMUNITY_PUBLICATIONS {
        uuid id PK "UUID публікації"
        varchar mission_id FK "Прив'язка до місії"
        varchar artifact_id FK "Опціональна прив'язка до апарата"
        varchar title "Назва ролика або публікації"
        varchar video_url "Посилання на YouTube Shorts / TikTok"
        varchar platform_type "YOUTUBE, TIKTOK, REELS"
        text source_references "Джерела контенту (NASA каталоги, фото)"
        varchar author_name "Нікнейм автора контенту"
        boolean is_approved "Премодерація для показу на порталі"
        timestamp created_at
    }
```

> **Примітка щодо десктопного редактора (Tauri)**:  
> Всі сутності локального монтажу (`VideoScriptSlide`, `BatchQueueTask`, локальні шляхи `.mp4`, токени соцмереж) зберігаються **виключно локально** на машині креатора в `%APPDATA%/CosmoLost/` (SQLite / JSON) і не навантажують серверну БД. Відеофайли залишаються на ПК автора або заливаються напряму на YouTube/TikTok.

---

## 3. Реєстр переліків серверної бази даних (Enums)

### 3.1. `CoordinateSystemType` (Система координат небесного тіла)
* `SELENOGRAPHIC` — селенографічна система для Місяця (довгота $[-180^\circ..180^\circ]$).
* `PLANETOCENTRIC_360` — планетоцентрична система для Марса за каталогами IAU 2000 (східна довгота $[0^\circ..360^\circ]$).

### 3.2. `ArtifactType` (Класифікатор 10 типів обладнання NASA)
* `ROVER` — колісні марсоходи та місячні ровери (Spirit, Opportunity, Apollo LRV).
* `HELICOPTER` — марсіанський атмосферний дрон (Ingenuity).
* `LANDER` — стаціонарні посадочні модулі (Viking 1/2, InSight, Phoenix).
* `DESCENT_STAGE` — посадкові ступені пілотованих кораблів (Apollo 11 LM Eagle).
* `IMPACT_STAGE` — ступені ракет, навмисно розбиті об ґрунт для сейсміки (Saturn V S-IVB).
* `INSTRUMENT` — автономні наукові прилади на поверхні (сейсмометри ALSEP, SEIS).
* `RETRO_REFLECTOR` — пасивні куточкові лазерні відбивачі (Apollo 11/14/15 LRRR).
* `SAMPLE_TUBE` — герметичні титанові трубки зі зразками ґрунту (Three Forks Depot).
* `ENTRY_DEBRIS` — скинуті компоненти посадки (Backshell, теплові щити, парашути).
* `DEEP_SPACE_PROBE` — автоматичні апарати далекого космосу (Voyager 1/2, Pioneer 10/11).

### 3.3. `OperationalStatus` (Робочий статус апарата)
* `DORMANT` — знеструмлений / засипаний піском (завершив роботу, очікує повернення людей).
* `PASSIVE_ACTIVE` — пасивно відбиває земні лазерні промені без живлення (ретрорефлектори).
* `DESTROYED_ON_IMPACT` — зруйнований при запланованому зіткненні для сейсмічного аналізу.
* `ACTIVE_TRANSMITTING` — продовжує радіозв'язок із Землею через Deep Space Network.

### 3.4. `MediaCategory` (Категорія архівного медіа)
* `SURFACE_FIRST_PERSON` — знімки з бортових камер апарата на поверхні.
* `LAST_KNOWN_PHOTO` — фінальний знімок перед остаточним замовканням станції.
* `ORBITAL_PROOF_LROC_HIRISE` — супутникове підтвердження точки з орбіти (LROC, HiRISE).
* `MODEL_3D` — посилання на 3D-модель `.glb` у відкритому репозиторії NASA.
* `AUDIO_RECORDING` — записи звуків посадки або вітру (мікрофони InSight, Perseverance).

### 3.5. `PlatformType` (Платформа зовнішньої публікації)
* `YOUTUBE` — YouTube Shorts або довгі відео.
* `TIKTOK` — вертикальні відео TikTok.
* `REELS` — Instagram Reels.
* `OTHER` — інші зовнішні відеохостинги.

---

## 4. Специфікація 8 серверних таблиць (PostgreSQL / Django ORM)

| № | Таблиця | Опис | Кількість полів | Зовнішні ключі (FK) |
|---|---|---|---|---|
| 1 | `CELESTIAL_BODIES` | Небесні тіла (Місяць, Марс) для 3D-глобуса | 7 | — |
| 2 | `MISSIONS` | Космічні місії та програми запуску NASA | 8 | — |
| 3 | `ARTIFACTS` | Покинуті апарати, монолог en-US, 3D .glb | 17 | `mission_id`, `celestial_body_id` |
| 4 | `TRAVERSE_WAYPOINTS` | Точки треку та телеметрія роверів/дронів | 9 | `artifact_id` |
| 5 | `SCIENTIFIC_DISCOVERIES`| Наукові факти та прилади місій | 7 | `artifact_id` |
| 6 | `ARTIFACT_MEDIA` | Фотоархів NASA (PIA-коди, CDN-посилання) | 8 | `artifact_id` |
| 7 | `COMMUNITY_PUBLICATIONS`| Посилання на відео користувачів з джерелами | 9 | `mission_id`, `artifact_id` (opt) |

> **Примітка щодо `COMMUNITY_PUBLICATIONS`**:  
> Таблиця розроблена на майбутнє для агрегації роликів користувачів (YouTube Shorts / TikTok) за місіями з обов'язковим зазначенням першоджерел контенту. На бекенді готова; клієнтський інтерфейс внесення/перегляду перебуває у статусі беклогу `[AI-DRAFT]`.

