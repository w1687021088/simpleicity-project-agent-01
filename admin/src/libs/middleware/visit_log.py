import time
from typing import Callable
from fastapi import Request, FastAPI, Response
from src.libs.logger import logger


def visit_log_middleware(app: FastAPI) -> Callable[[Request, Callable], Response]:
    # 日志
    @app.middleware('http')  # 中间件的类型。目前只支持“http”。
    async def middleware(request: Request, call_next):
        """
        访问日志
        :param request:
        :param call_next:
        :return: Callable[[Request, Callable], Response]
        """
        start_time = time.time()
        response = await call_next(request)
        end_time = time.time()
        total_time = end_time - start_time
        request_id = request.state.request_id

        logger.info(
            f"request_id: {request_id} 客户端 ip：{request.client} 请求方法：{request.method} 请求路径：{request.url} 请求头：{request.headers} 响应状态码：{response.status_code} 响应时间：{total_time}"
        )

        response.headers["X-Process-Time"] = str(total_time)
        return response

    return middleware
