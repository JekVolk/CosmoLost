param(
  [string]$DesktopClientDir = "C:\Users\JekVo\orca\workspaces\CosmoLost\feature-desktop-client-fix-first\desktop-client"
)

$ErrorActionPreference = "Stop"
Set-Location $DesktopClientDir

Write-Host "=========================================================="
Write-Host "BUILDING PROD VERSION ONLY (Release Profile)"
Write-Host "=========================================================="

if (-not (Test-Path "$DesktopClientDir\dist\index.html")) {
  Write-Host "[BUILD] Building frontend..."
  cmd.exe /c "pnpm.cmd build"
}

$ReleasesDir = "$DesktopClientDir\releases"
if (-not (Test-Path $ReleasesDir)) {
  New-Item -ItemType Directory -Path $ReleasesDir -Force | Out-Null
}

$TargetProd = "$DesktopClientDir\src-tauri\target-prod"
$env:CARGO_TARGET_DIR = $TargetProd

Write-Host "[PROD] Compiling with Tauri (Release)..."
cmd.exe /c "pnpm.cmd tauri build --ci -c src-tauri/tauri.nobuild.json"

$msiFile = Join-Path $TargetProd "release\bundle\msi\CosmoLost_0.1.0_x64_en-US.msi"
if (Test-Path $msiFile) {
  Copy-Item $msiFile (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.msi") -Force
}

$nsisFile = Join-Path $TargetProd "release\bundle\nsis\CosmoLost_0.1.0_x64-setup.exe"
if (Test-Path $nsisFile) {
  Copy-Item $nsisFile (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.exe") -Force
}

# Stage and Zip
$stage = Join-Path $ReleasesDir "staging-prod"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

if (Test-Path (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.msi")) {
  Copy-Item (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.msi") $stage -Force
}
if (Test-Path (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.exe")) {
  Copy-Item (Join-Path $ReleasesDir "CosmoLost-0.1.0-PROD-Setup.exe") $stage -Force
}

$readme = @"
CosmoLost Desktop Client v0.1.0 (PROD / Release Build)
======================================================
Target: Windows x86_64
Profile: Release (Fully optimized production build)

Installation:
1. Double click 'CosmoLost-0.1.0-PROD-Setup.exe' or 'CosmoLost-0.1.0-PROD-Setup.msi' to install.
2. Launch 'CosmoLost Desktop' from your Start Menu or Desktop shortcut.
"@
Set-Content -Path (Join-Path $stage "README.txt") -Value $readme -Encoding UTF8

$zipPath = Join-Path $ReleasesDir "CosmoLost-Desktop-0.1.0-prod.zip"
Compress-Archive -Path "$stage\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

Write-Host "=========================================================="
Write-Host "PROD BUILD COMPLETE: $zipPath"
Write-Host "=========================================================="
