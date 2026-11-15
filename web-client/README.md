# CosmoLost — Web Client (FSD v2.1)

The web client for the **CosmoLost** space deduction platform, built with React 19, Chakra UI v3, Three.js, Zustand, and TanStack Query.

---

## 🏗️ Architecture: Feature-Sliced Design (FSD v2.1)

```
web-client/src/
├── app/                  # Initialization, providers (Chakra, Query), and router
├── pages/                # Pages (Home, Arena, Profile, Leaderboards)
├── widgets/              # Large UI blocks (PlanetViewer, BattleArena, CuratorShowcase, PlanetaryTerrarium)
├── features/             # User scenarios (Auth, Matchmaking, AstroGuessr, ForensicSol...)
├── entities/             # Business entities (User, Container, Game, Inventory, Planet)
└── shared/               # Shared utilities, UI kit, HTTP and WS clients
```

---

## 🛠️ Tech Stack

* **Framework**: React 19
* **Build**: Vite 6 + TypeScript 5.7
* **Styling**: Chakra UI v3 (@chakra-ui/react + @emotion/react)
* **State Management**: Zustand
* **Server State**: TanStack Query v5
* **Real-Time Communication**: WebSocket (Zero-Knowledge protocol)
* **3D Visualization**: Three.js (Moon and Mars maps + artifact models)
* **Linter & Formatter**: Biome

---

## 🚀 Developer Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm check
pnpm build
```
