from fastapi import APIRouter

router = APIRouter()


@router.post("/login", description="用户登录")
async def login():
    pass


@router.post("/register", description="用户注册")
async def register():
    pass


@router.post("/logout", description="登出")
async def logout():
    pass
