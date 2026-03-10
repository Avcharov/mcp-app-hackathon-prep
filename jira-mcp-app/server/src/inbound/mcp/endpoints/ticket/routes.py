from mcp.types import ToolAnnotations

from inbound.mcp.base.routing.router import Router

router = Router()


@router.tool(
    annotations=ToolAnnotations(
        title="Get Issue",
        readOnlyHint=True,
    ),
)
async def get_issue(issue_id: str) -> str:
    """
    Returns the details for the issue.

    Args:
        issue_id (int): The ID of the task.

    Returns:
        JSON string with issue details.
    """
