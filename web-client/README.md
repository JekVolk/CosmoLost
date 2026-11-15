# CosmoLost — Web Client (FSD v2.1)

Веб-клієнт космічної дедуктивної платформи **CosmoLost** на базі React 19, Chakra UI v3, Three.js, Zustand та TanStack Query.

---

## 🏗️ Архітектура: Feature-Sliced Design (FSD v2.1)

```
web-client/src/
├── app/                  # Ініціалізація, провайдери (Chakra, Query), роутер
├── pages/                # Сторінки (Home, Arena, Profile, Leaderboards)
├── widgets/              # Великі UI блоки (PlanetViewer, BattleArena, CuratorShowcase, PlanetaryTerrarium)
├── features/             # Сценарії користувача (Auth, Matchmaking, AstroGuessr, ForensicSol...)
├── entities/             # Бізнес-сутності (User, Container, Game, Inventory, Planet)
└── shared/               # Спільні утиліти, UI-кіт, HTTP та WS клієнти
```

---

## 🛠️ Технічний стек

* **Фреймворк**: React 19
* **Збірка**: Vite 6 + TypeScript 5.7
* **Стилізація**: Chakra UI v3 (@chakra-ui/react + @emotion/react)
* **State Management**: Zustand
* **Серверні дані**: TanStack Query v5
* **Real-Time зв'язок**: WebSocket (Zero-Knowledge протокол)
* **3D візуалізація**: Three.js (карти Місяця та Марса + моделі артефактів)
* **Лінтер & Форматер**: Biome

---

## 🚀 Команди розробника

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm check
pnpm build
```
