---
name: tauri-desktop-development
description: >-
  Use this skill when developing desktop application features with Tauri v2, Rust backend IPC commands,
  window lifecycle management, permissions, and native OS integrations.
---

# Tauri v2 Desktop Development Skill

This skill guides development of cross-platform desktop applications using Tauri v2 with React and TypeScript.

## Tauri v2 Architecture Overview

Tauri uses a multi-process architecture:
- **Core Process (Rust)**: Native system access, file system, hardware, windowing, security sandbox.
- **Webview Process (Frontend)**: React + TypeScript UI rendered via the OS-native webview (WebView2 on Windows, WebKitGTK on Linux, WebKit on macOS).
- **IPC (Inter-Process Communication)**: Message passing between Webview and Core via `invoke`, `listen`, and `emit`.

## 1. Safe Frontend IPC Bridge (`shared/api/tauri`)

Never call raw `invoke` directly inside components. Wrap all Tauri commands in typed service functions within `shared/api/tauri/`:

```typescript
// src/shared/api/tauri/window.ts
import { getCurrentWindow } from '@tauri-apps/api/window';

export const windowApi = {
  minimize: async (): Promise<void> => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  },
  toggleMaximize: async (): Promise<void> => {
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
  },
  close: async (): Promise<void> => {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  },
};
```

```typescript
// src/shared/api/tauri/commands.ts
import { invoke } from '@tauri-apps/api/core';

export interface SystemInfo {
  osName: string;
  osVersion: string;
  arch: string;
  appVersion: string;
}

export const tauriCommands = {
  getSystemInfo: async (): Promise<SystemInfo> => {
    return await invoke<SystemInfo>('get_system_info');
  },
};
```

## 2. Rust Backend Command Implementation (`src-tauri/src/lib.rs`)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub arch: String,
    pub app_version: String,
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os_name: std::env::consts::OS.to_string(),
        os_version: "Windows 11".to_string(),
        arch: std::env::consts::ARCH.to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_system_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 3. Window Customization & Titlebar

For a modern desktop look with custom titlebar:
1. In `tauri.conf.json`:
   ```json
   "app": {
     "windows": [
       {
         "title": "CosmoLost Desktop",
         "width": 1200,
         "height": 800,
         "decorations": false,
         "transparent": false
       }
     ]
   }
   ```
2. In the Header/Titlebar component:
   Add the attribute `data-tauri-drag-region` on draggable areas.
   Interactive buttons (minimize, maximize, close) must NOT have this attribute so clicks register properly.

## 4. Tauri v2 Security & Capabilities (`src-tauri/capabilities/default.json`)

Tauri v2 enforces fine-grained permissions via capabilities:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capability for CosmoLost desktop client",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default"
  ]
}
```

## 5. Development Workflow Commands

- Start dev environment: `pnpm tauri dev`
- Build release bundle: `pnpm tauri build`
- Check Rust code: `cargo check --manifest-path src-tauri/Cargo.toml`
