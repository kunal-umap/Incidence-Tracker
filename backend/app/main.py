import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from app.api.v1.api_router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.redis import close_redis, init_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan:
    - Startup: Initialize Redis connection pool, log boot state
    - Shutdown: Close Redis connection pool, flush pending buffers
    """
    logger.info(f"Starting {settings.PROJECT_NAME} (Env: {settings.ENVIRONMENT})")
    try:
        await init_redis()
        logger.info("Connected to Redis cache successfully.")
    except Exception as exc:
        logger.warning(f"Redis initialization warning (will retry on demand): {exc}")

    yield

    logger.info("Shutting down application...")
    await close_redis()
    logger.info("Application shutdown complete.")


# Initialize FastAPI with OpenAPI metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade Python backend built with FastAPI, PostgreSQL 16 (Async SQLAlchemy 2.0), "
        "Redis, JWT token rotation, and AI Agent module."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    """Adds X-Request-ID and X-Process-Time headers for observability."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_code": exc.error_code,
            "message": exc.detail,
            "extra_data": exc.extra_data,
        },
        headers=exc.headers,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled Server Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred.",
        },
    )


# Mount API v1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="Root Health Landing")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "healthy",
    }
