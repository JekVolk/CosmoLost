# CLI Integrations & Multi-LLM Interceptor Rules

This document specifies the architectural contracts, security boundaries, and command-line interfaces for integrating **Claude CLI**, **Antigravity CLI (agy)**, **Codex / OpenAI CLI**, and direct token-based Multi-LLM inference into **CosmoLost Desktop**.

## 1. Supported CLI Ecosystems

| CLI Ecosystem | Protocol / Transport | Configuration Path | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Claude CLI (`claude`)** | stdio JSON-RPC 2.0 (MCP) | `~/.claude.json` or `claude mcp add` | Autonomous agent execution, video generation, desktop telemetry inspection |
| **Antigravity CLI (`agy`)** | stdio JSON-RPC 2.0 + Custom Agents | `~/.gemini/antigravity-cli/mcp/` | Multi-agent swarms, deep code audits, pipeline automation |
| **Codex / OpenAI CLI (`codex`)** | stdio JSON-RPC 2.0 / OpenAI API Bridge | `openai` CLI config / env tokens | Automated script generation, prompt optimization, DALL-E 3 image synthesis |
| **Custom OpenAPI / Local LLMs** | HTTP REST (OpenAI-compatible) | `http://localhost:11434/v1` (Ollama/vLLM) | Offline local inference, privacy-first script generation |

---

## 2. CLI Interception & Bridge Architecture ("Перехватка")

The CLI Interceptor Bridge provides a dual-channel interface:
1. **Model Context Protocol (MCP)**:
   - Exposes tools via `scripts/cosmolost-mcp-server.mjs`.
   - External CLI clients launch this script via stdio to access live application state, trigger video renders, and read desktop metrics.
2. **Command Interceptor Service**:
   - Implemented in `src/shared/lib/cli-bridge/cli-interceptor.ts`.
   - Parses CLI formatted commands:
     - `cosmolost status` - Live desktop metrics and task queue.
     - `cosmolost generate --artifact <id> --rubric <rubric>` - Generates 40s viral short script.
     - `cosmolost render --task <id>` - Triggers FFmpeg rendering pipeline.
     - `cosmolost publish --task <id> --platform <platform>` - Publishes to YouTube Shorts, Telegram, or OS folder.
     - `cosmolost ping` - Diagnostic health check.
   - Logs all intercepted commands to `useDiagnosticsStore` for full auditability.

---

## 3. Direct Token Management & Multi-Provider Architecture

All API keys are securely persisted in desktop native storage (`tauri-plugin-store`) through `DesktopSettingsSchema`.

### Provider Specifications:
1. **Claude (Anthropic)**:
   - Token format: `sk-ant-...`
   - Endpoint: `https://api.anthropic.com/v1/messages`
   - Models: `claude-3-5-sonnet-20241022`, `claude-3-7-sonnet`, `claude-3-haiku-20240307`
   - Header requirements: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`.
2. **OpenAI / Codex**:
   - Token format: `sk-...`
   - Endpoint: `https://api.openai.com/v1/chat/completions` (or user-defined `customLlmEndpoint`)
   - Models: `gpt-4o`, `gpt-4o-mini`, `o3-mini`
   - Authorization: `Bearer ${apiKey}`.
3. **Gemini (Google AI)**:
   - Token format: `AIzaSy...`
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
4. **Image Generation**:
   - Providers: OpenAI DALL-E 3 (`https://api.openai.com/v1/images/generations`), Pollinations AI (Zero-cost CDN fallback), and Gemini Imagen.

---

## 4. Security & Isolation Guidelines

1. **Zero Credential Leakage**:
   - API tokens MUST NEVER be committed to Git or written to persistent non-secured log files.
   - UI input fields for tokens must be masked (`type="password"`) by default with an explicit reveal toggle.
2. **CORS & Native Bypass**:
   - In Tauri native mode, requests execute via native HTTP fetch or stdio IPC to avoid browser CORS constraints.
   - In browser preview mode, mock fallback generators ensure developer velocity without hard failing.
3. **Graceful Fallbacks**:
   - When an external API token is missing or encounters a rate limit (HTTP 429), the system automatically falls back to local heuristic algorithms to prevent UI pipeline stalls.
