import uuid
import jwt
from datetime import datetime, timedelta, UTC

from settings import app_settings


def create_access_token(data: dict) -> str:
    """创建访问令牌"""
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=app_settings.ADMIN_JWT_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(UTC),
        "jti": str(uuid.uuid4()),
    })

    return jwt.encode(
        to_encode,
        app_settings.ADMIN_JWT_SECRET_KEY,
        algorithm=app_settings.ADMIN_JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """
    解码并验证 token

    如果 token 过期 → 抛 ExpiredSignatureError
    如果 token 无效（签名错误、格式错误等）→ 抛 InvalidTokenError
    """
    return jwt.decode(
        token,
        app_settings.ADMIN_JWT_SECRET_KEY,
        algorithms=[app_settings.ADMIN_JWT_ALGORITHM],
    )


def access_token_blocklist_key_prefix(jti: str) -> str:
    """获取访问令牌黑名单 key 前缀"""
    return f"auth:access-token:{jti}"


def get_access_token_remaining_seconds(token: str) -> int:
    """获取访问令牌剩余有效期（秒）"""
    payload = decode_access_token(token)
    if payload is None:
        return 0
    exp = int(payload.get("exp", 0))
    now = int(datetime.now(UTC).timestamp())
    return max(0, exp - now)