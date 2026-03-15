from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from mcp.server import FastMCP

from inbound.mcp.base.routing.router import Router
from infrastructure.di.container import DIContainer
from inbound.mcp.context import Context
from infrastructure.settings import AppSettings


class MCPServer:

    def __init__(
        self,
        *,
        di_container: DIContainer,
        routers: list[Router],
    ) -> None:
        self._container = di_container
        self._mcp = self._build_mcp(
            app_settings=di_container[AppSettings],
            routers=routers,
        )

    def _build_mcp(
        self,
        *,
        app_settings: AppSettings,
        routers: list[Router],
    ) -> FastMCP:
        mcp = FastMCP(
            name=app_settings.NAME,
            json_response=True,
            debug=app_settings.DEBUG,
            lifespan=self._lifespan,
        )

        for router in routers:
            for tool in router.tools:
                mcp.add_tool(tool.func, *tool.args, **tool.kwargs)

        return mcp

    async def run(self) -> None:
        await self._mcp.run_stdio_async()

    @asynccontextmanager
    async def _lifespan(self, *args: Any, **kwargs: Any) -> AsyncIterator[Context]:
        yield Context(di_container=self._container)
