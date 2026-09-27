from typing import Optional, Any
from fastapi import Request, status, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import datetime
import traceback

from settings import app_settings
from src.config.biz_code import BizCode, biz_code_messages
from src.libs.logger import logger


# 非 DEBUG 模式下保留的最大栈帧数
_MAX_TRACEBACK_FRAMES = 10


class AppException(Exception):
    """
    通用业务异常
    使用示例：
        raise AppException(BizCode.USER_NOT_FOUND, "用户不存在")
        raise AppException(BizCode.VALIDATION_ERROR, "参数校验失败", data={"field": "email"})
    """

    def __init__(
            self,
            code: BizCode = BizCode.UNKNOWN_ERROR,
            message: Optional[str] = None,
            data: Optional[Any] = None,
            http_status_code: int = status.HTTP_200_OK,  # 默认固定为 200
    ):
        if message is None:
            message = self._get_default_message(code)
        self.code = code
        self.message = message
        self.data = data
        self.http_status_code = http_status_code
        super().__init__(self.message)

    @staticmethod
    def _get_default_message(code: BizCode) -> str:
        return biz_code_messages.get(code, "未知错误")


class HandleError(JSONResponse):
    """ 自定义错误响应类 """

    def __init__(self, status_code: int, **kwargs: Any):
        self.data = {
            "success": False,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.data.update(kwargs)
        super().__init__(
            status_code=status_code,
            content=self.data,
        )


def raise_biz_error(code: BizCode, message: Optional[str] = None, data: Optional[Any] = None, **kwargs):
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
    """
    只剥 ExceptionGroup（anyio TaskGroup / asyncio.gather 的包装），
    拿到真正被包装的异常。

    不剥 __cause__ / __context__：
      - raise X from Y 的语义要保留（外层异常才是业务想表达的）
      - __context__ 链由 traceback.format(chain=False) 负责不展开
    """
    seen: set[int] = set()
    while id(exc) not in seen:
        seen.add(id(exc))

        if isinstance(exc, BaseExceptionGroup) and exc.exceptions:
            exc = exc.exceptions[0]
            continue

        break
    return exc


def _format_exception(exc: BaseException) -> str:
    """
    只格式化单个异常，不展开 __context__ / __cause__ 链。

    非 DEBUG 模式：只保留最后 _MAX_TRACEBACK_FRAMES 帧，
    避免第三方库 / 框架堆栈淹没业务帧。
    """
    tb_exc = traceback.TracebackException(
        type(exc),
        exc,
        exc.__traceback__,
    )

    if not app_settings.ADMIN_LOGER_DEBUG:
        if len(tb_exc.stack) > _MAX_TRACEBACK_FRAMES:
            # 取最后 N 帧（最靠近出错点）
            tb_exc.stack = traceback.StackSummary.from_list(
                tb_exc.stack[-_MAX_TRACEBACK_FRAMES:]
            )

    return "".join(tb_exc.format(chain=False))


def register_exception(app: FastAPI):
    """
    注册全局异常处理器
    :param app:
    :return: None
    """

    # 处理所有自定义的业务异常
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method

        logger.bind(
            path=path,
            method=method,
            request_id=request_id,
            code=int(exc.code),
            errors=exc.message,
        ).warning(f"业务异常: {path}")

        return HandleError(
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

        return HandleError(
            status_code=exc.status_code,
            message=message,
            path=path,
            request_id=request_id,
        )

    # 处理 Pydantic 参数校验失败异常 (RequestValidationError)
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = [
            {"field": ".".join(str(l) for l in e["loc"]), "msg": e["msg"]}
            for e in exc.errors()
        ]
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method

        logger.bind(
            path=path,
            method=method,
            request_id=request_id,
            error_count=len(exc.errors()),
            errors=errors,
        ).warning(f"请求参数校验失败: {path}")

        return HandleError(
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

        # 剥掉 ExceptionGroup 外壳，拿到真正的异常
        root = _unwrap_exception(exc)
        # 手动格式化堆栈（chain=False），绕开 loguru 的异常链展开
        tb_str = _format_exception(root)

        logger.bind(
            error_type=type(root).__name__,
            error_msg=str(root),
            raw_type=type(exc).__name__,  # 原始异常类型（可能是 ExceptionGroup），留着备查
            path=path,
            method=method,
            path_params=dict(request.path_params),
            query_params=dict(request.query_params),
            request_id=request_id,
            request_body=body_str,
        ).error(f"未处理的系统异常\n{tb_str}")

        return HandleError(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code=BizCode.SERVER_ERROR,
            message="服务器内部错误，请稍后重试",
            data=None,
            path=path,
            request_id=request_id,
        )