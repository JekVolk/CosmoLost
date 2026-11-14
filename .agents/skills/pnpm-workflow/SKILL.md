---
name: pnpm-workflow
description: >-
  Use this skill when managing packages, executing build scripts, configuring workspace monorepos,
  and handling dependencies with pnpm on Windows/cross-platform.
---

# pnpm Package Management Workflow

This skill outlines best practices for package management and script execution with `pnpm` in the CosmoLost project.

## 1. Windows Execution Rules

On Windows, PowerShell execution policies may restrict `.ps1` script execution. Always use:
```powershell
pnpm.cmd <command>
# OR
npx pnpm <command>
```

## 2. Common pnpm Commands

- **Install all dependencies**:
  ```powershell
  pnpm.cmd install
  ```
- **Add runtime dependency**:
  ```powershell
  pnpm.cmd add <package-name>
  ```
- **Add development dependency**:
  ```powershell
  pnpm.cmd add -D <package-name>
  ```
- **Run project scripts**:
  ```powershell
  pnpm.cmd dev
  pnpm.cmd build
  pnpm.cmd lint
  pnpm.cmd typecheck
  ```

## 3. Monorepo / Workspace Configuration (`pnpm-workspace.yaml`)

When operating in monorepo root:
```yaml
packages:
  - 'desktop-client'
  - 'web-client'
```

Running commands in a specific package from root:
```powershell
pnpm.cmd --filter desktop-client <command>
```

## 4. Lockfile & Clean Installs

- Always commit `pnpm-lock.yaml`.
- For clean CI/CD installations, use:
  ```powershell
  pnpm.cmd install --frozen-lockfile
  ```
