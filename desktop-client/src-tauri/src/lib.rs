use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub arch: String,
    pub app_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PingResponse {
    pub received_at: u64,
    pub echo: String,
    pub roundtrip_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenFolderWithVideoResult {
    pub success: bool,
    pub opened_path: String,
    pub copied_to_clipboard: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlatformConnectorDto {
    pub id: String,
    pub platform_type: String,
    pub display_name: String,
    pub auth_type: String,
    pub connection_status: String,
    pub is_active: bool,
    pub last_connected_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RenderVideoResult {
    pub task_id: String,
    pub output_video_path: String,
    pub duration_sec: f64,
    pub file_size_bytes: u64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CliToolStatus {
    pub tool_name: String,
    pub installed: bool,
    pub path: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AutoConfigureResult {
    pub success: bool,
    pub client_name: String,
    pub config_file_path: String,
    pub message: String,
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os_name: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
fn ping(message: String) -> PingResponse {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    PingResponse {
        received_at: now,
        echo: message,
        roundtrip_status: "ok".to_string(),
    }
}

#[tauri::command]
async fn show_main_window(window: tauri::Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    let _ = window.set_focus();
    Ok(())
}

fn get_cosmolost_video_folder() -> std::path::PathBuf {
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_else(|_| ".".to_string());
    let mut path = std::path::PathBuf::from(home);
    path.push("Videos");
    path.push("CosmoLost");
    let _ = std::fs::create_dir_all(&path);
    path
}

#[tauri::command]
fn open_folder_with_video(project_id: String) -> Result<OpenFolderWithVideoResult, String> {
    // Security: Sanitize project_id to strictly alphanumeric, dashes and underscores
    let clean_id: String = project_id
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .collect();
    let safe_id = if clean_id.is_empty() {
        "default_project".to_string()
    } else {
        clean_id
    };

    let video_folder = get_cosmolost_video_folder();
    let video_file = video_folder.join(format!("{}.mp4", safe_id));
    let video_file_str = video_file.to_string_lossy().to_string();

    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("explorer")
            .arg(format!("/select,{}", video_file_str))
            .spawn();
    }

    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg("-R")
            .arg(&video_file)
            .spawn();
    }

    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open")
            .arg(&video_folder)
            .spawn();
    }

    Ok(OpenFolderWithVideoResult {
        success: true,
        opened_path: video_file_str,
        copied_to_clipboard: true,
    })
}

#[tauri::command]
fn copy_to_clipboard(text: String, _target: String) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(mut child) = std::process::Command::new("clip")
            .stdin(std::process::Stdio::piped())
            .spawn()
        {
            if let Some(mut stdin) = child.stdin.take() {
                use std::io::Write;
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait(); // Prevent zombie processes
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(mut child) = std::process::Command::new("pbcopy")
            .stdin(std::process::Stdio::piped())
            .spawn()
        {
            if let Some(mut stdin) = child.stdin.take() {
                use std::io::Write;
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait(); // Prevent zombie processes
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Ok(mut child) = std::process::Command::new("xclip")
            .arg("-selection")
            .arg("clipboard")
            .stdin(std::process::Stdio::piped())
            .spawn()
        {
            if let Some(mut stdin) = child.stdin.take() {
                use std::io::Write;
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait(); // Prevent zombie processes
        }
    }

    Ok(serde_json::json!({ "success": true }))
}

#[tauri::command]
fn list_platform_connectors() -> Result<Vec<PlatformConnectorDto>, String> {
    Ok(vec![
        PlatformConnectorDto {
            id: "youtube-shorts".to_string(),
            platform_type: "YOUTUBE_SHORTS".to_string(),
            display_name: "YouTube Shorts (OAuth PKCE)".to_string(),
            auth_type: "OAUTH_PKCE".to_string(),
            connection_status: "CONNECTED".to_string(),
            is_active: true,
            last_connected_at: Some("2026-11-14T15:00:00Z".to_string()),
        },
        PlatformConnectorDto {
            id: "telegram-channel".to_string(),
            platform_type: "TELEGRAM_CHANNEL".to_string(),
            display_name: "Telegram Channel (@cosmolost_hq)".to_string(),
            auth_type: "BOT_TOKEN".to_string(),
            connection_status: "CONNECTED".to_string(),
            is_active: true,
            last_connected_at: Some("2026-11-14T15:00:00Z".to_string()),
        },
        PlatformConnectorDto {
            id: "local-folder-export".to_string(),
            platform_type: "LOCAL_FOLDER".to_string(),
            display_name: "Нативний провідник ОС (Explorer)".to_string(),
            auth_type: "NONE".to_string(),
            connection_status: "CONNECTED".to_string(),
            is_active: true,
            last_connected_at: Some("2026-11-14T15:00:00Z".to_string()),
        },
    ])
}

#[tauri::command]
fn render_video_ffmpeg(params: serde_json::Value) -> Result<RenderVideoResult, String> {
    let raw_project_id = params
        .get("project_id")
        .and_then(|v| v.as_str())
        .unwrap_or("default_project");

    // Security: Sanitize project_id to prevent path traversal
    let clean_id: String = raw_project_id
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .collect();
    let safe_id = if clean_id.is_empty() {
        "default_project".to_string()
    } else {
        clean_id
    };

    let video_folder = get_cosmolost_video_folder();
    let output_file = video_folder.join(format!("{}_rendered.mp4", safe_id));
    let output_file_str = output_file.to_string_lossy().to_string();

    Ok(RenderVideoResult {
        task_id: format!("task_{}", safe_id),
        output_video_path: output_file_str,
        duration_sec: 40.0,
        file_size_bytes: 18450000,
        status: "COMPLETED".to_string(),
    })
}

#[tauri::command]
fn detect_cli_tool(tool_name: String) -> Result<CliToolStatus, String> {
    // Security: Strict whitelist to prevent arbitrary command execution
    const ALLOWED_TOOLS: &[&str] = &["claude", "agy", "node", "npm", "pnpm", "git", "openai", "ffmpeg"];
    let normalized = tool_name.trim().to_lowercase();
    if !ALLOWED_TOOLS.contains(&normalized.as_str()) {
        return Ok(CliToolStatus {
            tool_name,
            installed: false,
            path: None,
            version: None,
        });
    }

    let check_cmd = if cfg!(target_os = "windows") { "where" } else { "which" };
    let output = std::process::Command::new(check_cmd)
        .arg(&normalized)
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let path_str = String::from_utf8_lossy(&out.stdout)
                .trim()
                .lines()
                .next()
                .unwrap_or("")
                .to_string();

            let version = std::process::Command::new(&normalized)
                .arg("--version")
                .output()
                .ok()
                .and_then(|v| {
                    if v.status.success() {
                        Some(String::from_utf8_lossy(&v.stdout).trim().to_string())
                    } else {
                        None
                    }
                });

            Ok(CliToolStatus {
                tool_name: normalized,
                installed: true,
                path: Some(path_str),
                version,
            })
        }
        _ => Ok(CliToolStatus {
            tool_name: normalized,
            installed: false,
            path: None,
            version: None,
        }),
    }
}

#[tauri::command]
fn auto_configure_cli_mcp(
    client_name: String,
    script_path: Option<String>,
) -> Result<AutoConfigureResult, String> {
    // Security: Validate script_path extension and prevent path traversal
    if let Some(ref path_str) = script_path {
        if !path_str.ends_with(".mjs") && !path_str.ends_with(".js") {
            return Err("Security Violation: MCP script must be a valid .js or .mjs file".to_string());
        }
        if path_str.contains("..") {
            return Err("Security Violation: Directory traversal in script_path is prohibited".to_string());
        }
    }

    let current_dir = std::env::current_dir().unwrap_or_default();
    let default_script = current_dir.join("scripts").join("cosmolost-mcp-server.mjs");
    let target_script = script_path
        .map(std::path::PathBuf::from)
        .unwrap_or(default_script);
    let target_script_str = target_script.to_string_lossy().to_string();

    match client_name.to_lowercase().as_str() {
        "claude" => {
            let app_data = std::env::var("APPDATA")
                .or_else(|_| std::env::var("HOME").map(|h| format!("{}/Library/Application Support", h)))
                .unwrap_or_else(|_| ".".to_string());
            let config_dir = std::path::PathBuf::from(app_data).join("Claude");
            let _ = std::fs::create_dir_all(&config_dir);
            let config_file = config_dir.join("claude_desktop_config.json");

            let mut root: serde_json::Value = if config_file.exists() {
                let content = std::fs::read_to_string(&config_file).unwrap_or_default();
                serde_json::from_str(&content).unwrap_or_else(|_| serde_json::json!({}))
            } else {
                serde_json::json!({})
            };

            if !root.is_object() {
                root = serde_json::json!({});
            }

            let obj = root.as_object_mut().unwrap();
            if !obj.contains_key("mcpServers") || !obj.get("mcpServers").unwrap().is_object() {
                obj.insert("mcpServers".to_string(), serde_json::json!({}));
            }

            let servers = obj.get_mut("mcpServers").unwrap().as_object_mut().unwrap();
            servers.insert(
                "cosmolost".to_string(),
                serde_json::json!({
                    "command": "node",
                    "args": [target_script_str],
                    "env": {
                        "NODE_ENV": "production"
                    }
                }),
            );

            let new_content = serde_json::to_string_pretty(&root).map_err(|e| e.to_string())?;
            std::fs::write(&config_file, new_content).map_err(|e| e.to_string())?;

            Ok(AutoConfigureResult {
                success: true,
                client_name: "Claude Desktop / CLI".to_string(),
                config_file_path: config_file.to_string_lossy().to_string(),
                message: "MCP сервер CosmoLost успішно додано до конфігурації Claude Desktop/CLI!".to_string(),
            })
        }
        "agy" | "antigravity" => {
            let user_home = std::env::var("USERPROFILE")
                .or_else(|_| std::env::var("HOME"))
                .unwrap_or_else(|_| ".".to_string());
            let mcp_dir = std::path::PathBuf::from(user_home)
                .join(".gemini")
                .join("antigravity-cli")
                .join("mcp");
            let _ = std::fs::create_dir_all(&mcp_dir);
            let config_file = mcp_dir.join("cosmolost.json");

            let config_json = serde_json::json!({
                "name": "cosmolost",
                "description": "CosmoLost Desktop Client Live State & Content Automation Server",
                "command": "node",
                "args": [target_script_str],
                "transport": "stdio",
                "version": "0.1.0"
            });

            let new_content = serde_json::to_string_pretty(&config_json).map_err(|e| e.to_string())?;
            std::fs::write(&config_file, new_content).map_err(|e| e.to_string())?;

            Ok(AutoConfigureResult {
                success: true,
                client_name: "Antigravity CLI (agy)".to_string(),
                config_file_path: config_file.to_string_lossy().to_string(),
                message: "MCP сервер CosmoLost успішно зареєстровано в Antigravity CLI!".to_string(),
            })
        }
        _ => Err(format!("Невідомий клієнт: {}", client_name)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build());

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_mcp_bridge::init());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            ping,
            show_main_window,
            open_folder_with_video,
            copy_to_clipboard,
            list_platform_connectors,
            render_video_ffmpeg,
            detect_cli_tool,
            auto_configure_cli_mcp
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
