from snowflake import SnowflakeGenerator
from settings import app_settings

# 全局生成器实例
_snowflake_generator = None

def get_snowflake_generator() -> SnowflakeGenerator:
    global _snowflake_generator
    if _snowflake_generator is None:
        _snowflake_generator = SnowflakeGenerator(app_settings.ADMIN_SNOWFLAKE_WORKER_ID)
        # 多线程改为  _generator = SnowflakeGenerator(app_settings.ADMIN_SNOWFLAKE_WORKER_ID)
    return _snowflake_generator

def generate_snowflake_id() -> int:
    """生成一个雪花 ID（整数）"""
    return next(get_snowflake_generator())