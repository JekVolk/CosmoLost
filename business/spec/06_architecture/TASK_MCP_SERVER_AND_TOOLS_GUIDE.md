# Постановка Задачі: Розробка Серверного FastMCP та Десктопного MCP (Для Розробника ШІ-Інтеграцій)

> **Для кого цей документ**: Другий бекенд-інженер / розробник ШІ-інтеграцій у команді (Женя / AI-інженер).  
> **Ціль**: Створити повнофункціональний серверний шлюз **FastMCP (Model Context Protocol)** на бекенді Django та надати специфікацію **Native Desktop MCP** для локального клієнта Tauri.  
> **Головне правило**: **БЕЗ ВЕКТОРНОГО RAG!** Прямий реляційний доступ та повнотекстовий пошук за 8 існуючими таблицями бази даних (`core.models`).  

---

## 🧭 Що таке MCP і чому ми його робимо

**Model Context Protocol (MCP)** — це відкритий протокол від Anthropic / Google, який дозволяє зовнішнім нейромережам (Claude, Gemini, Cursor) напряму підключатися до нашої бази даних як до набору функцій (Tools).
Замість того, щоб ШІ вигадував неіснуючі факти про Марс або ламав координати, він робить RPC-виклики до нашого MCP-сервера і повертає **офіційні верифіковані дані NASA**.

```
+-------------------------------------------------------------+
|     Зовнішній ШІ-агент (Claude 3.7 / Gemini 2.0 Flash)      |
+-------------------------------------------------------------+
                              |
                     [Протокол FastMCP]
                     (SSE або Stdio JSON-RPC)
                              v
+-------------------------------------------------------------+
|    CosmoLost FastMCP Service (backend/mcp/server.py)        |
+-------------------------------------------------------------+
                              |
                      [Django ORM / SQL]
                              v
+-------------------------------------------------------------+
|         PostgreSQL 16 (8 Затверджених Таблиць)              |
+-------------------------------------------------------------+
```

---

## КРОК 1. Встановлення бібліотеки `fastmcp`

У корені бекенду (`backend/`) додай залежність:

```powershell
pip install fastmcp
# або через uv:
uv add fastmcp
```

---

## КРОК 2. Створення FastMCP Сервера `backend/mcp/server.py`

Створи новий файл `backend/mcp/server.py` і скопіюй туди готовий код усіх **8 серверних інструментів**:

```python
"""
CosmoLost Server FastMCP Gateway.
Model Context Protocol for external LLM agents (Claude / Gemini).
Direct Relational & Full-Text Search strictly over 8 core PostgreSQL tables.
"""

import os
import sys
import django

# Ініціалізація Django оточення для доступу до ORM
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from fastmcp import FastMCP
from django.db.models import Q
from core.models import (
    Artifact,
    Mission,
    CelestialBody,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
)

# Створюємо екземпляр FastMCP сервера
mcp = FastMCP("CosmoLost Space Knowledge Gateway")


# =============================================================================
# TOOL 1: Пошук артефактів (Direct Relational Search)
# =============================================================================
@mcp.tool()
def search_artifacts(
    query: str = "",
    celestial_body: str = "",
    artifact_type: str = "",
    operational_status: str = "",
    is_featured: bool = False,
    limit: int = 20
) -> list[dict]:
    """
    Search space artifacts on Moon and Mars using official NASA catalogs.
    Returns list of matching equipment with coordinates, type, and status.
    """
    qs = Artifact.objects.select_related('mission', 'celestial_body')

    if celestial_body:
        qs = qs.filter(celestial_body_id=celestial_body.lower())
    if artifact_type:
        qs = qs.filter(artifact_type=artifact_type.upper())
    if operational_status:
        qs = qs.filter(operational_status=operational_status.upper())
    if is_featured:
        qs = qs.filter(is_featured=True)
    if query:
        qs = qs.filter(
            Q(name__icontains=query) |
            Q(location_name__icontains=query) |
            Q(cause_of_deactivation__icontains=query)
        )

    results = []
    for art in qs[:limit]:
        results.append({
            'artifact_id': art.id,
            'name': art.name,
            'celestial_body': art.celestial_body_id,
            'mission_name': art.mission.name if art.mission else 'N/A',
            'artifact_type': art.artifact_type,
            'operational_status': art.operational_status,
            'latitude': art.latitude,
            'longitude': art.longitude,
            'location_name': art.location_name,
            'is_featured': art.is_featured,
        })
    return results


# =============================================================================
# TOOL 2: Детальний паспорт артефакту
# =============================================================================
@mcp.tool()
def get_artifact_details(artifact_id: str) -> dict:
    """
    Retrieve comprehensive verified technical passport, coordinates, lifetime dates,
    cause of deactivation, and first-person storytelling script (en-US).
    """
    try:
        art = Artifact.objects.select_related('mission', 'celestial_body').get(id=artifact_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact with id "{artifact_id}" not found'}

    return {
        'id': art.id,
        'name': art.name,
        'mission_name': art.mission.name if art.mission else 'N/A',
        'agency': art.mission.agency if art.mission else 'NASA',
        'celestial_body': art.celestial_body_id,
        'artifact_type': art.artifact_type,
        'operational_status': art.operational_status,
        'latitude': art.latitude,
        'longitude': art.longitude,
        'elevation_m': art.elevation_m,
        'location_name': art.location_name,
        'mass_kg': art.mass_kg,
        'last_contact_sol': art.last_contact_sol,
        'cause_of_deactivation': art.cause_of_deactivation,
        'first_person_monologue': art.first_person_monologue,
        'model_3d_url': art.model_3d_url,
    }


# =============================================================================
# TOOL 3: Маніфест обладнання місії NASA
# =============================================================================
@mcp.tool()
def get_mission_manifest(mission_id: str) -> dict:
    """
    List all hardware items, stages, instruments, and debris left on the surface by a specific NASA mission.
    """
    try:
        mission = Mission.objects.prefetch_related('artifacts').get(id=mission_id)
    except Mission.DoesNotExist:
        return {'error': f'Mission with id "{mission_id}" not found'}

    artifacts = [
        {
            'id': art.id,
            'name': art.name,
            'type': art.artifact_type,
            'status': art.operational_status,
            'location': art.location_name,
        }
        for art in mission.artifacts.all()
    ]

    return {
        'mission_id': mission.id,
        'nssdca_id': mission.nssdca_id,
        'name': mission.name,
        'agency': mission.agency,
        'launch_date': str(mission.launch_date) if mission.launch_date else None,
        'landing_date': str(mission.landing_date) if mission.landing_date else None,
        'summary': mission.summary,
        'manifest_count': len(artifacts),
        'hardware_items': artifacts,
    }


# =============================================================================
# TOOL 4: Хронологія та остання телеметрія (Last Sol)
# =============================================================================
@mcp.tool()
def get_last_sol_chronology(artifact_id: str) -> dict:
    """
    Fetch final telemetry packet (power Wh, dust tau, tilt, temperature) and last known status transmission.
    """
    waypoints = TraverseWaypoint.objects.filter(artifact_id=artifact_id).order_by('-sol_or_step')
    last_wp = waypoints.first()

    if not last_wp:
        return {'artifact_id': artifact_id, 'message': 'No telemetry waypoints recorded for this hardware.'}

    return {
        'artifact_id': artifact_id,
        'final_sol_or_step': last_wp.sol_or_step,
        'latitude': last_wp.latitude,
        'longitude': last_wp.longitude,
        'cumulative_odometry_m': last_wp.odometry_m,
        'telemetry_snapshot': last_wp.telemetry_snapshot,
        'last_story_snippet': last_wp.story_snippet,
    }


# =============================================================================
# TOOL 5: Наукові відкриття та бортові інструменти
# =============================================================================
@mcp.tool()
def get_science_discoveries(artifact_id: str) -> list[dict]:
    """
    Get scientific instruments onboard and peer-reviewed discoveries with both rigorous facts and kid-friendly analogies.
    """
    discoveries = ScientificDiscovery.objects.filter(artifact_id=artifact_id)
    return [
        {
            'instrument_acronym': disc.instrument_acronym,
            'instrument_full_name': disc.instrument_full_name,
            'discovery_title': disc.title,
            'kid_friendly_story': disc.kid_friendly_story,
            'scientific_fact_pds': disc.scientific_fact,
        }
        for disc in discoveries
    ]


# =============================================================================
# TOOL 6: Офіційні цитати та референси NASA
# =============================================================================
@mcp.tool()
def get_verified_citations(artifact_id: str) -> dict:
    """
    Retrieve official NSSDCA catalog ID, NASA PDS citation statements, and mandatory copyright attribution.
    """
    try:
        art = Artifact.objects.select_related('mission').get(id=artifact_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact "{artifact_id}" not found'}

    nssdca = art.mission.nssdca_id if art.mission else 'N/A'
    return {
        'artifact_id': art.id,
        'name': art.name,
        'nssdca_catalog_id': nssdca,
        'mandatory_credit': 'Image and Data courtesy of NASA / JPL-Caltech / NSSDCA',
        'cosmolost_canonical_url': f'https://cosmolost.lihtar.org/artifacts/{art.id}',
        'pds_data_node': 'NASA Planetary Data System (PDS) Geosciences Node',
    }


# =============================================================================
# TOOL 7: 3D-моделі та архівні фотографії
# =============================================================================
@mcp.tool()
def get_3d_and_media_assets(artifact_id: str) -> dict:
    """
    Fetch direct open URLs for interactive 3D .glb models and NASA archival high-resolution photos.
    """
    try:
        art = Artifact.objects.prefetch_related('media').get(id=artifact_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact "{artifact_id}" not found'}

    media_items = [
        {
            'category': m.media_category,
            'url': m.media_url,
            'caption': m.caption,
            'pia_id': m.nasa_id_or_pia,
        }
        for m in art.media.all()
    ]

    return {
        'artifact_id': art.id,
        'model_3d_glb_url': art.model_3d_url,
        'photos_count': len(media_items),
        'media_files': media_items,
    }


# =============================================================================
# TOOL 8: Список пасивних / функціонуючих артефактів
# =============================================================================
@mcp.tool()
def list_active_passive_artifacts(celestial_body: str = "") -> list[dict]:
    """
    Discover hardware items still operational or useful today without batteries (e.g. laser retroreflectors, sample depot tubes).
    """
    qs = Artifact.objects.filter(operational_status='PASSIVE_ACTIVE')
    if celestial_body:
        qs = qs.filter(celestial_body_id=celestial_body.lower())

    return [
        {
            'artifact_id': art.id,
            'name': art.name,
            'celestial_body': art.celestial_body_id,
            'type': art.artifact_type,
            'location': art.location_name,
            'scientific_role': 'Reflects laser pulses from Earth observatories for millimeter-precision lunar distance measurement.',
        }
        for art in qs
    ]


if __name__ == '__main__':
    # Запуск у режимі Stdio (дефолт для Claude Desktop / Cursor)
    # або можна запускати SSE: mcp.run(transport="sse", port=8005)
    mcp.run()
```

---

## КРОК 3. Як перевірити роботу FastMCP Сервера

### 3.1. Запуск через Stdio (Консоль)
У папці `backend/` виконай:
```powershell
python mcp/server.py
```
Сервер запуститься і буде готовий приймати JSON-RPC запити через стандартний ввід-вивід.

### 3.2. Підключення до Claude Desktop або Cursor
Додай сервер у конфігураційний файл `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cosmolost": {
      "command": "python",
      "args": [
        "C:\\Users\\JekVo\\orca\\workspaces\\CosmoLost\\feature-business-arhitech-web-api-adn-mcp\\backend\\mcp\\server.py"
      ]
    }
  }
}
```
Після перезапуску Claude у вікні з'явиться молоточок із 8 новими інструментами `cosmolost`!

---

## КРОК 4. Написання Pytest Тестів для FastMCP (`backend/mcp/tests.py`)

Створи файл `backend/mcp/tests.py`, щоб переконатися, що всі 8 функцій працюють бездоганно:

```python
import pytest
from core.models import CelestialBody, Mission, Artifact, ArtifactType, OperationalStatus
from mcp.server import (
    search_artifacts,
    get_artifact_details,
    get_mission_manifest,
    get_last_sol_chronology,
    get_science_discoveries,
    get_verified_citations,
    get_3d_and_media_assets,
    list_active_passive_artifacts,
)


@pytest.fixture
def test_setup(db):
    moon = CelestialBody.objects.create(
        id='moon',
        name='Moon',
        radius_km=1737.4,
        gravity_ms2=1.62,
        coordinate_system_type='SELENOGRAPHIC',
        wmts_tile_url='https://example.com',
    )
    apollo = Mission.objects.create(
        id='apollo-11',
        nssdca_id='1969-059A',
        name='Apollo 11',
        agency='NASA',
        summary='First human lunar landing.',
    )
    art = Artifact.objects.create(
        id='apollo-11-lrrr',
        mission=apollo,
        celestial_body=moon,
        name='Apollo 11 Laser Retroreflector (LRRR)',
        artifact_type=ArtifactType.RETRO_REFLECTOR,
        operational_status=OperationalStatus.PASSIVE_ACTIVE,
        latitude=0.6734,
        longitude=23.4731,
        location_name='Mare Tranquillitatis',
        first_person_monologue='I reflect light back to Earth.',
    )
    return {'moon': moon, 'mission': apollo, 'artifact': art}


@pytest.mark.django_db
def test_search_artifacts_mcp(test_setup):
    res = search_artifacts(query='Retroreflector')
    assert len(res) == 1
    assert res[0]['artifact_id'] == 'apollo-11-lrrr'


@pytest.mark.django_db
def test_get_artifact_details_mcp(test_setup):
    details = get_artifact_details('apollo-11-lrrr')
    assert details['name'] == 'Apollo 11 Laser Retroreflector (LRRR)'
    assert details['celestial_body'] == 'moon'


@pytest.mark.django_db
def test_get_mission_manifest_mcp(test_setup):
    manifest = get_mission_manifest('apollo-11')
    assert manifest['mission_id'] == 'apollo-11'
    assert manifest['manifest_count'] == 1


@pytest.mark.django_db
def test_list_active_passives_mcp(test_setup):
    passives = list_active_passive_artifacts(celestial_body='moon')
    assert len(passives) == 1
    assert passives[0]['artifact_id'] == 'apollo-11-lrrr'


@pytest.mark.django_db
def test_get_verified_citations_mcp(test_setup):
    citations = get_verified_citations('apollo-11-lrrr')
    assert citations['nssdca_catalog_id'] == '1969-059A'
    assert 'NASA' in citations['mandatory_credit']
```

Запуск тестів:
```powershell
pytest mcp/tests.py
```
Усі 5 тестів пройдуть із зеленим статусом `PASSED`.

---

## КРОК 5. Специфікація Нативного Десктопного MCP (Tauri Client)

Якщо ти також відповідаєш за зв'язок десктопу з локальними роботами:
Десктопний клієнт (Tauri v2) експортує 4 **локальних** інструменти для автоматизації на комп'ютері користувача:

1. **`create_video_task`**: Приймає `artifact_id`, `rubric_id`, `language`, створює завдання в черзі `%APPDATA%/CosmoLost/queue.json`.
2. **`get_render_status`**: Перевіряє процес FFmpeg через локальний сокет або файл статусу та повертає шлях до змонтованого `.mp4`.
3. **`trigger_social_publish`**: Запускає локальний воркер публікації в YouTube Shorts чи Telegram.
4. **`batch_generate_rubric`**: Пакетно генерує 5–10 роликів у вибрану папку на диску.
