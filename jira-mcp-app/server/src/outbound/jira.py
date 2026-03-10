from urllib.parse import urljoin

from aiohttp import BasicAuth, ClientSession


class JiraClient:

    def __init__(
        self,
        *,
        api_token: str,
        username: str,
        domain: str,
    ) -> None:
        self._session = ClientSession(
            base_url=urljoin(domain, "/rest/api/3"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            auth=BasicAuth(username, api_token),
        )

    async def __aenter__(self) -> "JiraClient":
        self._session = self._session.__aenter__()
        return self

    async def __aexit__(self, *args, **kwargs) -> None:
        await self._session.__aexit__(*args, **kwargs)
