from fastapi import FastAPI

from contextlib import asynccontextmanager

from src.libs.logger import logger
from src.apps import register_routes
from src.utils.redis_client import app_redis
from src.libs import (
    register_middleware,
    register_exception,
    register_db,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        await app_redis.connect()
        logger.info("✅ 所有服务连接成功")
    except Exception as e:
        logger.error(f"❌ 服务连接失败，应用无法启动: {e}")
        raise

    yield

    try:
        await app_redis.disconnect()
    except Exception as e:
        logger.error(f"⚠️ Redis 关闭异常: {e}")

    logger.info("🛑 所有连接已释放")


def create_app() -> FastAPI:
    """创建应用"""
    app = FastAPI(lifespan=lifespan, title="agent-dev-admin", docs_url="/admin/docs")

    # 注册路由
    register_routes(app)

    # 注册中间件
    register_middleware(app)

    # 注册异常处理
    register_exception(app)

    # 注册数据库
    register_db(app)

    return app
