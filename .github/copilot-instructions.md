# GitHub Copilot Instructions for CosmoLost

This repository contains the CosmoLost backend and Model Context Protocol (MCP) gateway.

## FastMCP Tools for CosmoLost Space Knowledge Gateway

The local MCP server `cosmolost` provides 8 official tools for querying verified NASA Lunar and Martian surface equipment directly from PostgreSQL/SQLite without vector hallucinations:

1. `search_artifacts(query, celestial_body, artifact_type, operational_status, is_featured, limit)`:
   - Search space equipment on Moon or Mars.
   - Example: Search for Mars rovers: `search_artifacts(celestial_body="mars", artifact_type="ROVER")`
2. `get_artifact_details(artifact_id)`:
   - Comprehensive technical passport, exact coordinates, landing site, failure mode, and monologue.
   - Example: `get_artifact_details(artifact_id="perseverance-rover")`
3. `get_mission_manifest(mission_id)`:
   - Manifest of all hardware, instruments, and debris left by a specific NASA mission.
   - Example: `get_mission_manifest(mission_id="apollo-11")`
4. `get_last_sol_chronology(artifact_id)`:
   - Final recorded telemetry packet (power, dust tau, tilt, temperature) and last known status snippet.
   - Example: `get_last_sol_chronology(artifact_id="perseverance-rover")`
5. `get_science_discoveries(artifact_id)`:
   - Onboard instruments and peer-reviewed scientific findings with both rigorous facts and kid-friendly explanations.
   - Example: `get_science_discoveries(artifact_id="perseverance-rover")`
6. `get_verified_citations(artifact_id)`:
   - Official NASA NSSDCA catalog designators, PDS citation lines, and mandatory copyright attribution.
   - Example: `get_verified_citations(artifact_id="apollo-11-lrrr")`
7. `get_3d_and_media_assets(artifact_id)`:
   - Direct URLs for 3D `.glb` models and high-resolution NASA archival photographs with PIA IDs.
   - Example: `get_3d_and_media_assets(artifact_id="perseverance-rover")`
8. `list_active_passive_artifacts(celestial_body)`:
   - Hardware still operational or scientifically useful without battery power (retroreflectors, sample caches).
   - Example: `list_active_passive_artifacts(celestial_body="moon")`

## Data Rules
- All coordinates use official NASA Planetary Data System (PDS) reference frames.
- Longitudes are in the range [-180, 180] or [0, 360].
- When referencing equipment, cite the mandatory NASA credit returned by `get_verified_citations`.
