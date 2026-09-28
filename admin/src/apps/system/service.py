from config.biz_code import BizCode
from src.libs.exception import raise_biz_error
from src.apps.system.schemas import AuthRegisterBody, AuthRegisterResponse
from src.models import User
from src.utils.bcrypt_utils import hash_password
from src.utils.snowflake_utils import generate_snowflake_id
from src.utils.jwt_utils import create_access_token


async def handle_register(body: AuthRegisterBody):
    """ 处理注册逻辑 """

    # 检查用户名是否已存在
    if await User.filter(username=body.username).exists():
        raise_biz_error(BizCode.USERNAME_ALREADY_EXISTS)

    # 检查手机号（若提供）是否已存在
    if body.phone and await User.filter(phone=body.phone).exists():
        raise_biz_error(BizCode.PHONE_ALREADY_EXISTS)

    # 检查邮箱（若提供）是否已存在
    if body.email and await User.filter(email=body.email).exists():
        raise_biz_error(BizCode.EMAIL_ALREADY_EXISTS)

    hashed_password = hash_password(body.password)

    user_id = generate_snowflake_id()  # 生成用户 ID

    # 创建用户
    user = await User.create(
        user_id=user_id,
        username=body.username,
        password=hashed_password,
        phone=body.phone,
        email=body.email,
        nickname=body.nickname,
        is_active=True
    )

    # 生成 JWTToken
    token = create_access_token(data={"sub": user.username, "user_id": str(user.user_id)})

    return AuthRegisterResponse(
        user_id=user.user_id,
        username=user.username,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        is_active=user.is_active,
        token=token
    ).model_dump()
