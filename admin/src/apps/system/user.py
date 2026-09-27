from fastapi import APIRouter

from tortoise import connections

router = APIRouter()


@router.get("/info", description="获取用户信息")
async def info():
    data = {}
    print(data['p'])
    return {"code": 200, "msg": "ok", "data": {"app": "你好"}}


@router.get("/health/db", description="数据库健康检查")
async def health_db():
    conn = connections.get("default")
    await conn.execute_query("SELECT 1")
    return {"db": "ok"}
