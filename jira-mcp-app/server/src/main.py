import anyio

from inbound.mcp.endpoints.issue import router as issue_router
from inbound.mcp.server import MCPServer
from infrastructure.di.builder import DIContainerManager
from infrastructure.log import configure_logging


async def serve() -> None:
    async with DIContainerManager() as di_container:
        server = MCPServer(
            di_container=di_container,
            routers=[issue_router]
        )
        await server.run()


def main() -> None:
    configure_logging()
    anyio.run(serve)


if __name__ == "__main__":
    main()
