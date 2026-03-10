from functools import wraps
from typing import Callable

from mcp.server import FastMCP
from mcp.types import AnyFunction

from inbound.mcp.base.routing.endpoint import Endpoint


class Router:

    def __init__(self) -> None:
        self._tools = []

    @wraps(FastMCP.tool)
    def tool(self, *args, **kwargs) -> Callable[[AnyFunction], AnyFunction]:
        def wrapper[T: AnyFunction](func: T) -> T:
            self._tools.append(Endpoint(func=func, args=args, kwargs=kwargs))
            return func

        return wrapper
