import time
import uuid
from typing import Callable
from fastapi import Request, FastAPI, Response
from src.libs.logger import logger


def visit_log_middleware(app: FastAPI) -> Callable[[Request, Callable], Response]:
    """访问日志中间件"""

    @app.middleware('http')
    async def middleware(request: Request, call_next):
        # 在最外层生成 request_id，保证所有请求（含 CORS 预检）都有， 目前 visit_log_middleware 在最外层
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.time()
        response = await call_next(request)
        total_time = time.time() - start_time

        logger.info(
            f"request_id: {request_id} 客户端 ip：{request.client} "
            f"请求方法：{request.method} 请求路径：{request.url.path} "
            f"响应状态码：{response.status_code} 响应时间：{total_time:.4f}s"
        )

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(total_time)
        return response

    return middleware