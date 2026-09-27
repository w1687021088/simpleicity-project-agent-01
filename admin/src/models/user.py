from tortoise import fields
from src.models import BaseModel


class User(BaseModel):
    """用户表"""
    username = fields.CharField(max_length=50, unique=True, description="用户名")
    password = fields.CharField(max_length=255, description="密码哈希")
    nickname = fields.CharField(max_length=50, null=True, description="昵称")
    email = fields.CharField(max_length=100, null=True, unique=True, description="邮箱")
    phone = fields.CharField(max_length=20, null=True, unique=True, description="手机号")
    is_active = fields.BooleanField(default=True, description="是否启用")

    class Meta:
        table = "sys_user"
        table_description = "用户表"
