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
    date_str = time.strftime("%Y-%m-%d")
    log_path_info = log_path / f'admin_info_{date_str}.log'
    log_path_warning = log_path / f'admin_warning_{date_str}.log'
    log_path_error = log_path / f'admin_error_{date_str}.log'

    # 5. INFO：只收集普通信息
    logger.add(
        log_path_info,
        rotation="100 MB",
        retention="3 days",
        mode="a+",
        encoding="utf-8",
        filter=lambda record: record["level"].name == "INFO",
        format="{time: YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        enqueue=False,
    )

    # 6. WARNING：业务告警、参数校验失败、内置 HTTP 异常等
    logger.add(
        log_path_warning,
        rotation="100 MB",
        retention="2 weeks",
        mode="a+",
        encoding="utf-8",
        filter=lambda record: record["level"].name == "WARNING",
        format="{time: YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message} | {extra}",
        enqueue=False,
    )

    # 7. ERROR：未捕获的系统异常
    logger.add(
        log_path_error,
        rotation="500 MB",
        retention="4 weeks",
        mode="a+",
        encoding="utf-8",
        filter=lambda record: record["level"].name in ("ERROR", "CRITICAL"),
        format="{time: YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message} | {extra}\n{exception}",
        diagnose=app_settings.ADMIN_LOGER_DEBUG,
        backtrace=app_settings.ADMIN_LOGER_DEBUG,
        enqueue=False,
    )


create_logger()