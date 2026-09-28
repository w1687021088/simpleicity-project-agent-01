from typing import Optional, Any, NoReturn
from fastapi import Request, status, FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

from settings import app_settings
from src.config.biz_code import BizCode, biz_code_messages
from src.config.response import AppResponse
from src.libs.logger import logger


# 非 DEBUG 模式下保留的最大栈帧数
_MAX_TRACEBACK_FRAMES = 10


class AppException(Exception):
    """通用业务异常"""

    def __init__(
            self,
            code: BizCode = BizCode.UNKNOWN_ERROR,
            message: Optional[str] = None,
            data: Optional[Any] = None,
            http_status_code: int = status.HTTP_200_OK,
    ):
        if message is None:
            message = biz_code_messages.get(code, "未知错误")
        self.code = code
        self.message = message
        self.data = data
        self.http_status_code = http_status_code
        super().__init__(self.message)


def raise_biz_error(code: BizCode, message: Optional[str] = None, data: Optional[Any] = None, **kwargs) -> NoReturn:
    """快捷抛出业务异常"""
    raise AppException(code=code, message=message, data=data, **kwargs)


def _get_body_str(request: Request) -> str:
    """安全读取缓存的请求体"""
    cached_body = getattr(request.state, "cached_body", b"")
    if isinstance(cached_body, bytes):
        return cached_body.decode("utf-8", errors="ignore")[:500]
    if isinstance(cached_body, str):
        return cached_body[:500]
    return "<empty>"


def _unwrap_exception(exc: BaseException) -> BaseException:
    """只剥 ExceptionGroup，拿到真正被包装的异常"""
    seen: set[int] = set()
    while id(exc) not in seen:
        seen.add(id(exc))
        if isinstance(exc, BaseExceptionGroup) and exc.exceptions:
            exc = exc.exceptions[0]
            continue
        break
    return exc


def _format_exception(exc: BaseException) -> str:
    """只格式化单个异常，不展开 __context__ / __cause__ 链"""
    tb_exc = traceback.TracebackException(
        type(exc),
        exc,
        exc.__traceback__,
    )

    if not app_settings.ADMIN_LOGER_DEBUG:
        if len(tb_exc.stack) > _MAX_TRACEBACK_FRAMES:
            tb_exc.stack = traceback.StackSummary.from_list(
                tb_exc.stack[-_MAX_TRACEBACK_FRAMES:]
            )

    return "".join(tb_exc.format(chain=False))


def _http_status_to_code(http_status: int) -> BizCode:
    """HTTP 状态码 → 业务错误码（兜底）"""
    mapping = {
        status.HTTP_400_BAD_REQUEST: BizCode.VALIDATION_ERROR,
        status.HTTP_401_UNAUTHORIZED: BizCode.TOKEN_INVALID,
        status.HTTP_403_FORBIDDEN: BizCode.UNKNOWN_ERROR,
        status.HTTP_404_NOT_FOUND: BizCode.UNKNOWN_ERROR,
        status.HTTP_500_INTERNAL_SERVER_ERROR: BizCode.SERVER_ERROR,
    }
    return mapping.get(http_status, BizCode.UNKNOWN_ERROR)


def register_exception(app: FastAPI):
    """注册全局异常处理器"""

    # 处理所有自定义的业务异常
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method
        body_str = _get_body_str(request)

        logger.bind(
            path=path,
            method=method,
            path_params=dict(request.path_params),
            query_params=dict(request.query_params),
            request_id=request_id,
            code=int(exc.code),
            message=exc.message,
            request_body=body_str,
        ).warning(f"业务异常: {path}")

        return AppResponse(
            status_code=exc.http_status_code,
            code=exc.code,
            message=exc.message,
            data=exc.data,
            path=path,
            request_id=request_id,
        )

    # 处理 FastAPI 内置的 HTTP 异常
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        message = exc.detail or "请求处理失败"
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method

        logger.bind(
            path=path,
            method=method,
            request_id=request_id,
            status_code=exc.status_code,
        ).warning(f"内置的 HTTP 异常: {path}")

        return AppResponse(
            status_code=exc.status_code,
            code=_http_status_to_code(exc.status_code),
            message=message,
            path=path,
            request_id=request_id,
        )

    # 处理 Pydantic 参数校验失败异常
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = [
            {"field": ".".join(str(l) for l in e["loc"]), "msg": e["msg"]}
            for e in exc.errors()
        ]
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method
        body_str = _get_body_str(request)

        logger.bind(
            path=path,
            method=method,
            request_id=request_id,
            error_count=len(exc.errors()),
            errors=errors,
            path_params=dict(request.path_params),
            query_params=dict(request.query_params),
            request_body=body_str,
        ).warning(f"请求参数校验失败: {path}")

        return AppResponse(
            status_code=status.HTTP_200_OK,
            code=BizCode.VALIDATION_ERROR,
            message="请求参数校验失败",
            data=None,
            errors=errors,
            path=path,
            request_id=request_id,
        )

    # 兜底处理所有未被捕获的系统异常
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method
        body_str = _get_body_str(request)

        root = _unwrap_exception(exc)
        tb_str = _format_exception(root)

        logger.bind(
            error_type=type(root).__name__,
            error_msg=str(root),
            raw_type=type(exc).__name__,
            path=path,
            method=method,
            path_params=dict(request.path_params),
            query_params=dict(request.query_params),
            request_id=request_id,
            request_body=body_str,
        ).error(f"未处理的系统异常\n{tb_str}")

        return AppResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code=BizCode.SERVER_ERROR,
            message="服务器内部错误，请稍后重试",
            data=None,
            path=path,
            request_id=request_id,
        )