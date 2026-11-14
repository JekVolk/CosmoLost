---
description: Enforce Feature-Sliced Design (FSD) architecture principles, Repository pattern, and UI/state separation
trigger: always_on
---

# Feature-Sliced Design (FSD) Architecture Rules

All frontend code in `desktop-client` and `web-client` MUST adhere to Feature-Sliced Design (FSD v2.1):

1. **Layer Order**:
   - `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`
   - An upper layer CAN import from lower layers.
   - A lower layer CAN NEVER import from an upper layer.

2. **Cross-Slice Isolation**:
   - Slices on the same layer CANNOT import from each other.
   - Compose slices at the next higher layer (e.g. combine two features inside a widget or page).

3. **Public API Requirement**:
   - Every slice must expose its interface via an `index.ts` file at the root of the slice.
   - Deep imports into slices (e.g. `@/features/auth/ui/LoginForm`) are strictly forbidden. Only import from the slice root (`@/features/auth`).

4. **Entities Layer Rules**:
   - API endpoints live in `entities/<slice>/api/`.
   - Data access must use the **Repository Pattern** (`entities/<slice>/api/<slice>-repository.ts`).
   - Domain models, React Query hooks, and Zustand stores live in `entities/<slice>/model/`.
   - Entity UI components in `entities/<slice>/ui/` must be pure presentational views driven by props.

5. **Separation of Concerns**:
   - State and logic MUST be separated from UI presentation.
   - No direct IPC or API calls inside UI components.

6. **Styling**:
   - **NO Tailwind CSS**. Use Chakra UI v3 exclusively.

7. **Shared Layer**:
   - `shared` contains no business logic. Grouped by: `api`, `config`, `lib/utils`, `lib/hooks`, `ui`.
