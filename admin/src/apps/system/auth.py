from typing import Annotated

from fastapi import APIRouter, Body
from src.config.response import AppResponse

from src.apps.system.schemas import AuthRegisterBody

router = APIRouter()


@router.post("/login", description="用户登录")
async def login():
    pass


@router.post("/register", description="用户注册")
async def register(body: Annotated[AuthRegisterBody, Body()]):
    print(body)
    return AppResponse(data={"message": "注册成功"})


@router.post("/logout", description="登出")
async def logout():
    pass
