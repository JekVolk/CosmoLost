# CosmoLost: Екосистема Покинутого Космічного Обладнання

> **«Abandoned on the Moon and Mars, but Never Forgotten by Humanity»**  
> Проєкт розроблено командою **Space Ліхтар** для всесвітнього хакатону **NASA Space Apps Challenge 2026**.

[![NASA Space Apps](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue.svg)](https://www.spaceappschallenge.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![FSD Architecture](https://img.shields.io/badge/Architecture-FSD%20v2.1-orange.svg)](business/spec/06_architecture)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8D8.svg)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Chakra UI v3](https://img.shields.io/badge/Chakra%20UI-v3.8-319795.svg)](https://chakra-ui.com/)

---

## 🌌 Про Проєкт

Понад 60 років досліджень Сонячної системи залишили сотні наукових станцій, роверів та посадкових модулів на поверхні Місяця та Марса. Офіційні каталоги NASA PDS/NSSDCA є складними для сприйняття молоддю, а створення якісного науково-популярного відео вручну забирає 4+ години.

**CosmoLost** об'єднує покинуті технологічні артефакти людства у триєдину інтерактивну екосистему:

1. **🌐 Інтерактивний 3D Вебпортал (`web-client`)**:
   - Інтерактивний глобус Місяця та Марса на базі високоточних тайлів **NASA Treks WMTS**.
   - Перегляд 3D-моделей артефактів (`.glb`) у браузері через Three.js.
   - Емоційний сторітелінг «Щоденник останнього Сола» та телеметричні хроніки.

2. **🎬 Локальна Десктоп-Студія «Фабрика Контенту» (`desktop-client`)**:
   - Автоматизований 11-нодовий конвеєр (`@xyflow/react`) створення вірусних вертикальних відео (1080x1920) за 30 секунд.
   - Двомовний синтез мови **Edge-TTS** (`uk-UA-OstapNeural` / `en-US-GuyNeural`) із видаленням пауз (Jump-cut).
   - Реактивний **PNGTuber-аватар** з RMS-ліпсинком, студією 8 спрайтів та підтримкою власних персонажів.
   - **Smart Next Topic Engine**: інтелектуальний вибір наступної теми із серійним сюжетним містком та 88% ретеншном.
   - **ШІ-Лабораторія фрагментів**: генерація кінематографічних промптів для Veo 3.1, Nano Banana 2 та Lyria, 1-click копіювання, Drag & Drop заміна асетів.
   - **Zero-Trust BYOK**: локальне зберігання всіх ключів (YouTube OAuth PKCE, Telegram) без витоку на сервер.

3. **⚙️ Бекенд API та Шлюз FastMCP (`backend`)**:
   - Django REST Framework на базі офіційної реляційної схеми даних NASA (8 канонічних таблиць).
   - Автоматичний завантажувач та валідатор архівів NASA Ingest Subsystem (`run_ingest`).
   - Шлюз **FastMCP** (8 спеціалізованих інструментів) для дослідження каталогів ШІ-агентами (Claude, Gemini, Antigravity) без галюцинацій.

---

## 🏛 Монорепозиторій: Структура Проєкту

```
CosmoLost/
├── desktop-client/      # Десктопна студія Shorts (Tauri v2 + React 19 + Chakra UI v3 + FSD v2.1)
├── web-client/          # 3D вебпортал дослідження планет (React + Three.js + NASA Treks)
├── backend/             # Django REST API, NASA Ingest Loader та FastMCP сервер
├── business/            # Повний пакет бізнес-вимог, специфікацій, ERD та QA-кейсів
├── deploy/              # Конфігурації розгортання та Docker
├── design/              # UI/UX макети, палітри та графічні ресурси
├── testing/             # Загальні тести та тест-плани
├── pnpm-workspace.yaml  # Конфігурація моноїєрархії pnpm
└── package.json         # Головні скрипти монорепозиторію
```

---

## 🚀 Швидкий Старт

### Передумови:
- [Node.js 20+](https://nodejs.org/) та [pnpm 9+](https://pnpm.io/) (`corepack enable pnpm`)
- [Rust 1.80+](https://www.rust-lang.org/) (для збірки Tauri десктоп-клієнта)
- [Python 3.11+](https://www.python.org/) (для запуску бекенда Django та Ingest)

### 1. Клонування репозиторію:
```bash
git clone https://github.com/JekVolk/CosmoLost.git
cd CosmoLost
```

### 2. Запуск Десктопної Студії (`desktop-client`):
```powershell
# Встановлення залежностей
pnpm install

# Запуск десктопного додатку в режимі розробки (Tauri v2 + Vite + MCP Bridge)
pnpm tauri:dev

# Або запуск тільки вебінтерфейсу студії на http://localhost:1420
pnpm dev:desktop
```

### 3. Запуск Бекенд API та Ingest (`backend`):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # На Windows: .venv\Scripts\activate
pip install -r requirements.txt  # або uv pip sync
python manage.py migrate
python manage.py run_ingest --force  # Завантаження 7 базових артефактів NASA
python manage.py runserver 0.0.0.0:8000
```

### 4. Запуск Вебпорталу 3D (`web-client`):
```powershell
pnpm dev
# Вебпортал буде доступний на http://localhost:5173
```

---

## 🧪 Тестування та Верифікація

```powershell
# Запуск 29 тестових сьютів (189 тестів) десктоп-клієнта
pnpm test:desktop

# Перевірка архітектурних меж FSD v2.1 та лінтинг Biome
pnpm check:desktop
```

---

## 👥 Команда «Space Ліхтар»

* **Lead Architect & Backend / AI**: Архітектура FastMCP, Django REST, NASA Ingest.
* **Desktop Lead**: Tauri v2, `@xyflow/react`, FFmpeg compositing, Edge-TTS, FSD v2.1.
* **3D & Web Lead**: Three.js, NASA Treks WMTS, вебпортал.
* **UI/UX Designer**: Віолетта — дизайн-система, естетика Pillow-Box, космічні аватари.

---

## 📜 Ліцензія

Розповсюджується під ліцензією MIT. Дані місій та фотографії: **NASA / JPL-Caltech Open Data Policy**.
