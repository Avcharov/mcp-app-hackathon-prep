import anyio

from inbound.mcp.server import MCPServer
from infrastructure.di.builder import DIContainerBuilder


async def serve() -> None:
    async with DIContainerBuilder() as di_container:
        server = MCPServer(di_container=di_container)
        await server.run()


def main() -> None:
    anyio.run(serve)
