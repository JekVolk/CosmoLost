---
name: fsd-architecture
description: >-
  Use this skill whenever structuring, refactoring, or developing features, pages, widgets,
  entities, or shared modules following Feature-Sliced Design (FSD v2.1) methodology for React applications.
---

# Feature-Sliced Design (FSD v2.1) Guidelines

Feature-Sliced Design is an architectural methodology for front-end applications that emphasizes maintainability, scalability, and loose coupling.

## Layer Hierarchy (Strict Top-to-Bottom Flow)

Modules can ONLY import from layers strictly below them:

```
┌────────────────────────────────────────────────────────┐
│ 1. app       (Providers, routing, global styles)       │
├────────────────────────────────────────────────────────┤
│ 2. pages     (Full view screens, route components)     │
├────────────────────────────────────────────────────────┤
│ 3. widgets   (Composite UI blocks combining features)  │
├────────────────────────────────────────────────────────┤
│ 4. features  (User interactions with business value)   │
├────────────────────────────────────────────────────────┤
│ 5. entities  (Business domain models, UI, API, types)  │
├────────────────────────────────────────────────────────┤
│ 6. shared    (Reusable UI kit, API clients, lib, hooks)│
└────────────────────────────────────────────────────────┘
```

> **Golden Rule**: An upper layer can import from lower layers. A lower layer can NEVER import from an upper layer.
> `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`

## Slices and Segments Structure

Inside each layer (except `app` and `shared`), code is partitioned into **Slices** (business domains) and **Segments** (technical concerns):

```text
src/
├── app/                  # Application initialization
│   ├── providers/        # ChakraProvider, ThemeProvider, RouterProvider
│   ├── styles/           # Global styles, resets, font declarations
│   ├── App.tsx           # Root component with providers
│   └── index.ts          # App entry exports
│
├── pages/                # Route screens
│   ├── home/
│   │   ├── ui/HomePage.tsx
│   │   └── index.ts
│   └── settings/
│       ├── ui/SettingsPage.tsx
│       └── index.ts
│
├── widgets/              # Standalone complex UI blocks
│   ├── header/
│   │   ├── ui/Header.tsx
│   │   └── index.ts
│   └── sidebar/
│       ├── ui/Sidebar.tsx
│       └── index.ts
│
├── features/             # User scenarios & interactions
│   ├── window-controls/  # E.g. minimize, maximize, close window
│   │   ├── ui/WindowControls.tsx
│   │   ├── model/useWindowControls.ts
│   │   └── index.ts
│   └── theme-toggle/
│       ├── ui/ThemeToggle.tsx
│       └── index.ts
│
├── entities/             # Business entities (Domain models)
│   ├── session/
│   │   ├── model/types.ts, slice.ts
│   │   └── index.ts
│   └── user/
│       ├── ui/UserAvatar.tsx
│       ├── model/types.ts
│       └── index.ts
│
└── shared/               # Reusable domain-agnostic code
    ├── api/              # Tauri bridge, HTTP clients
    ├── config/           # Environment variables, constants
    ├── lib/              # Helpers, formatting, custom hooks
    └── ui/               # Chakra UI wrapper components (Button, Modal, etc.)
```

## Standard Segments within Slices

- `ui/`: React components, styles, visual elements.
- `model/`: State management, hooks, schemas, type definitions.
- `api/`: Backend or IPC requests specific to this slice.
- `lib/`: Helper functions and utilities specific to this slice.
- `config/`: Constants and configuration specific to this slice.

## Public API (`index.ts`) Rules

1. Every slice MUST export its public interface via an `index.ts` file at the root of the slice.
2. External modules MUST ONLY import through this Public API:
   ```typescript
   //  CORRECT:
   import { WindowControls } from '@/features/window-controls';
   import { UserAvatar, type User } from '@/entities/user';
   import { Button } from '@/shared/ui';

   //  WRONG (Deep import):
   import { WindowControls } from '@/features/window-controls/ui/WindowControls';
   import { type User } from '@/entities/user/model/types';
   ```

## Cross-Slice Rule (Same Layer Isolation)

- Slices on the same layer **CANNOT** import from each other.
- `features/auth` CANNOT import from `features/settings`.
- `entities/user` CANNOT import from `entities/order`.
- If two features need to interact, coordinate them in a `widget` or `page` layer.
- If two entities need shared types or logic, extract that logic down into `shared`.
