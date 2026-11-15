"""
Constants, API Endpoints, and Curated Seed Datasets for NASA Ingestion.
"""
from loader.missions_catalog import ALL_MISSIONS
from loader.artifacts_catalog import ALL_ARTIFACTS

# NASA API Endpoints
MARS_ROVER_PHOTOS_ENDPOINT = "/mars-photos/api/v1/rovers/{rover}/photos"
MARS_ROVER_MANIFEST_ENDPOINT = "/mars-photos/api/v1/manifests/{rover}"
APOD_ENDPOINT = "/planetary/apod"
INSIGHT_WEATHER_ENDPOINT = "/insight_weather/"
IMAGES_SEARCH_ENDPOINT = "/search"

# NASA Treks WMTS Global Basemaps
MOON_WMTS_URL = "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
MARS_WMTS_URL = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"

# NASA MMGIS Open GeoJSON Traverse & Waypoints Endpoints
M20_TRAVERSE_URL = "https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_traverse.json"
M20_WAYPOINTS_URL = "https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_waypoints.json"
MSL_TRAVERSE_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_traverse.json"
MSL_WAYPOINTS_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json"

# JPL SSD/CNEOS Horizons API
HORIZONS_API_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

# Curated Tier-1 Hardware Catalog (Moon & Mars)
CURATED_CELESTIAL_BODIES = [
    {
        "id": "moon",
        "name": "Moon",
        "radius_km": 1737.4,
        "gravity_ms2": 1.62,
        "coordinate_system_type": "SELENOGRAPHIC",
        "wmts_tile_url": MOON_WMTS_URL,
    },
    {
        "id": "mars",
        "name": "Mars",
        "radius_km": 3389.5,
        "gravity_ms2": 3.72,
        "coordinate_system_type": "PLANETOCENTRIC_360",
        "wmts_tile_url": MARS_WMTS_URL,
    },
]

# Canonical catalog exports
CURATED_MISSIONS = ALL_MISSIONS
CURATED_ARTIFACTS = ALL_ARTIFACTS

# Official NASA 3D Resources CDN URLs (verified HTTP 200 model/gltf-binary)
# Source: NASA Science 3D Resources (https://science.nasa.gov/3d-resources/)
NASA_3D_MODEL_CDN_MAP = {
    "opportunity-rover": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb",
    "spirit-rover": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb",
    "apollo-11-descent-stage": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb",
    "apollo-11-lm-eagle": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb",
    "ingenuity-helicopter": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/ingenuity-mars-helicopter/Ingenuity%20Mars%20Helicopter.glb",
    "insight-lander": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20(panels%20deployed).glb",
    "perseverance-rover": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-2020-perseverance-rover/Mars%202020%20Perseverance%20Rover.glb",
    "curiosity-rover": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-2020-perseverance-rover/Mars%202020%20Perseverance%20Rover.glb",
    "viking-lander": "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/viking-lander/Viking%20Lander.glb",
}


def resolve_3d_model_url(artifact_id: str = "", raw_url: str = "") -> str:
    """
    Resolves official NASA Science CDN GLB URL for an artifact.
    Replaces broken legacy GitHub raw URLs (which return 404) with direct CDN assets.
    """
    clean_raw = (raw_url or "").strip()
    if clean_raw and 'assets.science.nasa.gov' in clean_raw and clean_raw.lower().endswith('.glb'):
        return clean_raw

    norm_id = (artifact_id or "").lower().strip()
    if norm_id in NASA_3D_MODEL_CDN_MAP:
        return NASA_3D_MODEL_CDN_MAP[norm_id]

    combined = f"{norm_id} {clean_raw}".lower()
    if 'ingenuity' in combined:
        return NASA_3D_MODEL_CDN_MAP['ingenuity-helicopter']
    if 'opportunity' in combined or 'spirit' in combined or 'mer-' in combined:
        return NASA_3D_MODEL_CDN_MAP['opportunity-rover']
    if 'apollo' in combined or 'lunar module' in combined or 'lm' in combined:
        return NASA_3D_MODEL_CDN_MAP['apollo-11-descent-stage']
    if 'insight' in combined:
        return NASA_3D_MODEL_CDN_MAP['insight-lander']
    if 'perseverance' in combined or 'curiosity' in combined or 'mars-2020' in combined:
        return NASA_3D_MODEL_CDN_MAP['perseverance-rover']
    if 'viking' in combined:
        return NASA_3D_MODEL_CDN_MAP['viking-lander']

    if 'github' in clean_raw.lower() or 'raw.githubusercontent.com' in clean_raw.lower():
        return ""

    return clean_raw

