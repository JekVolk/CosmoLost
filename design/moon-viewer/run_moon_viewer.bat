@echo off
cd /d "%~dp0"
echo Starting CosmoLost NASA 3D Moon Viewer...
start http://localhost:8085/
python -m http.server 8085
