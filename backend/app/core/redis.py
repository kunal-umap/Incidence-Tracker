from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> aioredis.Redis:
    """Initialize Redis connection pool."""
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return redis_client


async def close_redis() -> None:
    """Close Redis connection pool gracefully."""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None


async def is_token_blacklisted(token_jti: str) -> bool:
    """Check if a JWT ID (jti) or token hash has been revoked in Redis."""
    if redis_client is None:
        return False
    try:
        exists = await redis_client.get(f"blacklist:{token_jti}")
        return exists is not None
    except Exception:
        # Fallback gracefully if Redis is temporarily unreachable
        return False


async def blacklist_token(token_jti: str, expires_in_seconds: int) -> None:
    """Add a token to Redis blacklist until its natural expiration."""
    if redis_client is not None:
        try:
            await redis_client.setex(f"blacklist:{token_jti}", expires_in_seconds, "revoked")
        except Exception:
            pass


async def check_rate_limit(key: str, limit: int, window_seconds: int = 60) -> bool:
    """
    Sliding window or fixed window rate limiter using Redis.
    Returns True if allowed, False if limit exceeded.
    """
    if redis_client is None:
        return True
    try:
        current = await redis_client.incr(f"ratelimit:{key}")
        if current == 1:
            await redis_client.expire(f"ratelimit:{key}", window_seconds)
        return current <= limit
    except Exception:
        return True
