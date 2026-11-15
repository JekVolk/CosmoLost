"""
Resilient HTTP Client for NASA Open Data APIs.
Features automatic retry, rate limiting delay, token pool rotation, and seed fallbacks.
"""
import logging
import time
from typing import Any, Dict, List, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

from loader.constants import (
    IMAGES_SEARCH_ENDPOINT,
    MARS_ROVER_MANIFEST_ENDPOINT,
    MARS_ROVER_PHOTOS_ENDPOINT,
)
from loader.domain.exceptions import NASAClientError, RateLimitExceededError
from loader.infrastructure.token_pool import NASATokenPool

logger = logging.getLogger('loader.nasa_client')


class NASAClient:
    """
    HTTP client for querying official NASA endpoints with resilience.
    """

    def __init__(
        self,
        token_pool: NASATokenPool,
        base_url: str = "https://api.nasa.gov",
        images_api_url: str = "https://images-api.nasa.gov",
        timeout: int = 15,
        rate_limit_delay: float = 0.25,
        max_retries: int = 3,
        enable_mock_fallback: bool = True,
    ):
        self.token_pool = token_pool
        self.base_url = base_url.rstrip('/')
        self.images_api_url = images_api_url.rstrip('/')
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.enable_mock_fallback = enable_mock_fallback

        self.session = requests.Session()
        retries = Retry(
            total=max_retries,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False,
            respect_retry_after_header=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=10, pool_maxsize=20)
        self.session.mount('https://', adapter)
        self.session.mount('http://', adapter)

    def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        use_images_api: bool = False,
        is_full_url: bool = False,
    ) -> Dict[str, Any]:
        """
        Execute GET request against NASA APIs with token injection and rotation.
        """
        params = params.copy() if params else {}

        if is_full_url:
            url = endpoint
        elif use_images_api:
            url = f"{self.images_api_url}/{endpoint.lstrip('/')}"
        else:
            url = f"{self.base_url}/{endpoint.lstrip('/')}"

        max_pool_attempts = max(1, len(self.token_pool.tokens))
        attempt = 0

        while attempt < max_pool_attempts:
            attempt += 1
            current_token = ""
            if not use_images_api and not is_full_url:
                try:
                    current_token = self.token_pool.get_token()
                except RateLimitExceededError:
                    if self.enable_mock_fallback:
                        logger.warning("All tokens in pool are rate-limited. Fallback enabled -> returning empty payload.")
                        return {}
                    raise
                params['api_key'] = current_token

            if self.rate_limit_delay > 0:
                time.sleep(self.rate_limit_delay)

            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                if current_token:
                    self.token_pool.update_quota_headers(current_token, response.headers)

                if response.status_code in (429, 403):
                    logger.warning(
                        f"NASA returned status {response.status_code} for key ...{current_token[-4:] if len(current_token)>4 else current_token}. Rotating..."
                    )
                    if current_token:
                        self.token_pool.mark_rate_limited(current_token, cooldown_seconds=3600.0)
                    continue

                if response.status_code == 404:
                    logger.warning(f"NASA resource returned 404 Not Found: {url}")
                    if self.enable_mock_fallback:
                        return {}
                    raise NASAClientError(f"Resource not found: {url}")

                if response.status_code == 200:
                    # Enforce max 25MB response size limit to prevent memory exhaustion DoS
                    if len(response.content) > 25 * 1024 * 1024:
                        raise NASAClientError(f"Response from {url} exceeded 25MB limit")

                    parsed = response.json()
                    if isinstance(parsed, dict):
                        return parsed
                    elif isinstance(parsed, list):
                        return {'items': parsed}
                    return {}

                response.raise_for_status()

            except requests.RequestException as e:
                logger.error(f"HTTP request error for {url}: {e}")
                if attempt >= max_pool_attempts:
                    if self.enable_mock_fallback:
                        logger.warning(f"Mock fallback enabled. Returning empty payload for {url}")
                        return {}
                    raise NASAClientError(f"Request failed after {attempt} attempts: {e}") from e

        if self.enable_mock_fallback:
            return {}
        raise RateLimitExceededError("Exhausted all available NASA tokens without a successful response.")

    def fetch_rover_manifest(self, rover_name: str) -> Dict[str, Any]:
        endpoint = MARS_ROVER_MANIFEST_ENDPOINT.format(rover=rover_name.lower())
        return self.get(endpoint)

    def fetch_rover_photos(
        self,
        rover_name: str,
        sol: int,
        camera: Optional[str] = None,
        page: int = 1,
    ) -> List[Dict[str, Any]]:
        endpoint = MARS_ROVER_PHOTOS_ENDPOINT.format(rover=rover_name.lower())
        params: Dict[str, Any] = {'sol': sol, 'page': page}
        if camera:
            params['camera'] = camera
        data = self.get(endpoint, params=params)
        return data.get('photos', [])

    def search_archive_images(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {'q': query, 'media_type': 'image', 'page_size': limit}
        try:
            data = self.get(IMAGES_SEARCH_ENDPOINT, params=params, use_images_api=True)
            items = data.get('collection', {}).get('items', [])
            results = []
            for item in items:
                data_list = item.get('data', [{}])
                links = item.get('links', [{}])
                if data_list and links:
                    info = data_list[0]
                    results.append({
                        'nasa_id': info.get('nasa_id', ''),
                        'title': info.get('title', ''),
                        'description': info.get('description', ''),
                        'href': links[0].get('href', ''),
                        'photographer': info.get('photographer', 'NASA/JPL'),
                    })
            return results
        except Exception as e:
            logger.warning(f"Error querying NASA Image Archive for '{query}': {e}")
            return []

    def fetch_mmgis_layer(self, url: str) -> Dict[str, Any]:
        """Fetch open GeoJSON traverse/waypoint layers from NASA MMGIS."""
        try:
            return self.get(url, is_full_url=True)
        except Exception as e:
            logger.warning(f"Could not load MMGIS layer {url}: {e}")
            return {}
