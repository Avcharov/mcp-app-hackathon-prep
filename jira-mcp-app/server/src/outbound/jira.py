import logging
from typing import Any
from urllib.parse import urljoin

from aiohttp import BasicAuth, ClientSession

logger = logging.getLogger(__name__)


class JiraClient:

    def __init__(
        self,
        *,
        api_token: str,
        username: str,
        domain: str,
    ) -> None:
        self._session = ClientSession(
            base_url=urljoin(domain, "/rest/api/3/"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            auth=BasicAuth(username, api_token),
        )

    async def _request[T](
        self,
        *,
        url: str,
    ) -> T:
        response = await self._session.get(url)

        response_body = await response.text()
        logger.info(f"{url=}; response={response_body[:150]}")

        return await response.json()

    async def get_issue(
        self,
        *,
        issue_id_or_key: str,
    ) -> dict[str, Any]:
        return await self._request(url=f"issue/{issue_id_or_key}")

    async def __aenter__(self) -> "JiraClient":
        self._session = await self._session.__aenter__()
        return self

    async def __aexit__(self, *args, **kwargs) -> None:
        await self._session.__aexit__(*args, **kwargs)
