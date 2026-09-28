from fastapi import APIRouter, Depends

from tortoise import connections

from src.apps.dependencies import require_auth
from src.libs.logger import logger
from src.config.response import AppResponse, AppResponseModel
from src.apps.system.service import (
    get_user_info,
    handle_change_password,
)
from src.apps.system.schemas import UserInfoResponse, AuthChangePasswordBody

router = APIRouter()


@router.get("/info", description="获取用户信息", response_model=AppResponseModel[UserInfoResponse])
async def info(current_user: dict = Depends(require_auth)):
    logger.info(f"查询用户信息: user_id={current_user.get('user_id')}")
    result = await get_user_info(current_user)
    return AppResponse(data=result.model_dump())


@router.post("/change-password", description="修改密码", response_model=AppResponseModel[UserInfoResponse])
async def change_password(body: AuthChangePasswordBody, current_user: dict = Depends(require_auth)):
    logger.info(
        f"修改密码: user_id={current_user.get('user_id')} password={body.old_password} new_password={body.new_password}")
    await handle_change_password(body, current_user)
    return AppResponse(message="密码修改成功，请重新登录")

@router.get("/health/db", description="数据库健康检查")
async def health_db():
    conn = connections.get("default")
    await conn.execute_query("SELECT 1")
    return {"db": "ok"}
