from fastapi import APIRouter

router = APIRouter()


@router.get("/info", description="获取用户信息")
async def info():
    data = {}
    print(data['p'])
    return {"code": 200, "msg": "ok", "data": {"app": "你好"}}
