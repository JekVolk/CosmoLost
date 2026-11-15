# CosmoLost: Universal Knowledge & Source Pack (For NotebookLM & Presentation Generation)

> **Project**: CosmoLost (NASA Space Apps Challenge 2026)  
> **Challenge**: *«Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars»*  
> **Team**: Space Ліхтар (Space Lantern)  
> **Version**: v0.2.0 (APPROVED)  
> **Target Audiences**: Students, science enthusiasts, STEM creators, NASA competition jury, AI researchers.

---

## 1. Executive Summary & Core Mission
- **Slogan**: *«Abandoned on the Moon and Mars, but Never Forgotten by Humanity»*
- **The Core Problem**:
  1. Over 60+ years of space exploration, humanity has left hundreds of spacecraft, rovers, orbiters, and landers on the Moon and Mars.
  2. Official NASA repositories (Planetary Data System - PDS, NSSDCA, Catalogue of Manmade Material) are technical, fragmented, dry tabular archives inaccessible to the general public.
  3. Younger generations consume knowledge through short vertical videos (TikTok, YouTube Shorts, Reels), where quality STEM content is rare, or filled with AI hallucinations and pseudoscience.
  4. Manual creation of scientific short videos takes 4+ hours per video (researching, fact-checking, scriptwriting, editing, voiceover).
- **The CosmoLost Solution**:
  An integrated, closed-loop ecosystem connecting official NASA planetary archives directly to 3D web exploration and automated 1-click vertical video generation for creators, backed by a verified AI FastMCP gateway.

---

## 2. The 4 Pillars of the CosmoLost Ecosystem
1. **Interactive 3D Web Portal (FEAT-01, FEAT-02)**:
   - 3D planetary exploration of Moon & Mars using NASA Treks tiles, Cesium/Three.js.
   - Dedicated artifact landing pages (`/artifact/<slug>`) with 3D model viewer (`.glb`), high-res archival photography (Apollo, Curiosity, Opportunity, Surveyor 3), and verified GPS/Cartographic landing coordinates.
   - Emotional, scientifically accurate storytelling: **«Diary of the Last Sol»** (first-person narrative of the probe's final operational hours, dust accumulation, power depletion, and humanity's lasting discoveries).
2. **Desktop Creator Studio / «Content Factory» (FEAT-03, FEAT-04)**:
   - Lightweight desktop app built with **Tauri v2 + Chakra UI + FFmpeg sidecar + edge-tts**.
   - Zero-cloud dependencies for rendering: works 100% locally on standard laptops.
   - Converts raw artifact data into a polished 1080x1920 60fps vertical video in **under 30 seconds**.
   - Auto-generates bilingual voiceovers (Ukrainian / English), subtitles with kinetic animations, background ambient space audio, and "Pillow-box" safe-zone framing for social UI overlays.
   - 1-click distribution to YouTube Shorts API, Telegram channels, and local MP4 export.
3. **Backend & NASA Ingestion Engine (FEAT-06, C4 Architecture)**:
   - High-performance Django REST framework + PostgreSQL 16 (8 core relational tables with GIN full-text indexes).
   - Ingestion loader pipeline syncing official datasets: NASA PDS, NSSDCA Master Catalog, Lunar Reconnaissance Orbiter (LRO) Camera, Mars HiRISE.
   - Django Unfold admin panel for editorial moderation and artifact curation.
4. **FastMCP Server for AI Agents (FEAT-05)**:
   - Standardized Model Context Protocol (MCP) server running on FastMCP.
   - Allows external AI assistants (Claude 3.7, Gemini 2.0 Flash, Antigravity) to query the verified database directly via RPC tools.
   - Eliminates AI hallucinations by grounding all facts in peer-reviewed NASA records with direct source URLs.

---

## 3. Competitive Advantage: RESP Framework (РЕСП)
- **R (Різниця / Difference)**: Instead of waiting for users to visit a dry government website, CosmoLost actively brings compelling stories into social feeds (Shorts/Reels) and funnels curious viewers back into deep 3D interactive exploration.
- **E (Ефективність / Efficiency)**: Streamlined pipeline: from 4 hours of tedious manual video editing down to 30 seconds of automated local rendering.
- **S (Спеціалізація / Specialization)**: Laser-focused on the human and engineering legacy of discarded space equipment: why it went silent, what discovery it unlocked, and its exact resting place.
- **P (Простота / Simplicity)**: Local-first desktop app requires no complex server rendering farms; API keys stored in OS keychain; portal loads seamlessly on desktop and mobile.

---

## 4. Technical Architecture & Zero-Budget Engineering Laws
1. **Law 1: Local-First Compute**: Video rendering and text-to-speech are processed on the client machine via native FFmpeg and edge-tts, keeping server operational costs at $0.
2. **Law 2: Direct Relational & Full-Text Search (No Vector Bloat)**: Instead of expensive, hallucination-prone vector embeddings, FastMCP queries PostgreSQL 16 directly using strict relational joins and Ukrainian/English GIN full-text search dictionaries.
3. **Law 3: NASA Official Grounding**: Every artifact requires verified NASA catalog IDs, coordinates (lat/long), mission operational dates, and primary source links.

---

## 5. Market Potential, Target Audiences & Business Model
- **Target Segments**:
  1. *School & University Students*: Visual, immersive learning through 3D exploration and emotional "Last Sol" diaries.
  2. *Science Communicators & Content Creators*: Need high-cadence, high-retention vertical videos without spending days editing.
  3. *AI Agents & Developers*: Use the FastMCP gateway to enrich LLM queries with verified space historical data.
- **Monetization & Sustainability**:
  - Educational Grants (NASA Space Apps global acceleration, Horizon Europe, Ukrainian STEM initiatives).
  - Creator Pro tier: Custom branding watermarks, 4K rendering templates, multi-channel batch publishing.
  - FastMCP Developer API: Free tier (1,000 req/mo), Paid Researcher Tier for commercial AI platforms.

---

## 6. Hackathon Roadmap (Space Ліхтар)
- **Phase 1 (Hackathon MVP - Completed)**:
  - Django database schema (14 tables, 8 core models) & NASA parser.
  - Interactive 3D map prototype (Moon & Mars tiles).
  - Tauri desktop content factory with FFmpeg rendering & Edge-TTS.
  - FastMCP server with 8 standard tools.
- **Phase 2 (Post-Hackathon Expansion)**:
  - Mars Rover Traverse Tracks (MMGIS GeoJSON integration).
  - NotebookLM-powered automated Audio Deep Dive podcasts on artifact pages.
  - Community storytelling submission with peer-review moderation.
