"""
CosmoLost MCP App and FastMCP Package Bridge.

Ensures seamless interoperability between local Django app 'mcp'
and the official PyPI 'mcp' SDK required by FastMCP.
"""

import os as _os
import sys as _sys

_current_dir = _os.path.dirname(_os.path.abspath(__file__))

# Find site-packages mcp directory
_site_mcp_dir = None
for _p in _sys.path:
    if _p and _os.path.abspath(_p) != _os.path.abspath(_os.path.dirname(_current_dir)):
        _cand = _os.path.join(_p, 'mcp')
        if _os.path.isdir(_cand) and _os.path.isfile(_os.path.join(_cand, '__init__.py')):
            _site_mcp_dir = _cand
            break

# Extend __path__ so site-packages mcp is searched first for submodules (e.g. mcp.server.lowlevel)
# while current_dir provides Django app components (apps, tests, server, etc.)
if _site_mcp_dir:
    __path__ = [_site_mcp_dir, _current_dir]
    _init_path = _os.path.join(_site_mcp_dir, '__init__.py')
    with open(_init_path, 'r', encoding='utf-8') as _f:
        exec(compile(_f.read(), _init_path, 'exec'), globals())

    # Bridge mcp.server so importing tools directly from mcp.server works
    try:
        import mcp.server

        def _mcp_server_getattr(name):
            import importlib.util
            server_path = _os.path.join(_current_dir, 'server.py')
            if _os.path.exists(server_path):
                if '_cosmolost_mcp_server' not in _sys.modules:
                    spec = importlib.util.spec_from_file_location('_cosmolost_mcp_server', server_path)
                    mod = importlib.util.module_from_spec(spec)
                    _sys.modules['_cosmolost_mcp_server'] = mod
                    spec.loader.exec_module(mod)
                mod = _sys.modules['_cosmolost_mcp_server']
                if hasattr(mod, name):
                    val = getattr(mod, name)
                    setattr(mcp.server, name, val)
                    return val
            raise AttributeError(f"module 'mcp.server' has no attribute '{name}'")

        mcp.server.__getattr__ = _mcp_server_getattr
    except Exception:
        pass
else:
    __path__ = [_current_dir]


def __getattr__(name):
    """Enable top-level imports from mcp package (e.g. from mcp import search_artifacts)."""
    try:
        import mcp.server
        return getattr(mcp.server, name)
    except Exception:
        raise AttributeError(f"module 'mcp' has no attribute '{name}'")
