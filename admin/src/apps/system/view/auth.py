from typing import Annotated

from fastapi import APIRouter, Body, Depends

from src.apps.dependencies import require_auth
from src.libs.logger import logger
from src.config.response import AppResponse, AppResponseModel
from src.apps.system.schemas import (AuthLoginBody, AuthRegisterBody, AuthRegisterResponse)
from src.apps.system.service import (
    handle_register,
    handle_login,
    handle_logout,
)

router = APIRouter()


@router.post("/login", description="用户登录")
async def login(body: Annotated[AuthLoginBody, Body()]):
    logger.info(f"登录请求: username={body.username}")
    result = await handle_login(body)
    return AppResponse(data=result.model_dump())


@router.post("/register", description="用户注册", response_model=AppResponseModel[AuthRegisterResponse])
async def register(body: Annotated[AuthRegisterBody, Body()]):
    logger.info(f"注册请求: username={body.username}, phone={body.phone}, email={body.email}")
    result = await handle_register(body)
    return AppResponse(data=result.model_dump())


@router.post("/logout", description="登出")
async def logout(current_user: dict = Depends(require_auth)):
    logger.info(f"登出请求: user_id={current_user.get('user_id')}")
    await handle_logout(current_user)
    return AppResponse(message="登出成功")
