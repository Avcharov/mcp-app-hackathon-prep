import json

from mcp.server.fastmcp import Context
from mcp.types import ToolAnnotations

from domain.service.issue import IssueService
from inbound.mcp.base.routing.router import Router
from infrastructure.di.container import DIContainer

router = Router()


@router.tool(
    annotations=ToolAnnotations(
        title="Get Jira Issue",
        readOnlyHint=True,
    ),
)
async def get_issue(
    issue_id_or_key: str,
    ctx: Context,  # noqa: ignore
) -> str:
    """
    Returns the details for the Jira issue.

    Args:
        issue_id_or_key (str): The ID of the task.

    Returns:
        JSON string with issue details.
    """
    di_container: DIContainer = ctx.request_context.lifespan_context.di_container
    service = di_container[IssueService]
    jira_issue = await service.get_issue(issue_id_or_key=issue_id_or_key)
    return json.dumps(jira_issue)
