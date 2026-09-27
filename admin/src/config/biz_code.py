from enum import IntEnum


# ==================== 定义数字错误码枚举 ====================
class BizCode(IntEnum):
    """业务错误码（纯数字）"""
    SUCCESS = 0
    # 通用错误 1000-1999
    UNKNOWN_ERROR = 1000 # 通用错误
    VALIDATION_ERROR = 1001  # 请求参数校验失败


    # 用户模块 2000-2999
    # ====== 注册 ======
    USERNAME_ALREADY_EXISTS = 2011  # 用户名已存在
    PHONE_ALREADY_EXISTS = 2012  # 手机号已存在
    EMAIL_ALREADY_EXISTS = 2013  # 邮箱已存在
    USER_NOT_FOUND = 2014  # 用户不存在
    USER_PASSWORD_ERROR = 2015  # 用户密码错误

    # ====== 认证相关（新增） ======
    TOKEN_MISSING = 2100  # 未提供 token
    TOKEN_INVALID = 2101  # token 无效（签名错误、格式错误）
    TOKEN_EXPIRED = 2102  # token 已过期
    TOKEN_BLACKLISTED = 2103  # token 已登出（在黑名单）
    TOKEN_MISSING_JTI = 2104  # token 缺少 jti

    # 系统级错误 9000-9999
    DB_ERROR = 9001
    REDIS_ERROR = 9002
    THIRD_PARTY_ERROR = 9003
    SERVER_ERROR = 9999




# ==================== 定义错误码对应的提示信息 ====================
biz_code_messages = {
    BizCode.SUCCESS: "操作成功",
    BizCode.VALIDATION_ERROR: "请求参数校验失败",

    # ====== 系统级错误 ======
    BizCode.SERVER_ERROR: "服务器内部错误，请稍后重试",

    # ====== 认证相关（新增） ======
    BizCode.TOKEN_MISSING: "未提供 token",
    BizCode.TOKEN_INVALID: "无效 token，请重新登录",
    BizCode.TOKEN_EXPIRED: "token 已过期，请重新登录",
    BizCode.TOKEN_BLACKLISTED: "token 已登出，请重新登录",
    BizCode.TOKEN_MISSING_JTI: "token 格式异常，请重新登录",

    # ====== auth ======
    BizCode.USER_NOT_FOUND: "用户不存在",
    BizCode.USERNAME_ALREADY_EXISTS: "用户名已被注册",
    BizCode.PHONE_ALREADY_EXISTS: "手机号已被注册",
    BizCode.EMAIL_ALREADY_EXISTS: "邮箱已被注册",
    BizCode.USER_PASSWORD_ERROR: "密码错误",

}
