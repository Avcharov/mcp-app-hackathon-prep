import logging
from typing import Any
from urllib.parse import urljoin

from aiohttp import BasicAuth, ClientSession

from infrastructure.http import HTTPSessionManager
from infrastructure.settings import jira_settings

logger = logging.getLogger(__name__)


class JiraClient:

    def __init__(
        self,
        *,
        api_token: str,
        username: str,
        domain: str,
    ) -> None:
        manager = HTTPSessionManager()
        http_session_name = self.__class__.__name__

        if not (session := manager.get(http_session_name)):
            self._session = ClientSession(
                base_url=urljoin(domain, "/rest/api/3/"),
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                auth=BasicAuth(username, api_token),
            )
            manager.add(http_session_name, self._session)
        else:
            self._session = session

    async def get_issue(
        self,
        *,
        issue_id_or_key: str,
    ) -> dict[str, Any]:
        return await self._request(
            method="GET",
            url=f"issue/{issue_id_or_key}",
        )

    @classmethod
    def build(cls) -> JiraClient:
        return JiraClient(
            api_token=jira_settings.API_TOKEN,
            username=jira_settings.USERNAME,
            domain=jira_settings.DOMAIN,
        )

    async def _request[T](
        self,
        *,
        method: str,
        url: str,
    ) -> T:
        response = await self._session.request(
            method=method,
            url=url,
        )

        response_body = await response.text()
        logger.info(f"{method} {url} payload={response_body[:150]}")

        return await response.json()
