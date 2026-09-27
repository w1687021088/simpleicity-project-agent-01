from typing import ClassVar
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfigSettings(BaseSettings):
    # 基础目录
    BASE_DIR: ClassVar[Path] = Path(__file__).resolve().parent

    # 基础配置
    ADMIN_APP_HOST: str  # ip
    ADMIN_APP_PORT: int  # 端口
    ADMIN_LOGER_DEBUG: bool # 日志是否调试模式

    # 数据库
    ADMIN_DB_HOST: str
    ADMIN_DB_PORT: int
    ADMIN_DB_USER: str
    ADMIN_DB_PASSWORD: str
    ADMIN_DB_NAME: str

    # 数据库连接池
    ADMIN_DB_POOL_MIN: int
    ADMIN_DB_POOL_MAX: int

    # jwt
    ADMIN_JWT_SECRET_KEY: str  # 密钥
    ADMIN_JWT_ALGORITHM: str  # 算法
    ADMIN_JWT_EXPIRE_MINUTES: int  # 过期时间(分钟)

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent / ".env",  # 指定文件（相对于当前文件路径）
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 里多余的变量
        case_sensitive=True,  # 推荐保持默认 True，让字段名和 .env 完全一致
    )


app_settings = AppConfigSettings()
