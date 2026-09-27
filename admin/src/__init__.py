# from contextlib import asynccontextmanager

from fastapi import FastAPI

# @asynccontextmanager
# async def lifespan(_: FastAPI):
#     """应用启动时执行"""
#     pass


def create_app() -> FastAPI:
    """创建应用"""
    app = FastAPI()
    # app = FastAPI(lifespan=lifespan)

    return app
