from settings import app_settings

# 数据库配置
TORTOISE_ORM = {
    "connections": { # 数据库连接配置
        "default": { # 默认数据库连接
            "engine": "tortoise.backends.asyncpg", # 数据库引擎
            "credentials": { # 数据库凭证
                "host": app_settings.ADMIN_DB_HOST, # 数据库主机
                "port": app_settings.ADMIN_DB_PORT, # 数据库端口
                "user": app_settings.ADMIN_DB_USER, # 数据库用户
                "password": app_settings.ADMIN_DB_PASSWORD, # 数据库密码
                "database": app_settings.ADMIN_DB_NAME, # 数据库名
                "server_settings": {
                    "client_encoding": "utf8", # 客户端编码
                },
                "minsize": app_settings.ADMIN_DB_POOL_MIN, # 连接池最小连接数
                "maxsize": app_settings.ADMIN_DB_POOL_MAX, # 连接池最大连接数
            },
        }
    },
    "apps": {
        "models": { # 模型配置
            "models": ["src.models"], # 模型路径
            "default_connection": "default", # 默认连接
            "migrations": "src.migrations", # 迁移文件路径
        },
    },
    "use_tz": True, # PostgreSQL 建议 True，用 TIMESTAMPTZ
    "timezone": "Asia/Shanghai", # 时区
}