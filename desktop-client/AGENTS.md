# Desktop Client Architecture & Strict Rules

This desktop application for **CosmoLost** is built with **Tauri v2**, **React 19**, **TypeScript**, and **Chakra UI v3**, structured strictly using **Feature-Sliced Design (FSD v2.1)**.

## Core Architectural Rules

1. **Strict Layer Hierarchy**:
   `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
   Upper layers can import from lower layers; lower layers can NEVER import from upper layers. Slices on the same layer CANNOT import from each other.

2. **NO Tailwind CSS**:
   Tailwind CSS is strictly forbidden. All layout, styling, and theming must use Chakra UI v3 primitives, recipes, and semantic tokens.

3. **Entities Architecture (API + Repository Pattern)**:
   - `entities/<name>/api/`: Direct IPC/HTTP API callers.
   - `entities/<name>/api/<name>-repository.ts`: Repository pattern implementing domain interfaces (`IRepository`), mapping raw API data to typed domain models.
   - `entities/<name>/model/`: Domain interfaces (`types.ts`), React Query hooks (`use<Entity>Query`), and Zustand client stores (`use<Entity>Store`).
   - `entities/<name>/ui/`: Pure presentational components receiving typed props.

4. **Component & State Separation**:
   - UI components in `ui/` must remain pure presentational components.
   - Business logic, caching, and state management live exclusively in `model/` (hooks & stores).
   - Features/Widgets act as containers connecting model hooks with presentational UI components.

5. **State Management**:
   - **React Query** (`@tanstack/react-query`) for all async IPC / remote data fetching and caching.
   - **Zustand** (`zustand`) for local client state and session management.

6. **Shared Utilities**:
   - Domain-agnostic utilities belong in `src/shared/lib/utils/`.

7. **Tooling & Code Quality**:
   - **Biome** (`@biomejs/biome`) is used for linting and formatting. Run `pnpm check` before committing.
   - **Chakra UI MCP**, **Context7 MCP**, and **Tauri MCP** are configured for agent tool execution.
