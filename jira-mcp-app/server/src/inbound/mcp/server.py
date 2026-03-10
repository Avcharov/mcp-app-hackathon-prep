from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from mcp.server import FastMCP

from infrastructure.di.container import DIContainer
from inbound.mcp.context import Context
from infrastructure.settings import AppSettings, HTTPSettings


class MCPServer:

    def __init__(self, *, di_container: DIContainer) -> None:
        http_settings = di_container[HTTPSettings]
        app_settings = di_container[AppSettings]

        self._container = di_container
        self._mcp = FastMCP(
            name=app_settings.NAME,
            json_response=True,
            host=http_settings.HOST,
            port=http_settings.PORT,
            debug=app_settings.DEBUG,
            lifespan=self._lifespan,
        )

    async def run(self) -> None:
        await self._mcp.run_streamable_http_async()

    @asynccontextmanager
    async def _lifespan(self, *args: Any, **kwargs: Any) -> AsyncIterator[Context]:
        yield Context(container=self._container)
