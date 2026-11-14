---
description: Enforce Biome formatting and linting rules
trigger: always_on
---

# Biome Linter & Formatter Rules

- All formatting and linting for TypeScript and React must follow Biome (`biome.json`).
- Run `pnpm check` to automatically format and fix lint issues.
- Single quotes for JS/TS, double quotes for JSX, semicolons required, 2 spaces indent.
- No unused variables, no unused imports.
