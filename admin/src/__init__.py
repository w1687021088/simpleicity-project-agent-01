from contextlib import asynccontextmanager
from src.libs.logger import logger

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(_: FastAPI):
    """应用启动时执行"""
    try:
        # await app_redis.connect()  # 链接 redis
        # print("✅ 所有服务连接成功")
        pass
    except Exception as e:
        logger.error(f"❌ 服务连接失败，应用无法启动: {e}")
        raise

    yield

    # 关闭时尽量保证都释放，即使某个报错也不影响其他的
    try:
        pass
        # await app_redis.disconnect()  # 关闭 redis 连接
    except Exception as e:
        logger.error(f"⚠️ Redis 关闭异常: {e}")

    print("🛑 所有连接已释放")


def create_app() -> FastAPI:
    """创建应用"""
    app = FastAPI(lifespan=lifespan, title="agent-dev-admin", docs_url="/admin/docs")

    return app
