import anyio

from inbound.mcp.endpoints.issue import router as issue_router
from inbound.mcp.endpoints.ui import router as ui_router
from inbound.mcp.server import MCPServer
from infrastructure.log import configure_logging
from infrastructure.settings import app_settings


async def serve() -> None:
    server = MCPServer(
        app_name=app_settings.NAME,
        debug=app_settings.DEBUG,
        routers=[
            issue_router,
            ui_router,
        ],
    )
    await server.run()


def main() -> None:
    configure_logging()
    anyio.run(serve)


if __name__ == "__main__":
    main()
