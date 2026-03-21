import logging

from mcp.server import FastMCP

from inbound.mcp.routing.router import Router

logger = logging.getLogger(__name__)


class MCPServer:

    def __init__(
        self,
        *,
        app_name: str,
        debug: bool,
        routers: list[Router],
    ) -> None:
        self._mcp = self._build_mcp(
            name=app_name,
            debug=debug,
            routers=routers,
        )

    async def run(self) -> None:
        logger.info("Starting MCP server")
        await self._mcp.run_stdio_async()

    @staticmethod
    def _build_mcp(
        *,
        name: str,
        debug: bool,
        routers: list[Router],
    ) -> FastMCP:
        mcp = FastMCP(
            name=name,
            json_response=True,
            debug=debug,
        )

        for router in routers:
            for tool in router.tools:
                mcp.tool(*tool.args, **tool.kwargs)(tool.func)

            for resource in router.resources:
                mcp.resource(*resource.args, **resource.kwargs)(resource.func)

        return mcp
