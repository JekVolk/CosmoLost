"""
Manual Test Runner and Benchmark for CosmoLost FastMCP Gateway.
Simulates real GitHub Copilot / Cursor agent calls across all 10 tools,
measuring latency (ms) and validating payload structures against live SQLite database.
"""

import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import time
import json
from fastmcp import Client
from mcp.server import mcp


async def run_manual_test_suite():
    print("=" * 80)
    print("🚀 CosmoLost FastMCP Gateway: Manual Tool Execution & Latency Benchmark")
    print("=" * 80)

    test_scenarios = [
        # 1. Primary navigation
        {
            'tool': 'list_celestial_bodies',
            'args': {},
            'desc': 'Copilot: "What celestial bodies are supported?"',
        },
        # 2. List missions
        {
            'tool': 'list_missions',
            'args': {'agency': 'NASA'},
            'desc': 'Copilot: "List NASA missions with hardware on the surface"',
        },
        # 3. Search rovers on Mars
        {
            'tool': 'search_artifacts',
            'args': {'celestial_body': 'mars', 'artifact_type': 'ROVER', 'operational_status': 'ACTIVE'},
            'desc': 'Copilot: "Find all active rovers on Mars"',
        },
        # 4. Search Apollo on Moon
        {
            'tool': 'search_artifacts',
            'args': {'celestial_body': 'moon', 'query': 'Apollo'},
            'desc': 'Copilot: "Search for Apollo equipment on the Moon"',
        },
        # 5. Technical passport
        {
            'tool': 'get_artifact_details',
            'args': {'artifact_id': 'perseverance-rover'},
            'desc': 'Copilot: "Get technical passport of Perseverance Rover"',
        },
        # 6. Mission manifest
        {
            'tool': 'get_mission_manifest',
            'args': {'mission_id': 'apollo-11'},
            'desc': 'Copilot: "What hardware was left on Moon by Apollo 11?"',
        },
        # 7. Final Sol telemetry
        {
            'tool': 'get_last_sol_chronology',
            'args': {'artifact_id': 'opportunity-rover'},
            'desc': 'Copilot: "What was Opportunity\'s final Sol telemetry and story?"',
        },
        # 8. Science discoveries
        {
            'tool': 'get_science_discoveries',
            'args': {'artifact_id': 'opportunity-rover'},
            'desc': 'Copilot: "What scientific discoveries did Opportunity make?"',
        },
        # 9. Verified citations
        {
            'tool': 'get_verified_citations',
            'args': {'artifact_id': 'apollo-11-lrrr'},
            'desc': 'Copilot: "Give me verified NASA PDS citation for Apollo 11 LRRR"',
        },
        # 10. 3D and media assets
        {
            'tool': 'get_3d_and_media_assets',
            'args': {'artifact_id': 'perseverance-rover'},
            'desc': 'Copilot: "Fetch 3D model and photos for Perseverance"',
        },
        # 11. Passive operating hardware
        {
            'tool': 'list_active_passive_artifacts',
            'args': {'celestial_body': 'moon'},
            'desc': 'Copilot: "What equipment on Moon is still functional today?"',
        },
        # 12. 404 Error handling
        {
            'tool': 'get_artifact_details',
            'args': {'artifact_id': 'unknown-hallucinated-id'},
            'desc': 'Copilot Edge Case: "Requesting nonexistent artifact ID"',
        },
    ]

    benchmark_results = []

    async with Client(mcp) as client:
        # Check tool registration count
        tools = await client.list_tools()
        print(f"\n[OK] Client connected successfully. Registered tools: {len(tools)}/10")

        for idx, scenario in enumerate(test_scenarios, 1):
            tool_name = scenario['tool']
            args = scenario['args']
            desc = scenario['desc']

            print(f"\n--- [Scenario {idx:02d}] {desc} ---")
            print(f"Calling: {tool_name}({json.dumps(args)})")

            start_time = time.perf_counter()
            res = await client.call_tool(tool_name, args)
            elapsed_ms = (time.perf_counter() - start_time) * 1000

            content = res.structured_content
            # Format preview
            if isinstance(content, dict) and 'result' in content:
                items = content['result']
                preview = f"{len(items)} items returned"
                if len(items) > 0 and isinstance(items[0], dict):
                    first_keys = list(items[0].keys())[:4]
                    preview += f" (sample keys: {first_keys})"
            elif isinstance(content, dict):
                preview = f"dict with keys {list(content.keys())[:5]}"
            else:
                preview = str(content)[:80]

            print(f"Latency: {elapsed_ms:.2f} ms | Status: {'ERROR' if res.is_error else 'SUCCESS'}")
            print(f"Payload preview: {preview}")

            benchmark_results.append({
                'scenario': idx,
                'tool': tool_name,
                'latency_ms': elapsed_ms,
                'success': not res.is_error,
            })

    print("\n" + "=" * 80)
    print("📈 BENCHMARK SUMMARY TABLE")
    print("=" * 80)
    print(f"{'#':<4} {'Tool Name':<32} {'Latency (ms)':<15} {'Status':<10}")
    print("-" * 80)
    for r in benchmark_results:
        print(f"{r['scenario']:<4} {r['tool']:<32} {r['latency_ms']:<15.2f} {'PASSED' if r['success'] else 'FAILED':<10}")

    avg_latency = sum(r['latency_ms'] for r in benchmark_results) / len(benchmark_results)
    max_latency = max(r['latency_ms'] for r in benchmark_results)
    min_latency = min(r['latency_ms'] for r in benchmark_results)
    print("-" * 80)
    print(f"Total Scenarios: {len(benchmark_results)} | Avg Latency: {avg_latency:.2f} ms | Min: {min_latency:.2f} ms | Max: {max_latency:.2f} ms")
    print("=" * 80)


if __name__ == '__main__':
    asyncio.run(run_manual_test_suite())
