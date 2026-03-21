from inbound.mcp.routing.router import Router
from infrastructure.settings import mcp_settings

router = Router()


@router.resource(
    uri=mcp_settings.ISSUE_APP_RESOURCE,
    mime_type="text/html;profile=mcp-app",
)
async def get_mcp_app() -> str:
    with open(mcp_settings.APP_HTML_PATH) as file:
        return file.read()
