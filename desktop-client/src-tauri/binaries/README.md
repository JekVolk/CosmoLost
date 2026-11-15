# Tauri v2 External Binaries (Sidecars)

This directory houses external binaries bundled with CosmoLost Desktop as defined in `tauri.conf.json` under `bundle.externalBin`:

```json
"bundle": {
  "externalBin": [
    "binaries/ffmpeg",
    "binaries/ffprobe"
  ]
}
```

## Binary Naming Convention for Tauri v2

Tauri v2 requires target triple suffixes for external binaries when building production distributions:

- **Windows x86_64**: `binaries/ffmpeg-x86_64-pc-windows-msvc.exe` and `binaries/ffprobe-x86_64-pc-windows-msvc.exe`
- **macOS Apple Silicon**: `binaries/ffmpeg-aarch64-apple-darwin` and `binaries/ffprobe-aarch64-apple-darwin`
- **macOS Intel**: `binaries/ffmpeg-x86_64-apple-darwin` and `binaries/ffprobe-x86_64-apple-darwin`
- **Linux x86_64**: `binaries/ffmpeg-x86_64-unknown-linux-gnu` and `binaries/ffprobe-x86_64-unknown-linux-gnu`

## Production Distribution Note
When bundling for production releases with `pnpm tauri build`, the CI/CD pipeline or local build setup will download the official static builds of FFmpeg and FFprobe (e.g. from Gyan.dev for Windows or John Van Sickle for Linux) and place the target-triple named executables into this directory.
