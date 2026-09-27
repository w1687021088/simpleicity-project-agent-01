from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.libs.middleware.visit_log import visit_log_middleware
from src.libs.middleware.cache_request import CacheRequestBodyMiddleware


def register_middleware(app: FastAPI):
    """
    注册中间件
    :param app: FastAPI
    :return: None
    """

    # 添加请求体缓存中间件
    app.add_middleware(CacheRequestBodyMiddleware)

    # cors
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 访问日志
    visit_log_middleware(app)
