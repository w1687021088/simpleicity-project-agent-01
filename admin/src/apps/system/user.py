from fastapi import APIRouter

router = APIRouter()

@router.get("/info", description="获取用户信息")
async def info():
    pass