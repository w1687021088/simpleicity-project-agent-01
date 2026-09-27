from typing import Optional, Any
from fastapi import Request, status, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import datetime
from src.config.biz_code import BizCode, biz_code_messages
from src.libs.logger import logger


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
        # 如果没传 message，自动从错误码枚举中获取默认消息
        if message is None:
            message = self._get_default_message(code)
        self.code = code
        self.message = message
        self.data = data
        self.http_status_code = http_status_code
        super().__init__(self.message)

    @staticmethod
    def _get_default_message(code: BizCode) -> str:
        """为常见错误码提供默认文案"""
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
            content=self.data
        )


def raise_biz_error(code: BizCode, message: Optional[str] = None, data: Optional[Any] = None, **kwargs):
    """快捷抛出业务异常"""
    raise AppException(code=code, message=message, data=data, **kwargs)


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
            errors=exc,
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
        # 获取请求 ID
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method

        # 记录为 WARNING 级别（方便监控，但不触发告警）
        logger.bind(
            path=path,
            method=method,
            request_id=request_id,
            errors=exc,
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
        errors = [{"field": ".".join(str(l) for l in e["loc"]), "msg": e["msg"]} for e in exc.errors()]
        # 获取请求 ID
        request_id = getattr(request.state, "request_id", None)
        path = request.url.path
        method = request.method

        # 记录为 WARNING 级别（方便监控，但不触发告警）
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
        # 获取请求 ID
        request_id = getattr(request.state, "request_id", None)

        # 从缓存读取 Body
        cached_body = getattr(request.state, "cached_body", b"")

        # 获取请求体
        body_str = cached_body.decode("utf-8", errors="ignore")[:500] if cached_body else "<empty>"

        # 记录错误日志
        logger.bind(
            error_type=type(exc).__name__,
            error_msg=str(exc),
            path=request.url.path,
            method=request.method,
            path_params=dict(request.path_params),
            query_params=dict(request.query_params),
            request_id=request_id,
            request_body=body_str,
        ).error("未处理的系统异常")

        return HandleError(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code=BizCode.SERVER_ERROR,
            message="服务器内部错误，请稍后重试",
            data=None,
            path=request.url.path,
            request_id=request_id,
        )
