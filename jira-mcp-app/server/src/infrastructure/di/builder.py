from domain.service.issue import IssueService
from infrastructure.di.container import DIContainer
from infrastructure.settings import AppSettings, JiraSettings
from outbound.jira import JiraClient


class DIContainerManager:

    def __init__(self) -> None:
        self._container = DIContainer()

    async def __aenter__(self) -> DIContainer:
        self._container[AppSettings] = AppSettings()
        self._container[JiraSettings] = JiraSettings()

        self._container[JiraClient] = JiraClient(
            api_token=self._container[JiraSettings].API_TOKEN,
            username=self._container[JiraSettings].USERNAME,
            domain=self._container[JiraSettings].DOMAIN,
        )

        self._container[IssueService] = IssueService(
            jira_client=self._container[JiraClient],
        )

        await self._container[JiraClient].__aenter__()

        return self._container

    async def __aexit__(self, *args, **kwargs) -> None:
        await self._container[JiraClient].__aexit__(*args, **kwargs)
