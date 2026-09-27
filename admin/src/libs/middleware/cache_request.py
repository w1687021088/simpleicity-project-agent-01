import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class CacheRequestBodyMiddleware(BaseHTTPMiddleware):
    """
    缓存请求体
    """

    async def dispatch(self, request: Request, call_next):
        # 1. 缓存请求体（已有）
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body = await request.body()
                    request.state.cached_body = body
                except Exception as e:
                    print(e)

        # 2. 新增：生成请求 ID（方便日志追踪）
        request.state.request_id = str(uuid.uuid4())

        # 3. 新增：解析用户 ID（如果有 token）
        # token = request.headers.get("authorization")
        # request.state.user_id = decode_token(token)

        # 4. 新增：记录客户端 IP
        request.state.client_ip = getattr(request.client, "host", "")

        return await call_next(request)
