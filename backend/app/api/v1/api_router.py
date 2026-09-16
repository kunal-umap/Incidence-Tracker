from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, agents, health

api_router = APIRouter()

# Register sub-routers with logical prefixes and tags
api_router.include_router(health.router, prefix="/health", tags=["Health & Probes"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Tokens"])
api_router.include_router(users.router, prefix="/users", tags=["User Management & RBAC"])
api_router.include_router(agents.router, prefix="/agents", tags=["AI Agents & Sessions"])
