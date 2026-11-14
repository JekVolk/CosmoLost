"""
Sync State & Checksum Store for Delta Ingestion.
Uses Redis or a local JSON file ledger: NO extra Django database tables!
"""
import hashlib
import json
import logging
import os
import threading
from typing import Any, Dict, Optional

logger = logging.getLogger('loader.state_store')


class SyncStateStore:
    """
    Tracks SHA-256 entity hashes to detect newly added or updated data.
    Provides atomic file persistence and thread-safe operations.
    """

    def __init__(self, redis_url: Optional[str] = None, fallback_file_path: str = "loader_sync_state.json"):
        self.redis_client = None
        self.fallback_file_path = fallback_file_path
        self.local_cache: Dict[str, Any] = {}
        self._lock = threading.Lock()

        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                logger.info("Connected to Redis for sync state tracking.")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}). Falling back to local file ledger {fallback_file_path}.")
                self.redis_client = None

        if not self.redis_client:
            self._load_local_cache()

    def compute_hash(self, payload: dict) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def is_changed(self, entity_type: str, entity_id: str, current_hash: str) -> bool:
        key = f"cosmolost:sync:{entity_type}:{entity_id}"
        stored_hash = None

        if self.redis_client:
            try:
                stored_hash = self.redis_client.get(key)
            except Exception:
                stored_hash = self.local_cache.get(key)
        else:
            stored_hash = self.local_cache.get(key)

        return stored_hash != current_hash

    def update_hash(self, entity_type: str, entity_id: str, new_hash: str) -> None:
        key = f"cosmolost:sync:{entity_type}:{entity_id}"
        if self.redis_client:
            try:
                self.redis_client.set(key, new_hash)
            except Exception:
                self.local_cache[key] = new_hash
                self._save_local_cache()
        else:
            self.local_cache[key] = new_hash
            self._save_local_cache()

    def save_last_run_stats(self, stats_dict: Dict[str, Any]) -> None:
        key = "cosmolost:sync:last_run_stats"
        serialized = json.dumps(stats_dict, default=str)
        if self.redis_client:
            try:
                self.redis_client.set(key, serialized)
            except Exception:
                self.local_cache[key] = stats_dict
                self._save_local_cache()
        else:
            self.local_cache[key] = stats_dict
            self._save_local_cache()

    def get_last_run_stats(self) -> Optional[Dict[str, Any]]:
        key = "cosmolost:sync:last_run_stats"
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                if val:
                    return json.loads(val)
            except Exception:
                pass
        return self.local_cache.get(key)

    def _load_local_cache(self) -> None:
        with self._lock:
            if os.path.exists(self.fallback_file_path):
                try:
                    with open(self.fallback_file_path, 'r', encoding='utf-8') as f:
                        self.local_cache = json.load(f)
                except Exception:
                    self.local_cache = {}

    def _save_local_cache(self) -> None:
        with self._lock:
            tmp_path = f"{self.fallback_file_path}.tmp"
            try:
                with open(tmp_path, 'w', encoding='utf-8') as f:
                    json.dump(self.local_cache, f, indent=2, default=str)
                os.replace(tmp_path, self.fallback_file_path)
            except Exception as e:
                logger.error(f"Failed to write local state ledger atomically: {e}")
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass
