from functools import wraps
from typing import Callable

from mcp.server import FastMCP
from mcp.types import AnyFunction

from inbound.mcp.routing.types import Endpoint


class Router:

    def __init__(self) -> None:
        self._tools = []
        self._resources = []

    @wraps(FastMCP.tool)
    def tool(self, *args, **kwargs) -> Callable[[AnyFunction], AnyFunction]:
        def wrapper[T: AnyFunction](func: T) -> T:
            self._tools.append(Endpoint(func=func, args=args, kwargs=kwargs))
            return func

        return wrapper

    @wraps(FastMCP.resource)
    def resource(self, *args, **kwargs) -> Callable[[AnyFunction], AnyFunction]:
        def wrapper[T: AnyFunction](func: T) -> T:
            self._resources.append(Endpoint(func=func, args=args, kwargs=kwargs))
            return func

        return wrapper

    @property
    def tools(self) -> list[Endpoint]:
        return self._tools

    @property
    def resources(self) -> list[Endpoint]:
        return self._resources
