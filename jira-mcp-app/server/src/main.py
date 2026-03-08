import anyio

from inbound.mcp.server import MCPServer
from infrastructure.di.builder import DIContainerBuilder


async def serve() -> None:
    server = MCPServer(
        di_container=DIContainerBuilder().build()
    )

    await server.run()


def main() -> None:
    anyio.run(serve)
