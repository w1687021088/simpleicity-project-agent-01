from fastapi import FastAPI

from src.apps.system import system_router

# 添加路径前缀
_router_path = lambda path: f"/api/v1/{path}"


def register_routes(app: FastAPI):
    """
       注册路由
       :param app: FastAPI
       :return: None
       """


    # 注册系统路由
    app.include_router(system_router, prefix=_router_path("system"))
