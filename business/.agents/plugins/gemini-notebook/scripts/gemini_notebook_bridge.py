#!/usr/bin/env python3
"""
gemini_notebook_bridge.py
EntryPoint для виклику Stdio MCP сервера з конфігів mcp_config.json.
"""
from notebook_manager import run_stdio_bridge

if __name__ == "__main__":
    run_stdio_bridge()
