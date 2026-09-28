import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class CacheRequestBodyMiddleware(BaseHTTPMiddleware):
    """缓存请求体 + 记录客户端信息"""

    async def dispatch(self, request: Request, call_next):
        # 1. 缓存请求体
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body = await request.body()
                    request.state.cached_body = body
                except Exception as e:
                    print(e)

        # 记录客户端 IP
        request.state.client_ip = getattr(request.client, "host", "")

        return await call_next(request)
