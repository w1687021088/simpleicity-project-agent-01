from src.config.biz_code import BizCode
from src.libs.exception import raise_biz_error
from src.models import User
from src.utils.bcrypt_utils import hash_password, verify_password
from src.utils.snowflake_utils import generate_snowflake_id
from src.utils.jwt_utils import create_access_token
from src.apps.system.schemas import (
    AuthRegisterBody,
    AuthRegisterResponse,
    AuthLoginBody,
    AuthLoginResponse,
    UserInfoResponse,
)


async def handle_register(body: AuthRegisterBody) -> AuthRegisterResponse:
    """处理注册逻辑"""

    if await User.filter(username=body.username).exists():
        raise_biz_error(BizCode.USERNAME_ALREADY_EXISTS)

    if body.phone and await User.filter(phone=body.phone).exists():
        raise_biz_error(BizCode.PHONE_ALREADY_EXISTS)

    if body.email and await User.filter(email=body.email).exists():
        raise_biz_error(BizCode.EMAIL_ALREADY_EXISTS)

    hashed_password = hash_password(body.password)
    user_id = generate_snowflake_id()

    user = await User.create(
        user_id=user_id,
        username=body.username,
        password=hashed_password,
        phone=body.phone,
        email=body.email,
        nickname=body.nickname,
        is_active=True,
    )

    token = create_access_token(
        data={"sub": user.username, "user_id": str(user.user_id)}
    )

    return AuthRegisterResponse(
        user_id=str(user.user_id),
        username=user.username,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
        token=token,
    )


async def handle_login(body: AuthLoginBody) -> AuthLoginResponse:
    """处理获取用户信息逻辑"""
    # 1. 查找用户
    user: User = await User.get_or_none(username=body.username)
    if not user:
        raise_biz_error(BizCode.USER_NOT_FOUND)

    # 2. 验证密码
    if not verify_password(body.password, user.password):
        raise_biz_error(BizCode.USER_PASSWORD_ERROR)

    # 3. 生成 token
    token = create_access_token(data={"sub": user.username, "user_id": str(user.user_id)})

    return AuthLoginResponse(
        user_id=str(user.user_id),
        username=user.username,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
        token=token,
    )


async def get_user_info(current_user: dict) -> UserInfoResponse:
    """ 处理获取用户信息逻辑 """
    user_id = current_user.get("user_id")

    user = await User.get_or_none(user_id=user_id)
    if not user:
        raise_biz_error(BizCode.USER_NOT_FOUND)

    return UserInfoResponse(
        user_id=str(user.user_id),
        username=user.username,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
    )
