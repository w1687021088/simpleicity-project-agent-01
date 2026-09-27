from fastapi import Depends, status

from fastapi.security import OAuth2PasswordBearer

from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from redis.exceptions import RedisError

from src.utils.jwt_utils import decode_access_token, access_token_blocklist_key_prefix

from utils.redis_client import app_redis

from src.libs.exception import raise_biz_error

from src.config.biz_code import BizCode

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/system/auth/auh/login",
    auto_error=False
)


async def require_auth(token: str = Depends(oauth2_scheme)):
    """需要授权依赖"""
    if not token:
        raise_biz_error(
            code=BizCode.TOKEN_MISSING,
            http_status_code=status.HTTP_401_UNAUTHORIZED
        )

    try:
        payload = decode_access_token(token)
        jti = payload.get("jti")
        if not jti:
            raise_biz_error(
                code=BizCode.TOKEN_MISSING_JTI,
                http_status_code=status.HTTP_401_UNAUTHORIZED
            )

        blacklist_key = access_token_blocklist_key_prefix(jti)
        try:
            is_blacklisted = await app_redis.client.exists(blacklist_key)
        except RedisError:
            is_blacklisted = False

        if is_blacklisted:
            raise_biz_error(
                code=BizCode.TOKEN_BLACKLISTED,
                http_status_code=status.HTTP_401_UNAUTHORIZED
            )

        return {
            "user_id": payload.get("user_id"),
            "jti": jti,
            "exp": payload.get("exp"),
        }
    except ExpiredSignatureError:
        raise_biz_error(
            code=BizCode.TOKEN_EXPIRED,
            http_status_code=status.HTTP_401_UNAUTHORIZED
        )
    except InvalidTokenError:
        raise_biz_error(
            code=BizCode.TOKEN_INVALID,
            http_status_code=status.HTTP_401_UNAUTHORIZED
        )
