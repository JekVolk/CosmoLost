# CosmoLost — Web Client (FSD v2.1)

Веб-клієнт космічної дедуктивної платформи **CosmoLost** на базі React 19, Chakra UI v3, Zustand, TanStack Query та Three.js.

---

## 🏗️ Архітектура: Feature-Sliced Design (FSD v2.1)

```
web-client/src/
├── app/                  # Ініціалізація, провайдери (Chakra, Query), роутер
├── pages/                # Сторінки (Home, Arena, Profile, Leaderboards)
├── widgets/              # Великі UI блоки (BattleArena, CuratorShowcase, PlanetaryTerrarium)
├── features/             # Сценарії користувача (Auth, Matchmaking, AstroGuessr, ForensicSol...)
├── entities/             # Бізнес-сутності (User, Container, Game, Inventory)
└── shared/               # Спільні утиліти, UI-кіт, HTTP та WS клієнти
```

---

## 🛠️ Технічний стек

* **Фреймворк**: React 19
* **Збірка**: Vite 6 + TypeScript 5.7
* **Стилізація**: Chakra UI v3 (@chakra-ui/react + @emotion/react) — *жодного Tailwind CSS*
* **State Management**: Zustand (глобальний стан сесії, дуелі та інвентарю)
* **Серверні дані**: TanStack Query v5
* **Real-Time зв'язок**: WebSocket (Zero-Knowledge протокол)
* **3D візуалізація**: Three.js
* **Лінтер & Форматер**: Biome

---

## 🚀 Команди розробника

```bash
# Встановлення залежностей
pnpm install

# Запуск dev-сервера (http://localhost:5173)
pnpm dev

# Перевірка типів
pnpm typecheck

# Перевірка та автофікс коду через Biome
pnpm check

# Збірка продакшн версії
pnpm build
```

---

## 🔗 Зв'язок зі специфікаціями
* [FEAT-10: Дедуктивна гра та контейнери](../business/spec/04_features/FEAT-10_deductive_game_and_containers.md)
* [FEAT-11: Архітектура та протоколи](../business/spec/04_features/FEAT-11_game_implementation_spec.md)
* [FEAT-12: Геймплей та UI вайрфрейми](../business/spec/04_features/FEAT-12_gameplay_ui_and_onboarding_guide.md)
* [TASK-FE: Таска фронтенд-розробника](../business/spec/04_features/TASK_FE_game_frontend.md)
* [TEAM-ONE-PAGER: Огляд для команди](../business/spec/04_features/TEAM_PROPOSAL_ONE_PAGER.md)
