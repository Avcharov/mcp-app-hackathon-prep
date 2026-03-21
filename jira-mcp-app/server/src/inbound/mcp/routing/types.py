from typing import Any

from mcp.types import AnyFunction
from pydantic import BaseModel


class Endpoint(BaseModel):
    func: AnyFunction
    args: tuple[Any, ...]
    kwargs: dict[str, Any]
