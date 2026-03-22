import json

from mcp.types import ToolAnnotations

from domain.service.issue import IssueService
from inbound.mcp.routing.router import Router
from infrastructure.settings import mcp_settings

router = Router()


@router.tool(
    annotations=ToolAnnotations(
        title="Get Jira Issue",
        readOnlyHint=True,
    ),
    meta={
        "ui": {
            "resourceUri": mcp_settings.ISSUE_APP_RESOURCE,
        }
    },
)
async def get_issue(issue_id_or_key: str) -> str:
    """
    Returns the details for the Jira issue.

    Args:
        issue_id_or_key (str): The ID of the task.

    Returns:
        JSON string with issue details.
    """
    service = IssueService.build()
    jira_issue = await service.get_issue(issue_id_or_key=issue_id_or_key)
    return json.dumps(jira_issue)
