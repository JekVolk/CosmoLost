#!/usr/bin/env python3
"""
notebook_manager.py
Клієнт та менеджер для Gemini Notebook API (Model Context Protocol).
Підтримує як прямий CLI/скриптовий інтерфейс для LLM-агентів, так і режим Stdio MCP Bridge.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import requests

NOTEBOOK_MCP_URL = "https://notebook.googleapis.com/mcp"
DEFAULT_PROTOCOL_VERSION = "2024-11-05"

def find_env_file():
    """Пошук конфігураційних .env файлів у .agents/"""
    script_dir = Path(__file__).resolve().parent
    agents_dir = script_dir.parent.parent
    possible_paths = [
        agents_dir / ".env",
        agents_dir / "gemini_notebook.env",
        agents_dir / "gemini_notebook.env.example"
    ]
    for p in possible_paths:
        if p.exists():
            return p
    return None

def load_credentials():
    """Завантаження Project ID та Access Token з оточення або .env файлу."""
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("PROJECT_ID")
    access_token = os.environ.get("GEMINI_NOTEBOOK_ACCESS_TOKEN") or os.environ.get("ACCESS_TOKEN")

    env_path = find_env_file()
    if env_path and env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key in ("GOOGLE_CLOUD_PROJECT", "PROJECT_ID") and not project_id:
                        project_id = val
                    elif key in ("GEMINI_NOTEBOOK_ACCESS_TOKEN", "ACCESS_TOKEN") and not access_token:
                        access_token = val

    # Якщо токена немає в env, спробувати отримати через google.auth
    if not access_token:
        try:
            import google.auth
            from google.auth.transport.requests import Request
            scopes = [
                "https://www.googleapis.com/auth/cloud-platform",
                "https://www.googleapis.com/auth/notebook"
            ]
            creds, detected_proj = google.auth.default(scopes=scopes)
            if not project_id and detected_proj:
                project_id = detected_proj
            if creds:
                creds.refresh(Request())
                access_token = creds.token
        except Exception:
            pass

    return project_id, access_token

def call_mcp(method, tool_name=None, arguments=None, req_id=1):
    """Виклик віддаленого Streamable HTTP MCP сервера Gemini Notebook."""
    project_id, access_token = load_credentials()
    if not access_token or not project_id:
        error_msg = (
            "Помилка автентифікації: Не знайдено ACCESS_TOKEN або PROJECT_ID.\n"
            "Будь ласка, вкажіть їх у .agents/gemini_notebook.env або змінних середовища:\n"
            "export GOOGLE_CLOUD_PROJECT='ваш-проєкт'\n"
            "export GEMINI_NOTEBOOK_ACCESS_TOKEN='ваш-токен'"
        )
        raise RuntimeError(error_msg)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "x-goog-user-project": project_id,
        "Content-Type": "application/json",
        "MCP-Protocol-Version": DEFAULT_PROTOCOL_VERSION,
        "Mcp-Method": method
    }
    if tool_name:
        headers["Mcp-Name"] = tool_name

    payload = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method,
        "params": {
            "_meta": {
                "io.modelcontextprotocol/protocolVersion": DEFAULT_PROTOCOL_VERSION
            }
        }
    }
    if tool_name:
        payload["params"]["name"] = tool_name
    if arguments is not None:
        payload["params"]["arguments"] = arguments

    response = requests.post(NOTEBOOK_MCP_URL, headers=headers, json=payload, timeout=45)
    if response.status_code != 200:
        raise RuntimeError(f"HTTP {response.status_code}: {response.text}")

    return response.json()

# --- Клієнтські команди для LLM ---

def list_notebooks():
    """Отримати список блокнотів."""
    res = call_mcp("tools/call", "list_notebooks", {})
    return res

def create_notebook(display_name="CosmoLost Knowledge Base"):
    """Створити новий блокнот."""
    args = {
        "notebook": {
            "displayName": display_name
        }
    }
    res = call_mcp("tools/call", "create_notebook", args)
    return res

def get_notebook(notebook_name):
    """Отримати метадані блокнота."""
    res = call_mcp("tools/call", "get_notebook", {"name": notebook_name})
    return res

def create_source(notebook_name, display_name, content, mime_type="text/markdown"):
    """Завантажити текстове або Markdown джерело в блокнот."""
    args = {
        "parent": notebook_name,
        "source": {
            "displayName": display_name,
            "mimeType": mime_type,
            "textContent": {
                "content": content
            }
        }
    }
    res = call_mcp("tools/call", "create_source", args)
    return res

def create_web_source(notebook_name, display_name, url):
    """Завантажити Web URL або YouTube джерело в блокнот."""
    args = {
        "parent": notebook_name,
        "source": {
            "displayName": display_name,
            "webContent": {
                "url": url
            }
        }
    }
    res = call_mcp("tools/call", "create_source", args)
    return res

def list_sources(notebook_name):
    """Отримати список усіх джерел блокнота."""
    res = call_mcp("tools/call", "list_sources", {"parent": notebook_name})
    return res

def get_source(source_name):
    """Отримати статус джерела (PROCESSING, ACTIVE, FAILED)."""
    res = call_mcp("tools/call", "get_source", {"name": source_name})
    return res

def sync_spec_pack(notebook_name):
    """Завантажити всі ключові специфікації проєкту CosmoLost у блокнот."""
    business_root = Path(__file__).resolve().parent.parent.parent.parent
    sources_to_sync = [
        ("CosmoLost Universal Knowledge Pack", business_root / "spec" / "CosmoLost_NotebookLM_Source_Pack.md"),
        ("Product Passport (01_PASSPORT)", business_root / "spec" / "02_core" / "01_PASSPORT.md"),
        ("Features Map (01_FEATURES_MAP)", business_root / "spec" / "04_features" / "01_FEATURES_MAP.md"),
        ("FastMCP Architecture Guide", business_root / "spec" / "06_architecture" / "TASK_MCP_SERVER_AND_TOOLS_GUIDE.md"),
        ("Pitch Data Summary", business_root / "pitch_data.json")
    ]

    results = []
    for title, path in sources_to_sync:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            mime = "application/json" if path.suffix == ".json" else "text/markdown"
            print(f"[*] Синхронізація: {title} ({path.name})...")
            try:
                resp = create_source(notebook_name, title, content, mime_type=mime)
                results.append((title, "OK", resp))
            except Exception as e:
                print(f"[!] Помилка завантаження {title}: {e}")
                results.append((title, "ERROR", str(e)))
        else:
            print(f"[!] Файл не знайдено: {path}")

    return results

# --- Stdio Bridge для MCP клієнтів (Cursor, Claude Code, Antigravity) ---

def run_stdio_bridge():
    """
    Stdio MCP Bridge: читає JSON-RPC з stdin, проксіює на Streamable HTTP
    Gemini Notebook API з автоматичною ін'єкцією токена та повертає результат у stdout.
    """
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            req_id = req.get("id", 1)
            method = req.get("method", "")
            params = req.get("params", {})
            tool_name = params.get("name")
            arguments = params.get("arguments")

            resp = call_mcp(method, tool_name=tool_name, arguments=arguments, req_id=req_id)
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_resp = {
                "jsonrpc": "2.0",
                "id": req.get("id") if 'req' in locals() else None,
                "error": {
                    "code": -32603,
                    "message": str(e)
                }
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gemini Notebook API Manager & MCP Bridge")
    parser.add_argument("--bridge", action="store_true", help="Запустити в режимі Stdio MCP Bridge")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("list-notebooks", help="Список усіх блокнотів")
    
    create_p = subparsers.add_parser("create-notebook", help="Створити новий блокнот")
    create_p.add_argument("name", help="Назва блокнота (displayName)")

    add_p = subparsers.add_parser("add-source", help="Додати файл як джерело")
    add_p.add_argument("--notebook", required=True, help="ID блокнота (notebooks/...)")
    add_p.add_argument("--file", required=True, help="Шлях до файлу")
    add_p.add_argument("--title", required=True, help="Назва джерела")

    sync_p = subparsers.add_parser("sync-specs", help="Синхронізувати всі специфікації бізнесу в блокнот")
    sync_p.add_argument("--notebook", required=True, help="ID блокнота (notebooks/...)")

    list_src_p = subparsers.add_parser("list-sources", help="Список джерел блокнота")
    list_src_p.add_argument("--notebook", required=True, help="ID блокнота (notebooks/...)")

    args = parser.parse_args()

    if args.bridge:
        run_stdio_bridge()
    elif args.command == "list-notebooks":
        print(json.dumps(list_notebooks(), indent=2, ensure_ascii=False))
    elif args.command == "create-notebook":
        print(json.dumps(create_notebook(args.name), indent=2, ensure_ascii=False))
    elif args.command == "add-source":
        with open(args.file, "r", encoding="utf-8") as f:
            text = f.read()
        print(json.dumps(create_source(args.notebook, args.title, text), indent=2, ensure_ascii=False))
    elif args.command == "sync-specs":
        res = sync_spec_pack(args.notebook)
        print("[OK] Результат синхронізації:")
        for title, status, details in res:
            print(f" - {title}: {status}")
    elif args.command == "list-sources":
        print(json.dumps(list_sources(args.notebook), indent=2, ensure_ascii=False))
    else:
        parser.print_help()
