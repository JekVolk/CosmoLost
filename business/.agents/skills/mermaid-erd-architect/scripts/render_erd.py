"""
Automated Mermaid ERD to PNG Renderer for mermaid-erd-architect skill.
Extracts Mermaid erDiagram blocks from markdown or .mmd files and generates high-resolution PNG diagrams.
Uses Kroki API with compression and mermaid.ink as reliable fallback.
"""

import sys
import os
import argparse
import base64
import zlib
import urllib.request
import urllib.error
import re

def extract_mermaid_code(input_path: str) -> str:
    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if the file is markdown with ```mermaid block
    match = re.search(r"```mermaid\s*\n(erDiagram[\s\S]*?)\n```", content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    # If the file directly starts with erDiagram or contains it
    if "erDiagram" in content:
        # Extract starting from erDiagram
        start_idx = content.find("erDiagram")
        return content[start_idx:].strip()
    
    raise ValueError(f"No valid erDiagram block found in {input_path}")

def render_with_kroki(mermaid_code: str) -> bytes:
    # Use POST request to avoid HTTP 414 URI Too Long
    url = "https://kroki.io/mermaid/png"
    req = urllib.request.Request(
        url,
        data=mermaid_code.encode("utf-8"),
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Content-Type": "text/plain; charset=utf-8"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read()

def render_with_mermaid_ink(mermaid_code: str) -> bytes:
    b64 = base64.b64encode(mermaid_code.encode("utf-8")).decode("ascii")
    url = f"https://mermaid.ink/img/{b64}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()

def render_erd(input_file: str, output_file: str) -> str:
    print(f"[*] Reading ERD definition from: {input_file}")
    code = extract_mermaid_code(input_file)
    print(f"[*] Extracted {len(code.splitlines())} lines of Mermaid ERD code.")

    png_data = None
    errors = []

    # Try Kroki first (handles large compressed diagrams)
    try:
        print("[*] Rendering via Kroki engine...")
        png_data = render_with_kroki(code)
    except Exception as e:
        errors.append(f"Kroki error: {e}")
        print(f"[!] Kroki failed ({e}). Trying fallback to mermaid.ink...")

    # Fallback to mermaid.ink
    if png_data is None:
        try:
            png_data = render_with_mermaid_ink(code)
        except Exception as e:
            errors.append(f"mermaid.ink error: {e}")

    if png_data is None:
        raise RuntimeError(f"All rendering backends failed: {'; '.join(errors)}")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
    with open(output_file, "wb") as f:
        f.write(png_data)

    file_size_kb = len(png_data) / 1024
    print(f"[+] Successfully rendered ERD to: {output_file} ({file_size_kb:.2f} KB)")
    return output_file

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render Mermaid ERD to high-resolution PNG")
    parser.add_argument("--input", "-i", required=True, help="Path to markdown or mermaid file containing erDiagram")
    parser.add_argument("--output", "-o", required=True, help="Target path for output PNG image")

    args = parser.parse_args()
    try:
        render_erd(args.input, args.output)
    except Exception as err:
        print(f"[X] Rendering failed: {err}", file=sys.stderr)
        sys.exit(1)
