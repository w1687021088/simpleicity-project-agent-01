import datetime
from fastapi.responses import JSONResponse
from typing import Any, Optional, Annotated, Generic, TypeVar
from fastapi import status
from pydantic import Field, BaseModel

from src.config.biz_code import BizCode

T = TypeVar("T")


class AppResponse(JSONResponse):
    """ 应用程序响应 """

    def __init__(self, data: Optional[dict[str, Any]] = None, status_code: int = status.HTTP_200_OK,
                 message: Optional[str] = 'Success',
                 **kwargs: Any):
        self.data = {
            'code': BizCode.SUCCESS,
            'data': data,
            'message': message,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.data.update(kwargs)
        super().__init__(content=self.data, status_code=status_code)


class AppResponseModel(BaseModel, Generic[T]):
    """ 共同响应模型 """
    code: Annotated[BizCode, Field(..., description="业务代码")]
    data: T
    message: str
    timestamp: str
