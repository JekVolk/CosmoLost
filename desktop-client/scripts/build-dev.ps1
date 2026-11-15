param(
  [string]$DesktopClientDir = "C:\Users\JekVo\orca\workspaces\CosmoLost\feature-desktop-client-fix-first\desktop-client"
)

$ErrorActionPreference = "Stop"
Set-Location $DesktopClientDir

Write-Host "=========================================================="
Write-Host "BUILDING DEV VERSION ONLY (Debug Profile)"
Write-Host "=========================================================="

if (-not (Test-Path "$DesktopClientDir\dist\index.html")) {
  Write-Host "[BUILD] Building frontend..."
  cmd.exe /c "pnpm.cmd build"
}

$ReleasesDir = "$DesktopClientDir\releases"
if (-not (Test-Path $ReleasesDir)) {
  New-Item -ItemType Directory -Path $ReleasesDir -Force | Out-Null
}

$TargetDev = "$DesktopClientDir\src-tauri\target-dev"
$env:CARGO_TARGET_DIR = $TargetDev

Write-Host "[DEV] Compiling with Tauri (Debug)..."
cmd.exe /c "pnpm.cmd tauri build --debug --ci -c src-tauri/tauri.nobuild.json"

$msiFile = Join-Path $TargetDev "debug\bundle\msi\CosmoLost_0.1.0_x64_en-US.msi"
if (Test-Path $msiFile) {
  Copy-Item $msiFile (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.msi") -Force
}

$nsisFile = Join-Path $TargetDev "debug\bundle\nsis\CosmoLost_0.1.0_x64-setup.exe"
if (Test-Path $nsisFile) {
  Copy-Item $nsisFile (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.exe") -Force
}

# Stage and Zip
$stage = Join-Path $ReleasesDir "staging-dev"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

if (Test-Path (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.msi")) {
  Copy-Item (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.msi") $stage -Force
}
if (Test-Path (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.exe")) {
  Copy-Item (Join-Path $ReleasesDir "CosmoLost-0.1.0-DEV-Setup.exe") $stage -Force
}

$readme = @"
CosmoLost Desktop Client v0.1.0 (DEV / Debug Build)
===================================================
Target: Windows x86_64
Profile: Debug (DevTools F12 enabled, debug logging)

Installation:
1. Double click 'CosmoLost-0.1.0-DEV-Setup.msi' or 'CosmoLost-0.1.0-DEV-Setup.exe' to install.
2. Launch 'CosmoLost Desktop' from your Start Menu or Desktop shortcut.
"@
Set-Content -Path (Join-Path $stage "README.txt") -Value $readme -Encoding UTF8

$zipPath = Join-Path $ReleasesDir "CosmoLost-Desktop-0.1.0-dev.zip"
Compress-Archive -Path "$stage\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

Write-Host "=========================================================="
Write-Host "DEV BUILD COMPLETE: $zipPath"
Write-Host "=========================================================="
