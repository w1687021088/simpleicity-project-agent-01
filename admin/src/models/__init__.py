from tortoise import fields
from tortoise.models import Model


class BaseModel(Model):
    """所有模型的基类"""
    id = fields.IntField(pk=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        abstract = True


# 导入所有模型，让 aerich 能发现它们
from src.models.user import User

__all__ = ["BaseModel", "User"]