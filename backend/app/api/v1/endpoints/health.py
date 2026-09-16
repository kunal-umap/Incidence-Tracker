import time
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.redis import init_redis

router = APIRouter()
START_TIME = time.time()


@router.get("/live", summary="Liveness probe")
async def liveness_check():
    """Returns 200 if the process is alive."""
    return {"status": "alive", "uptime_seconds": round(time.time() - START_TIME, 2)}


@router.get("/ready", summary="Readiness probe")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Validates that:
    1. PostgreSQL database is reachable and responsive.
    2. Redis cache is reachable.
    """
    health_status = {
        "status": "ready",
        "timestamp": time.time(),
        "services": {
            "postgres": {"status": "unknown", "latency_ms": 0.0},
            "redis": {"status": "unknown", "latency_ms": 0.0},
        },
    }

    # Test PostgreSQL
    pg_start = time.time()
    try:
        await db.execute(text("SELECT 1"))
        health_status["services"]["postgres"]["status"] = "healthy"
        health_status["services"]["postgres"]["latency_ms"] = round((time.time() - pg_start) * 1000, 2)
    except Exception as exc:
        health_status["status"] = "unhealthy"
        health_status["services"]["postgres"]["status"] = f"unhealthy: {str(exc)}"

    # Test Redis
    r_start = time.time()
    try:
        r = await init_redis()
        await r.ping()
        health_status["services"]["redis"]["status"] = "healthy"
        health_status["services"]["redis"]["latency_ms"] = round((time.time() - r_start) * 1000, 2)
    except Exception as exc:
        health_status["services"]["redis"]["status"] = f"degraded: {str(exc)}"

    status_code = status.HTTP_200_OK if health_status["status"] == "ready" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=health_status, status_code=status_code)
