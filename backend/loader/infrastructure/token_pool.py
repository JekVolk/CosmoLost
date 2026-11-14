"""
NASA API Token Pool Manager.
Handles multi-key rotation, thread safety, HTTP 429 cooldowns, and quota tracking.
"""
import logging
import threading
import time
from typing import Dict, List, Optional

from loader.domain.exceptions import RateLimitExceededError

logger = logging.getLogger('loader.token_pool')


class TokenMetadata:
    """State tracking for a single NASA API key."""

    def __init__(self, key: str):
        self.key = key
        self.is_active = True
        self.total_requests = 0
        self.remaining_quota: Optional[int] = None
        self.rate_limited_until: float = 0.0

    def is_available(self) -> bool:
        if not self.is_active:
            return False
        return time.time() >= self.rate_limited_until


class NASATokenPool:
    """
    Thread-safe manager for multiple NASA API keys with auto-rotation on 429/403.
    """

    def __init__(self, raw_keys: str):
        parsed = [k.strip() for k in raw_keys.split(',') if k.strip()]
        if not parsed:
            parsed = ['DEMO_KEY']

        self.tokens: List[TokenMetadata] = [TokenMetadata(k) for k in parsed]
        self.current_index: int = 0
        self.rotation_count: int = 0
        self._lock = threading.Lock()
        logger.info(f"Initialized NASA Token Pool with {len(self.tokens)} key(s).")

    def get_token(self) -> str:
        with self._lock:
            for _ in range(len(self.tokens)):
                token_meta = self.tokens[self.current_index]
                if token_meta.is_available():
                    token_meta.total_requests += 1
                    return token_meta.key
                self._advance_index()

            wait_times = [max(0.0, t.rate_limited_until - time.time()) for t in self.tokens]
            min_wait = min(wait_times) if wait_times else 60.0
            raise RateLimitExceededError(
                f"All {len(self.tokens)} NASA API tokens are rate-limited! Min cooldown remaining: {min_wait:.1f}s"
            )

    def mark_rate_limited(self, key: str, cooldown_seconds: float = 3600.0) -> None:
        with self._lock:
            for t in self.tokens:
                if t.key == key:
                    t.rate_limited_until = time.time() + cooldown_seconds
                    logger.warning(
                        f"Token '...{key[-4:] if len(key) > 4 else key}' received HTTP 429! Cooldown for {cooldown_seconds}s."
                    )
                    break
            self.rotation_count += 1
            self._advance_index()

    def update_quota_headers(self, key: str, headers: Dict[str, str]) -> None:
        remaining = headers.get('X-RateLimit-Remaining')
        if remaining and remaining.isdigit():
            with self._lock:
                for t in self.tokens:
                    if t.key == key:
                        t.remaining_quota = int(remaining)
                        break

    def _advance_index(self) -> None:
        self.current_index = (self.current_index + 1) % len(self.tokens)
