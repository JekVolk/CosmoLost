# Діаграми Послідовності (04_SEQUENCES.md)

> **Статус**: `APPROVED`  
> **Версія специфікації**: `v0.2.0`  
> **Стандарт**: Mermaid Sequence Diagram

---

## 1. Сценарій: Генерація та публікація ролика у «Фабриці контенту»

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Креатор [ROLE-Creator]
    participant Desktop as Десктоп-додаток (Tauri UI)
    participant API as CosmoLost Django API
    participant TTS as Edge-TTS Engine
    participant FFmpeg as FFmpeg Sidecar (ПК)
    participant Social as YouTube Data API / Telegram

    Creator->>Desktop: Обирає артефакт (Opportunity) та рубрику ('last-sol')
    Desktop->>API: GET /api/v1/artifacts/opportunity-rover/
    API-->>Desktop: Дані об'єкта, фотографії та сторітелінг
    Desktop->>Desktop: Формує сценарій з 4 слайдів

    Creator->>Desktop: Натискає «Згенерувати озвучку»
    Desktop->>TTS: Запит синтезу (текст, голос uk-UA-OstapNeural)
    TTS-->>Desktop: Повертає audio.mp3

    Creator->>Desktop: Натискає «Змонтувати ролик»
    Desktop->>FFmpeg: Запуск команди склейки (фото + audio.mp3 + музика + субтитри)
    FFmpeg-->>Desktop: Готовий файл video.mp4 (1080x1920)

    alt Варіант А: Прямий автопостинг
        Creator->>Desktop: Клік «Опублікувати в YouTube Shorts»
        Desktop->>Social: POST /upload/youtube/v3/videos (video.mp4, snippet)
        Social-->>Desktop: 200 OK (video_id: abc123xyz)
        Desktop-->>Creator: Сповіщення «Ролик успішно опубліковано!»
    else Варіант Б: Локальний експорт для TikTok / Instagram
        Creator->>Desktop: Клік «Експортувати медіапакет»
        Desktop->>Desktop: Копіює video.mp4 у вибрану папку
        Desktop->>Desktop: Копіює готовий текст та хештеги у буфер обміну
        Desktop-->>Creator: Відкриває провідник ОС з файлом ролика
    end
```

---

## 2. Сценарій: Завантаження та збагачення даних NASA (Ingestion Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Адміністратор [ROLE-Admin]
    participant Unfold as Django Unfold Admin
    participant Ingest as Management Command (Ingestion)
    participant NASA as Офіційні архіви NASA (PDS/NSSDCA)
    participant DB as База даних PostgreSQL

    Admin->>Unfold: Натискає «Синхронізувати дані NASA»
    Unfold->>Ingest: Запуск фонової задачі ingest_nasa_catalog
    Ingest->>NASA: Запит актуальних каталогів та списків обладнання
    NASA-->>Ingest: Сирі JSON/CSV таблиці артефактів
    Ingest->>Ingest: Валідація координат та DTO через Pydantic

    loop Масовий імпорт (Tier 2)
        Ingest->>DB: Bulk Upsert артефактів (координати, маса, дати)
    end

    loop Кураторське збагачення (Tier 1)
        Ingest->>NASA: Запит 3D-моделей (.glb) та останніх селфі
        NASA-->>Ingest: Файли та медіа-посилання
        Ingest->>DB: Оновлення is_featured=True, прив'язка медіа
    end

    Ingest-->>Unfold: Завершено (імпортовано N об'єктів)
    Unfold-->>Admin: Показ повідомлення про успішне оновлення бази
```

---

## 3. Сценарій: Запит ШІ-агента через FastMCP Шлюз

```mermaid
sequenceDiagram
    autonumber
    actor User as Користувач ШІ
    participant LLM as Claude / Gemini
    participant MCP as CosmoLost FastMCP Сервер
    participant DB as База даних CosmoLost

    User->>LLM: «Розкажи про останній день ровера Оппортьюніті на Марсі»
    LLM->>MCP: Виклик Tool search_artifacts(query="Opportunity")
    MCP->>DB: Повнотекстовий пошук
    DB-->>MCP: Знайдено artifact_id="opportunity-rover"
    MCP-->>LLM: Метадані артефакту

    LLM->>MCP: Виклик Tool get_artifact_details("opportunity-rover")
    MCP->>DB: SELECT * FROM artifacts WHERE id="opportunity-rover"
    DB-->>MCP: Повні дані: Sol 5111, рівень пилу Tau 10.8, останні слова
    MCP-->>LLM: Перевірений паспорт та цитати першоджерел NASA

    LLM-->>User: Відповідає точною історією з реальними фактами та посиланням на сторінку CosmoLost
```
