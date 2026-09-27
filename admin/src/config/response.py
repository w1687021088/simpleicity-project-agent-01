import datetime
from typing import Any, Optional, Generic, TypeVar

from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import Field, BaseModel

from src.config.biz_code import BizCode, biz_code_messages

T = TypeVar("T")


class AppResponse(JSONResponse):
    """统一响应类：成功和失败共用一套结构"""

    def __init__(
        self,
        data: Optional[Any] = None,
        code: BizCode = BizCode.SUCCESS,
        message: Optional[str] = None,
        status_code: int = status.HTTP_200_OK,
        **extra: Any,
    ):
        if message is None:
            if code == BizCode.SUCCESS:
                message = "操作成功"
            else:
                message = biz_code_messages.get(code, "未知错误")

        body: dict[str, Any] = {
            "success": code == BizCode.SUCCESS,
            "code": int(code),
            "message": message,
            "data": data,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        # 失败时可额外带 path / request_id / errors 等
        body.update(extra)

        super().__init__(content=body, status_code=status_code)


class AppResponseModel(BaseModel, Generic[T]):
    """统一响应模型（用于 OpenAPI 文档）"""
    success: bool = Field(..., description="是否成功")
    code: int = Field(..., description="业务代码")
    message: str = Field(..., description="提示信息")
    data: Optional[T] = Field(None, description="业务数据")
    timestamp: str = Field(..., description="时间戳")