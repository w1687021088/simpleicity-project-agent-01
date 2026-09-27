from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

from src.config.db_config import TORTOISE_ORM


def register_db(app: FastAPI):
    """注册数据库"""
    register_tortoise(
        app,
        config=TORTOISE_ORM,
        generate_schemas=False,
        add_exception_handlers=False,  # 用你自己的异常体系
    )


# uv run tortoise init 初始化

# uv run tortoise makemigrations 生成迁移文件

# uv run tortoise migrate 迁移

