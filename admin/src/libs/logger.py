from settings import app_settings
from loguru import logger
import time


def create_logger():
    # 1. 打印 BASE_DIR
    base_dir = app_settings.BASE_DIR.resolve().parent

    # 2. 构造 logs 目录
    log_path = base_dir / "logs"

    # 3. 创建目录
    log_path.mkdir(parents=True, exist_ok=True)

    # 4. 生成日志文件绝对路径
    log_path_info = log_path / f'admin_info_{time.strftime("%Y-%m-%d")}.log'
    log_path_error = log_path / f'admin_error_{time.strftime("%Y-%m-%d")}.log'

    # 5. 添加文件 sink（同步写入）
    logger.add(
        log_path_info,
        rotation="100 MB",
        retention="3 days",
        mode="a+",
        encoding="utf-8",
        filter=lambda record: record["level"].name in ("INFO", "WARNING"),  # 否则会记录 INFO、WARNING、ERROR、CRITICAL
        format="{time: YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        enqueue=False,  # 关闭异步队列
    )

    logger.add(
        log_path_error,
        rotation="500 MB",
        retention="4 weeks",
        mode="a+",
        encoding="utf-8",
        level='ERROR',
        format="{time: YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message} | {extra}\n{exception}",
        diagnose=app_settings.ADMIN_LOGER_DEBUG,  # 开发显示局部变量，生产不显示
        backtrace=app_settings.ADMIN_LOGER_DEBUG,  # 开发展开跨帧，生产不展开
        enqueue=False,
    )


create_logger()
