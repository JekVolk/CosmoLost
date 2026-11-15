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
