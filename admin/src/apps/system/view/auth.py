from typing import Annotated

from fastapi import APIRouter, Body

from src.libs.logger import logger
from src.config.response import AppResponse

from src.apps.system.schemas import (AuthLoginBody, AuthRegisterBody, AuthRegisterResponse)
from src.apps.system.service import (
    handle_register
)

router = APIRouter()


@router.post("/login", description="用户登录")
async def login(body: Annotated[AuthLoginBody, Body()]):
    print(body)
    logger.info(f"登录请求: username={body.username}")
    return AppResponse(data={"message": "登录成功"})


@router.post("/register", description="用户注册", response_model=AuthRegisterResponse)
async def register(body: Annotated[AuthRegisterBody, Body()]):
    logger.info(f"注册请求: username={body.username}, phone={body.phone}, email={body.email}")
    result = await handle_register(body)
    return AppResponse(data=result)


@router.post("/logout", description="登出")
async def logout():
    pass
