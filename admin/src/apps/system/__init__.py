from fastapi import APIRouter

from src.apps.system.view.auth import router as auth_router
from src.apps.system.view.user import router as user_router

system_router = APIRouter()

system_router.include_router(auth_router, prefix="/auth", tags=["认证"])

system_router.include_router(user_router, prefix="/user", tags=["用户"])