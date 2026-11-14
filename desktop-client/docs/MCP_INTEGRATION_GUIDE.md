# Model Context Protocol (MCP) Integration & Control Guide

> **CosmoLost Desktop Client** features a dual-layer Model Context Protocol implementation:
> 1. **Stdio MCP Server** (`scripts/cosmolost-mcp-server.mjs`) for external AI agents (Antigravity, Claude Desktop, Cursor, Goose, etc.) to query and control the application natively over JSON-RPC 2.0.
> 2. **Runtime Desktop Bridge** (`window.__COSMOLOST_MCP__`) embedded directly in the Tauri webview, allowing direct state inspection, navigation, theme toggling, task scheduling, and JSON snapshot export.
> 3. **Interactive MCP Hub** at `/mcp` (hotkey `Alt + 5`) for endpoint registry management, tool testing, invocation logs, and automated background task synergy.

---

## 1. Connecting External AI Assistants (Claude Desktop / Antigravity / Cursor)

Add the CosmoLost Desktop MCP server to your AI client's configuration file (e.g. `claude_desktop_config.json` or Antigravity MCP settings):

```json
{
  "mcpServers": {
    "cosmolost-desktop": {
      "command": "node",
      "args": [
        "C:/Users/JekVo/orca/workspaces/CosmoLost/feature-desktop-client/desktop-client/scripts/cosmolost-mcp-server.mjs"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Quick Verification via Command Line
Run the server verification script:
```powershell
node desktop-client/scripts/cosmolost-mcp-server.mjs
```
The server speaks standard JSON-RPC 2.0 over standard I/O (`stdin` / `stdout`). Send:
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```
You will receive all registered tools and their input schemas.

---

## 2. Available MCP Tools

| Tool Name | Parameters | Description |
|---|---|---|
| `cosmolost_get_app_state` | None | Returns active route, current theme mode, online status, language, and system metrics. |
| `cosmolost_navigate` | `path`: string (`/`, `/settings`, `/scheduler`, `/mcp`) | Instructs the desktop client to navigate to the designated route view. |
| `cosmolost_set_theme` | `mode`: `"dark"` \| `"light"` \| `"system"` | Changes the desktop application's Chakra UI theme and persists it to native storage. |
| `cosmolost_get_scheduler_tasks` | `includeLogs`: boolean (optional) | Retrieves all scheduled background routines, execution history, and cron triggers. |
| `cosmolost_trigger_scheduler_task` | `taskId`: string | Forcefully triggers immediate execution of a registered background scheduler task. |
| `cosmolost_get_diagnostics` | None | Collects runtime platform diagnostics, Tauri IPC availability, and performance statistics. |
| `cosmolost_export_workspace` | None | Generates a full encrypted/serialized JSON backup bundle of settings and scheduled tasks. |

---

## 3. Controlling via Tauri Webview Console (`window.__COSMOLOST_MCP__`)

When running the desktop application (`pnpm tauri dev` or `pnpm dev`), open the developer console (`F12` or `Ctrl + Shift + I`):

### 3.1. Query Current Application State
```javascript
const state = await window.__COSMOLOST_MCP__.getAppState();
console.log('App state:', state);
```

### 3.2. Programmatic Route Navigation
```javascript
// Navigate to Scheduler
window.__COSMOLOST_MCP__.navigateTo('/scheduler');

// Navigate to Settings
window.__COSMOLOST_MCP__.navigateTo('/settings');
```

### 3.3. Dynamic Theme Switching
```javascript
// Switch to dark theme
await window.__COSMOLOST_MCP__.setTheme('dark');

// Switch to light theme
await window.__COSMOLOST_MCP__.setTheme('light');
```

### 3.4. Trigger Background Scheduler Task
```javascript
const result = await window.__COSMOLOST_MCP__.triggerTask('task-daily-backup');
console.log('Task trigger response:', result);
```

### 3.5. Export Full Workspace Bundle
```javascript
const bundle = await window.__COSMOLOST_MCP__.exportBundle();
console.log('Exported JSON bundle:', bundle);
```

---

## 4. MCP Hub UI (`/mcp` or `Alt + 5`)

Inside the desktop client:
1. Navigate to **MCP Hub** from the sidebar or press `Alt + 5`.
2. Inspect registered MCP endpoints (`Tauri Core IPC`, `Chakra UI Theme Engine`, `Context7 Docs`).
3. Click **Ping** to measure roundtrip latency.
4. Select any discovered tool, adjust parameter JSON in the editor, and click **Run Tool**.
5. Check the live execution result and inspect the call history in **Audit Call Logs**.
6. In **Task Scheduler** (`/scheduler`), you can create recurring jobs that periodically invoke MCP tools in the background.

---

## 5. Architectural Compliance (FSD v2.1)

- **`src/shared/lib/mcp`**: Low-level JSON-RPC protocol implementation and `desktop-mcp-bridge.ts`.
- **`src/entities/mcp`**: Zod schemas, persistent Tauri Zustand store (`cosmolost-mcp-state`), presentational badge components.
- **`src/features/mcp-manager`**: Orchestration hooks (`useMcpManager`), server management cards, tool execution runner, audit logs, and bridge diagnostics.
- **`src/pages/mcp`**: Lazy-loaded composite view routed at `/mcp`.
