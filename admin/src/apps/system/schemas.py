from pydantic import BaseModel, Field, field_validator, ValidationInfo
import re
from typing import Annotated

from src.config.response import AppResponseModel


def _validate_password_strength(v: str) -> str:
    """密码强度校验：长度8~32，必须含数字和特殊符号，只能包含特定字符集"""
    if not (8 <= len(v) <= 32):
        raise ValueError("密码长度必须为 8~32 位")
    allowed = r"^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:'\",.<>/?|\\~`]+$"
    if not re.match(allowed, v):
        raise ValueError("密码只能包含字母、数字和常见特殊符号（如 !@#$%^&* 等）")
    if not re.search(r"\d", v):
        raise ValueError("密码必须包含至少一个数字")
    if not re.search(r"[^A-Za-z0-9]", v):
        raise ValueError("密码必须包含至少一个特殊符号（如 !@#$%^&* 等）")
    return v


class AuthRegisterBody(BaseModel):
    """注册请求体"""
    username: str

    password: str

    confirm_password: str

    phone: Annotated[str | None, Field(examples=["13800138000"], description="手机号码")] = None

    email: Annotated[str | None, Field(examples=["example@example.com"], description="邮箱地址")] = None

    nickname: Annotated[str | None, Field(examples=["张三"], description="昵称")] = None

    @field_validator("confirm_password")
    def validate_confirm_password(cls, v: str, info: ValidationInfo) -> str:
        if v != info.data.get("password"):
            raise ValueError("两次输入的密码不一致")
        return v

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        return _validate_password_strength(v)

    @field_validator("phone")
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v

        cleaned = re.sub(r"[\s\-()]", "", v)

        if not cleaned.isdigit():
            raise ValueError("手机号只能包含数字")

        if len(cleaned) != 11:
            raise ValueError("手机号必须为 11 位")

        if not cleaned.startswith("1"):
            raise ValueError("手机号必须以 1 开头")

        return cleaned  # ← 返回清洗后的值

    @field_validator("email")
    def validate_email(cls, v: str | None) -> str | None:
        if v is None:
            return v

        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("邮箱格式不正确")

        if len(v) > 255:
            raise ValueError("邮箱地址不能超过 255 个字符")

        return v


class UserInfoResponse(BaseModel):
    """用户信息"""
    user_id: Annotated[str, Field(description="用户ID")]
    username: Annotated[str, Field(description="用户名")]
    phone: Annotated[str | None, Field(description="手机号码")]
    email: Annotated[str | None, Field(description="邮箱地址")]
    nickname: Annotated[str | None, Field(description="昵称")]
    created_at: Annotated[str, Field(description="创建时间")]
    updated_at: Annotated[str, Field(description="更新时间")]
    is_active: Annotated[bool, Field(description="是否启用")]


class RegisterResponse(UserInfoResponse):
    """注册响应"""
    token: str


class LoginResponse(UserInfoResponse):
    """登录响应"""
    token: str


class AuthLoginBody(BaseModel):
    """登录请求体（不校验密码强度，避免老用户登录被拦）"""
    username: str
    password: str


class AuthChangePasswordBody(BaseModel):
    """修改密码请求体"""
    old_password: Annotated[str, Field(description="旧密码")]
    new_password: Annotated[str, Field(description="新密码")]
    confirm_new_password: Annotated[str, Field(description="确认新密码")]

    @field_validator("new_password")
    def validate_new_password(cls, v: str) -> str:
        return _validate_password_strength(v)

    @field_validator("confirm_new_password")
    def validate_confirm(cls, v: str, info: ValidationInfo) -> str:
        if v != info.data.get("new_password"):
            raise ValueError("两次输入的新密码不一致")
        return v

    @field_validator("new_password", mode="after")
    def validate_old_new_not_same(cls, v: str, info: ValidationInfo) -> str:
        old = info.data.get("old_password")
        if old and v == old:
            raise ValueError("新密码不能与旧密码相同")
        return v


AuthRegisterResponse = AppResponseModel[RegisterResponse]

AuthLoginResponse = AppResponseModel[LoginResponse]
