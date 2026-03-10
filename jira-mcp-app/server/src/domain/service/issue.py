from typing import Any

from outbound.jira import JiraClient


class IssueService:

    def __init__(
        self,
        *,
        jira_client: JiraClient,
    ) -> None:
        self._jira_client = jira_client

    async def get_issue(
        self,
        *,
        issue_id_or_key: str,
    ) -> dict[str, Any]:
        pass
