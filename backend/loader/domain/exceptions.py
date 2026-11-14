"""
Domain exceptions for NASA data loader.
"""


class LoaderBaseException(Exception):
    """Base exception for all loader errors."""
    pass


class NASAClientError(LoaderBaseException):
    """Network or HTTP error while calling NASA API."""
    pass


class RateLimitExceededError(NASAClientError):
    """All NASA API tokens in pool reached rate limits."""
    pass


class IngestValidationError(LoaderBaseException):
    """DTO validation failed (e.g. invalid coordinates or missing IDs)."""
    pass


class IngestRepositoryError(LoaderBaseException):
    """Database persistence failure."""
    pass
